from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base


class OperationLog(Base):
    __tablename__ = "operation_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(64), nullable=False, index=True)
    flight_id = Column(Integer, nullable=True, index=True)
    runway_id = Column(Integer, nullable=True, index=True)
    simulation_time = Column(Integer, nullable=False, default=0)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
