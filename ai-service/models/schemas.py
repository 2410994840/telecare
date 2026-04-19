from pydantic import BaseModel
from typing import List, Optional

class SymptomRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    duration_days: Optional[int] = None

class AnalysisResponse(BaseModel):
    urgency: str  # low | medium | critical
    diseases: List[dict]
    confidence: float
    recommendations: List[str]
    emergency_escalate: bool
    fallback: bool = False
