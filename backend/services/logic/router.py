from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from backend.shared.database import get_db
from backend.shared.models import User, PatentAnalysis, AnalysisStatus
from backend.services.auth.security import get_current_user
from backend.shared.events import publish_event
from backend.services.nlp.claim_parser import parse_claims  # MVP parsed logic
from backend.services.logic.risk_engine import risk_engine

router = APIRouter(prefix="/api/analysis", tags=["Core Analysis Pipeline"])


async def run_async_analysis_pipeline(analysis_id: uuid.UUID, description: str, db: AsyncSession):
    """
    Background worker orchestrating the full AI Pipeline:
    Parser -> Vector -> Graph -> Risk Scoring -> Report Gen
    """
    try:
        # For MVP, simulate processing
        parsed_claims = parse_claims(description)
        
        # 1. Mocking Vector & Graph Hits for UI Demo purposes until databases populate
        # In Prod: vector_engine.search_similar() & graph_engine.calculate_structural_similarity()
        semantic_score = 0.85
        structural_score = 0.72
        components = parsed_claims[0]['components'] if parsed_claims else []
        
        # 2. Risk Engine
        risk_result = risk_engine.generate_risk_score(
            semantic_score=semantic_score,
            structural_score=structural_score,
            claim_text=description,
            components=components
        )
        
        # 3. Save Results
        analysis = await db.get(PatentAnalysis, analysis_id)
        if analysis:
            analysis.status = AnalysisStatus.COMPLETED
            analysis.risk_score = risk_result['final_score']
            analysis.parsed_claims = parsed_claims
            analysis.raw_results = risk_result
            await db.commit()
            
            # Emit Completion Event
            await publish_event("analysis_events", "analysis_completed", {
                "analysis_id": str(analysis_id),
                "score": risk_result['final_score']
            })

    except Exception as e:
        analysis = await db.get(PatentAnalysis, analysis_id)
        if analysis:
            analysis.status = AnalysisStatus.FAILED
            await db.commit()


@router.post("/", status_code=202)
async def submit_analysis(
    payload: Dict[str, Any], 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint for users to submit raw text or claims for Patent Risk Analysis.
    Starts background pipeline.
    """
    description = payload.get("invention_description")
    if not description:
         raise HTTPException(status_code=400, detail="invention_description required")

    # 1. Create DB Record tracking status
    analysis = PatentAnalysis(
        user_id=current_user.id,
        title=payload.get("title", f"Analysis {uuid.uuid4().hex[:6]}"),
        raw_text=description,
        status=AnalysisStatus.PROCESSING
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # 2. Trigger Async Celery/FastAPI Background Worker
    background_tasks.add_task(run_async_analysis_pipeline, analysis.id, description, db)

    return {
        "analysis_id": str(analysis.id),
        "status": analysis.status,
        "message": "Analysis queued for processing."
    }
