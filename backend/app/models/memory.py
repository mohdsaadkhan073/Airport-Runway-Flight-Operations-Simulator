from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base


class MemoryAllocation(Base):
    __tablename__ = "memory_allocations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    block_id = Column(String(64), nullable=False, index=True)
    process_name = Column(String(64), nullable=False)
    requested_size = Column(Integer, nullable=False)
    allocated_size = Column(Integer, nullable=False)
    start_address = Column(Integer, nullable=False)
    algorithm = Column(String(32), nullable=False)
    status = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
