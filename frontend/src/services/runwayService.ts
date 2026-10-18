import { request } from './apiClient';
import {
  Runway,
  RunwayCreatePayload,
  RunwayUpdatePayload,
  RunwayStatusSummary,
} from '../types/runway';

export const runwayService = {
  async getRunways(): Promise<Runway[]> {
    return request<Runway[]>('/runways');
  },

  async getRunwayStatus(): Promise<RunwayStatusSummary> {
    return request<RunwayStatusSummary>('/runways/status');
  },

  async createRunway(payload: RunwayCreatePayload): Promise<Runway> {
    return request<Runway>('/runways', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateRunway(id: number, payload: RunwayUpdatePayload): Promise<Runway> {
    return request<Runway>(`/runways/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
