import { request } from './apiClient';
import { LogListResponse } from '../types/log';

export interface GetLogsParams {
  event_type?: string;
  flight_id?: number;
  runway_id?: number;
  skip?: number;
  limit?: number;
}

export const logService = {
  async getLogs(params: GetLogsParams = {}): Promise<LogListResponse> {
    const searchParams = new URLSearchParams();
    if (params.event_type) searchParams.append('event_type', params.event_type);
    if (params.flight_id !== undefined) searchParams.append('flight_id', String(params.flight_id));
    if (params.runway_id !== undefined) searchParams.append('runway_id', String(params.runway_id));
    if (params.skip !== undefined) searchParams.append('skip', String(params.skip));
    if (params.limit !== undefined) searchParams.append('limit', String(params.limit));

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<LogListResponse>(`/logs${query}`);
  },

  async clearLogs(): Promise<{ status: string; message: string }> {
    return request<{ status: string; message: string }>('/logs?confirm=true', {
      method: 'DELETE',
    });
  },
};
