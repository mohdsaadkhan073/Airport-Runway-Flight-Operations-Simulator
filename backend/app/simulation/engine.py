from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.settings import SimulationSettings
from app.models.flight import Flight, FlightStatus
from app.models.runway import Runway, RunwayStatus
from app.models.operation import FlightOperation
from app.services.runway_service import init_default_runways
from app.services.log_service import create_log


def get_or_create_settings(db: Session) -> SimulationSettings:
    settings = db.query(SimulationSettings).first()
    if not settings:
        settings = SimulationSettings(
            runway_count=1,
            default_algorithm="FCFS",
            speed_multiplier=1.0,
            time_quantum=3,
            current_time=0,
            is_running=False
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def get_simulation_state(db: Session) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    runways = db.query(Runway).all()
    if not runways:
        runways = init_default_runways(db, settings.runway_count)

    waiting_flights = db.query(Flight).filter(Flight.status == FlightStatus.WAITING).order_by(
        Flight.is_emergency.desc(),
        Flight.priority.asc(),
        Flight.arrival_time.asc()
    ).all()

    active_flights = db.query(Flight).filter(Flight.status == FlightStatus.ON_RUNWAY).all()
    scheduled_flights = db.query(Flight).filter(Flight.status == FlightStatus.SCHEDULED).all()
    completed_flights = db.query(Flight).filter(Flight.status == FlightStatus.COMPLETED).all()

    return {
        "current_time": settings.current_time,
        "is_running": settings.is_running,
        "speed_multiplier": settings.speed_multiplier,
        "default_algorithm": settings.default_algorithm,
        "time_quantum": settings.time_quantum,
        "runways": [
            {
                "id": r.id,
                "name": r.name,
                "status": r.status.value,
                "current_flight_id": r.current_flight_id,
                "supported_operations": r.supported_operations,
                "current_flight": {
                    "id": r.current_flight.id,
                    "flight_number": r.current_flight.flight_number,
                    "aircraft_type": r.current_flight.aircraft_type,
                    "operation_type": r.current_flight.operation_type.value,
                    "remaining_duration": r.current_flight.remaining_duration,
                    "duration": r.current_flight.duration,
                    "priority": r.current_flight.priority,
                    "is_emergency": r.current_flight.is_emergency
                } if r.current_flight else None
            }
            for r in runways
        ],
        "active_flights_count": len(active_flights),
        "waiting_flights_count": len(waiting_flights),
        "scheduled_flights_count": len(scheduled_flights),
        "completed_flights_count": len(completed_flights),
        "waiting_queue": [
            {
                "id": f.id,
                "flight_number": f.flight_number,
                "aircraft_type": f.aircraft_type,
                "operation_type": f.operation_type.value,
                "arrival_time": f.arrival_time,
                "duration": f.duration,
                "priority": f.priority,
                "is_emergency": f.is_emergency
            }
            for f in waiting_flights
        ]
    }


def step_simulation(db: Session, steps: int = 1) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    runways = db.query(Runway).all()
    if not runways:
        runways = init_default_runways(db, settings.runway_count)

    for _ in range(max(1, steps)):
        sim_time = settings.current_time

        scheduled_to_wait = db.query(Flight).filter(
            Flight.status == FlightStatus.SCHEDULED,
            Flight.arrival_time <= sim_time
        ).all()

        for flight in scheduled_to_wait:
            flight.status = FlightStatus.WAITING
            create_log(
                db=db,
                event_type="FLIGHT_ARRIVED",
                flight_id=flight.id,
                simulation_time=sim_time,
                description=f"Flight {flight.flight_number} entered waiting queue for {flight.operation_type.value}."
            )

        for runway in runways:
            if runway.status == RunwayStatus.OCCUPIED and runway.current_flight_id:
                flight = db.query(Flight).filter(Flight.id == runway.current_flight_id).first()
                if flight:
                    flight.remaining_duration -= 1
                    if flight.remaining_duration <= 0:
                        flight.status = FlightStatus.COMPLETED
                        start_time = max(flight.arrival_time, sim_time - flight.duration + 1)
                        completion_time = sim_time + 1
                        turnaround_time = max(0, completion_time - flight.arrival_time)
                        waiting_time = max(0, start_time - flight.arrival_time)

                        operation = FlightOperation(
                            flight_id=flight.id,
                            runway_id=runway.id,
                            algorithm=settings.default_algorithm,
                            start_time=start_time,
                            completion_time=completion_time,
                            waiting_time=waiting_time,
                            turnaround_time=turnaround_time,
                            status="COMPLETED"
                        )
                        db.add(operation)

                        runway.status = RunwayStatus.AVAILABLE
                        runway.current_flight_id = None

                        create_log(
                            db=db,
                            event_type="OPERATION_COMPLETED",
                            flight_id=flight.id,
                            runway_id=runway.id,
                            simulation_time=sim_time + 1,
                            description=f"Flight {flight.flight_number} completed {flight.operation_type.value} on {runway.name}."
                        )

        for runway in runways:
            if runway.status == RunwayStatus.AVAILABLE:
                waiting_query = db.query(Flight).filter(
                    Flight.status == FlightStatus.WAITING,
                    Flight.arrival_time <= sim_time
                )
                waiting_flights = waiting_query.all()

                if waiting_flights:
                    if settings.default_algorithm.upper() in ["PRIORITY", "PRIORITY SCHEDULING"]:
                        waiting_flights.sort(
                            key=lambda f: (
                                0 if f.is_emergency else 1,
                                f.priority,
                                f.arrival_time,
                                f.id
                            )
                        )
                    else:
                        waiting_flights.sort(
                            key=lambda f: (
                                0 if f.is_emergency else 1,
                                f.arrival_time,
                                f.priority,
                                f.id
                            )
                        )

                    next_flight = waiting_flights[0]
                    next_flight.status = FlightStatus.ON_RUNWAY
                    runway.status = RunwayStatus.OCCUPIED
                    runway.current_flight_id = next_flight.id

                    create_log(
                        db=db,
                        event_type="OPERATION_STARTED",
                        flight_id=next_flight.id,
                        runway_id=runway.id,
                        simulation_time=sim_time,
                        description=f"Flight {next_flight.flight_number} assigned to {runway.name}."
                    )

        settings.current_time += 1
        db.commit()

    return get_simulation_state(db)


def start_simulation(db: Session) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    settings.is_running = True
    db.commit()
    create_log(db=db, event_type="SIMULATION_STARTED", simulation_time=settings.current_time, description="Simulation started.")
    return get_simulation_state(db)


def pause_simulation(db: Session) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    settings.is_running = False
    db.commit()
    create_log(db=db, event_type="SIMULATION_PAUSED", simulation_time=settings.current_time, description="Simulation paused.")
    return get_simulation_state(db)


def resume_simulation(db: Session) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    settings.is_running = True
    db.commit()
    create_log(db=db, event_type="SIMULATION_RESUMED", simulation_time=settings.current_time, description="Simulation resumed.")
    return get_simulation_state(db)


def reset_simulation(db: Session) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    settings.current_time = 0
    settings.is_running = False

    runways = db.query(Runway).all()
    for r in runways:
        if r.status != RunwayStatus.UNAVAILABLE:
            r.status = RunwayStatus.AVAILABLE
        r.current_flight_id = None

    flights = db.query(Flight).all()
    for f in flights:
        f.status = FlightStatus.SCHEDULED
        f.remaining_duration = f.duration

    db.commit()
    create_log(db=db, event_type="SIMULATION_RESET", simulation_time=0, description="Simulation reset to time 0.")
    return get_simulation_state(db)


def load_sample_data(db: Session, overwrite: bool = False) -> Dict[str, Any]:
    if overwrite:
        db.query(FlightOperation).delete()
        db.query(Flight).delete()
        db.query(Runway).delete()
        db.commit()

    runway_definitions = [
        {"name": "Runway 09L", "status": RunwayStatus.AVAILABLE, "supported_operations": "ALL"},
        {"name": "Runway 27R", "status": RunwayStatus.AVAILABLE, "supported_operations": "ALL"},
        {"name": "Runway 14/32", "status": RunwayStatus.UNAVAILABLE, "supported_operations": "ALL"},
    ]
    for r_def in runway_definitions:
        existing_r = db.query(Runway).filter(Runway.name == r_def["name"]).first()
        if not existing_r:
            db.add(Runway(**r_def))

    sample_flights = [
        {"flight_number": "SIM-AA101", "aircraft_type": "Boeing 737-800", "operation_type": "TAKEOFF", "arrival_time": 0, "duration": 4, "priority": 3, "is_emergency": False},
        {"flight_number": "SIM-BA204", "aircraft_type": "Airbus A320neo", "operation_type": "LANDING", "arrival_time": 1, "duration": 3, "priority": 2, "is_emergency": False},
        {"flight_number": "SIM-DL330", "aircraft_type": "Airbus A330-300", "operation_type": "TAKEOFF", "arrival_time": 2, "duration": 5, "priority": 4, "is_emergency": False},
        {"flight_number": "SIM-EMERG99", "aircraft_type": "Boeing 777-300ER", "operation_type": "LANDING", "arrival_time": 3, "duration": 4, "priority": 1, "is_emergency": True},
        {"flight_number": "SIM-LH456", "aircraft_type": "Boeing 747-8", "operation_type": "TAKEOFF", "arrival_time": 4, "duration": 6, "priority": 3, "is_emergency": False},
        {"flight_number": "SIM-SQ789", "aircraft_type": "Boeing 787-9", "operation_type": "LANDING", "arrival_time": 5, "duration": 4, "priority": 2, "is_emergency": False},
        {"flight_number": "SIM-AF012", "aircraft_type": "Airbus A350-900", "operation_type": "TAKEOFF", "arrival_time": 6, "duration": 5, "priority": 3, "is_emergency": False},
        {"flight_number": "SIM-EK501", "aircraft_type": "Airbus A380-800", "operation_type": "LANDING", "arrival_time": 8, "duration": 7, "priority": 2, "is_emergency": False},
    ]

    for f_data in sample_flights:
        existing_f = db.query(Flight).filter(Flight.flight_number == f_data["flight_number"]).first()
        if not existing_f:
            f = Flight(
                flight_number=f_data["flight_number"],
                aircraft_type=f_data["aircraft_type"],
                operation_type=f_data["operation_type"],
                arrival_time=f_data["arrival_time"],
                duration=f_data["duration"],
                priority=f_data["priority"],
                is_emergency=f_data["is_emergency"],
                status=FlightStatus.SCHEDULED,
                remaining_duration=f_data["duration"]
            )
            db.add(f)

    db.commit()

    settings = get_or_create_settings(db)
    settings.runway_count = 3
    db.commit()

    create_log(
        db=db,
        event_type="SAMPLE_DATA_LOADED",
        description="Standard educational simulation dataset loaded (8 flights, 3 runways including 1 unavailable)."
    )

    return get_simulation_state(db)

