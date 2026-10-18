from typing import List, Dict, Any
from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class OperationTypeCount(BaseModel):
    operation_type: str
    count: int


class AnalyticsOverviewResponse(BaseModel):
    total_flights: int
    completed_flights: int
    waiting_flights: int
    on_runway_flights: int
    holding_flights: int
    emergency_flights: int
    total_runways: int
    available_runways: int
    occupied_runways: int
    unavailable_runways: int
    runway_utilization_rate: float
    average_waiting_time: float
    average_turnaround_time: float
    completed_throughput: float
    status_distribution: List[StatusCount]
    operation_distribution: List[OperationTypeCount]


class AlgorithmComparisonItem(BaseModel):
    algorithm: str
    average_waiting_time: float
    average_turnaround_time: float
    throughput: float
    total_completed: int


class AnalyticsSchedulingResponse(BaseModel):
    total_operations_recorded: int
    comparisons: List[AlgorithmComparisonItem]
    recent_performance: List[Dict[str, Any]]
