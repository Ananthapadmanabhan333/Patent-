import datetime
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

Base = declarative_base()

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    
    # AI Summaries & Scoring
    overall_score = Column(Float, default=0.0)
    engineering_maturity = Column(Float, default=0.0)
    systems_score = Column(Float, default=0.0)
    ai_score = Column(Float, default=0.0)
    leadership_score = Column(Float, default=0.0)
    
    role_predictions = Column(JSON, nullable=True) # Dict[role, fit_percentage]
    skills_extracted = Column(JSON, nullable=True)  # List[str]
    domain_specializations = Column(JSON, nullable=True) # List[str]
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="candidate", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="candidate", cascade="all, delete-orphan")
    github_metrics = relationship("GitHubMetrics", uselist=False, back_populates="candidate", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="candidate", cascade="all, delete-orphan")
    scoring_logs = relationship("AIScoringLog", back_populates="candidate", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # PDF, PNG, JPG
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(JSON, nullable=True)
    
    # Specific extraction sections
    work_experience = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    
    vlm_analysis = Column(JSON, nullable=True) # Detailed notes from Vision Language Model
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(255), nullable=True)
    
    # Project Quality Metrics (AI Scored)
    originality_score = Column(Float, default=0.0)
    complexity_score = Column(Float, default=0.0)
    scalability_score = Column(Float, default=0.0)
    maintainability_score = Column(Float, default=0.0)
    ai_sophistication = Column(Float, default=0.0)
    systems_depth = Column(Float, default=0.0)
    
    architecture_analysis = Column(Text, nullable=True)
    is_crud_app = Column(Boolean, default=False)
    detected_tech_stack = Column(JSON, nullable=True) # List[str]
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="projects")

class GitHubMetrics(Base):
    __tablename__ = "github_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    username = Column(String(100), nullable=False)
    
    repo_count = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_forks = Column(Integer, default=0)
    total_commits_1yr = Column(Integer, default=0)
    
    technology_diversity = Column(JSON, nullable=True) # Dict[lang, percentage]
    contribution_frequency = Column(JSON, nullable=True) # Dict[month/day, count]
    originality_ratio = Column(Float, default=0.0) # non-forked vs forked repos
    
    engineering_maturity_score = Column(Float, default=0.0)
    architectural_patterns = Column(JSON, nullable=True) # List[str] e.g., Microservices, Event-Driven
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="github_metrics")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    role_targeted = Column(String(100), nullable=False)
    
    # Dynamic questions generated by AI
    questions_generated = Column(JSON, nullable=True) # List[Dict[id, question, category, expected_answer]]
    responses_recorded = Column(JSON, nullable=True) # List[Dict[id, answer, evaluation, score]]
    
    overall_performance_score = Column(Float, default=0.0)
    summary_evaluation = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interviews")

class AIScoringLog(Base):
    __tablename__ = "ai_scoring_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    
    # Detailed weights used in ranking
    ranking_run_id = Column(String(100), nullable=False)
    raw_weights = Column(JSON, nullable=False) # weights dictionary
    scoring_factors = Column(JSON, nullable=False) # scores before weighting
    weighted_score = Column(Float, nullable=False)
    
    # Explainability Elements
    strengths = Column(JSON, nullable=True) # List[str]
    growth_areas = Column(JSON, nullable=True) # List[str]
    confidence_score = Column(Float, default=1.0)
    reasoning_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="scoring_logs")

class FairnessMetric(Base):
    __tablename__ = "fairness_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String(100), nullable=False) # e.g. Disparate Impact, Demographic Parity
    value = Column(Float, nullable=False)
    context = Column(JSON, nullable=True) # additional logs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Engine & Session Setup Helper
def get_db_engine(db_url: str = "sqlite:///./talentos.db"):
    return create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})

def init_db(engine):
    Base.metadata.create_all(bind=engine)

def get_session_factory(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)
