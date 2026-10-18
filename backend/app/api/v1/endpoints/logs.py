from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.log import LogListResponse, OperationLogResponse
from app.services import log_service
from app.models.log import OperationLog

router = APIRouter()


@router.get("", response_model=LogListResponse)
def list_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    flight_id: Optional[int] = Query(None, description="Filter by flight ID"),
    runway_id: Optional[int] = Query(None, description="Filter by runway ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    items, total = log_service.get_logs(
        db=db,
        event_type=event_type,
        flight_id=flight_id,
        runway_id=runway_id,
        skip=skip,
        limit=limit
    )
    log_responses = [OperationLogResponse.model_validate(item) for item in items]
    return LogListResponse(total=total, items=log_responses)


@router.delete("", status_code=status.HTTP_200_OK)
def clear_logs(
    confirm: bool = Query(False, description="Explicit confirmation required to clear history"),
    db: Session = Depends(get_db)
):
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required. Set confirm=true to clear operation logs."
        )

    deleted_count = db.query(OperationLog).delete()
    db.commit()

    log_service.create_log(
        db=db,
        event_type="LOGS_CLEARED",
        description=f"Administrative log clearance removed {deleted_count} records."
    )

    return {"status": "success", "message": f"Cleared {deleted_count} log entries."}
