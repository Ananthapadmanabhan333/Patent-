# 🛡️ PatentIQ: AI Patent Risk & Claim Intelligence Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**PatentIQ** is a production-grade, AI-powered platform designed for intellectual property professionals, legal teams, and R&D departments. It leverages state-of-the-art Large Language Models (LLMs) and vector similarity search to provide deep insights into patent landscapes, claim analysis, and infringement risk assessment.

---

## 🚀 Key Features

- **🔍 Intelligent Similarity Search**: High-performance semantic search using FAISS and vector embeddings to find relevant patents beyond simple keyword matching.
- **📄 Automated Claim Extraction**: Deep analysis of patent claims using NLP to decompose complex legal language into actionable data points.
- **⚖️ Infringement Risk Analysis**: AI-driven scoring and mapping of technical specifications against existing patent claims to identify potential litigation risks.
- **💳 Enterprise-Ready Billing**: Fully integrated subscription management and seat-based billing powered by Stripe.
- **📊 Real-time Monitoring**: Integrated observability with Prometheus metrics and Sentry error tracking for mission-critical reliability.
- **🏗️ Scalable Architecture**: Containerized deployment with Docker and Kubernetes, orchestrated for high availability.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Asynchronous Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM (AsyncPG)
- **Caching**: Redis
- **Vector Engine**: FAISS (Facebook AI Similarity Search)
- **Auth**: JWT-based authentication with Python-Jose
- **Task Queue**: Celery (Background analysis tasks)

### Frontend
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Framer Motion for premium animations
- **State Management**: React Query (TanStack Query) for robust server state

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (K8s)
- **CI/CD**: GitHub Actions
- **Logging**: Structured JSON logging with Loguru

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL & Redis

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ananthapadmanabhan333/Patent-.git
   cd Patent-
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   uvicorn backend.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
.
├── backend/                # FastAPI application source
│   ├── services/           # Domain-specific micro-services (Auth, Search, Billing)
│   ├── shared/             # Shared database models, config, and utils
│   └── tests/              # Pytest suite
├── frontend/               # React + TypeScript source
│   ├── src/                # Component library and application logic
│   └── public/             # Static assets
├── docker/                 # Environment-specific Dockerfiles
├── k8s/                    # Kubernetes manifests
└── scripts/                # Deployment and utility scripts
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ for the IP Community
</p>
