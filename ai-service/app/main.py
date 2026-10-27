import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .schemas import SimilarityRequest, SimilarityResponse
from .similarity import get_similarity_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload SentenceTransformer model on application startup
    print("[FastAPI Startup] Initializing Similarity Engine & embedding cache...")
    get_similarity_service()
    yield
    print("[FastAPI Shutdown] Shutting down AI Microservice.")

app = FastAPI(
    title="FYP AI Similarity Detection Microservice",
    description="Microservice to compute semantic similarity between FYP proposals and historical projects using all-MiniLM-L6-v2",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Info"])
async def root():
    return {
        "service": "FYP AI Similarity Detection Microservice",
        "status": "online",
        "version": "1.0.0",
        "model": os.getenv("MODEL_NAME", "all-MiniLM-L6-v2"),
        "docs_url": "/docs",
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-similarity-service",
    }

@app.post(
    "/check-similarity",
    response_model=SimilarityResponse,
    status_code=status.HTTP_200_OK,
    tags=["Similarity"],
    summary="Compute semantic similarity between a proposal and historical FYPs"
)
async def check_similarity_endpoint(payload: SimilarityRequest):
    try:
        service = get_similarity_service()
        response = service.check_similarity(
            title=payload.title,
            abstract=payload.abstract,
            previous_projects=payload.previous_projects,
            threshold=payload.threshold or 70.0,
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error computing similarity: {str(e)}",
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
