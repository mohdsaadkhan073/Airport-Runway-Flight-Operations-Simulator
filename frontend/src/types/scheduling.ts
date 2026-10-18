export interface ScheduleRunRequest {
  algorithm: string;
  flight_ids?: number[];
  time_quantum?: number;
}

export interface FlightScheduleItem {
  flight_id: number;
  flight_number: string;
  operation_type: string;
  arrival_time: number;
  duration: number;
  priority: number;
  is_emergency: boolean;
  start_time: number;
  completion_time: number;
  waiting_time: number;
  turnaround_time: number;
}

export interface GanttInterval {
  flight_id: number;
  flight_number: string;
  start_time: number;
  end_time: number;
  is_emergency: boolean;
}

export interface SchedulingResult {
  algorithm: string;
  items: FlightScheduleItem[];
  gantt_intervals: GanttInterval[];
  average_waiting_time: number;
  average_turnaround_time: number;
  throughput: number;
  total_duration: number;
}

export interface SchedulingComparisonResponse {
  workload_count: number;
  results: SchedulingResult[];
}
