from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np
import fitz
import os
import re

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
MODEL_NAME = os.environ.get("MODEL_NAME", "BAAI/bge-small-en-v1.5")
model = SentenceTransformer(MODEL_NAME)

def l2_normalize(vec: np.ndarray) -> np.ndarray:
    denom = np.linalg.norm(vec)
    return vec if denom == 0 else vec / denom

def embed_text(text: str) -> list[float]:
    v = model.encode(text, normalize_embeddings=False)
    v = np.asarray(v, dtype=np.float32)
    v = l2_normalize(v)
    return v.tolist()

def extract_text(file_path: str, doc_type: str) -> str:
    ext = (doc_type or "").lower()
    if ext == "pdf" or file_path.lower().endswith(".pdf"):
        with fitz.open(file_path) as doc:
            return "\n".join(page.get_text("text") for page in doc)
    # MD/TXT fallthrough
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def normalize_text(text: str) -> str:
    text = re.sub(r"\r\n|\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def chunk_text(text: str, target_chars: int = 4000, overlap_chars: int = 800) -> list[str]:
    # Roughly ~1000 tokens at 4 chars/token; adjust if needed
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks, buf = [], ""
    for s in sentences:
        if len(buf) + len(s) + 1 <= target_chars:
            buf = f"{buf} {s}".strip() if buf else s
        else:
            if buf:
                chunks.append(buf)
            # start next with overlap tail from previous
            if overlap_chars > 0 and buf:
                tail = buf[-overlap_chars:]
                buf = f"{tail} {s}".strip()
            else:
                buf = s
    if buf:
        chunks.append(buf)
    return chunks

@app.post("/embed")
def embed_endpoint():
    data = request.get_json(force=True)
    text = data.get("text", "")
    if not text.strip():
        return jsonify({"error": "text is required"}), 400
    emb = embed_text(text)
    return jsonify({"embedding": emb})

@app.post("/ingest")
def ingest_endpoint():
    data = request.get_json(force=True)
    doc_id = data.get("doc_id")
    title = data.get("title")
    doc_type = data.get("type", "")
    path = data.get("path")
    if not all([doc_id, title, path]):
        return jsonify({"error": "doc_id and path are required"}), 400
    if not os.path.exists(path):
        return jsonify({"error": "file not found"}), 404

    raw = extract_text(path, doc_type)
    norm = normalize_text(raw)
    texts = chunk_text(norm, target_chars=4000, overlap_chars=800)
    result = []
    for idx, t in enumerate(texts):
        emb = embed_text(t)
        result.append({"index": idx, "text": t, "embedding": emb})

    return jsonify({"doc_id": doc_id, "title": title, "chunks": result})

PORT = int(os.environ.get("PORT", "8000"))
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
