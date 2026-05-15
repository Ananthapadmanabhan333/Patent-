from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.shared.database import get_db
from backend.shared.models import User, Subscription, UserRole, SubscriptionStatus
from backend.shared.schemas import UserCreate, UserLogin, Token, UserOut
from backend.services.auth.security import (
    verify_password, get_password_hash, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Handle Organization
    from backend.shared.models import Organization
    org_id = None
    role = UserRole.FREE
    
    if user_data.organization_name:
        org = Organization(name=user_data.organization_name)
        db.add(org)
        await db.flush()
        org_id = org.id
        role = UserRole.ADMIN # First user in org is Admin

    # 3. Create User
    raw_pwd = user_data.password.get_secret_value() if hasattr(user_data.password, 'get_secret_value') else str(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(raw_pwd),
        role=role,
        organization_id=org_id,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # 4. Default Trial Subscription
    subscription = Subscription(
        user_id=user.id,
        plan=UserRole.FREE,
        status=SubscriptionStatus.TRIAL,
        searches_used=0,
        searches_limit=1,
    )
    db.add(subscription)
    
    await db.commit()
    await db.refresh(user)

    # 5. Emit events
    from backend.shared.events import publish_event
    await publish_event("auth_events", "user_registered", {"user_id": str(user.id), "email": user.email})
    if org_id:
        await publish_event("org_events", "organization_created", {"org_id": str(org_id), "name": org.name})

    return user


from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=Token)
async def login(credentials: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token(data={"sub": str(user.id)})
    
    try:
        user_out = UserOut(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            organization_id=str(user.organization_id) if user.organization_id else None,
            is_active=user.is_active,
            created_at=user.created_at
        )
    except Exception as e:
        import traceback
        print("VALIDATION ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

    return Token(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
