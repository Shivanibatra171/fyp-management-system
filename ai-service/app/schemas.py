from typing import List, Optional
from pydantic import BaseModel, Field

class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., description="Project title")
    abstract: str = Field(..., description="Project abstract or summary")
    year: Optional[int] = Field(None, description="Completion year")
    domain: Optional[str] = Field(None, description="Project domain")
    technologies: Optional[List[str]] = Field(default_factory=list, description="Tech stack")

class SimilarityRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Proposal title")
    abstract: str = Field(..., min_length=10, description="Proposal abstract")
    previous_projects: List[ProjectItem] = Field(
        default_factory=list,
        description="List of previous FYP records to compare against"
    )
    threshold: Optional[float] = Field(
        default=70.0,
        ge=0.0,
        le=100.0,
        description="Similarity percentage threshold that triggers a warning (default: 70%)"
    )

class TopMatch(BaseModel):
    id: Optional[str] = None
    title: str
    year: Optional[int] = None
    domain: Optional[str] = None
    similarity_percentage: float = Field(..., ge=0.0, le=100.0)

class SimilarityResponse(BaseModel):
    max_similarity: float = Field(..., ge=0.0, le=100.0)
    has_warning: bool
    warning_message: str
    top_matches: List[TopMatch]
    total_compared: int
