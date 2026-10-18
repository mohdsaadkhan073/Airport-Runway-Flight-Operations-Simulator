from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.flight import Flight, FlightStatus, OperationType
from app.models.runway import Runway, RunwayStatus
from app.models.operation import FlightOperation
from app.models.settings import SimulationSettings
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    AnalyticsSchedulingResponse,
    AlgorithmComparisonItem,
    StatusCount,
    OperationTypeCount,
)
from app.services.scheduling_service import compare_scheduling


def get_analytics_overview(db: Session) -> AnalyticsOverviewResponse:
    total_flights = db.query(Flight).count()
    completed_flights = db.query(Flight).filter(Flight.status == FlightStatus.COMPLETED).count()
    waiting_flights = db.query(Flight).filter(Flight.status == FlightStatus.WAITING).count()
    on_runway_flights = db.query(Flight).filter(Flight.status == FlightStatus.ON_RUNWAY).count()
    holding_flights = db.query(Flight).filter(Flight.status == FlightStatus.HOLDING).count()
    emergency_flights = db.query(Flight).filter(Flight.is_emergency == True).count()

    total_runways = db.query(Runway).count()
    available_runways = db.query(Runway).filter(Runway.status == RunwayStatus.AVAILABLE).count()
    occupied_runways = db.query(Runway).filter(Runway.status == RunwayStatus.OCCUPIED).count()
    unavailable_runways = db.query(Runway).filter(Runway.status == RunwayStatus.UNAVAILABLE).count()

    runway_utilization = round((occupied_runways / total_runways) * 100, 2) if total_runways > 0 else 0.0

    completed_ops = db.query(FlightOperation).all()
    if completed_ops:
        avg_wait = round(sum(op.waiting_time for op in completed_ops) / len(completed_ops), 2)
        avg_tat = round(sum(op.turnaround_time for op in completed_ops) / len(completed_ops), 2)
        sim_settings = db.query(SimulationSettings).first()
        current_time = sim_settings.current_time if sim_settings and sim_settings.current_time > 0 else 1
        throughput = round(len(completed_ops) / current_time, 4)
    else:
        avg_wait = 0.0
        avg_tat = 0.0
        throughput = 0.0

    status_groups = (
        db.query(Flight.status, func.count(Flight.id))
        .group_by(Flight.status)
        .all()
    )
    status_distribution = [
        StatusCount(status=s.value if hasattr(s, "value") else str(s), count=cnt)
        for s, cnt in status_groups
    ]

    op_groups = (
        db.query(Flight.operation_type, func.count(Flight.id))
        .group_by(Flight.operation_type)
        .all()
    )
    operation_distribution = [
        OperationTypeCount(operation_type=op.value if hasattr(op, "value") else str(op), count=cnt)
        for op, cnt in op_groups
    ]

    return AnalyticsOverviewResponse(
        total_flights=total_flights,
        completed_flights=completed_flights,
        waiting_flights=waiting_flights,
        on_runway_flights=on_runway_flights,
        holding_flights=holding_flights,
        emergency_flights=emergency_flights,
        total_runways=total_runways,
        available_runways=available_runways,
        occupied_runways=occupied_runways,
        unavailable_runways=unavailable_runways,
        runway_utilization_rate=runway_utilization,
        average_waiting_time=avg_wait,
        average_turnaround_time=avg_tat,
        completed_throughput=throughput,
        status_distribution=status_distribution,
        operation_distribution=operation_distribution
    )


def get_analytics_scheduling(db: Session) -> AnalyticsSchedulingResponse:
    completed_ops = db.query(FlightOperation).all()
    total_recorded = len(completed_ops)

    algorithm_stats = {}
    for op in completed_ops:
        algo = op.algorithm
        if algo not in algorithm_stats:
            algorithm_stats[algo] = {"wait_times": [], "tat_times": [], "count": 0}
        algorithm_stats[algo]["wait_times"].append(op.waiting_time)
        algorithm_stats[algo]["tat_times"].append(op.turnaround_time)
        algorithm_stats[algo]["count"] += 1

    sim_settings = db.query(SimulationSettings).first()
    curr_time = sim_settings.current_time if sim_settings and sim_settings.current_time > 0 else 1

    comparisons = []
    for algo, stats in algorithm_stats.items():
        n = stats["count"]
        avg_w = round(sum(stats["wait_times"]) / n, 2) if n > 0 else 0.0
        avg_t = round(sum(stats["tat_times"]) / n, 2) if n > 0 else 0.0
        tp = round(n / curr_time, 4)
        comparisons.append(AlgorithmComparisonItem(
            algorithm=algo,
            average_waiting_time=avg_w,
            average_turnaround_time=avg_t,
            throughput=tp,
            total_completed=n
        ))

    if not comparisons:
        try:
            comparison_res = compare_scheduling(db)
            for res in comparison_res.results:
                comparisons.append(AlgorithmComparisonItem(
                    algorithm=res.algorithm,
                    average_waiting_time=res.average_waiting_time,
                    average_turnaround_time=res.average_turnaround_time,
                    throughput=res.throughput,
                    total_completed=len(res.items)
                ))
        except Exception:
            comparisons = [
                AlgorithmComparisonItem(algorithm="FCFS", average_waiting_time=0.0, average_turnaround_time=0.0, throughput=0.0, total_completed=0),
                AlgorithmComparisonItem(algorithm="Priority Scheduling", average_waiting_time=0.0, average_turnaround_time=0.0, throughput=0.0, total_completed=0),
                AlgorithmComparisonItem(algorithm="Round Robin", average_waiting_time=0.0, average_turnaround_time=0.0, throughput=0.0, total_completed=0),
            ]

    recent_perf = [
        {
            "id": op.id,
            "flight_id": op.flight_id,
            "runway_id": op.runway_id,
            "algorithm": op.algorithm,
            "waiting_time": op.waiting_time,
            "turnaround_time": op.turnaround_time,
            "completion_time": op.completion_time
        }
        for op in completed_ops[-20:]
    ]

    return AnalyticsSchedulingResponse(
        total_operations_recorded=total_recorded,
        comparisons=comparisons,
        recent_performance=recent_perf
    )
