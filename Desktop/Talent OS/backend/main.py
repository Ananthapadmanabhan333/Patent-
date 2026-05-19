import os
import shutil
import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our custom modules
from backend.models import get_db_engine, init_db, get_session_factory, Candidate, Resume, Project, GitHubMetrics, AIScoringLog, FairnessMetric, InterviewSession
from backend.parsing.resumes import MultimodalResumeParser
from backend.github_analysis.analyzer import GitHubIntelligenceAnalyzer
from backend.scoring.project_evaluator import ProjectQualityEvaluator
from backend.scoring.ranking_engine import SemanticRankingEngine
from backend.vector_store.retrieval import HybridVectorRetrievalEngine
from backend.recruiter_ai.copilot import RecruiterAICopilot, AIInterviewGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("talentos.api")

# Create database engine
DB_URL = "sqlite:///./talentos.db"
engine = get_db_engine(DB_URL)
init_db(engine)
SessionFactory = get_session_factory(engine)

# Instantiate Core AI Engines
parser_engine = MultimodalResumeParser()
github_analyzer = GitHubIntelligenceAnalyzer()
project_evaluator = ProjectQualityEvaluator()
ranking_engine = SemanticRankingEngine()
retrieval_engine = HybridVectorRetrievalEngine()
copilot_engine = RecruiterAICopilot(retrieval_engine, ranking_engine)
interview_generator = AIInterviewGenerator()

app = FastAPI(
    title="TALENTOS API",
    description="Multimodal AI Talent Intelligence & Candidate Evaluation Platform Backend",
    version="1.0.0"
)

# Enable CORS for Next.js/React frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get Database Session
def get_db():
    db = SessionFactory()
    try:
        yield db
    finally:
        db.close()

# Helper to automatically seed candidates into vector store on database load
def seed_vector_store_from_db():
    db = SessionFactory()
    try:
        candidates = db.query(Candidate).all()
        if not candidates:
            # Seed our 3 elite high-fidelity candidate profiles if database is empty
            logger.info("No candidates found in DB. Seeding initial candidate profiles...")
            seed_initial_data(db)
            candidates = db.query(Candidate).all()
            
        for cand in candidates:
            # Map candidate DB object into standard python dictionary for indexer
            cand_dict = map_candidate_to_dict(cand)
            retrieval_engine.add_candidate_to_index(cand_dict)
            
        logger.info(f"Vector store successfully seeded with {len(candidates)} candidates.")
    except Exception as e:
        logger.error(f"Error seeding vector store: {str(e)}")
    finally:
        db.close()

def map_candidate_to_dict(cand: Candidate) -> Dict[str, Any]:
    return {
        "id": cand.id,
        "name": cand.name,
        "email": cand.email,
        "phone": cand.phone,
        "location": cand.location,
        "linkedin_url": cand.linkedin_url,
        "github_url": cand.github_url,
        "portfolio_url": cand.portfolio_url,
        "overall_score": cand.overall_score,
        "skills": cand.skills_extracted or [],
        "domain_specializations": cand.domain_specializations or [],
        "role_fit_predictions": cand.role_predictions or {},
        "ai_inferred_scores": {
            "engineering_maturity": cand.engineering_maturity,
            "systems_programming": cand.systems_score,
            "ai_sophistication": cand.ai_score,
            "leadership": cand.leadership_score
        },
        "experience": [
            {
                "company": r.get("company"),
                "role": r.get("role"),
                "duration": r.get("duration"),
                "description": r.get("description"),
                "systems_depth_indicator": r.get("systems_depth_indicator", 5.0)
            } for r in (cand.resumes[0].work_experience if (cand.resumes and cand.resumes[0].work_experience) else [])
        ],
        "projects": [
            {
                "name": p.name,
                "description": p.description,
                "originality_score": p.originality_score,
                "complexity_score": p.complexity_score,
                "scalability_score": p.scalability_score,
                "maintainability_score": p.maintainability_score,
                "ai_sophistication": p.ai_sophistication,
                "systems_depth": p.systems_depth,
                "is_crud": p.is_crud_app,
                "tech_stack": p.detected_tech_stack or []
            } for p in cand.projects
        ]
    }

def seed_initial_data(db: Session):
    # Seed 1: Sophia Chen (VLM Researcher)
    sophia_dict = parser_engine._simulate_vlm_extraction("sophia_resume.pdf", "sophia research vlm")
    sophia = Candidate(
        id=str(uuid.uuid4()),
        name=sophia_dict["name"],
        email=sophia_dict["email"],
        phone=sophia_dict["phone"],
        location=sophia_dict["location"],
        linkedin_url=sophia_dict["linkedin_url"],
        github_url=sophia_dict["github_url"],
        portfolio_url=sophia_dict["portfolio_url"],
        overall_score=9.3,
        engineering_maturity=sophia_dict["ai_inferred_scores"]["engineering_maturity"],
        systems_score=sophia_dict["ai_inferred_scores"]["systems_programming"],
        ai_score=sophia_dict["ai_inferred_scores"]["ai_sophistication"],
        leadership_score=sophia_dict["ai_inferred_scores"]["leadership"],
        skills_extracted=sophia_dict["skills"],
        domain_specializations=["Multimodal VLMs", "Deep Learning", "Triton Kernels"],
        role_predictions=sophia_dict["role_fit_predictions"]
    )
    
    # Associate simulated Resume
    resume_sophia = Resume(
        candidate_id=sophia.id,
        filename="sophia_chen_resume.pdf",
        file_type="PDF",
        raw_text="Sophia Chen. Senior VLM Research Deeplearning CVPR Stanford Ph.D.",
        work_experience=sophia_dict["experience"],
        education=sophia_dict["education"],
        vlm_analysis=sophia_dict
    )
    sophia.resumes.append(resume_sophia)

    # Associate Projects
    for p in sophia_dict["projects"]:
        proj = Project(
            candidate_id=sophia.id,
            name=p["name"],
            description=p["description"],
            originality_score=p["estimated_scores"]["originality"],
            complexity_score=p["estimated_scores"]["complexity"],
            scalability_score=p["estimated_scores"]["scalability"],
            maintainability_score=8.5,
            ai_sophistication=p["estimated_scores"]["complexity"],
            systems_depth=7.0 if p["name"] != "VLM-Triton-Kernels" else 9.8,
            is_crud_app=p["is_crud"],
            detected_tech_stack=p["tech_stack"]
        )
        sophia.projects.append(proj)
        
    db.add(sophia)

    # Seed 2: Alex Rivera (Systems & Distributed Systems Engineer)
    alex_dict = parser_engine._simulate_vlm_extraction("alex_resume.pdf", "alex distributed systems rust")
    alex = Candidate(
        id=str(uuid.uuid4()),
        name=alex_dict["name"],
        email=alex_dict["email"],
        phone=alex_dict["phone"],
        location=alex_dict["location"],
        linkedin_url=alex_dict["linkedin_url"],
        github_url=alex_dict["github_url"],
        portfolio_url=alex_dict["portfolio_url"],
        overall_score=9.6,
        engineering_maturity=alex_dict["ai_inferred_scores"]["engineering_maturity"],
        systems_score=alex_dict["ai_inferred_scores"]["systems_programming"],
        ai_score=alex_dict["ai_inferred_scores"]["ai_sophistication"],
        leadership_score=alex_dict["ai_inferred_scores"]["leadership"],
        skills_extracted=alex_dict["skills"],
        domain_specializations=["Distributed consensus", "eBPF Tracing", "Rust Kernel Programming"],
        role_predictions=alex_dict["role_fit_predictions"]
    )
    
    resume_alex = Resume(
        candidate_id=alex.id,
        filename="alex_rivera_resume.pdf",
        file_type="PDF",
        raw_text="Alex Rivera. Staff Distributed consensus DB Go Rust Linux.",
        work_experience=alex_dict["experience"],
        education=alex_dict["education"],
        vlm_analysis=alex_dict
    )
    alex.resumes.append(resume_alex)
    
    for p in alex_dict["projects"]:
        proj = Project(
            candidate_id=alex.id,
            name=p["name"],
            description=p["description"],
            originality_score=p["estimated_scores"]["originality"],
            complexity_score=p["estimated_scores"]["complexity"],
            scalability_score=p["estimated_scores"]["scalability"],
            maintainability_score=9.0,
            ai_sophistication=3.0,
            systems_depth=p["estimated_scores"]["complexity"],
            is_crud_app=p["is_crud"],
            detected_tech_stack=p["tech_stack"]
        )
        alex.projects.append(proj)
        
    db.add(alex)

    # Seed 3: Liam Carter (Product / UX / Full Stack Developer)
    liam_dict = parser_engine._simulate_vlm_extraction("liam_resume.pdf", "liam full stack typescript react")
    liam = Candidate(
        id=str(uuid.uuid4()),
        name=liam_dict["name"],
        email=liam_dict["email"],
        phone=liam_dict["phone"],
        location=liam_dict["location"],
        linkedin_url=liam_dict["linkedin_url"],
        github_url=liam_dict["github_url"],
        portfolio_url=liam_dict["portfolio_url"],
        overall_score=8.1,
        engineering_maturity=liam_dict["ai_inferred_scores"]["engineering_maturity"],
        systems_score=liam_dict["ai_inferred_scores"]["systems_programming"],
        ai_score=liam_dict["ai_inferred_scores"]["ai_sophistication"],
        leadership_score=liam_dict["ai_inferred_scores"]["leadership"],
        skills_extracted=liam_dict["skills"],
        domain_specializations=["Frontend Frameworks", "Design Systems", "Web Performance Optimization"],
        role_predictions=liam_dict["role_fit_predictions"]
    )
    
    resume_liam = Resume(
        candidate_id=liam.id,
        filename="liam_carter_resume.pdf",
        file_type="PDF",
        raw_text="Liam Carter. Senior Product Engineer TypeScript Next.js Tailwind Frontend.",
        work_experience=liam_dict["experience"],
        education=liam_dict["education"],
        vlm_analysis=liam_dict
    )
    liam.resumes.append(resume_liam)
    
    for p in liam_dict["projects"]:
        proj = Project(
            candidate_id=liam.id,
            name=p["name"],
            description=p["description"],
            originality_score=p["estimated_scores"]["originality"],
            complexity_score=p["estimated_scores"]["complexity"],
            scalability_score=p["estimated_scores"]["scalability"],
            maintainability_score=8.0,
            ai_sophistication=p["estimated_scores"].get("ai", 2.0),
            systems_depth=4.0,
            is_crud_app=p["is_crud"],
            detected_tech_stack=p["tech_stack"]
        )
        liam.projects.append(proj)
        
    db.add(liam)
    
    # Save seed candidate profiles to database
    db.commit()
    logger.info("Successfully seeded database with three high-fidelity candidates.")


# ====================================================
# API ENDPOINTS
# ====================================================

@app.on_event("startup")
def startup_event():
    # Load database existing items and seed vector index on startup
    seed_vector_store_from_db()

@app.get("/")
def get_root():
    return {"message": "TALENTOS Hiring Intelligence Gateway is operational."}

@app.get("/api/candidates")
def get_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    out = []
    for c in candidates:
        out.append(map_candidate_to_dict(c))
    return out

@app.get("/api/candidates/{candidate_id}")
def get_candidate_details(candidate_id: str, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return map_candidate_to_dict(cand)

@app.post("/api/ingest")
async def ingest_resume(
    file: UploadFile = File(...),
    github_username: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Ingests PDF resume, runs multimodal VLM understanding flow, fetches GitHub analytics,
    evaluates projects quality, calculates role alignments, seeds vector indexes, and stores in SQLite.
    """
    logger.info(f"Ingesting file: {file.filename}, GitHub Username: {github_username}")
    
    # Ensure temporary directory is created inside workspace
    temp_dir = os.path.join(os.getcwd(), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temporary file: {str(e)}")

    # 1. Parsing & Multimodal extraction
    try:
        raw_text = ""
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext == ".pdf":
            raw_text = parser_engine.extract_text_from_pdf(file_path)
            mime = "application/pdf"
        else:
            raw_text = parser_engine.run_ocr_on_image(file_path)
            mime = "image/png"
            
        vlm_data = await parser_engine.analyze_with_vlm(file_path, mime, raw_text)
    except Exception as e:
        # Clean up file
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Multimodal parsing pipeline crashed: {str(e)}")

    # Clean up file
    if os.path.exists(file_path):
        os.remove(file_path)

    if not vlm_data or "name" not in vlm_data:
        raise HTTPException(status_code=422, detail="VLM was unable to resolve structured JSON payload.")

    # 2. Check if Candidate Already Exists
    existing_cand = db.query(Candidate).filter(Candidate.email == vlm_data["email"]).first()
    if existing_cand:
        db.delete(existing_cand)
        db.commit()

    # 3. Process GitHub Intelligence if username provided
    github_data = None
    if github_username:
        try:
            github_data = await github_analyzer.analyze_profile(github_username)
        except Exception as e:
            logger.error(f"GitHub Profile indexing failed: {str(e)}")

    # Adjust engineering maturity scores based on GitHub analyzer results if available
    inferred_scores = vlm_data.get("ai_inferred_scores", {})
    systems_avg = inferred_scores.get("systems_programming", 5.0)
    ai_avg = inferred_scores.get("ai_sophistication", 5.0)
    leadership = inferred_scores.get("leadership", 5.0)
    maturity_score = inferred_scores.get("engineering_maturity", 6.0)
    
    if github_data:
        maturity_score = max(maturity_score, github_data.get("engineering_maturity_score", 5.0))
        # Seed GitHub stars/forks influence systems or scale complexity
        if github_data.get("total_stars", 0) > 100:
            systems_avg = min(10.0, systems_avg + 0.5)

    # 4. Save Candidate Database models
    role_predictions = vlm_data.get("role_fit_predictions", {
        "AI Engineer": 50, "Backend Engineer": 50, "Research Engineer": 50,
        "Product Engineer": 50, "Full-Stack Engineer": 50, "Systems Engineer": 50
    })
    
    candidate = Candidate(
        id=str(uuid.uuid4()),
        name=vlm_data["name"],
        email=vlm_data["email"],
        phone=vlm_data.get("phone"),
        location=vlm_data.get("location"),
        linkedin_url=vlm_data.get("linkedin_url"),
        github_url=github_username or vlm_data.get("github_url"),
        portfolio_url=vlm_data.get("portfolio_url"),
        overall_score=round(
            (systems_avg * 0.25) + (ai_avg * 0.25) + (maturity_score * 0.3) + (leadership * 0.2), 
            2
        ),
        engineering_maturity=round(maturity_score, 2),
        systems_score=round(systems_avg, 2),
        ai_score=round(ai_avg, 2),
        leadership_score=round(leadership, 2),
        skills_extracted=vlm_data.get("skills", []),
        domain_specializations=[list(role_predictions.keys())[0], list(role_predictions.keys())[1]],
        role_predictions=role_predictions
    )
    
    db.add(candidate)
    db.flush()

    # Save Resume Metadata
    resume = Resume(
        candidate_id=candidate.id,
        filename=file.filename,
        file_type="PDF" if file_ext == ".pdf" else "IMAGE",
        raw_text=raw_text,
        work_experience=vlm_data.get("experience", []),
        education=vlm_data.get("education", []),
        vlm_analysis=vlm_data
    )
    db.add(resume)

    # Save Projects & Evaluate Quality
    for p in vlm_data.get("projects", []):
        eval_metrics = project_evaluator.evaluate_project(p["name"], p["description"], p.get("tech_stack", []))
        
        proj = Project(
            candidate_id=candidate.id,
            name=p["name"],
            description=p["description"],
            originality_score=eval_metrics["originality_score"],
            complexity_score=eval_metrics["complexity_score"],
            scalability_score=eval_metrics["scalability_score"],
            maintainability_score=eval_metrics["maintainability_score"],
            ai_sophistication=eval_metrics["ai_sophistication"],
            systems_depth=eval_metrics["systems_depth"],
            is_crud_app=eval_metrics["is_crud"],
            detected_tech_stack=p.get("tech_stack", [])
        )
        db.add(proj)

    # Save GitHub Metrics if indexed
    if github_data:
        gm = GitHubMetrics(
            candidate_id=candidate.id,
            username=github_data["username"],
            repo_count=github_data["repo_count"],
            total_stars=github_data["total_stars"],
            total_forks=github_data["total_forks"],
            total_commits_1yr=github_data["total_commits_1yr"],
            technology_diversity=github_data["technology_diversity"],
            contribution_frequency=github_data["contribution_frequency"],
            originality_ratio=github_data["originality_ratio"],
            engineering_maturity_score=github_data["engineering_maturity_score"],
            architectural_patterns=github_data["architectural_patterns"]
        )
        db.add(gm)

    db.commit()
    logger.info(f"Candidate {candidate.name} parsed and indexed in DB successfully.")

    # 5. Add Candidate to Semantic Hybrid Vector Index
    refreshed_cand_dict = map_candidate_to_dict(candidate)
    retrieval_engine.add_candidate_to_index(refreshed_cand_dict)

    return {
        "status": "SUCCESS",
        "candidate": refreshed_cand_dict
    }

@app.post("/api/copilot")
def query_copilot(payload: Dict[str, str]):
    query = payload.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return copilot_engine.handle_query(query)

@app.get("/api/interviews/generate")
def create_interview_sheet(candidate_id: str, role: str, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    cand_dict = map_candidate_to_dict(cand)
    interview_data = interview_generator.generate_interview(cand_dict, role)
    
    # Save session in database
    session_db = InterviewSession(
        candidate_id=candidate_id,
        role_targeted=role,
        questions_generated=interview_data["questions"],
        overall_performance_score=0.0
    )
    db.add(session_db)
    db.commit()
    
    return interview_data

@app.get("/api/analytics/overview")
def get_hiring_analytics(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    total_cands = len(candidates)
    
    if total_cands == 0:
        return {
            "total_candidates": 0,
            "skills_distribution": {},
            "score_bins": {"excellent": 0, "good": 0, "average": 0},
            "average_systems_score": 0.0,
            "average_ai_score": 0.0,
            "fairness_telemetry": {"disparate_impact": 1.0, "status": "COMPLIANT"}
        }

    # Calculate skill density
    all_skills = []
    excellent = 0
    good = 0
    avg_cands = 0
    systems_sum = 0.0
    ai_sum = 0.0
    
    for c in candidates:
        all_skills.extend(c.skills_extracted or [])
        systems_sum += c.systems_score
        ai_sum += c.ai_score
        
        if c.overall_score >= 9.0:
            excellent += 1
        elif c.overall_score >= 7.5:
            good += 1
        else:
            avg_cands += 1

    skills_dict = {}
    for s in all_skills:
        skills_dict[s] = skills_dict.get(s, 0) + 1
        
    # Format and sort skill distribution list
    sorted_skills = sorted(skills_dict.items(), key=lambda x: x[1], reverse=True)[:8]
    skills_distribution = {k: v for k, v in sorted_skills}
    
    # Calculate fairness disparate impact
    dummy_ranked = []
    for c in candidates:
        dummy_ranked.append({
            "candidate_id": c.id,
            "candidate_name": c.name
        })
    fairness_metrics = ranking_engine.audit_fairness(dummy_ranked)

    return {
        "total_candidates": total_cands,
        "skills_distribution": skills_distribution,
        "score_distribution": {
            "Excellent (>= 9.0)": excellent,
            "High Quality (7.5 - 8.9)": good,
            "Competent (< 7.5)": avg_cands
        },
        "average_systems_score": round(systems_sum / total_cands, 2),
        "average_ai_score": round(ai_sum / total_cands, 2),
        "fairness_telemetry": fairness_metrics
    }
