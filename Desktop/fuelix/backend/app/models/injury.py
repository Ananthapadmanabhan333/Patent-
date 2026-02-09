from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Float, Text
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime
import enum

class BodyPart(str, enum.Enum):
    SHOULDER = "shoulder"
    KNEE = "knee"
    LOWER_BACK = "lower_back"
    ANKLE = "ankle"
    WRIST = "wrist"
    ELBOW = "elbow"
    HIP = "hip"
    GENERAL = "general"

class InjuryType(str, enum.Enum):
    STRAIN = "strain"
    SPRAIN = "sprain"
    IMPACT = "impact"
    OVERUSE = "overuse"
    SORENESS = "soreness"
    SURGERY = "surgery"

class InjuryStatus(str, enum.Enum):
    ACTIVE = "active"
    REHAB = "rehab"
    HEALED = "healed"

class Injury(Base):
    __tablename__ = "injuries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    body_part = Column(String) # BodyPart enum
    injury_type = Column(String) # InjuryType enum
    severity = Column(String) # mild, moderate, severe
    pain_level = Column(Integer) # 1-10
    status = Column(String, default=InjuryStatus.ACTIVE.value)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="injuries")
