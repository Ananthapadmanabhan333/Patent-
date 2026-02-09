from datetime import datetime
from typing import Any, Dict, List
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from enum import Enum

class TrainingType(str, Enum):
    BOXING = "Boxing"
    STRENGTH = "Strength"
    CARDIO = "Cardio"
    ATHLETICS = "Athletics"

class TrainingSession(Base):
    __tablename__ = "training_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    type = Column(SQLEnum(TrainingType), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=False)
    rpe = Column(Integer, nullable=True) # Rate of Perceived Exertion (1-10)
    
    # Store specific data like punch counts, sets/reps, etc as JSON
    load_data = Column(JSON, nullable=True)
    
    notes = Column(String, nullable=True)
    
    user = relationship("User", back_populates="training_sessions")
    feedback = relationship("WorkoutFeedback", back_populates="training_session")
