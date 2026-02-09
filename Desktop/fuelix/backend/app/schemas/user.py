from typing import Optional
from datetime import date
from pydantic import BaseModel, EmailStr
from app.models.user import ActivityLevel

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    dob: Optional[date] = None
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    activity_level: Optional[ActivityLevel] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    full_name: str = "User"
    is_active: bool = True
    is_superuser: bool = False

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[date] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
