from fastapi import APIRouter
from typing import Optional

router = APIRouter()

# In production: query MongoDB aggregation via internal API
MOCK_TRENDS = [
    {"symptom": "fever", "village": "Rampur", "count": 45, "week": "2024-W01"},
    {"symptom": "cough", "village": "Sitapur", "count": 32, "week": "2024-W01"},
    {"symptom": "diarrhea", "village": "Rampur", "count": 28, "week": "2024-W01"},
    {"symptom": "joint pain", "village": "Devpur", "count": 19, "week": "2024-W01"},
]

@router.get("/trends")
def get_trends(village: Optional[str] = None, district: Optional[str] = None):
    data = MOCK_TRENDS
    if village:
        data = [t for t in data if t["village"] == village]
    return {"trends": data, "outbreak_risk": _detect_outbreak(data)}

def _detect_outbreak(trends: list) -> list:
    return [t for t in trends if t["count"] > 30]
