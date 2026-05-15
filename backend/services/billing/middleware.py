from fastapi import Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.shared.database import get_db
from backend.shared.models import Subscription, SubscriptionStatus, User
from backend.services.auth.security import get_current_user
from loguru import logger

async def quota_enforcement_dependency(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    FastAPI Dependency to enforce Subscription usage limits per billing cycle.
    Applicable to expensive AI core routes (e.g. Analysis generation, NLP Parsing).
    """
    
    # 1. Fetch active subscription for user
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    subscription = result.scalar_one_or_none()

    if not subscription:
        logger.warning(f"User {current_user.email} attempted API access without a valid subscription record.")
        raise HTTPException(status_code=403, detail="No active subscription found. Please contact support.")

    # 2. Check Status
    if subscription.status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]:
        raise HTTPException(
            status_code=402, # Payment Required
            detail=f"Subscription is currently {subscription.status.name}. Please update billing details."
        )

    # 3. Check Quota Usage
    # In a true scalable SaaS, you would cache this counter in Redis to avoid DB hits on every request.
    if subscription.searches_used >= subscription.searches_limit:
        logger.info(f"User {current_user.email} exceeded quota ({subscription.searches_limit}). Blocked access.")
        raise HTTPException(
            status_code=429, # Too Many Requests
            detail=f"Monthly limits reached ({subscription.searches_limit}/{subscription.searches_limit}). Please upgrade your plan."
        )

    # 4. Success. Return subscription context if route needs it.
    return subscription


async def increment_usage(user_id: str, db: AsyncSession):
    """
    Utility function called AFTER a successful expensive operation to increment the counter.
    """
    try:
        result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
        subscription = result.scalar_one_or_none()
        if subscription:
            subscription.searches_used += 1
            await db.commit()
    except Exception as e:
        logger.error(f"Failed to increment usage for user {user_id}: {e}")
        await db.rollback()
