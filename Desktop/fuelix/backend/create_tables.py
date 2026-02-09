"""
Create database tables for Fuelix application using SQLite
"""
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.models.athlete_state import AthleteState
from app.models.training_conversation import TrainingConversation
from app.models.daily_log import DailyLog
from app.models.feedback import WorkoutFeedback
from app.models.injury import Injury
from app.models.training import TrainingSession
from app.models.progress import ProgressHistory
from app.models.chat_message import ChatMessage

def create_tables():
    """Create all tables in the database."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - athlete_state")
    print("  - training_conversation (for fine-tuning)")
    print("  - daily_log")
    print("  - injuries")
    print("  - training_session")
    print("  - workout_feedback")
    print("  - progress_history")
    print("  - chat_messages")

if __name__ == "__main__":
    create_tables()
