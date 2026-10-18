from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.flight import Flight, FlightStatus
from app.schemas.scheduling import (
    SchedulingResult,
    SchedulingComparisonResponse,
)
from app.algorithms.fcfs import calculate_fcfs
from app.algorithms.priority import calculate_priority
from app.algorithms.sjf import calculate_sjf
from app.services.log_service import create_log

_last_scheduling_results: Dict[str, SchedulingResult] = {}


def get_workload_from_db(db: Session, flight_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
    query = db.query(Flight)
    if flight_ids:
        query = query.filter(Flight.id.in_(flight_ids))
    else:
        pending = query.filter(Flight.status.in_([FlightStatus.SCHEDULED, FlightStatus.WAITING])).all()
        if pending:
            return [
                {
                    "id": f.id,
                    "flight_number": f.flight_number,
                    "operation_type": f.operation_type.value if hasattr(f.operation_type, "value") else str(f.operation_type),
                    "arrival_time": f.arrival_time,
                    "duration": f.duration,
                    "priority": f.priority,
                    "is_emergency": f.is_emergency
                }
                for f in pending
            ]

    flights = query.all()
    return [
        {
            "id": f.id,
            "flight_number": f.flight_number,
            "operation_type": f.operation_type.value if hasattr(f.operation_type, "value") else str(f.operation_type),
            "arrival_time": f.arrival_time,
            "duration": f.duration,
            "priority": f.priority,
            "is_emergency": f.is_emergency
        }
        for f in flights
    ]


def run_scheduling(
    db: Session,
    algorithm: str = "FCFS",
    flight_ids: Optional[List[int]] = None,
    time_quantum: int = 3
) -> SchedulingResult:
    workload = get_workload_from_db(db, flight_ids)
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No flights available to schedule. Please add flights first."
        )

    algo_upper = algorithm.strip().upper()
    if algo_upper == "FCFS":
        result = calculate_fcfs(workload)
    elif algo_upper in ["PRIORITY", "PRIORITY SCHEDULING"]:
        result = calculate_priority(workload)
    elif algo_upper in ["SJF", "SHORTEST JOB FIRST"]:
        result = calculate_sjf(workload)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown scheduling algorithm '{algorithm}'. Use FCFS, PRIORITY, or SJF."
        )

    _last_scheduling_results[algo_upper] = result

    create_log(
        db=db,
        event_type="SCHEDULING_RUN",
        description=f"Executed {result.algorithm} algorithm for {len(workload)} flights."
    )

    return result


def get_last_results(db: Session, algorithm: Optional[str] = None) -> SchedulingResult:
    if algorithm:
        algo_upper = algorithm.strip().upper()
        if algo_upper in _last_scheduling_results:
            return _last_scheduling_results[algo_upper]
        return run_scheduling(db, algorithm=algo_upper)

    if _last_scheduling_results:
        return next(iter(_last_scheduling_results.values()))

    return run_scheduling(db, algorithm="FCFS")


def compare_scheduling(
    db: Session,
    flight_ids: Optional[List[int]] = None,
    time_quantum: int = 3
) -> SchedulingComparisonResponse:
    workload = get_workload_from_db(db, flight_ids)
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No flights available to compare. Please add flights first."
        )

    fcfs_res = calculate_fcfs(workload)
    priority_res = calculate_priority(workload)
    sjf_res = calculate_sjf(workload)

    _last_scheduling_results["FCFS"] = fcfs_res
    _last_scheduling_results["PRIORITY"] = priority_res
    _last_scheduling_results["SJF"] = sjf_res

    create_log(
        db=db,
        event_type="SCHEDULING_COMPARE",
        description=f"Compared FCFS, Priority, and SJF across {len(workload)} flights."
    )

    return SchedulingComparisonResponse(
        workload_count=len(workload),
        results=[fcfs_res, priority_res, sjf_res]
    )
