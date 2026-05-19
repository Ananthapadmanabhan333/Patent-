import logging
from typing import Dict, Any, List, Optional
from backend.vector_store.retrieval import HybridVectorRetrievalEngine
from backend.scoring.ranking_engine import SemanticRankingEngine

logger = logging.getLogger("talentos.copilot")

class RecruiterAICopilot:
    """
    Recruiter AI Copilot that translates natural language queries into candidate searches,
    reasons about profile matches, summarizes strengths/weaknesses, and recommends hiring strategies.
    """

    def __init__(self, retrieval_engine: HybridVectorRetrievalEngine, ranking_engine: SemanticRankingEngine):
        self.retrieval_engine = retrieval_engine
        self.ranking_engine = ranking_engine

    def handle_query(self, query: str) -> Dict[str, Any]:
        """
        Processes recruiter natural language query, retrieves candidates semantically,
        and generates comparative AI recommendations.
        """
        logger.info(f"Copilot processing prompt query: '{query}'")
        
        # 1. Parse intent or map keywords for required skills
        required_skills = []
        query_lower = query.lower()
        
        if "rust" in query_lower:
            required_skills.append("Rust")
        if "pytorch" in query_lower or "triton" in query_lower or "cuda" in query_lower:
            required_skills.append("PyTorch")
        if "typescript" in query_lower or "react" in query_lower:
            required_skills.append("TypeScript")

        # 2. Search candidates semantically
        search_results = self.retrieval_engine.search_candidates(query, required_skills=required_skills, top_k=3)
        
        # 3. Score candidates with full explainability
        evaluated_candidates = []
        for cand, sim_score in search_results:
            ranking_card = self.ranking_engine.compute_bias_free_score(cand, sim_score)
            evaluated_candidates.append(ranking_card)

        # Sort descending by scored rank
        evaluated_candidates.sort(key=lambda x: x["overall_score"], reverse=True)

        # 4. Generate Copilot Response Text
        if not evaluated_candidates:
            copilot_text = (
                f"I searched the candidate pool for '{query}', but couldn't find any profiles that met "
                f"the skills or experience criteria. Try widening the query or removing specific filters."
            )
        else:
            top_cand = evaluated_candidates[0]
            copilot_text = (
                f"Based on your query: **'{query}'**, I retrieved and ranked **{len(evaluated_candidates)}** candidates. "
                f"The top recommendation is **{top_cand['candidate_name']}** with an overall semantic fit score of "
                f"**{top_cand['overall_score']}/10**.\n\n"
                f"### Why **{top_cand['candidate_name']}** is a great fit:\n"
                + "\n".join([f"- {s}" for s in top_cand['strengths'][:2]]) + "\n\n"
                f"### Recruiter Recommendations:\n"
                f"- **Recommended Role Fit**: {self._infer_role_recommendation(top_cand['radar_metrics'])}\n"
                f"- **Interview Strategy**: Probe deep into their project '{cand.get('projects', [{'name': 'core projects'}])[0]['name']}'. "
                f"Focus on architecture choices, data-flow boundaries, and dynamic scaling benchmarks."
            )

        return {
            "query": query,
            "response": copilot_text,
            "ranked_matches": evaluated_candidates,
            "suggested_actions": [
                "Schedule Technical Interview",
                "Generate Role-tailored Questions",
                "Audit Recommendation Bias"
            ]
        }

    def _infer_role_recommendation(self, radar_metrics: Dict[str, float]) -> str:
        """
        Determines target engineering profile based on skill score dimensions.
        """
        systems = radar_metrics.get("systems", 5.0)
        ai = radar_metrics.get("ai", 5.0)
        relevance = radar_metrics.get("relevance", 5.0)
        
        if ai >= 8.5:
            return "VLM & AI Research Engineer"
        elif systems >= 8.5:
            return "Distributed Systems & Infrastructure Architect"
        elif systems >= 7.0 and ai >= 7.0:
            return "AI Systems Infrastructure Engineer"
        elif relevance >= 8.0:
            return "Lead Product & Full-Stack Engineer"
        else:
            return "Senior Generalist Software Engineer"


class AIInterviewGenerator:
    """
    AI Technical Interview Question Generator.
    Adapts dynamic, deep-probing questions based on candidate profile, projects, and potential skill gaps.
    """

    def generate_interview(self, candidate_data: Dict[str, Any], targeted_role: str) -> Dict[str, Any]:
        """
        Generates role-specific, project-specific, and weakness-probing technical questions.
        """
        name = candidate_data.get("name")
        skills = candidate_data.get("skills", [])
        projects = candidate_data.get("projects", [])
        ai_scores = candidate_data.get("ai_inferred_scores", {})
        
        questions = []
        
        # 1. Project Deep Dive (Probe technical claims)
        if projects:
            top_proj = projects[0]
            questions.append({
                "id": "q1_proj_dive",
                "category": "Project Architecture Deep-Dive",
                "question": f"In your project '{top_proj['name']}', you outlined an architecture described as '{top_proj.get('description', 'advanced systems work')}'. Can you explain how state synchronization or data consistency is handled under high write pressure? What happens during a network partition?",
                "expected_answer": f"Proving actual involvement in '{top_proj['name']}' by explaining concurrency limits, threading models, or concrete state recovery routes."
            })
        else:
            questions.append({
                "id": "q1_system_design",
                "category": "System Design & Distributed Data",
                "question": "Can you design a multi-region real-time ingestion pipeline with sub-100ms globally-replicated state caching? Walk me through write replication latency trade-offs.",
                "expected_answer": "Discussing CAP theorem, eventual vs strong consistency, Raft consensus logs, or multi-leader databases."
            })

        # 2. Skill Gap/Weakness Prober
        systems_score = ai_scores.get("systems_programming", 5.0)
        ai_score = ai_scores.get("ai_sophistication", 5.0)
        
        if systems_score < 6.0 and "Systems" in targeted_role:
            questions.append({
                "id": "q2_weakness_systems",
                "category": "Systems & Concurrency Probing",
                "question": "Your experience is centered heavily on visual/web frontends. Explain standard memory management difference between stack and heap allocations. How does a thread safe channel prevent race conditions under Go or Rust?",
                "expected_answer": "Clear explanation of thread locks, atomic memory operations, stack stack/heap variables, and channel ring-buffers."
            })
        elif ai_score < 6.0 and "AI" in targeted_role:
            questions.append({
                "id": "q2_weakness_ai",
                "category": "AI/VLM Engineering Probing",
                "question": "For high-performance visual classification or captioning, how does visual embedding alignment (e.g. CLIP) contrast with direct generative autoregressive decoders? What are the key latency bottlenecks during inference?",
                "expected_answer": "Contrasting contrastive loss encoders with sequence causal language transformers, citing KV-caching and memory bandwidth limits as bottlenecks."
            })
        else:
            questions.append({
                "id": "q2_core_depth",
                "category": "Engineering Methodology",
                "question": "Describe a scenario where you faced a significant performance bottleneck in production. What tracing tools (e.g. pprof, eBPF, chrome devtools) did you use to locate the issue, and how did you resolve it?",
                "expected_answer": "Demonstrating systematic root-cause analysis rather than brute-force guessing. Explaining specific profiler/flamegraph findings."
            })

        # 3. Role-Specific Technical Scenario
        if "AI" in targeted_role:
            questions.append({
                "id": "q3_role_scenario",
                "category": "Vision-Language Model Scaling",
                "question": "When serving a massive 70B parameter multimodal model, what strategies (e.g., pipeline parallelism, tensor parallelism, quantization like AWQ) would you implement to keep end-to-end latency suitable for real-time recruiter search?",
                "expected_answer": "Explanation of pipeline chunking, communication collectives (AllReduce), active memory foot-prints of FP16 vs INT4, and flash attention."
            })
        else:
            questions.append({
                "id": "q3_role_scenario",
                "category": "Scalable Systems Infrastructure",
                "question": "How would you design a rate-limiter for an enterprise gateway processing 100k requests/sec? Compare sliding window log with token bucket in terms of memory footprint and compute efficiency.",
                "expected_answer": "Explaining Redis sorted set sliding window memory limits vs atomic token bucket counters."
            })

        return {
            "candidate_name": name,
            "targeted_role": targeted_role,
            "questions": questions,
            "adaptability_notes": f"Questions generated specifically targeting {name}'s parsed accomplishments in {', '.join(skills[:3])}."
        }
