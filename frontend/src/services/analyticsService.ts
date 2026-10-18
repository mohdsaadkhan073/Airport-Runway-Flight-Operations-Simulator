import { request } from './apiClient';
import { AnalyticsOverviewResponse, AnalyticsSchedulingResponse } from '../types/analytics';

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverviewResponse> {
    return request<AnalyticsOverviewResponse>('/analytics/overview');
  },

  async getScheduling(): Promise<AnalyticsSchedulingResponse> {
    return request<AnalyticsSchedulingResponse>('/analytics/scheduling');
  },
};
