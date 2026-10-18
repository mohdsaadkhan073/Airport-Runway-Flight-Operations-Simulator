import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base


class RunwayStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    UNAVAILABLE = "UNAVAILABLE"


class Runway(Base):
    __tablename__ = "runways"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(32), unique=True, index=True, nullable=False)
    status = Column(SQLEnum(RunwayStatus), nullable=False, default=RunwayStatus.AVAILABLE)
    current_flight_id = Column(Integer, ForeignKey("flights.id", ondelete="SET NULL"), nullable=True)
    supported_operations = Column(String(32), nullable=False, default="ALL")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    current_flight = relationship("Flight", foreign_keys=[current_flight_id])
    operations = relationship("FlightOperation", back_populates="runway")
