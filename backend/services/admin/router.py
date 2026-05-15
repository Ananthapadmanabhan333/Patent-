from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.shared.database import get_db
from backend.shared.models import User, UserRole, Subscription, PatentAnalysis
from backend.services.auth.security import get_current_user
from loguru import logger

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

def require_admin(user: User = Depends(get_current_user)):
    """Dependency to ensure the user holds the SYS_ADMIN or ENTERPRISE Admin role."""
    if user.role not in [UserRole.SYS_ADMIN]:
        logger.warning(f"Unauthorized Admin access attempt by {user.email}")
        raise HTTPException(status_code=403, detail="System Administrator privileges required.")
    return user


@router.get("/metrics")
async def get_platform_metrics(
    admin: User = Depends(require_admin), 
    db: AsyncSession = Depends(get_db)
):
    """
    Returns high-level SaaS platform metrics for the admin dashboard.
    Tracks total usage, active subscriptions, and analysis volumes.
    """
    try:
        # 1. User Growth
        total_users_query = await db.execute(select(func.count(User.id)))
        total_users = total_users_query.scalar() or 0

        # 2. Subscription Distribution
        subs_query = await db.execute(select(Subscription.plan, func.count()).group_by(Subscription.plan))
        subs_distribution = {plan.name: count for plan, count in subs_query.all()}
        
        # 3. Overall Platform API Usage
        analyses_query = await db.execute(select(func.count(PatentAnalysis.id)))
        total_analyses = analyses_query.scalar() or 0
        
        # 4. Total Search Volume Consumed (Proxy for AI inference costs)
        usage_query = await db.execute(select(func.sum(Subscription.searches_used)))
        total_searches_consumed = usage_query.scalar() or 0

        return {
            "platform_health": "OPTIMAL",
            "metrics": {
                "total_registered_users": total_users,
                "subscription_tiers": subs_distribution,
                "total_analyses_run": total_analyses,
                "total_api_calls_billed": total_searches_consumed
            }
        }
    except Exception as e:
        logger.error(f"Failed to fetch admin metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal admin metrics error")
