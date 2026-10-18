import { request } from './apiClient';
import {
  ScheduleRunRequest,
  SchedulingResult,
  SchedulingComparisonResponse,
} from '../types/scheduling';

export const schedulingService = {
  async runScheduling(payload: ScheduleRunRequest): Promise<SchedulingResult> {
    return request<SchedulingResult>('/scheduling/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSchedulingResults(algorithm?: string): Promise<SchedulingResult> {
    const query = algorithm ? `?algorithm=${encodeURIComponent(algorithm)}` : '';
    return request<SchedulingResult>(`/scheduling/results${query}`);
  },

  async compareScheduling(payload: ScheduleRunRequest = { algorithm: 'ALL' }): Promise<SchedulingComparisonResponse> {
    return request<SchedulingComparisonResponse>('/scheduling/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
