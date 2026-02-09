from datetime import date
from typing import Any
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class DailyLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    
    # Ring Metrics
    total_calories_in = Column(Integer, default=0)
    total_training_minutes = Column(Integer, default=0)
    recovery_score = Column(Integer, default=0) # 0-100
    
    # Recovery Details
    sleep_hours = Column(Float, default=0.0)
    mood = Column(Integer, nullable=True) # 1-10
    soreness_level = Column(Integer, nullable=True) # 1-10
    notes = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="daily_logs")
