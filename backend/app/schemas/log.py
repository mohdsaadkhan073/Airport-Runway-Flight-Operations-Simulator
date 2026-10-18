from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class OperationLogResponse(BaseModel):
    id: int
    event_type: str
    flight_id: Optional[int] = None
    runway_id: Optional[int] = None
    simulation_time: int
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LogListResponse(BaseModel):
    total: int
    items: List[OperationLogResponse]
