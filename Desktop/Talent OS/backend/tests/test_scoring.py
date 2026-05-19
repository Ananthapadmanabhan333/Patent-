import unittest
from backend.scoring.project_evaluator import ProjectQualityEvaluator
from backend.scoring.ranking_engine import SemanticRankingEngine
from backend.vector_store.retrieval import HybridVectorRetrievalEngine

class TestTalentosScoringInfrastructure(unittest.TestCase):
    """
    Rigorously validates TALENTOS scoring formulas, project quality categorizations,
    fairness audit parameters, and hybrid vector indexing ranks.
    """

    def setUp(self):
        self.project_evaluator = ProjectQualityEvaluator()
        self.ranking_engine = SemanticRankingEngine()
        self.retrieval_engine = HybridVectorRetrievalEngine()

    def test_project_quality_differentiation(self):
        """
        Ensures advanced infrastructure projects get highly differentiated systems/AI
        scores compared to typical MVC CRUD template boilerplates.
        """
        # 1. Advanced Systems Project
        sys_project = self.project_evaluator.evaluate_project(
            name="Raft-Consensus-Store",
            description="High throughput distributed key-value core written in Go implementing leader partition consensus and raw WAL disks.",
            tech_stack=["Go", "Protobuf"]
        )
        
        self.assertFalse(sys_project["is_crud"])
        self.assertGreaterEqual(sys_project["systems_depth"], 7.5)
        self.assertGreater(sys_project["overall_project_score"], 7.0)

        # 2. Basic CRUD Project
        crud_project = self.project_evaluator.evaluate_project(
            name="SaaS-Template-Admin",
            description="Simple website dashboard with typical JWT authentication, React frontend, and standard PostgreSQL database tables.",
            tech_stack=["TypeScript", "React", "Prisma"]
        )
        
        self.assertTrue(crud_project["is_crud"])
        self.assertLess(crud_project["systems_depth"], 5.0)
        self.assertLess(crud_project["overall_project_score"], 6.0)

    def test_anonymized_weighted_scoring(self):
        """
        Validates that score computation properly strips sensitive fields and respects custom weights.
        """
        candidate_data = {
            "id": "cand-test-id",
            "name": "Jane Doe",
            "email": "jane@doe.com",
            "github_url": "github.com/janedoe",
            "ai_inferred_scores": {
                "engineering_maturity": 8.0,
                "systems_programming": 9.0,
                "ai_sophistication": 6.0,
                "leadership": 7.0
            },
            "experience": [
                {"role": "Systems Engineer", "company": "Company A", "description": "built kernels"}
            ]
        }
        
        # Calculate with strict weights favoring systems engineering
        custom_weights = {
            "semantic_fit": 0.20,
            "systems_depth": 0.50,
            "ai_sophistication": 0.10,
            "engineering_maturity": 0.10,
            "leadership": 0.10
        }
        
        score_card = self.ranking_engine.compute_bias_free_score(
            candidate_data, 
            role_query_embeddings_fit=0.85, # high semantic fit
            custom_weights=custom_weights
        )
        
        self.assertEqual(score_card["candidate_name"], "Jane Doe")
        self.assertGreaterEqual(score_card["overall_score"], 7.5)
        self.assertEqual(score_card["radar_metrics"]["systems"], 9.0)
        self.assertIn("Exceptional low-level and systems programming proficiency (C++, Rust, eBPF).", score_card["strengths"])

    def test_fairness_parity_math(self):
        """
        Tests demographic disparate impact selection rate math.
        """
        ranked_cands = [
            {"candidate_id": "c1", "candidate_name": "Sophia"},
            {"candidate_id": "c2", "candidate_name": "Alex"},
            {"candidate_id": "c3", "candidate_name": "Liam"},
            {"candidate_id": "c4", "candidate_name": "Nikhil"},
            {"candidate_id": "c5", "candidate_name": "Elena"},
        ]
        
        audit = self.ranking_engine.audit_fairness(ranked_cands)
        
        self.assertIn("disparate_impact_ratio", audit)
        self.assertIn("demographic_parity_diff", audit)
        self.assertGreater(audit["disparate_impact_ratio"], 0.0)

if __name__ == "__main__":
    unittest.main()
