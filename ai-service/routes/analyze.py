from fastapi import APIRouter
from models.schemas import SymptomRequest, AnalysisResponse
from utils.symptom_engine import analyze

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_symptoms(request: SymptomRequest):
    return analyze(request.symptoms, request.age, request.gender)
