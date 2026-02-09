import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User, ActivityLevel
from app.models.athlete_state import AthleteState
from app.models.injury import Injury
from app.models.progress import ProgressHistory
from app.models.daily_log import DailyLog
from app.models.daily_task import DailyTask
from app.models.chat_message import ChatMessage
from app.models.feedback import WorkoutFeedback
from app.models.nutrition import NutritionLog, WaterLog
from app.models.training import TrainingSession
from app.models.training_conversation import TrainingConversation

# Use the REAL database file
SQLALCHEMY_DATABASE_URL = "sqlite:///./fuelix.db"

def debug_real_db():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL}...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # We expect tables to exist now.
    
    db = SessionLocal()
    
    print("Attempting to read Users...")
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users.")
    except Exception as e:
        print(f"Error Reading Users: {e}")
        return

    print("Attempting to Create User...")
    try:
        import random
        email = f"debug_real_{random.randint(1000,9999)}@example.com"
        user = User(
            email=email,
            hashed_password="hash",
            full_name="Debug Real User",
            activity_level=ActivityLevel.ACTIVE
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User Created: {user.id}")
        
        # Create AthleteState
        state = AthleteState(user_id=user.id)
        db.add(state)
        db.commit()
        print("AthleteState Created.")
        
    except Exception as e:
        print(f"Error Creating User/State: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_real_db()
