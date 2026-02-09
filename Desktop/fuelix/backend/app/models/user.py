from datetime import date
from typing import Optional
from enum import Enum
from sqlalchemy import Column, String, Integer, Float, Date, Enum as SQLEnum, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class ActivityLevel(str, Enum):
    SEDENTARY = "Sedentary"
    MODERATE = "Moderate"
    ACTIVE = "Active"
    ATHLETE = "Athlete"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Integer, default=True)
    is_superuser = Column(Integer, default=False)
    
    # Physical Stats
    dob = Column(Date, nullable=True)
    height_cm = Column(Float, nullable=True)
    current_weight_kg = Column(Float, nullable=True)
    activity_level = Column(SQLEnum(ActivityLevel), default=ActivityLevel.SEDENTARY)
    
    # AI Integration
    equipment_access = Column(JSON, default=["bodyweight"]) # List of equipment
    
    injuries = relationship("Injury", back_populates="owner")
    nutrition_logs = relationship("NutritionLog", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")
    tasks = relationship("DailyTask", back_populates="owner")
    training_sessions = relationship("TrainingSession", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")
    athlete_state = relationship("AthleteState", back_populates="user", uselist=False)
    progress_history = relationship("ProgressHistory", back_populates="user")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
