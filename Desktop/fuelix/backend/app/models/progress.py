from datetime import date, datetime
from typing import Optional
from sqlalchemy import Column, Integer, Float, Date, String, ForeignKey, Enum as SQLEnum, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class MetricType(str, enum.Enum):
    WEIGHT = "weight"
    BODY_FAT = "body_fat"
    SQUAT_1RM = "squat_1rm"
    BENCH_1RM = "bench_1rm"
    DEADLIFT_1RM = "deadlift_1rm"
    RUN_5K_TIME = "run_5k_time"

class ProgressHistory(Base):
    """
    Tracks historical progress for various metrics.
    """
    __tablename__ = "progress_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(Date, default=date.today, nullable=False)
    metric_type = Column(SQLEnum(MetricType), nullable=False)
    value = Column(Float, nullable=False) # Store everything as float (kg, %, minutes)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="progress_history")
