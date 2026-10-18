import { Flight } from './flight';

export type RunwayStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNAVAILABLE';

export interface Runway {
  id: number;
  name: string;
  status: RunwayStatus;
  current_flight_id: number | null;
  supported_operations: string;
  created_at: string;
  updated_at: string;
  current_flight?: Flight | null;
}

export interface RunwayCreatePayload {
  name: string;
  supported_operations?: string;
}

export interface RunwayUpdatePayload {
  name?: string;
  status?: RunwayStatus;
  supported_operations?: string;
}

export interface RunwayStatusSummary {
  total_runways: number;
  available_runways: number;
  occupied_runways: number;
  unavailable_runways: number;
  runways: Runway[];
}
