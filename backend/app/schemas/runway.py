from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.runway import RunwayStatus
from app.schemas.flight import FlightResponse


class RunwayBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=32)
    supported_operations: str = Field(default="ALL", max_length=32)


class RunwayCreate(RunwayBase):
    pass


class RunwayUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=32)
    status: Optional[RunwayStatus] = None
    supported_operations: Optional[str] = None


class RunwayResponse(RunwayBase):
    id: int
    status: RunwayStatus
    current_flight_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    current_flight: Optional[FlightResponse] = None

    model_config = ConfigDict(from_attributes=True)


class RunwayStatusSummary(BaseModel):
    total_runways: int
    available_runways: int
    occupied_runways: int
    unavailable_runways: int
    runways: List[RunwayResponse]
