import hashlib
import numpy as np
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer, util
from .schemas import ProjectItem, TopMatch, SimilarityResponse

class SimilarityService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        print(f"[AI Service] Loading sentence-transformers model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        # In-memory LRU/hash cache for text embeddings
        # Key: md5 hash of normalized text -> Value: 1D numpy array
        self.embedding_cache: Dict[str, np.ndarray] = {}
        print(f"[AI Service] Model loaded successfully.")

    def _hash_text(self, text: str) -> str:
        return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()

    def get_embedding(self, text: str) -> np.ndarray:
        key = self._hash_text(text)
        if key in self.embedding_cache:
            return self.embedding_cache[key]
        
        # Compute and normalize embedding
        embedding = self.model.encode(text, normalize_embeddings=True)
        self.embedding_cache[key] = embedding
        return embedding

    def get_batch_embeddings(self, texts: List[str]) -> np.ndarray:
        embeddings = []
        texts_to_compute = []
        indices_to_compute = []

        for idx, text in enumerate(texts):
            key = self._hash_text(text)
            if key in self.embedding_cache:
                embeddings.append(self.embedding_cache[key])
            else:
                embeddings.append(None)
                texts_to_compute.append(text)
                indices_to_compute.append(idx)

        # Batch encode missing texts
        if texts_to_compute:
            new_embeddings = self.model.encode(texts_to_compute, normalize_embeddings=True)
            for idx, text, emb in zip(indices_to_compute, texts_to_compute, new_embeddings):
                key = self._hash_text(text)
                self.embedding_cache[key] = emb
                embeddings[idx] = emb

        return np.array(embeddings)

    def check_similarity(
        self,
        title: str,
        abstract: str,
        previous_projects: List[ProjectItem],
        threshold: float = 70.0
    ) -> SimilarityResponse:
        total_compared = len(previous_projects)
        if total_compared == 0:
            return SimilarityResponse(
                max_similarity=0.0,
                has_warning=False,
                warning_message="No previous FYP records available to compare against.",
                top_matches=[],
                total_compared=0,
            )

        # 1. Combine title + abstract for proposal
        proposal_text = f"{title.strip()}. {abstract.strip()}"
        proposal_embedding = self.get_embedding(proposal_text)

        # 2. Combine title + abstract for all past projects
        past_texts = [
            f"{p.title.strip()}. {p.abstract.strip()}"
            for p in previous_projects
        ]
        past_embeddings = self.get_batch_embeddings(past_texts)

        # 3. Compute cosine similarities (dot product since normalized)
        cosine_scores = np.dot(past_embeddings, proposal_embedding)

        # 4. Pair with project info and convert to percentage (0 - 100)
        scored_projects: List[Tuple[ProjectItem, float]] = []
        for proj, score in zip(previous_projects, cosine_scores):
            percentage = round(float(np.clip(score, 0.0, 1.0)) * 100.0, 2)
            scored_projects.append((proj, percentage))

        # 5. Sort descending by similarity
        scored_projects.sort(key=lambda x: x[1], reverse=True)

        # 6. Take top 5
        top_5 = scored_projects[:5]
        top_matches: List[TopMatch] = [
            TopMatch(
                id=proj.id,
                title=proj.title,
                year=proj.year,
                domain=proj.domain,
                similarity_percentage=pct,
            )
            for proj, pct in top_5
        ]

        max_similarity = top_matches[0].similarity_percentage if top_matches else 0.0
        has_warning = max_similarity > threshold

        if has_warning:
            warning_message = (
                f"High similarity warning: This proposal is {max_similarity}% similar to "
                f"'{top_matches[0].title}'. Consider revising the scope to ensure originality."
            )
        else:
            warning_message = f"Similarity check passed. Highest similarity is {max_similarity}% (below {threshold}% threshold)."

        return SimilarityResponse(
            max_similarity=max_similarity,
            has_warning=has_warning,
            warning_message=warning_message,
            top_matches=top_matches,
            total_compared=total_compared,
        )

# Global singleton
_service_instance: SimilarityService = None

def get_similarity_service() -> SimilarityService:
    global _service_instance
    if _service_instance is None:
        _service_instance = SimilarityService()
    return _service_instance
