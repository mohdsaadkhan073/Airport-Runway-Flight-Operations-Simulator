from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class FlightOperation(Base):
    __tablename__ = "flight_operations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    flight_id = Column(Integer, ForeignKey("flights.id", ondelete="CASCADE"), nullable=False)
    runway_id = Column(Integer, ForeignKey("runways.id", ondelete="SET NULL"), nullable=True)
    algorithm = Column(String(32), nullable=False)
    start_time = Column(Integer, nullable=False)
    completion_time = Column(Integer, nullable=False)
    waiting_time = Column(Integer, nullable=False)
    turnaround_time = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="COMPLETED")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    flight = relationship("Flight", back_populates="operations")
    runway = relationship("Runway", back_populates="operations")
