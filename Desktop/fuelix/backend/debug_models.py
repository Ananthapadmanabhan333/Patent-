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
from app.core import security

def debug_models():
    print("Initializing In-Memory DB...")
    engine = create_engine("sqlite:///:memory:")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    print("Creating Tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables Created Successfully.")
    except Exception as e:
        print(f"Error Creating Tables: {e}")
        return

    db = SessionLocal()
    
    print("Creating User...")
    try:
        user = User(
            email="debug@example.com",
            hashed_password="hash",
            full_name="Debug User",
            activity_level=ActivityLevel.ACTIVE
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User Created: {user.id}")
    except Exception as e:
        print(f"Error Creating User: {e}")
        return

    print("Creating AthleteState...")
    try:
        state = AthleteState(user_id=user.id)
        db.add(state)
        db.commit()
        print("AthleteState Created.")
    except Exception as e:
        print(f"Error Creating AthleteState: {e}")
        return

    print("Model Debug Complete. No Issues Found locally.")

if __name__ == "__main__":
    debug_models()
