export type OperationType = 'TAKEOFF' | 'LANDING';

export type FlightStatus =
  | 'SCHEDULED'
  | 'WAITING'
  | 'ON_RUNWAY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'HOLDING';

export interface Flight {
  id: number;
  flight_number: string;
  aircraft_type: string;
  operation_type: OperationType;
  arrival_time: number;
  duration: number;
  priority: number;
  is_emergency: boolean;
  status: FlightStatus;
  remaining_duration: number;
  created_at: string;
  updated_at: string;
}

export interface FlightCreatePayload {
  flight_number: string;
  aircraft_type: string;
  operation_type: OperationType;
  arrival_time: number;
  duration: number;
  priority: number;
  is_emergency: boolean;
}

export interface FlightUpdatePayload {
  flight_number?: string;
  aircraft_type?: string;
  operation_type?: OperationType;
  arrival_time?: number;
  duration?: number;
  priority?: number;
  is_emergency?: boolean;
  status?: FlightStatus;
  remaining_duration?: number;
}

export interface FlightListResponse {
  total: number;
  items: Flight[];
}
