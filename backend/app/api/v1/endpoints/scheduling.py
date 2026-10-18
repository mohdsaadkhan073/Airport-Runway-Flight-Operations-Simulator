from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.scheduling import (
    ScheduleRunRequest,
    SchedulingResult,
    SchedulingComparisonResponse,
)
from app.services import scheduling_service

router = APIRouter()


@router.post("/run", response_model=SchedulingResult)
def run_scheduling_algorithm(
    request: ScheduleRunRequest,
    db: Session = Depends(get_db)
):
    return scheduling_service.run_scheduling(
        db=db,
        algorithm=request.algorithm,
        flight_ids=request.flight_ids,
        time_quantum=request.time_quantum or 3
    )


@router.get("/results", response_model=SchedulingResult)
def get_scheduling_results(
    algorithm: Optional[str] = Query(None, description="Algorithm name (FCFS, PRIORITY, ROUND_ROBIN)"),
    db: Session = Depends(get_db)
):
    return scheduling_service.get_last_results(db=db, algorithm=algorithm)


@router.post("/compare", response_model=SchedulingComparisonResponse)
def compare_scheduling_algorithms(
    request: ScheduleRunRequest,
    db: Session = Depends(get_db)
):
    return scheduling_service.compare_scheduling(
        db=db,
        flight_ids=request.flight_ids,
        time_quantum=request.time_quantum or 3
    )
