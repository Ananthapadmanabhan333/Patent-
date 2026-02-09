from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime
import enum

class TaskPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TaskCategory(str, enum.Enum):
    TRAINING = "training"
    NUTRITION = "nutrition"
    RECOVERY = "recovery"
    MINDSET = "mindset"

class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, index=True)
    message = Column(String) # The AI-generated context
    category = Column(String) # TaskCategory
    priority = Column(String) # TaskPriority
    
    is_completed = Column(Boolean, default=False)
    due_date = Column(DateTime) # Usually just the date, or specific time
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="tasks")
