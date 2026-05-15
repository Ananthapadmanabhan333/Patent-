from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator
from loguru import logger
import sys, json, os
import uvicorn
from backend.shared.config import settings
from backend.shared.models import Base, User, Organization, Subscription, PatentAnalysis, ExtractedClaim, SimilarPatent
from backend.shared.database import engine
from backend.services.auth.router import router as auth_router
from backend.services.core.engine import router as engine_router
from backend.services.similarity.router import router as search_router

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# Configure Structured JSON Logging for Production
logger.remove()
logger.add(
    sys.stdout, 
    format="{message}", 
    serialize=True, 
    level="INFO" if settings.ENVIRONMENT == "production" else "DEBUG"
)

# Sentry SDK Initialization Error tracking
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN", ""),
    environment=settings.ENVIRONMENT,
    traces_sample_rate=1.0 if settings.ENVIRONMENT != "production" else 0.2,
    profiles_sample_rate=1.0 if settings.ENVIRONMENT != "production" else 0.2,
    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ],
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables for MVP
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Application Startup Complete.")
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for PatentIQ - AI Patent Risk & Claim Intelligence Engine",
    version="1.0.0",
    lifespan=lifespan,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(engine_router)
app.include_router(search_router)

from backend.services.billing.router import router as billing_router
app.include_router(billing_router)

from backend.services.admin.router import router as admin_router
app.include_router(admin_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.ENVIRONMENT}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
