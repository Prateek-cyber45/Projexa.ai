AI Scoring Engine - R_score Module

Quick start (development):

1. (Optional) create a virtualenv and install dependencies:

   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt

2. Download spaCy model if you want the full NLP behavior:

   python -m spacy download en_core_web_sm

3. Run the local test (fallback works if dependencies are missing):

   python r_score.py

This module will use `sentence-transformers` + `spaCy` when available; otherwise
it falls back to a lightweight similarity method for quick testing.
