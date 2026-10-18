from typing import List, Optional
from pydantic import BaseModel, Field


class ScheduleRunRequest(BaseModel):
    algorithm: str = Field(default="FCFS")
    flight_ids: Optional[List[int]] = None
    time_quantum: Optional[int] = Field(default=3, ge=1, le=60)


class FlightScheduleItem(BaseModel):
    flight_id: int
    flight_number: str
    operation_type: str
    arrival_time: int
    duration: int
    priority: int
    is_emergency: bool
    start_time: int
    completion_time: int
    waiting_time: int
    turnaround_time: int


class GanttInterval(BaseModel):
    flight_id: int
    flight_number: str
    start_time: int
    end_time: int
    is_emergency: bool


class SchedulingResult(BaseModel):
    algorithm: str
    items: List[FlightScheduleItem]
    gantt_intervals: List[GanttInterval]
    average_waiting_time: float
    average_turnaround_time: float
    throughput: float
    total_duration: int


class SchedulingComparisonResponse(BaseModel):
    workload_count: int
    results: List[SchedulingResult]
