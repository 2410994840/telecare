"""
Rule-based symptom analysis engine with ML-ready structure.
In production, replace with trained RandomForest/XGBoost model.
"""
from typing import List, Tuple

SYMPTOM_DISEASE_MAP = {
    "fever": [("Malaria", 0.4), ("Typhoid", 0.3), ("Dengue", 0.2), ("Common Cold", 0.1)],
    "high fever": [("Malaria", 0.5), ("Dengue", 0.3), ("Typhoid", 0.2)],
    "cough": [("Tuberculosis", 0.3), ("Pneumonia", 0.3), ("Common Cold", 0.4)],
    "chest pain": [("Cardiac Event", 0.5), ("Pneumonia", 0.3), ("Costochondritis", 0.2)],
    "difficulty breathing": [("Asthma", 0.4), ("Pneumonia", 0.3), ("Cardiac Event", 0.3)],
    "diarrhea": [("Cholera", 0.3), ("Gastroenteritis", 0.5), ("Food Poisoning", 0.2)],
    "vomiting": [("Gastroenteritis", 0.4), ("Food Poisoning", 0.3), ("Typhoid", 0.3)],
    "headache": [("Migraine", 0.4), ("Hypertension", 0.3), ("Dengue", 0.3)],
    "joint pain": [("Chikungunya", 0.5), ("Arthritis", 0.3), ("Dengue", 0.2)],
    "rash": [("Chickenpox", 0.4), ("Dengue", 0.3), ("Allergy", 0.3)],
    "unconscious": [("Stroke", 0.5), ("Hypoglycemia", 0.3), ("Cardiac Event", 0.2)],
    "seizure": [("Epilepsy", 0.5), ("Febrile Seizure", 0.3), ("Meningitis", 0.2)],
    "abdominal pain": [("Appendicitis", 0.3), ("Gastritis", 0.4), ("Kidney Stone", 0.3)],
    "fatigue": [("Anemia", 0.4), ("Diabetes", 0.3), ("Hypothyroidism", 0.3)],
    "excessive thirst": [("Diabetes", 0.7), ("Dehydration", 0.3)],
}

CRITICAL_SYMPTOMS = {"chest pain", "difficulty breathing", "unconscious", "seizure", "stroke", "severe bleeding"}
MEDIUM_SYMPTOMS = {"high fever", "vomiting", "severe headache", "abdominal pain", "difficulty walking"}

def classify_urgency(symptoms: List[str]) -> str:
    lower = {s.lower() for s in symptoms}
    if lower & CRITICAL_SYMPTOMS:
        return "critical"
    if lower & MEDIUM_SYMPTOMS:
        return "medium"
    return "low"

def predict_diseases(symptoms: List[str]) -> List[dict]:
    disease_scores = {}
    for symptom in symptoms:
        matches = SYMPTOM_DISEASE_MAP.get(symptom.lower(), [])
        for disease, score in matches:
            disease_scores[disease] = disease_scores.get(disease, 0) + score

    sorted_diseases = sorted(disease_scores.items(), key=lambda x: x[1], reverse=True)
    return [{"name": d, "probability": round(min(s, 1.0), 2)} for d, s in sorted_diseases[:5]]

def get_recommendations(urgency: str, diseases: List[dict]) -> List[str]:
    recs = []
    if urgency == "critical":
        recs.append("Seek emergency medical care immediately")
        recs.append("Call emergency helpline: 108")
    elif urgency == "medium":
        recs.append("Consult a doctor within 24 hours")
        recs.append("Monitor symptoms closely")
    else:
        recs.append("Rest and stay hydrated")
        recs.append("Schedule a routine consultation")

    if diseases and diseases[0]["name"] in ["Malaria", "Dengue", "Cholera"]:
        recs.append("Avoid mosquito exposure, use nets")
    return recs

def analyze(symptoms: List[str], age: int = None, gender: str = None) -> dict:
    urgency = classify_urgency(symptoms)
    diseases = predict_diseases(symptoms)
    recommendations = get_recommendations(urgency, diseases)
    confidence = diseases[0]["probability"] if diseases else 0.0

    return {
        "urgency": urgency,
        "diseases": diseases,
        "confidence": confidence,
        "recommendations": recommendations,
        "emergency_escalate": urgency == "critical",
        "fallback": False
    }
