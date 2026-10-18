from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.memory import (
    MemoryAllocationRequest,
    MemoryDeallocationRequest,
    MemoryStateResponse,
)
from app.services import memory_service

router = APIRouter()


@router.get("/state", response_model=MemoryStateResponse)
def get_memory_state(db: Session = Depends(get_db)):
    return memory_service.get_memory_state(db)


@router.post("/allocate", response_model=MemoryStateResponse)
def allocate_memory_block(
    request: MemoryAllocationRequest,
    db: Session = Depends(get_db)
):
    return memory_service.allocate_memory(
        db=db,
        process_name=request.process_name,
        requested_size=request.requested_size,
        algorithm=request.algorithm
    )


@router.post("/deallocate", response_model=MemoryStateResponse)
def deallocate_memory_block(
    request: MemoryDeallocationRequest,
    db: Session = Depends(get_db)
):
    return memory_service.deallocate_memory(db=db, block_id=request.block_id)


@router.post("/reset", response_model=MemoryStateResponse)
def reset_memory_state(db: Session = Depends(get_db)):
    return memory_service.reset_memory(db=db)
