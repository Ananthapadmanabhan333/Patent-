import math
from typing import Dict, Any, List
from loguru import logger

class RiskScoringEngine:
    """
    Enterprise Multi-Variable Risk Scoring Engine.
    Calculates a 0-100 infringement risk score by aggregating:
    1. Semantic Similarity (FAISS Vector Space)
    2. Structural Similarity (Neo4j Graph DAG intersection)
    3. Claim Breadth Entropy (Complexity penalty)
    4. Litigation/Jurisdiction Modifiers
    """
    
    def __init__(self):
        # Weights for the final score out of 100
        self.WEIGHT_SEMANTIC = 0.40
        self.WEIGHT_STRUCTURAL = 0.40
        self.WEIGHT_BREADTH = 0.10
        self.WEIGHT_JURISDICTION = 0.10

    def calculate_claim_breadth_entropy(self, claim_text: str, components: List[Dict]) -> float:
        """
        Estimates the 'breadth' of a claim.
        Fewer, more general words/components = broader claim = higher risk of accidental infringement.
        Returns a modifier score between 0.0 and 1.0 (1.0 being extremely broad/risky).
        """
        word_count = len(claim_text.split())
        comp_count = len(components)
        
        # Base assumptions: A claim with < 30 words and < 3 components is very broad
        if word_count == 0 or comp_count == 0:
            return 0.5
            
        # Entropy function reflecting broader risk for shorter/simpler claims
        breadth_score = min(1.0, 100 / (word_count * math.sqrt(comp_count)))
        return round(max(0.1, breadth_score), 2)


    def calculate_jurisdiction_multiplier(self, user_jurisdictions: List[str], patent_jurisdiction: str, is_active: bool) -> float:
        """
        Modifier based on legal status and geographical overlap.
        """
        if not is_active:
            return 0.1 # Expired patents pose minimal risk, though some liability might trail

        if patent_jurisdiction in user_jurisdictions or 'GLOBAL' in user_jurisdictions:
            return 1.0 # Direct geographic threat
            
        return 0.3 # Geographically distant, but still valid prior art


    def generate_risk_score(self, 
                            semantic_score: float, 
                            structural_score: float, 
                            claim_text: str,
                            components: List[Dict],
                            patent_jurisdiction: str = "US",
                            user_jurisdictions: List[str] = ["US"],
                            is_active: bool = True) -> Dict[str, Any]:
        """
        Generates the final multi-variable risk score and explanation envelope.
        semantic_score [0.0 - 1.0]
        structural_score [0.0 - 1.0]
        """
        try:
            # 1. Base Score from AI (0-80 points)
            base_score = ((semantic_score * self.WEIGHT_SEMANTIC) + \
                          (structural_score * self.WEIGHT_STRUCTURAL)) * 100
                          
            # 2. Entropy Modifier (0-10 points)
            breadth_mod = self.calculate_claim_breadth_entropy(claim_text, components)
            breadth_score = (breadth_mod * self.WEIGHT_BREADTH) * 100
            
            # 3. Legal/Jurisdiction Modifier (0-10 points)
            jurisdiction_mod = self.calculate_jurisdiction_multiplier(user_jurisdictions, patent_jurisdiction, is_active)
            jurisdiction_score = (jurisdiction_mod * self.WEIGHT_JURISDICTION) * 100
            
            # Final calculation
            raw_score = base_score + breadth_score + jurisdiction_score
            final_score = min(100.0, max(0.0, raw_score))
            
            # Sub-component explanation layer for the Enterprise UI
            if final_score >= 80:
                risk_level = "CRITICAL"
            elif final_score >= 50:
                risk_level = "HIGH"
            elif final_score >= 30:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            explanation = {
                "final_score": round(final_score, 1),
                "risk_level": risk_level,
                "breakdown": {
                    "semantic_contribution": round((semantic_score * self.WEIGHT_SEMANTIC) * 100, 1),
                    "structural_contribution": round((structural_score * self.WEIGHT_STRUCTURAL) * 100, 1),
                    "breadth_penalty": round(breadth_score, 1),
                    "jurisdiction_weight": round(jurisdiction_score, 1)
                },
                "flags": [
                    "High Semantic Overlap" if semantic_score > 0.8 else None,
                    "Broad Claim Coverage" if breadth_mod > 0.7 else None,
                    "Active US Threat" if is_active and patent_jurisdiction == "US" else None
                ]
            }
            
            # Clean up None flags
            explanation["flags"] = [f for f in explanation["flags"] if f]
            
            return explanation

        except Exception as e:
            logger.error(f"Error calculating risk score: {e}")
            return {"final_score": 0.0, "risk_level": "ERROR", "breakdown": {}}

# Singleton
risk_engine = RiskScoringEngine()
