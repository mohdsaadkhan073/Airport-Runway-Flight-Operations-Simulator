from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    AnalyticsSchedulingResponse,
)
from app.services import analytics_service

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    return analytics_service.get_analytics_overview(db)


@router.get("/scheduling", response_model=AnalyticsSchedulingResponse)
def get_analytics_scheduling(db: Session = Depends(get_db)):
    return analytics_service.get_analytics_scheduling(db)
