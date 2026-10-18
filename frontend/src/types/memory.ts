export interface MemoryBlock {
  block_id: string;
  start_address: number;
  size: number;
  is_allocated: boolean;
  process_name: string | null;
}

export interface MemoryAllocationRecord {
  id: number;
  block_id: string;
  process_name: string;
  requested_size: number;
  allocated_size: number;
  start_address: number;
  algorithm: string;
  status: string;
  created_at: string;
}

export interface MemoryStateResponse {
  total_memory: number;
  used_memory: number;
  free_memory: number;
  external_fragmentation: number;
  blocks: MemoryBlock[];
  allocations: MemoryAllocationRecord[];
}

export interface MemoryAllocationRequest {
  process_name: string;
  requested_size: number;
  algorithm: string;
}
