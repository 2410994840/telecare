from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SchemeRequest(BaseModel):
    age: int
    gender: str
    income: Optional[int] = None
    conditions: Optional[List[str]] = []
    category: Optional[str] = None
    state: Optional[str] = None

SCHEMES = [
    {"id": "pmjay", "name": "Ayushman Bharat PM-JAY", "coverage": 500000,
     "eligibility": {"max_income": 100000, "categories": ["BPL", "SC", "ST"]}},
    {"id": "jssk", "name": "Janani Shishu Suraksha", "coverage": None,
     "eligibility": {"gender": "female", "age_range": [15, 45]}},
    {"id": "rbsk", "name": "Rashtriya Bal Swasthya", "coverage": None,
     "eligibility": {"age_range": [0, 18]}},
    {"id": "npcdcs", "name": "NPCDCS", "coverage": None,
     "eligibility": {"conditions": ["diabetes", "hypertension", "cancer"]}},
]

@router.post("/schemes")
def check_schemes(req: SchemeRequest):
    eligible = []
    for scheme in SCHEMES:
        e = scheme["eligibility"]
        if "max_income" in e and req.income and req.income > e["max_income"]:
            continue
        if "gender" in e and e["gender"] != req.gender:
            continue
        if "age_range" in e and not (e["age_range"][0] <= req.age <= e["age_range"][1]):
            continue
        if "categories" in e and req.category not in e["categories"]:
            continue
        if "conditions" in e and not any(c in req.conditions for c in e["conditions"]):
            continue
        eligible.append(scheme)
    return {"eligible_schemes": eligible, "count": len(eligible)}
