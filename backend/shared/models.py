import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from backend.shared.database import Base


class UserRole(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    STARTUP = "startup"
    ENTERPRISE = "enterprise"
    ADMIN = "admin"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIAL = "trial"
    CANCELLED = "cancelled"

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ── Organizations (Multi-Tenancy) ─────────────────────────────────────────────

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    api_key_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="organization")


# ── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.FREE, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    organization = relationship("Organization", back_populates="users")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    analyses = relationship("PatentAnalysis", back_populates="user")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan = Column(SAEnum(UserRole), default=UserRole.FREE, nullable=False)
    status = Column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.TRIAL)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    searches_used = Column(Integer, default=0)
    searches_limit = Column(Integer, default=1)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="subscription")


# ── Patent Analysis ───────────────────────────────────────────────────────────

class PatentAnalysis(Base):
    __tablename__ = "patent_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=True)
    invention_description = Column(Text, nullable=False)
    status = Column(SAEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(50), nullable=True)
    report_path = Column(String(500), nullable=True)
    celery_task_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="analyses")
    claims = relationship("ExtractedClaim", back_populates="analysis")
    similar_patents = relationship("SimilarPatent", back_populates="analysis")


class ExtractedClaim(Base):
    __tablename__ = "extracted_claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("patent_analyses.id"), nullable=False)
    claim_number = Column(Integer, nullable=False)
    claim_text = Column(Text, nullable=False)
    components = Column(Text, nullable=True)  # JSON
    functional_elements = Column(Text, nullable=True)  # JSON
    constraints = Column(Text, nullable=True)  # JSON
    dependencies = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("PatentAnalysis", back_populates="claims")


class SimilarPatent(Base):
    __tablename__ = "similar_patents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("patent_analyses.id"), nullable=False)
    patent_number = Column(String(100), nullable=False)
    title = Column(String(500), nullable=True)
    assignee = Column(String(255), nullable=True)
    filing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    jurisdiction = Column(String(50), nullable=True)
    similarity_score = Column(Float, nullable=True)
    semantic_score = Column(Float, nullable=True)
    structural_score = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    abstract = Column(Text, nullable=True)
    source_url = Column(String(1000), nullable=True)

    analysis = relationship("PatentAnalysis", back_populates="similar_patents")
