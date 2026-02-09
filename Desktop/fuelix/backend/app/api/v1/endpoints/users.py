from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.models.user import User
from app.models.athlete_state import AthleteState
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.models.progress import ProgressHistory
from app.schemas.progress import Progress as ProgressSchema, ProgressCreate

router = APIRouter()

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
            
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system.",
            )
        
        hashed_password = security.get_password_hash(user_in.password)
        db_obj = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_superuser=user_in.is_superuser if hasattr(user_in, 'is_superuser') else False,
            is_active=user_in.is_active if hasattr(user_in, 'is_active') else True,
            dob=user_in.dob if hasattr(user_in, 'dob') else None,
            height_cm=user_in.height_cm if hasattr(user_in, 'height_cm') else None,
            current_weight_kg=user_in.current_weight_kg if hasattr(user_in, 'current_weight_kg') else None,
            activity_level=user_in.activity_level if hasattr(user_in, 'activity_level') else None
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Create initial athlete state
        athlete_state = AthleteState(user_id=db_obj.id)
        db.add(athlete_state)
        db.commit()
        
        return db_obj
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.get("/me", response_model=UserSchema)
@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user profile.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    # Update user fields
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/progress", response_model=ProgressSchema)
def create_user_progress(
    *,
    db: Session = Depends(deps.get_db),
    progress_in: ProgressCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Log new progress entry.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    progress = ProgressHistory(
        user_id=current_user.id,
        metric_type=progress_in.metric_type,
        value=progress_in.value,
        date=progress_in.date or date.today(),
        notes=progress_in.notes
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

@router.get("/me/progress", response_model=List[ProgressSchema])
def read_user_progress(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get progress history.
    """
    if db is None:
        return []
        
    progress = db.query(ProgressHistory).filter(
        ProgressHistory.user_id == current_user.id
    ).order_by(ProgressHistory.date.desc()).offset(skip).limit(limit).all()
    return progress
