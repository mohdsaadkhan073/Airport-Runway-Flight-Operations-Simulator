export interface StatusCount {
  status: string;
  count: number;
}

export interface OperationTypeCount {
  operation_type: string;
  count: number;
}

export interface AnalyticsOverviewResponse {
  total_flights: number;
  completed_flights: number;
  waiting_flights: number;
  on_runway_flights: number;
  holding_flights: number;
  emergency_flights: number;
  total_runways: number;
  available_runways: number;
  occupied_runways: number;
  unavailable_runways: number;
  runway_utilization_rate: number;
  average_waiting_time: number;
  average_turnaround_time: number;
  completed_throughput: number;
  status_distribution: StatusCount[];
  operation_distribution: OperationTypeCount[];
}

export interface AlgorithmComparisonItem {
  algorithm: string;
  average_waiting_time: number;
  average_turnaround_time: number;
  throughput: number;
  total_completed: number;
}

export interface AnalyticsSchedulingResponse {
  total_operations_recorded: number;
  comparisons: AlgorithmComparisonItem[];
  recent_performance: Array<{
    id: number;
    flight_id: number;
    runway_id: number;
    algorithm: string;
    waiting_time: number;
    turnaround_time: number;
    completion_time: number;
  }>;
}
