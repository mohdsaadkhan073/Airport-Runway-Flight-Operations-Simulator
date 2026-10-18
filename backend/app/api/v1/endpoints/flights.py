from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.flight import FlightStatus, OperationType
from app.schemas.flight import (
    FlightCreate,
    FlightUpdate,
    FlightResponse,
    FlightListResponse,
)
from app.services import flight_service

router = APIRouter()


@router.get("", response_model=FlightListResponse)
def list_flights(
    search: Optional[str] = Query(None, description="Search flight number or aircraft type"),
    status: Optional[FlightStatus] = Query(None, description="Filter by flight status"),
    operation_type: Optional[OperationType] = Query(None, description="Filter by operation type"),
    is_emergency: Optional[bool] = Query(None, description="Filter by emergency status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sort_by: str = Query("arrival_time"),
    sort_order: str = Query("asc"),
    db: Session = Depends(get_db)
):
    flights, total = flight_service.get_flights(
        db=db,
        search=search,
        status_filter=status,
        operation_type=operation_type,
        is_emergency=is_emergency,
        skip=skip,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return FlightListResponse(total=total, items=flights)


@router.post("", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
def create_flight(
    flight_in: FlightCreate,
    db: Session = Depends(get_db)
):
    return flight_service.create_flight(db=db, flight_in=flight_in)


@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(
    flight_id: int,
    db: Session = Depends(get_db)
):
    flight = flight_service.get_flight_by_id(db=db, flight_id=flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flight with ID {flight_id} not found."
        )
    return flight


@router.patch("/{flight_id}", response_model=FlightResponse)
def update_flight(
    flight_id: int,
    flight_in: FlightUpdate,
    db: Session = Depends(get_db)
):
    flight = flight_service.get_flight_by_id(db=db, flight_id=flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flight with ID {flight_id} not found."
        )
    return flight_service.update_flight(db=db, flight=flight, flight_in=flight_in)


@router.delete("/{flight_id}", status_code=status.HTTP_200_OK)
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db)
):
    flight = flight_service.get_flight_by_id(db=db, flight_id=flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flight with ID {flight_id} not found."
        )
    flight_service.delete_flight(db=db, flight=flight)
    return {"status": "success", "message": f"Flight {flight.flight_number} deleted successfully."}
