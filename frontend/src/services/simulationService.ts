import { request } from './apiClient';
import { SimulationState, SimulationSettingsUpdate } from '../types/simulation';

export const simulationService = {
  async getState(): Promise<SimulationState> {
    return request<SimulationState>('/simulation/state');
  },

  async start(): Promise<SimulationState> {
    return request<SimulationState>('/simulation/start', { method: 'POST' });
  },

  async pause(): Promise<SimulationState> {
    return request<SimulationState>('/simulation/pause', { method: 'POST' });
  },

  async resume(): Promise<SimulationState> {
    return request<SimulationState>('/simulation/resume', { method: 'POST' });
  },

  async step(steps: number = 1): Promise<SimulationState> {
    return request<SimulationState>(`/simulation/step?steps=${steps}`, { method: 'POST' });
  },

  async reset(): Promise<SimulationState> {
    return request<SimulationState>('/simulation/reset', { method: 'POST' });
  },

  async updateSettings(settings: SimulationSettingsUpdate): Promise<SimulationState> {
    return request<SimulationState>('/simulation/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  async loadSampleData(overwrite: boolean = false): Promise<SimulationState> {
    return request<SimulationState>(`/simulation/sample-data?overwrite=${overwrite}`, {
      method: 'POST',
    });
  },
};
