import os
import re
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class KnowledgeEngine:
    def __init__(self):
        # Memory-based chunk store: list of dicts with {"doc_id": ..., "text": ..., "tokens": set}
        self._chunks: List[Dict[str, Any]] = []

    def _tokenize(self, text: str) -> set:
        # Convert text to unique lowercase word tokens for simple Jaccard/keyword search similarity
        words = re.findall(r'\b\w+\b', text.lower())
        return set(words)

    def add_document(self, doc_id: str, text: str):
        """
        Chunks the document text and stores it in the index.
        """
        # Chunking: split text by paragraphs or every 1000 characters
        paragraphs = text.split("\n\n")
        chunk_index = 0
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # Sub-chunk if too long
            if len(para) > 1200:
                sub_chunks = [para[i:i+1000] for i in range(0, len(para), 800)]
            else:
                sub_chunks = [para]
                
            for sc in sub_chunks:
                self._chunks.append({
                    "doc_id": doc_id,
                    "chunk_id": f"{doc_id}_c{chunk_index}",
                    "text": sc,
                    "tokens": self._tokenize(sc)
                })
                chunk_index += 1
                
        logger.info(f"Ingested document {doc_id} into Knowledge Engine. Total chunks now: {len(self._chunks)}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves matching chunks using token overlap scoring (Jaccard similarity).
        """
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        results = []
        for chunk in self._chunks:
            intersection = query_tokens.intersection(chunk["tokens"])
            if intersection:
                # Score = size of overlap / log of chunk size (to avoid favoring long chunks slightly)
                score = len(intersection) / (len(query_tokens) + 0.1)
                results.append((score, chunk))

        # Sort by score descending
        results.sort(key=lambda x: x[0], reverse=True)
        
        # Return top k results formatted
        retrieved = []
        for score, chunk in results[:top_k]:
            if score > 0.05:  # Relevance threshold
                retrieved.append({
                    "text": chunk["text"],
                    "doc_id": chunk["doc_id"],
                    "score": score
                })
                
        return retrieved

# Global Knowledge Engine
knowledge_engine = KnowledgeEngine()
