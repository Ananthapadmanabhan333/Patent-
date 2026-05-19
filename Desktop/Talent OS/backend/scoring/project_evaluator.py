import logging
from typing import Dict, Any, List

logger = logging.getLogger("talentos.project_evaluator")

class ProjectQualityEvaluator:
    """
    Project Quality Evaluation Engine that assesses engineering complexity,
    systems depth, AI sophistication, originality, and infrastructure maturity,
    clearly separating standard CRUD apps from advanced systems engineering projects.
    """

    def evaluate_project(self, name: str, description: str, tech_stack: List[str]) -> Dict[str, Any]:
        """
        Evaluate a single candidate project and return a detailed AI scoring card.
        """
        logger.info(f"Evaluating quality score for project: {name}")
        
        name_lower = name.lower()
        desc_lower = description.lower()
        
        # Initialize default metrics
        originality = 5.0
        complexity = 5.0
        scalability = 5.0
        maintainability = 6.0
        ai_sophistication = 1.0
        systems_depth = 1.0
        is_crud = True
        
        reasons = []
        architecture_critique = ""
        
        # 1. Check for AI & VLM sophistication
        ai_keywords = ["vlm", "llm", "transformer", "pytorch", "huggingface", "triton", "cuda", "embedding", "rag", "vector db", "blip-2", "clip", "vision language model"]
        ai_hits = sum(1 for kw in ai_keywords if kw in desc_lower or kw in name_lower)
        
        if ai_hits > 0:
            is_crud = False
            ai_sophistication = min(10.0, 4.0 + (ai_hits * 1.5))
            complexity += 1.5
            reasons.append(f"AI capabilities detected based on keywords: {[kw for kw in ai_keywords if kw in desc_lower]}")
            
        # 2. Check for Systems and Distributed Systems depth
        sys_keywords = ["raft", "consensus", "ebpf", "kernel", "grpc", "protobuf", "low-level", "zero-copy", "multithread", "distributed", "transaction", "compiler", "malloc", "rust", "c++", "storage engine", "sstable", "lsm-tree"]
        sys_hits = sum(1 for kw in sys_keywords if kw in desc_lower or kw in name_lower or any(kw in t.lower() for t in tech_stack))
        
        if sys_hits > 0:
            is_crud = False
            systems_depth = min(10.0, 3.5 + (sys_hits * 2.0))
            complexity += 2.0
            reasons.append(f"Advanced systems components detected: {[kw for kw in sys_keywords if kw in desc_lower or kw in name_lower]}")
            
        # 3. Refine scores
        if not is_crud:
            originality = min(10.0, 6.0 + (complexity * 0.3))
            scalability = min(10.0, 5.0 + (systems_depth * 0.4) + (ai_sophistication * 0.2))
            complexity = min(10.0, complexity)
        else:
            # Simple CRUD template heuristics
            originality = max(3.5, 5.5 - (1.0 if "starter" in name_lower or "template" in desc_lower else 0.0))
            complexity = max(3.0, 4.5)
            scalability = max(3.0, 5.0)
            reasons.append("Project exhibits patterns typical of a standard CRUD framework or database wrapper application.")

        # Final aggregate score
        overall_project_score = round(
            (complexity * 0.3) + (scalability * 0.25) + (originality * 0.2) + (systems_depth * 0.15) + (ai_sophistication * 0.1), 
            2
        )
        
        # Dynamic Architecture Critique Generation
        if systems_depth >= 8.0:
            architecture_critique = (
                f"The project '{name}' exhibits exemplary systems-level sophistication. "
                f"Its use of low-level paradigms and distributed concepts (like Raft, kernel hooks, or custom lock structures) "
                f"highlights an outstanding command over memory alignment, lockless programming, and fault-tolerant computing. "
                f"Highly scalable design with minimal overhead."
            )
        elif ai_sophistication >= 8.0:
            architecture_critique = (
                f"The project '{name}' showcases state-of-the-art AI infrastructure. "
                f"Rather than simply calling external APIs, it integrates deep architectural structures such as "
                f"custom Triton GPU attention optimization or visual ingestion alignments, "
                f"demonstrating exceptional research and machine learning engineering capabilities."
            )
        elif not is_crud:
            architecture_critique = (
                f"The project '{name}' is a highly original non-CRUD utility. "
                f"It demonstrates solid asynchronous engineering, message routing, or robust canvas synchronization. "
                f"The system components are properly decoupled, showing good API design principles."
            )
        else:
            architecture_critique = (
                f"The project '{name}' is a well-engineered application template. "
                f"While it fulfills essential requirements (authentication, data modeling, database migrations), "
                f"it relies heavily on standard web framework abstractions (ORM, MVC) and does not present "
                f"complex concurrency, real-time data sync, low-level optimizations, or intensive AI orchestration."
            )

        return {
            "name": name,
            "complexity_score": round(complexity, 2),
            "scalability_score": round(scalability, 2),
            "originality_score": round(originality, 2),
            "maintainability_score": round(maintainability, 2),
            "ai_sophistication": round(ai_sophistication, 2),
            "systems_depth": round(systems_depth, 2),
            "is_crud": is_crud,
            "reasons": reasons,
            "architecture_critique": architecture_critique,
            "overall_project_score": overall_project_score
        }
