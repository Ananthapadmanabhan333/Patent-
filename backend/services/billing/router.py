import os
import stripe
from typing import Dict, Any, Optional
from loguru import logger
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.shared.database import get_db
from backend.shared.models import User, Subscription, SubscriptionStatus, UserRole
from backend.services.auth.security import get_current_user

# Stripe Configuration
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "sk_test_mock_key_for_development")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_mock_secret")

router = APIRouter(prefix="/api/billing", tags=["Monetization"])

# Mapping our SaaS tiers to Stripe Price IDs
STRIPE_PRICES = {
    "PRO": os.environ.get("STRIPE_PRICE_PRO", "price_1XYZ_pro"),
    "STARTUP": os.environ.get("STRIPE_PRICE_STARTUP", "price_1XYZ_startup"),
    "ENTERPRISE": os.environ.get("STRIPE_PRICE_ENTERPRISE", "price_1XYZ_enterprise"),
}

@router.post("/checkout-session")
async def create_checkout_session(
    plan: str, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a Stripe Checkout Session for subscription upgrades.
    """
    plan = plan.upper()
    if plan not in STRIPE_PRICES:
        raise HTTPException(status_code=400, detail="Invalid subscription plan selected.")

    try:
        # Determine if customer already exists in Stripe (for MVP, creating new)
        # Prod logic would check `current_user.stripe_customer_id`
        
        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': STRIPE_PRICES[plan],
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/dashboard?checkout=success",
            cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/pricing?checkout=canceled",
            metadata={
                "user_id": str(current_user.id),
                "plan": plan
            }
        )
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Error creating Stripe checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment gateway error")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Listens for async Stripe Webhooks to update subscription DB tables.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # For local dev without real Stripe CLI exposing the endpoint, we mock verification
        if stripe.api_key == "sk_test_mock_key_for_development":
            import json
            event = stripe.Event.construct_from(
                json.loads(payload), stripe.api_key
            )
        else:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        user_id = session.get('metadata', {}).get('user_id')
        new_plan = session.get('metadata', {}).get('plan')
        
        if user_id and new_plan:
             await _upgrade_user_subscription(user_id, new_plan, db)

    elif event['type'] == 'invoice.payment_failed':
         # Handle payment failure (downgrade or lock account)
         logger.warning("Subscription payment failed.")
         # Implementation left out for MVP brevity

    return {"status": "success"}


async def _upgrade_user_subscription(user_id: str, plan_string: str, db: AsyncSession):
    """Internal helper to mutate User and Subscription schemas upon successful payment."""
    try:
         # Map string to enum
         target_role = getattr(UserRole, plan_string, None)
         if not target_role:
             logger.error(f"Webhook error: Plan '{plan_string}' does not map to a internal UserRole.")
             return

         # Fetch User
         result = await db.execute(select(User).where(User.id == user_id))
         user = result.scalar_one_or_none()
         if not user:
             logger.error(f"Webhook error: User {user_id} not found in DB.")
             return

         # Update Role
         user.role = target_role

         # Fetch & Update Subscription Let Limits
         sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
         subscription = sub_result.scalar_one_or_none()
         
         if subscription:
             subscription.plan = target_role
             subscription.status = SubscriptionStatus.ACTIVE
             # Increment limits based on Enterprise tier
             if target_role == UserRole.PRO:
                 subscription.searches_limit = 50
             elif target_role == UserRole.STARTUP:
                 subscription.searches_limit = 200
             elif target_role == UserRole.ENTERPRISE:
                 subscription.searches_limit = 10000 # Unlimited effectively

         await db.commit()
         logger.info(f"Successfully upgraded user {user_id} to plan {plan_string}")

    except Exception as e:
        logger.error(f"Database error during subscription upgrade: {e}")
        await db.rollback()
