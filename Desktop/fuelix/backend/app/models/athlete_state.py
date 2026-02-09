from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, String, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from enum import Enum

class MesocyclePhase(str, Enum):
    ACCUMULATION = "Accumulation"
    PEAK = "Peak"
    DELOAD = "Deload"
    RECOVERY = "Recovery"

class AthleteState(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Fatigue State (0.0 - 100.0)
    cns_fatigue = Column(Float, default=0.0)
    muscular_fatigue_upper = Column(Float, default=0.0)
    muscular_fatigue_lower = Column(Float, default=0.0)
    cardio_fatigue = Column(Float, default=0.0)
    
    # Progression State
    current_mesocycle_phase = Column(SQLEnum(MesocyclePhase), default=MesocyclePhase.ACCUMULATION)
    week_in_phase = Column(Integer, default=1)
    
    # Last Activity
    last_workout_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="athlete_state")
