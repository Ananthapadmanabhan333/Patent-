"""
NLP Claim Parsing Engine
Decomposes invention descriptions into structured claim components
using spaCy and pattern-based extraction.
"""
import re
import json
from typing import List, Dict, Any
from loguru import logger

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except (OSError, ImportError):
    logger.warning("spaCy module/model not found. Falling back to regex.")
    nlp = None


COMPONENT_PATTERNS = [
    r"comprising\s+([^,;.]+)",
    r"including\s+([^,;.]+)",
    r"consisting of\s+([^,;.]+)",
    r"having\s+([^,;.]+)",
    r"means for\s+([^,;.]+)",
    r"configured to\s+([^,;.]+)",
    r"adapted to\s+([^,;.]+)",
]

FUNCTIONAL_PATTERNS = [
    r"for\s+([\w\s]+ing)\s",
    r"to\s+([\w\s]+)\s+the",
    r"capable of\s+([\w\s]+)",
    r"operable to\s+([\w\s]+)",
]

CONSTRAINT_PATTERNS = [
    r"wherein\s+([^,;.]+)",
    r"whereby\s+([^,;.]+)",
    r"such that\s+([^,;.]+)",
    r"provided that\s+([^,;.]+)",
    r"at least\s+([^,;.]+)",
    r"not more than\s+([^,;.]+)",
]


def _extract_by_patterns(text: str, patterns: List[str]) -> List[str]:
    results = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results.extend([m.strip() for m in matches if len(m.strip()) > 3])
    return list(set(results))[:10]


def _split_into_claims(text: str) -> List[str]:
    """
    Try to split text into individual claims.
    Handles numbered claims (1. A system...) and paragraph-style.
    """
    # Try numbered claim splitting
    numbered = re.split(r'\n\s*\d+\.\s+', text)
    if len(numbered) > 1:
        return [c.strip() for c in numbered if len(c.strip()) > 20]
    
    # Try sentence-based splitting for descriptions without claim numbers
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Group 3-5 sentences into logical claims
    claims = []
    chunk = []
    for s in sentences:
        chunk.append(s)
        if len(' '.join(chunk)) > 200:
            claims.append(' '.join(chunk))
            chunk = []
    if chunk:
        claims.append(' '.join(chunk))
    
    return claims if claims else [text]


def _extract_dependencies(claim_text: str, all_claims: List[str]) -> List[str]:
    deps = []
    refs = re.findall(r'claim\s+(\d+)', claim_text, re.IGNORECASE)
    for ref in refs:
        idx = int(ref) - 1
        if 0 <= idx < len(all_claims):
            deps.append(f"claim_{ref}")
    return deps


def parse_claims(invention_description: str) -> List[Dict[str, Any]]:
    """
    Main entry point: parse invention description into structured claims.
    Returns a list of claim dicts with components, functions, constraints, dependencies.
    """
    raw_claims = _split_into_claims(invention_description)
    structured = []

    for i, claim_text in enumerate(raw_claims, start=1):
        components = _extract_by_patterns(claim_text, COMPONENT_PATTERNS)
        functional_elements = _extract_by_patterns(claim_text, FUNCTIONAL_PATTERNS)
        constraints = _extract_by_patterns(claim_text, CONSTRAINT_PATTERNS)
        dependencies = _extract_dependencies(claim_text, raw_claims)

        # spaCy noun-phrase extraction for additional components
        if nlp:
            doc = nlp(claim_text[:3000])  # limit for performance
            noun_phrases = [chunk.text for chunk in doc.noun_chunks if len(chunk.text) > 3]
            components = list(set(components + noun_phrases[:8]))

        structured.append({
            "claim_number": i,
            "claim_text": claim_text.strip(),
            "components": json.dumps(components),
            "functional_elements": json.dumps(functional_elements),
            "constraints": json.dumps(constraints),
            "dependencies": json.dumps(dependencies),
        })

    logger.info(f"Parsed {len(structured)} claims from input")
    return structured
