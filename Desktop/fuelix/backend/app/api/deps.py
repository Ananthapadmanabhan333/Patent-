from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/access-token"
)

def get_db() -> Generator:
    """
    Database session dependency.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    # Mock token removed for production/strict auth
    # if token == "mock_token_for_dev": ... logic deleted
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_mock_user(db: Session = None) -> User:
    """
    For MVP: Returns a mock user object.
    Now used to instantiate the user for DB storage.
    """
    # Create a mock user object 
    # Note: ID is not set here so DB can auto-increment/assign
    # Using a proper bcrypt hash for password "test123"
    mock_user = User(
        email="test@fuelix.com",
        full_name="Test User",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqgdW6Kzm2",  # bcrypt hash of "test123"
        is_active=True,
        current_weight_kg=75.0,
        activity_level="Active", # Match Enum value
        equipment_access=["bodyweight", "dumbbells"]
    )
    return mock_user
