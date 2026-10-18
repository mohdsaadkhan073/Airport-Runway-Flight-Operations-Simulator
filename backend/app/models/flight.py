import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base


class OperationType(str, enum.Enum):
    TAKEOFF = "TAKEOFF"
    LANDING = "LANDING"


class FlightStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    WAITING = "WAITING"
    ON_RUNWAY = "ON_RUNWAY"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    HOLDING = "HOLDING"


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    flight_number = Column(String(32), unique=True, index=True, nullable=False)
    aircraft_type = Column(String(64), nullable=False)
    operation_type = Column(SQLEnum(OperationType), nullable=False)
    arrival_time = Column(Integer, nullable=False, default=0)
    duration = Column(Integer, nullable=False)
    priority = Column(Integer, nullable=False, default=3)
    is_emergency = Column(Boolean, nullable=False, default=False)
    status = Column(SQLEnum(FlightStatus), nullable=False, default=FlightStatus.SCHEDULED)
    remaining_duration = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    operations = relationship("FlightOperation", back_populates="flight", cascade="all, delete-orphan")
