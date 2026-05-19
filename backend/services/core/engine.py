"""
Core Orchestration Engine
Coordinates NLP parsing, Vector Search, and Risk Scoring
"""
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.shared.database import get_db
from backend.shared.models import User, PatentAnalysis, ExtractedClaim, SimilarPatent, AnalysisStatus
from backend.shared.schemas import AnalysisCreate, AnalysisOut, AnalysisSummaryOut
from backend.services.auth.security import get_current_user
from backend.services.nlp.claim_parser import parse_claims
from backend.services.similarity.vector_engine import vector_engine
from backend.services.core.risk import calculate_risk_score, determine_risk_level

router = APIRouter(prefix="/api/analysis", tags=["Core Analysis"])


async def process_analysis_task(analysis_id: UUID, db: AsyncSession):
    """Background task to run the heavy AI pipeline."""
    # 1. Fetch analysis record
    result = await db.execute(select(PatentAnalysis).where(PatentAnalysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        return

    try:
        analysis.status = AnalysisStatus.PROCESSING
        await db.commit()

        # 2. NLP Claim Parsing
        parsed_claims = parse_claims(analysis.invention_description)
        for claim_data in parsed_claims:
            db_claim = ExtractedClaim(
                analysis_id=analysis.id,
                **claim_data
            )
            db.add(db_claim)
            
        # 3. Generate Embedding & Vector Search
        similar_results_raw = vector_engine.search_similar(analysis.invention_description, top_k=5)
        similar_results = [{"patent_number": doc_id, "similarity_score": score, "is_active": True} for doc_id, score in similar_results_raw]
        
        for sim_data in similar_results:
            db_sim = SimilarPatent(
                analysis_id=analysis.id,
                **sim_data
            )
            db.add(db_sim)
            
        # 4. Calculate Risk
        risk_score = calculate_risk_score(similar_results)
        risk_level = determine_risk_level(risk_score)
        
        analysis.risk_score = risk_score
        analysis.risk_level = risk_level
        analysis.status = AnalysisStatus.COMPLETED
        analysis.completed_at = datetime.utcnow()
        
        await db.commit()
        
    except Exception as e:
        await db.rollback()
        # Ensure we reconnect/refresh if session is bad to mark as failed
        result = await db.execute(select(PatentAnalysis).where(PatentAnalysis.id == analysis_id))
        failed_analysis = result.scalar_one_or_none()
        if failed_analysis:
            failed_analysis.status = AnalysisStatus.FAILED
            await db.commit()
        print(f"Error processing analysis {analysis_id}: {str(e)}")


@router.post("/", response_model=AnalysisOut, status_code=202)
async def create_analysis(
    req: AnalysisCreate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a new invention description for analysis."""
    # Check limits (simplified for now)
    analysis = PatentAnalysis(
        user_id=current_user.id,
        title=req.title or "Untitled Analysis",
        invention_description=req.invention_description,
        status=AnalysisStatus.PENDING
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Dispatch to background
    background_tasks.add_task(process_analysis_task, analysis.id, db)
    
    return analysis


@router.get("/", response_model=list[AnalysisSummaryOut])
async def list_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all analyses for the current user."""
    result = await db.execute(
        select(PatentAnalysis)
        .where(PatentAnalysis.user_id == current_user.id)
        .order_by(PatentAnalysis.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{analysis_id}", response_model=AnalysisOut)
async def get_analysis(
    analysis_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get full details of a specific analysis including claims and similar patents."""
    result = await db.execute(
        select(PatentAnalysis)
        .where(PatentAnalysis.id == analysis_id, PatentAnalysis.user_id == current_user.id)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    # Eager loading would be better here, but doing individual queries for simplicity in MVP
    claims_res = await db.execute(select(ExtractedClaim).where(ExtractedClaim.analysis_id == analysis_id))
    analysis.claims = claims_res.scalars().all()
    
    sims_res = await db.execute(select(SimilarPatent).where(SimilarPatent.analysis_id == analysis_id))
    analysis.similar_patents = sims_res.scalars().all()
    
    return analysis
