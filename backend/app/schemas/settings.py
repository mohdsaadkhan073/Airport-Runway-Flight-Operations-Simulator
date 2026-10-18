from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SimulationSettingsBase(BaseModel):
    runway_count: int = Field(default=1, ge=1, le=10)
    default_algorithm: str = Field(default="FCFS")
    speed_multiplier: float = Field(default=1.0, ge=0.1, le=10.0)
    time_quantum: int = Field(default=3, ge=1, le=60)


class SimulationSettingsUpdate(BaseModel):
    runway_count: Optional[int] = Field(None, ge=1, le=10)
    default_algorithm: Optional[str] = None
    speed_multiplier: Optional[float] = Field(None, ge=0.1, le=10.0)
    time_quantum: Optional[int] = Field(None, ge=1, le=60)


class SimulationSettingsResponse(SimulationSettingsBase):
    id: int
    current_time: int
    is_running: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
