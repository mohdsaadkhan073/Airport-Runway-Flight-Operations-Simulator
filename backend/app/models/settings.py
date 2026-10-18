from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.db.base import Base


class SimulationSettings(Base):
    __tablename__ = "simulation_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    runway_count = Column(Integer, nullable=False, default=1)
    default_algorithm = Column(String(32), nullable=False, default="FCFS")
    speed_multiplier = Column(Float, nullable=False, default=1.0)
    time_quantum = Column(Integer, nullable=False, default=3)
    current_time = Column(Integer, nullable=False, default=0)
    is_running = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
