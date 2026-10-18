import { request } from './apiClient';
import { MemoryStateResponse, MemoryAllocationRequest } from '../types/memory';

export const memoryService = {
  async getState(): Promise<MemoryStateResponse> {
    return request<MemoryStateResponse>('/memory/state');
  },

  async allocate(payload: MemoryAllocationRequest): Promise<MemoryStateResponse> {
    return request<MemoryStateResponse>('/memory/allocate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deallocate(blockId: string): Promise<MemoryStateResponse> {
    return request<MemoryStateResponse>('/memory/deallocate', {
      method: 'POST',
      body: JSON.stringify({ block_id: blockId }),
    });
  },

  async reset(): Promise<MemoryStateResponse> {
    return request<MemoryStateResponse>('/memory/reset', {
      method: 'POST',
    });
  },

  async defragment(): Promise<MemoryStateResponse> {
    return request<MemoryStateResponse>('/memory/defragment', {
      method: 'POST',
    });
  },
};
