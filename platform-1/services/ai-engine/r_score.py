"""
R_score evaluator for AI Scoring Engine.

This module uses Sentence-BERT and spaCy when available. If those
packages or models are not installed, it falls back to a lightweight
string-similarity and token-check implementation so the file can be
executed in constrained environments for quick testing.
"""

from typing import List, Dict

USE_MODELS = False

try:
    from sentence_transformers import SentenceTransformer, util
    import spacy
    nlp = spacy.load("en_core_web_sm")
    bert_model = SentenceTransformer('all-MiniLM-L6-v2')
    USE_MODELS = True
except Exception:
    # Fallbacks will be used if models/packages are not available
    USE_MODELS = False


def evaluate_r_score(user_submission: str, reference_answer: str, required_techniques: List[str]) -> Dict:
    """
    Calculates the R_score based on semantic similarity and keyword coverage.
    Returns a dict containing the `r_score` (0-100) and component breakdown.
    Fallbacks used when heavy ML packages are not present so tests can run.
    """

    # 1. Semantic Similarity
    if USE_MODELS:
        embeddings1 = bert_model.encode(user_submission, convert_to_tensor=True)
        embeddings2 = bert_model.encode(reference_answer, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings1, embeddings2)
        semantic_score = float(cosine_scores[0][0]) * 100.0
    else:
        # Lightweight fallback: sequence similarity
        from difflib import SequenceMatcher
        ratio = SequenceMatcher(None, user_submission.lower(), reference_answer.lower()).ratio()
        semantic_score = ratio * 100.0

    # 2. Rule Engine / Keyword Extraction (Technique coverage check)
    if USE_MODELS:
        user_doc = nlp(user_submission.lower())
        user_tokens = {token.lemma_ for token in user_doc}
    else:
        user_tokens = set(user_submission.lower().split())

    techniques_found = 0
    for technique in required_techniques or []:
        t = technique.lower()
        if t in user_tokens or t in user_submission.lower():
            techniques_found += 1

    technique_score = (techniques_found / len(required_techniques)) * 100.0 if required_techniques else 100.0

    # 3. Weighted final R_score
    r_score = (semantic_score * 0.7) + (technique_score * 0.3)

    return {
        "r_score": round(r_score, 2),
        "components": {
            "accuracy_completeness": round(semantic_score, 2),
            "technique_coverage": round(technique_score, 2)
        },
        "used_models": USE_MODELS
    }


if __name__ == "__main__":
    # Quick local test (works even if heavy packages are missing)
    reference = "I isolated the compromised machine from the network and analyzed the malicious payload using reverse engineering tools."
    submission = "I disconnected the infected host from the subnet and used ghidra to look at the malware."
    keywords = ["isolate", "analyze", "payload", "reverse engineering"]

    result = evaluate_r_score(submission, reference, keywords)
    print("Scoring Result:")
    import json
    print(json.dumps(result, indent=2))
