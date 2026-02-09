from sqlalchemy import Column, Integer, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class WorkoutFeedback(Base):
    id = Column(Integer, primary_key=True, index=True)
    training_session_id = Column(Integer, ForeignKey("training_sessions.id"), nullable=False)
    
    rpe = Column(Integer, nullable=False) # 1-10
    enjoyment = Column(Integer, nullable=False) # 1-5
    
    # Detailed soreness map e.g. {"shoulders": 5, "quads": 2}
    soreness_map = Column(JSON, default={})
    
    training_session = relationship("TrainingSession", back_populates="feedback")
