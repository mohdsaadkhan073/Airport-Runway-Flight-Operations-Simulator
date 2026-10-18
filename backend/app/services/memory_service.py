import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.memory import MemoryAllocation
from app.schemas.memory import (
    MemoryBlock,
    MemoryStateResponse,
    MemoryAllocationResponse,
)
from app.algorithms.memory_fit import (
    find_block_first_fit,
    find_block_best_fit,
    find_block_worst_fit,
)
from app.services.log_service import create_log

_TOTAL_MEMORY = 1024
_blocks: List[Dict[str, Any]] = [
    {
        "block_id": "block-init",
        "start_address": 0,
        "size": _TOTAL_MEMORY,
        "is_allocated": False,
        "process_name": None
    }
]


def _coalesce_free_blocks():
    global _blocks
    _blocks.sort(key=lambda b: b["start_address"])
    merged = []
    for b in _blocks:
        if not merged:
            merged.append(b)
        else:
            prev = merged[-1]
            if not prev["is_allocated"] and not b["is_allocated"]:
                prev["size"] += b["size"]
            else:
                merged.append(b)
    _blocks = merged


def get_memory_state(db: Session) -> MemoryStateResponse:
    _coalesce_free_blocks()
    used_memory = sum(b["size"] for b in _blocks if b["is_allocated"])
    free_memory = _TOTAL_MEMORY - used_memory
    max_contiguous_free = max((b["size"] for b in _blocks if not b["is_allocated"]), default=0)
    external_fragmentation = max(0, free_memory - max_contiguous_free)

    allocations = db.query(MemoryAllocation).order_by(MemoryAllocation.created_at.desc()).limit(50).all()

    return MemoryStateResponse(
        total_memory=_TOTAL_MEMORY,
        used_memory=used_memory,
        free_memory=free_memory,
        external_fragmentation=external_fragmentation,
        blocks=[MemoryBlock(**b) for b in _blocks],
        allocations=[MemoryAllocationResponse.model_validate(a) for a in allocations]
    )


def allocate_memory(
    db: Session,
    process_name: str,
    requested_size: int,
    algorithm: str = "FIRST_FIT"
) -> MemoryStateResponse:
    _coalesce_free_blocks()
    algo_upper = algorithm.strip().upper()

    free_indices = [i for i, b in enumerate(_blocks) if not b["is_allocated"]]
    free_candidates = [_blocks[i] for i in free_indices]

    chosen_relative_idx: Optional[int] = None
    if algo_upper == "FIRST_FIT":
        chosen_relative_idx = find_block_first_fit(free_candidates, requested_size)
    elif algo_upper == "BEST_FIT":
        chosen_relative_idx = find_block_best_fit(free_candidates, requested_size)
    elif algo_upper == "WORST_FIT":
        chosen_relative_idx = find_block_worst_fit(free_candidates, requested_size)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown memory allocation algorithm '{algorithm}'. Use FIRST_FIT, BEST_FIT, or WORST_FIT."
        )

    if chosen_relative_idx is None:
        failed_record = MemoryAllocation(
            block_id="FAILED",
            process_name=process_name,
            requested_size=requested_size,
            allocated_size=0,
            start_address=-1,
            algorithm=algo_upper,
            status="FAILED"
        )
        db.add(failed_record)
        db.commit()

        create_log(
            db=db,
            event_type="MEMORY_ALLOCATION_FAILED",
            description=f"Failed to allocate {requested_size} KB for {process_name} ({algo_upper})."
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Out of Memory / Fragmentation: Cannot find contiguous block of size {requested_size} KB."
        )

    block_idx = free_indices[chosen_relative_idx]
    target_block = _blocks[block_idx]

    alloc_id = f"mem-{uuid.uuid4().hex[:6]}"
    allocated_block = {
        "block_id": alloc_id,
        "start_address": target_block["start_address"],
        "size": requested_size,
        "is_allocated": True,
        "process_name": process_name
    }

    leftover_size = target_block["size"] - requested_size
    if leftover_size > 0:
        remainder_block = {
            "block_id": f"free-{uuid.uuid4().hex[:6]}",
            "start_address": target_block["start_address"] + requested_size,
            "size": leftover_size,
            "is_allocated": False,
            "process_name": None
        }
        _blocks[block_idx] = allocated_block
        _blocks.insert(block_idx + 1, remainder_block)
    else:
        _blocks[block_idx] = allocated_block

    record = MemoryAllocation(
        block_id=alloc_id,
        process_name=process_name,
        requested_size=requested_size,
        allocated_size=requested_size,
        start_address=allocated_block["start_address"],
        algorithm=algo_upper,
        status="ALLOCATED"
    )
    db.add(record)
    db.commit()

    create_log(
        db=db,
        event_type="MEMORY_ALLOCATED",
        description=f"Allocated {requested_size} KB at address {allocated_block['start_address']} for {process_name} using {algo_upper}."
    )

    return get_memory_state(db)


def deallocate_memory(db: Session, block_id: str) -> MemoryStateResponse:
    global _blocks
    found = False
    process_name = "Unknown"
    for b in _blocks:
        if b["block_id"] == block_id and b["is_allocated"]:
            b["is_allocated"] = False
            process_name = b["process_name"] or "Unknown"
            b["process_name"] = None
            found = True
            break

    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Allocated memory block with ID '{block_id}' not found."
        )

    _coalesce_free_blocks()

    record = db.query(MemoryAllocation).filter(MemoryAllocation.block_id == block_id).first()
    if record:
        record.status = "DEALLOCATED"
        db.commit()

    create_log(
        db=db,
        event_type="MEMORY_DEALLOCATED",
        description=f"Deallocated block {block_id} of {process_name}."
    )

    return get_memory_state(db)


def reset_memory(db: Session) -> MemoryStateResponse:
    global _blocks
    _blocks = [
        {
            "block_id": "block-init",
            "start_address": 0,
            "size": _TOTAL_MEMORY,
            "is_allocated": False,
            "process_name": None
        }
    ]

    create_log(
        db=db,
        event_type="MEMORY_RESET",
        description="Memory pool reset to 1024 KB initial state."
    )

    return get_memory_state(db)


def defragment_memory(db: Session) -> MemoryStateResponse:
    global _blocks
    allocated = [b for b in _blocks if b["is_allocated"]]
    total_allocated = sum(b["size"] for b in allocated)
    free_size = _TOTAL_MEMORY - total_allocated

    new_blocks = []
    current_addr = 0
    for b in allocated:
        b["start_address"] = current_addr
        new_blocks.append(b)
        current_addr += b["size"]

    if free_size > 0:
        new_blocks.append({
            "block_id": f"free-{uuid.uuid4().hex[:6]}",
            "start_address": current_addr,
            "size": free_size,
            "is_allocated": False,
            "process_name": None
        })

    _blocks = new_blocks

    create_log(
        db=db,
        event_type="MEMORY_DEFRAGMENTED",
        description=f"Compacted memory pool: consolidated {len(allocated)} active blocks, created {free_size} KB contiguous free space."
    )

    return get_memory_state(db)

