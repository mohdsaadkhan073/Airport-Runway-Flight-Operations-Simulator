import { request } from './apiClient';
import {
  Flight,
  FlightCreatePayload,
  FlightUpdatePayload,
  FlightListResponse,
  FlightStatus,
  OperationType,
} from '../types/flight';

export interface GetFlightsParams {
  search?: string;
  status?: FlightStatus;
  operation_type?: OperationType;
  is_emergency?: boolean;
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const flightService = {
  async getFlights(params: GetFlightsParams = {}): Promise<FlightListResponse> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.operation_type) searchParams.append('operation_type', params.operation_type);
    if (params.is_emergency !== undefined) searchParams.append('is_emergency', String(params.is_emergency));
    if (params.skip !== undefined) searchParams.append('skip', String(params.skip));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
    if (params.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params.sort_order) searchParams.append('sort_order', params.sort_order);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<FlightListResponse>(`/flights${query}`);
  },

  async getFlight(id: number): Promise<Flight> {
    return request<Flight>(`/flights/${id}`);
  },

  async createFlight(payload: FlightCreatePayload): Promise<Flight> {
    return request<Flight>('/flights', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateFlight(id: number, payload: FlightUpdatePayload): Promise<Flight> {
    return request<Flight>(`/flights/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteFlight(id: number): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>(`/flights/${id}`, {
      method: 'DELETE',
    });
  },
};
