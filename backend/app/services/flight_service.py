from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status
from app.models.flight import Flight, FlightStatus, OperationType
from app.schemas.flight import FlightCreate, FlightUpdate
from app.services.log_service import create_log


def get_flight_by_id(db: Session, flight_id: int) -> Optional[Flight]:
    return db.query(Flight).filter(Flight.id == flight_id).first()


def get_flight_by_number(db: Session, flight_number: str) -> Optional[Flight]:
    return db.query(Flight).filter(Flight.flight_number == flight_number).first()


def get_flights(
    db: Session,
    search: Optional[str] = None,
    status_filter: Optional[FlightStatus] = None,
    operation_type: Optional[OperationType] = None,
    is_emergency: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "arrival_time",
    sort_order: str = "asc"
) -> Tuple[List[Flight], int]:
    query = db.query(Flight)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Flight.flight_number.ilike(search_filter),
                Flight.aircraft_type.ilike(search_filter)
            )
        )
    if status_filter:
        query = query.filter(Flight.status == status_filter)
    if operation_type:
        query = query.filter(Flight.operation_type == operation_type)
    if is_emergency is not None:
        query = query.filter(Flight.is_emergency == is_emergency)

    total = query.count()

    sort_column = getattr(Flight, sort_by, Flight.arrival_time)
    order_func = desc if sort_order.lower() == "desc" else asc
    flights = query.order_by(order_func(sort_column)).offset(skip).limit(limit).all()

    return flights, total


def create_flight(db: Session, flight_in: FlightCreate) -> Flight:
    existing = get_flight_by_number(db, flight_in.flight_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Flight number '{flight_in.flight_number}' already exists."
        )

    flight = Flight(
        flight_number=flight_in.flight_number.strip().upper(),
        aircraft_type=flight_in.aircraft_type.strip(),
        operation_type=flight_in.operation_type,
        arrival_time=flight_in.arrival_time,
        duration=flight_in.duration,
        priority=flight_in.priority,
        is_emergency=flight_in.is_emergency,
        status=FlightStatus.SCHEDULED,
        remaining_duration=flight_in.duration
    )
    db.add(flight)
    db.commit()
    db.refresh(flight)

    create_log(
        db=db,
        event_type="FLIGHT_CREATED",
        flight_id=flight.id,
        description=f"Flight {flight.flight_number} created with {flight.operation_type} request."
    )
    return flight


def update_flight(db: Session, flight: Flight, flight_in: FlightUpdate) -> Flight:
    update_data = flight_in.model_dump(exclude_unset=True)

    if "flight_number" in update_data:
        new_number = update_data["flight_number"].strip().upper()
        if new_number != flight.flight_number:
            existing = get_flight_by_number(db, new_number)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Flight number '{new_number}' already exists."
                )
            flight.flight_number = new_number

    if "status" in update_data:
        new_status = update_data["status"]
        if flight.status == FlightStatus.COMPLETED and new_status != FlightStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Completed flight cannot be reverted to active status."
            )
        flight.status = new_status

    if "duration" in update_data:
        new_duration = update_data["duration"]
        if flight.status == FlightStatus.SCHEDULED or flight.status == FlightStatus.WAITING:
            flight.remaining_duration = new_duration
        flight.duration = new_duration

    for field, value in update_data.items():
        if field not in ["flight_number", "status", "duration"]:
            setattr(flight, field, value)

    db.commit()
    db.refresh(flight)

    create_log(
        db=db,
        event_type="FLIGHT_UPDATED",
        flight_id=flight.id,
        description=f"Flight {flight.flight_number} updated."
    )
    return flight


def delete_flight(db: Session, flight: Flight) -> None:
    if flight.status == FlightStatus.ON_RUNWAY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete flight {flight.flight_number} while it is actively occupying a runway."
        )

    flight_num = flight.flight_number
    flight_id = flight.id
    db.delete(flight)
    db.commit()

    create_log(
        db=db,
        event_type="FLIGHT_DELETED",
        description=f"Flight {flight_num} (ID: {flight_id}) was deleted."
    )
