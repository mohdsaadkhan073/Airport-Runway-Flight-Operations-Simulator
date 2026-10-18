from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class MemoryAllocationRequest(BaseModel):
    process_name: str = Field(..., min_length=1, max_length=64)
    requested_size: int = Field(..., gt=0)
    algorithm: str = Field(default="FIRST_FIT")


class MemoryDeallocationRequest(BaseModel):
    block_id: str


class MemoryBlock(BaseModel):
    block_id: str
    start_address: int
    size: int
    is_allocated: bool
    process_name: Optional[str] = None


class MemoryAllocationResponse(BaseModel):
    id: int
    block_id: str
    process_name: str
    requested_size: int
    allocated_size: int
    start_address: int
    algorithm: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MemoryStateResponse(BaseModel):
    total_memory: int
    used_memory: int
    free_memory: int
    external_fragmentation: int
    blocks: List[MemoryBlock]
    allocations: List[MemoryAllocationResponse]
