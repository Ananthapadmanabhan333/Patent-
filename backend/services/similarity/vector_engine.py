import os
import faiss
import numpy as np
import pickle
from typing import List, Dict, Any, Tuple
from loguru import logger

# Try import SentenceTransformers
try:
    from sentence_transformers import SentenceTransformer
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    logger.warning("sentence-transformers not installed. Falling back to mock embeddings.")


class VectorSimilarityEngine:
    """
    Enterprise Vector Similarity Engine using SentenceTransformers and FAISS.
    Handles semantic embedding generation for patent claims and rapid similarity search.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", index_path: str = "data/faiss_index"):
        self.DIMENSION = 384 # Default for all-MiniLM-L6-v2
        self.index_path = index_path
        self.metadata_path = f"{index_path}_meta.pkl"
        
        # Load Model
        if HAS_TRANSFORMERS:
            logger.info(f"Loading SentenceTransformer: {model_name}")
            self.model = SentenceTransformer(model_name)
        else:
            self.model = None
            
        # Initialize FAISS Index mapping Vector ID -> Document DB ID
        self.index = None
        self.metadata: Dict[int, str] = {} # Internal FAISS ID -> Patent/Claim ID
        self._load_or_create_index()


    def _load_or_create_index(self):
        """Loads FAISS index from disk or creates a new empty IndexFlatL2."""
        os.makedirs(os.path.dirname(self.index_path) if os.path.dirname(self.index_path) else ".", exist_ok=True)
        
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
                logger.info(f"Loaded existing FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}. Creating new.")
                self.index = faiss.IndexFlatL2(self.DIMENSION)
                self.metadata = {}
        else:
            self.index = faiss.IndexFlatL2(self.DIMENSION)
            self.metadata = {}
            logger.info(f"Created new FAISS IndexFlatL2 (Dim: {self.DIMENSION})")


    def save_index(self):
        """Persists FAISS index and metadata to disk."""
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'wb') as f:
            pickle.dump(self.metadata, f)
        logger.debug("FAISS index saved to disk.")


    def generate_embedding(self, text: str) -> np.ndarray:
        """Generates dense vector embedding for input text."""
        if self.model:
            embedding = self.model.encode(text, convert_to_numpy=True)
            # Ensure 2D shape (1, hidden_dim) required by FAISS
            if len(embedding.shape) == 1:
                embedding = np.expand_dims(embedding, axis=0)
            return embedding
        else:
            # Mock generating random vector payload in correct shape
            return np.random.rand(1, self.DIMENSION).astype('float32')


    def add_document(self, doc_id: str, text: str) -> bool:
        """
        Embeds text and adds it to the FAISS index with metadata tracking.
        """
        try:
            vector = self.generate_embedding(text)
            faiss.normalize_L2(vector) # Normalize for Cosine Similarity (instead of exact L2)
            
            # Add to FAISS index
            internal_id = self.index.ntotal
            self.index.add(vector)
            
            # Map internal FAISS integer ID to our system string ID
            self.metadata[internal_id] = doc_id
            
            # Periodically save
            if internal_id % 100 == 0:
                self.save_index()
                
            return True
        except Exception as e:
            logger.error(f"Failed to add document to index: {e}")
            return False


    def search_similar(self, text: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Searches the FAISS index for the k nearest neighbors to the input text.
        Returns List of (document_id, similarity_score).
        """
        if self.index.ntotal == 0:
            logger.warning("FAISS index is empty.")
            return []

        query_vector = self.generate_embedding(text)
        faiss.normalize_L2(query_vector)

        # FAISS search returns squared Euclidean distance (which equates to cosine sim after normalization)
        distances, indices = self.index.search(query_vector, min(top_k, self.index.ntotal))

        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1: # -1 means no neighbor found (if k > ntotal)
                doc_id = self.metadata.get(idx, "UNKNOWN")
                # Convert L2 distance of normalized vectors back to Cosine Similarity score [0, 1]
                # Cosine Similarity = 1 - (L2^2 / 2)
                score = float(1.0 - (distances[0][i] / 2.0))
                results.append((doc_id, score))
                
        return results

# Singleton instance
vector_engine = VectorSimilarityEngine()
