from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.runway import (
    RunwayCreate,
    RunwayUpdate,
    RunwayResponse,
    RunwayStatusSummary,
)
from app.services import runway_service

router = APIRouter()


@router.get("", response_model=List[RunwayResponse])
def list_runways(db: Session = Depends(get_db)):
    runways = runway_service.get_runways(db)
    return runways


@router.post("", response_model=RunwayResponse, status_code=status.HTTP_201_CREATED)
def create_runway(
    runway_in: RunwayCreate,
    db: Session = Depends(get_db)
):
    return runway_service.create_runway(db=db, runway_in=runway_in)


@router.get("/status", response_model=RunwayStatusSummary)
def get_runway_status(db: Session = Depends(get_db)):
    return runway_service.get_runway_status_summary(db=db)


@router.patch("/{runway_id}", response_model=RunwayResponse)
def update_runway(
    runway_id: int,
    runway_in: RunwayUpdate,
    db: Session = Depends(get_db)
):
    runway = runway_service.get_runway_by_id(db=db, runway_id=runway_id)
    if not runway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Runway with ID {runway_id} not found."
        )
    return runway_service.update_runway(db=db, runway=runway, runway_in=runway_in)
