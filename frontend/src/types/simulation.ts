export interface SimulationRunwayState {
  id: number;
  name: string;
  status: string;
  current_flight_id: number | null;
  supported_operations: string;
  current_flight?: {
    id: number;
    flight_number: string;
    aircraft_type: string;
    operation_type: string;
    remaining_duration: number;
    duration: number;
    priority: number;
    is_emergency: boolean;
  } | null;
}

export interface WaitingQueueItem {
  id: number;
  flight_number: string;
  aircraft_type: string;
  operation_type: string;
  arrival_time: number;
  duration: number;
  priority: number;
  is_emergency: boolean;
}

export interface SimulationState {
  current_time: number;
  is_running: boolean;
  speed_multiplier: number;
  default_algorithm: string;
  time_quantum: number;
  runways: SimulationRunwayState[];
  active_flights_count: number;
  waiting_flights_count: number;
  scheduled_flights_count: number;
  completed_flights_count: number;
  can_rewind?: boolean;
  waiting_queue: WaitingQueueItem[];
}

export interface SimulationSettingsUpdate {
  runway_count?: number;
  default_algorithm?: string;
  speed_multiplier?: number;
  time_quantum?: number;
}
