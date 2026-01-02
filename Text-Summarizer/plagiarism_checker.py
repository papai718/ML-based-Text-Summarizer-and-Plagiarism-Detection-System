import pandas as pd
import os
import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Paths
DATASET_PATH = r"..\Plagiarism Detection\dataset.csv"

# Globals
sbert_model = None
source_embeddings = None
source_texts = []

def load_resources():
    global sbert_model, source_embeddings, source_texts
    try:
        if sbert_model is None:
            logger.info("Loading SBERT model...")
            sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            if os.path.exists(DATASET_PATH):
                logger.info("Loading dataset...")
                df = pd.read_csv(DATASET_PATH)
                # Ensure strings
                df['source_text'] = df['source_text'].fillna('').astype(str)
                # Unique sources to check against
                source_texts = df['source_text'].unique().tolist()
                
                logger.info(f"Encoding {len(source_texts)} source texts... (This may take a moment)")
                source_embeddings = sbert_model.encode(source_texts)
                logger.info("Resources loaded successfully.")
                return True
            else:
                logger.error("Dataset file not found.")
                return False

    except Exception as e:
        logger.error(f"Error loading resources: {e}")
        return False

def check_plagiarism(text):
    """
    Checks the input text against the database of source texts using SBERT semantic similarity.
    """
    if sbert_model is None:
        success = load_resources()
        if not success:
            return {"error": "Failed to load detection model"}
    
    try:
        # Encode input
        input_embedding = sbert_model.encode([text])
        
        # Compute cosine similarity against all sources
        similarities = cosine_similarity(input_embedding, source_embeddings)[0]
        
        # Find best match
        best_match_idx = np.argmax(similarities)
        best_score = float(similarities[best_match_idx])
        best_match_source = source_texts[best_match_idx]
        
        # Threshold from user notebook was 0.6
        threshold = 0.6
        is_plagiarized = best_score >= threshold
        
        result = {
            "is_plagiarized": is_plagiarized,
            "similarity_score": best_score,
            "most_similar_source": (best_match_source[:500] + "...") if best_match_source else "No close match found."
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error checking plagiarism: {e}")
        return {"error": str(e)}
