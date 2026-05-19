"""
Risk Scoring Engine
Calculates patent infringement risk based on semantic and structural similarity.
"""
from typing import List, Dict, Any


def calculate_risk_score(similar_patents: List[Dict[str, Any]]) -> float:
    """
    Calculate an aggregate infringement risk score (0-100) based on similar patents.
    
    Factors considered:
    - Highest individual similarity score
    - Number of highly similar patents (>0.8 score)
    - Activity status of similar patents (active vs expired)
    """
    if not similar_patents:
        return 0.0

    # Sort by similarity
    sorted_patents = sorted(similar_patents, key=lambda x: x.get("similarity_score", 0), reverse=True)
    
    top_score = sorted_patents[0].get("similarity_score", 0)
    
    # Base risk is driven by the most similar patent
    base_risk = top_score * 80  # 0 to 80 points
    
    # Additional risk for multiple highly similar active patents
    clustering_risk = 0.0
    for p in sorted_patents:
        score = p.get("similarity_score", 0)
        is_active = p.get("is_active", True)
        
        if score > 0.75 and is_active:
            clustering_risk += (score - 0.75) * 40  # Add up to ~10 points per high-risk patent
            
    # Cap clustering risk at 20 points
    clustering_risk = min(clustering_risk, 20.0)
    
    total_risk = base_risk + clustering_risk
    return min(max(total_risk, 0.0), 100.0)


def determine_risk_level(score: float) -> str:
    """Map numerical score to risk category."""
    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 40:
        return "MODERATE"
    elif score >= 20:
        return "LOW"
    else:
        return "MINIMAL"


def evaluate_simulation(original_score: float, new_score: float) -> Dict[str, Any]:
    """Evaluate the impact of design modifications."""
    delta = new_score - original_score
    
    if delta < -15:
        explanation = "Significant risk reduction. The modifications successfully differentiated the design from existing patents."
    elif delta < -5:
        explanation = "Moderate risk reduction. Consider further structural changes to key components."
    elif delta < 0:
        explanation = "Minor risk reduction. The design remains structurally similar to existing art."
    elif delta == 0:
        explanation = "No change in risk profile. The modified functional elements are still covered by broad claims in prior art."
    else:
        explanation = "Warning: The modifications increased similarity to other existing patents."

    return {
        "original_risk_score": round(original_score, 1),
        "simulated_risk_score": round(new_score, 1),
        "delta": round(delta, 1),
        "explanation": explanation
    }
