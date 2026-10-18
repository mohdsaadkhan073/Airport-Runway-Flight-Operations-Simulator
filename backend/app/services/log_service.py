from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.log import OperationLog


def create_log(
    db: Session,
    event_type: str,
    description: str,
    flight_id: Optional[int] = None,
    runway_id: Optional[int] = None,
    simulation_time: int = 0
) -> OperationLog:
    log_entry = OperationLog(
        event_type=event_type,
        flight_id=flight_id,
        runway_id=runway_id,
        simulation_time=simulation_time,
        description=description
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def get_logs(
    db: Session,
    event_type: Optional[str] = None,
    flight_id: Optional[int] = None,
    runway_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[OperationLog], int]:
    query = db.query(OperationLog)
    if event_type:
        query = query.filter(OperationLog.event_type == event_type)
    if flight_id is not None:
        query = query.filter(OperationLog.flight_id == flight_id)
    if runway_id is not None:
        query = query.filter(OperationLog.runway_id == runway_id)

    total = query.count()
    items = query.order_by(desc(OperationLog.created_at)).offset(skip).limit(limit).all()
    return items, total
