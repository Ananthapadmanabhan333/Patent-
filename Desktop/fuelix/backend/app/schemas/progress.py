from datetime import date
from typing import Optional
from pydantic import BaseModel
from enum import Enum

class MetricType(str, Enum):
    WEIGHT = "weight"
    BODY_FAT = "body_fat"
    SQUAT_1RM = "squat_1rm"
    BENCH_1RM = "bench_1rm"
    DEADLIFT_1RM = "deadlift_1rm"
    RUN_5K_TIME = "run_5k_time"

class ProgressBase(BaseModel):
    metric_type: MetricType
    value: float
    date: Optional[date] = None
    notes: Optional[str] = None

class ProgressCreate(ProgressBase):
    pass

class Progress(ProgressBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True
