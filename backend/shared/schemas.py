import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ── Auth Schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2)
    password: str = Field(..., min_length=8)
    organization_name: Optional[str] = Field(None, description="Name of the organization if creating a new workspace")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class OrganizationOut(BaseModel):
    id: str
    name: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


from backend.shared.models import UserRole

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    organization_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


# ── Analysis Schemas ──────────────────────────────────────────────────────────

class AnalysisCreate(BaseModel):
    title: Optional[str] = None
    invention_description: str = Field(..., min_length=50, description="Full invention description")


class ClaimOut(BaseModel):
    claim_number: int
    claim_text: str
    components: Optional[str] = None
    functional_elements: Optional[str] = None
    constraints: Optional[str] = None
    dependencies: Optional[str] = None

    class Config:
        from_attributes = True


class SimilarPatentOut(BaseModel):
    patent_number: str
    title: Optional[str]
    assignee: Optional[str]
    filing_date: Optional[str]
    expiry_date: Optional[str]
    jurisdiction: Optional[str]
    similarity_score: Optional[float]
    semantic_score: Optional[float]
    structural_score: Optional[float]
    is_active: bool
    abstract: Optional[str]
    source_url: Optional[str]

    class Config:
        from_attributes = True


class AnalysisOut(BaseModel):
    id: uuid.UUID
    title: Optional[str]
    invention_description: str
    status: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    report_path: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    claims: List[ClaimOut] = []
    similar_patents: List[SimilarPatentOut] = []

    class Config:
        from_attributes = True


class AnalysisSummaryOut(BaseModel):
    id: uuid.UUID
    title: Optional[str]
    status: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Subscription Schemas ──────────────────────────────────────────────────────

class SubscriptionOut(BaseModel):
    plan: str
    status: str
    searches_used: int
    searches_limit: int
    period_end: Optional[datetime]

    class Config:
        from_attributes = True


class CreateCheckoutSession(BaseModel):
    plan: str  # "pro" | "startup" | "enterprise"


# ── Design Simulation ─────────────────────────────────────────────────────────

class ModificationItem(BaseModel):
    element: str
    action: str  # "remove" | "replace" | "modify"
    replacement: Optional[str] = None


class DesignSimulationRequest(BaseModel):
    analysis_id: uuid.UUID
    modifications: List[ModificationItem]


class DesignSimulationResult(BaseModel):
    original_risk_score: float
    simulated_risk_score: float
    delta: float
    explanation: str
    modified_description: str
