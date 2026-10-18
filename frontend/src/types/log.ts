export interface OperationLogItem {
  id: number;
  event_type: string;
  flight_id: number | null;
  runway_id: number | null;
  simulation_time: number;
  description: string;
  created_at: string;
}

export interface LogListResponse {
  total: number;
  items: OperationLogItem[];
}
