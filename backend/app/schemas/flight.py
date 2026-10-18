from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.flight import OperationType, FlightStatus


class FlightBase(BaseModel):
    flight_number: str = Field(..., min_length=2, max_length=32)
    aircraft_type: str = Field(..., min_length=2, max_length=64)
    operation_type: OperationType
    arrival_time: int = Field(default=0, ge=0)
    duration: int = Field(..., gt=0, le=3600)
    priority: int = Field(default=3, ge=1, le=5)
    is_emergency: bool = Field(default=False)


class FlightCreate(FlightBase):
    pass


class FlightUpdate(BaseModel):
    flight_number: Optional[str] = Field(None, min_length=2, max_length=32)
    aircraft_type: Optional[str] = Field(None, min_length=2, max_length=64)
    operation_type: Optional[OperationType] = None
    arrival_time: Optional[int] = Field(None, ge=0)
    duration: Optional[int] = Field(None, gt=0, le=3600)
    priority: Optional[int] = Field(None, ge=1, le=5)
    is_emergency: Optional[bool] = None
    status: Optional[FlightStatus] = None
    remaining_duration: Optional[int] = Field(None, ge=0)


class FlightResponse(FlightBase):
    id: int
    status: FlightStatus
    remaining_duration: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlightListResponse(BaseModel):
    total: int
    items: List[FlightResponse]
