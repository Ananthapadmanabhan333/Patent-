# TALENTOS: Multimodal AI Talent Intelligence & Candidate Evaluation Platform

TALENTOS is a production-grade enterprise-class hiring intelligence engine, multimodal resume understanding system, and explainable recruitment copilot designed to completely automate and de-bias technical evaluation at scale. 

Instead of traditional, brittle keyword-matching ATS applications, TALENTOS treats recruitment as a **semantic reasoning, project quality evaluation, and architectural pattern alignment** problem. By combining advanced Vision-Language Models (VLMs), static AST code analysis, commit-history tracing, and ethical AI auditing, TALENTOS isolates elite software and AI engineers based on raw engineering depth.

---

## 🚀 Key Architectural Capabilities

### 1. Multimodal Document Understanding Flow
The ingestion pipeline is capable of parsing structural PDF resumes, web portfolio screenshots, and architecture diagrams:
- **Spatial Alignment & OCR**: Extracts local token arrangements using OCR engines (with automatic layout preserves).
- **VLM prompt topologies**: Fuses structural document elements with Gemini 2.5 and GPT-4o multimodal API prompts under tight JSON schema models.
- **Entity Extraction**: Isolates key skills, publications, patents, and work duration.

```
[Resume PDF / Portfolio Screenshot]
       │
       ├───► PaddleOCR Spatial Coordinate Extraction ──┐
       │                                               ▼
       └───► Gemini 2.5 Flash / GPT-4o VLM Ingestion ──┼──► Structured JSON Entity
                                                       │    (Skills, Experience, Projects)
                                                       ▼
                                            SQL & Vector Store Indexing
```

### 2. GitHub & Project Quality Intelligence
Analyzes repository profiles to construct a detailed engineering maturity audit:
- **Architecture Pattern Mining**: Identifies custom key-value consensus storage engines (Raft), eBPF socket listeners, Triton GPU decoding attention kernels, or simple CRUD templates.
- **Commit Telemetry**: Evaluates weekly commit frequencies, repository diversity, fork-to-originality ratios, and code maintainability logs.
- **AST Static Scanner**: Analyzes code structures for thread lock systems, memory optimizations (unsafe pointer arithmetic, pin alignments), concurrency queues, and GPU CUDA blocks.

### 3. Semantic Candidate Ranking Engine
Avoids simplistic, easily-gamed keyword matching:
- **Embedding Alignment**: Computes cosine similarities between targeted role profiles and candidates' integrated semantic text representations using Sentence-Transformers (`all-MiniLM-L6-v2`).
- **Explainable Scoring Weighting**: Aggregates weights across Semantic Fit, Systems Programming Depth, VLM/AI Sophistication, GitHub Open-Source Maturity, and Leadership. Recruiters can slide weights in real-time, watching lists rearrange instantly.
- **Explainability Payload**: Generates Radar Chart coords (Systems, AI, Maturity, Relevance, Leadership), confidence ratings, identified technical growth areas, and natural language critiques of candidates' projects.

### 4. Recruiter AI Copilot & Dynamic Interview Generator
- **Recruiter Chat Copilot**: Processes natural language statements (e.g., *"Find AI Systems engineers who are highly skilled in Triton and CUDA attention kernels"*), executes hybrid retrieval, and presents a visual comparison card.
- **Interview Sheet Workbench**: Dynamic creation of tailormade project-probing and weakness-probing technical questions, complete with expected answer rubrics.

### 5. Ethical AI Guardrails & Fairness Audit Hub
- **EEOC 80% Rule Compliance**: Calculates disparate impact ratios and demographic parity rates across generated shortlists.
- **Strict Anonymization Buffers**: Strips gender proxies, specific location formats, names, and university classes from profiles before executing embeddings or rank algorithms.

---

## 🛠️ Technology Stack

- **Frontend**: Vite, React 19, TypeScript, TailwindCSS, Recharts, Lucide Icons
- **Backend**: FastAPI, Python 3.10+, SQLAlchemy (SQLite/PostgreSQL compatible)
- **AI Layers**: sentence-transformers (`all-MiniLM-L6-v2`), Gemini 2.5 Flash API, GPT-4o API
- **Document Intelligence**: PyMuPDF (fitz) & PaddleOCR/Tesseract fallbacks

---

## 📁 System Repository Structure

```
talentos/
│
├── backend/
│   ├── parsing/
│   │   └── resumes.py            # Multimodal PyMuPDF, OCR & VLM Gateway
│   ├── github_analysis/
│   │   └── analyzer.py           # GitHub profile, commits & eBPF pattern analyzer
│   ├── scoring/
│   │   ├── project_evaluator.py  # Differentiates simple CRUD from distributed engines
│   │   └── ranking_engine.py     # De-biased semantic rank calculator & EEOC auditor
│   ├── recruiter_ai/
│   │   └── copilot.py            # Semantic chat agent & tailormade interview sheets
│   ├── vector_store/
│   │   └── retrieval.py          # sentence-transformers hybrid embedding indexing
│   ├── models.py                 # SQLAlchemy schemas (Candidate, Resume, Projects, Logs)
│   └── main.py                   # FastAPI Application Server, Routing & DB Seeding
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # High-fidelity Recruiter Dashboard Single-page UI
    │   ├── index.css             # Tailwind config directives, Glassmorphic tokens
    │   └── main.tsx              # React mounting root
    ├── tailwind.config.js        # Developer colors, neon glow shadow setups
    └── package.json              # Vite, Recharts, Lucide dependencies
```

---

## 🚀 Execution & Setup Guide

### 1. FastAPI Backend setup
```bash
# Navigate to workspace
cd "Talent OS"

# Install Python requirements
pip install fastapi uvicorn sqlalchemy httpx numpy sentence-transformers PyMuPDF

# Launch Uvicorn local web server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Note: On startup, the FastAPI server will check the SQLite database (`talentos.db`). If empty, it automatically seeds three premium simulated profiles (Sophia Chen, Alex Rivera, Liam Carter) containing complete complex projects, VLM critiques, and metrics.*

### 2. Vite React Frontend setup
```bash
# Navigate to frontend folder
cd frontend

# Install Node modules
npm install

# Start local Vite development server
npm run dev
```

---

## 🔬 Testing Suite

To ensure the integrity of the platform's mathematical ranking formula, project quality evaluators, and hybrid vector searches, run:
```bash
# Execute python validation checks
python -m unittest backend.tests.test_scoring
```
*(Validation tests can be reviewed inside `backend/tests/test_scoring.py`)*

---

## 🛡️ Ethical AI Compliance Statement
TALENTOS complies with **Title VII of the Civil Rights Act of 1964** and the **EEOC Uniform Guidelines on Employee Selection Procedures**. The system tracks Disparate Impact telemetry in real-time, warning recruiters if recommendation parameters exhibit bias towards representational cohorts.
