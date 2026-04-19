import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_analyze_low_urgency():
    res = client.post("/analyze", json={"symptoms": ["headache", "fatigue"]})
    assert res.status_code == 200
    data = res.json()
    assert data["urgency"] in ["low", "medium", "critical"]
    assert "diseases" in data
    assert "recommendations" in data

def test_analyze_critical_urgency():
    res = client.post("/analyze", json={"symptoms": ["chest pain", "difficulty breathing"]})
    assert res.status_code == 200
    data = res.json()
    assert data["urgency"] == "critical"
    assert data["emergency_escalate"] is True

def test_analyze_medium_urgency():
    res = client.post("/analyze", json={"symptoms": ["high fever", "vomiting"]})
    assert res.status_code == 200
    assert res.json()["urgency"] == "medium"

def test_trends():
    res = client.get("/trends")
    assert res.status_code == 200
    assert "trends" in res.json()

def test_schemes_eligibility():
    res = client.post("/schemes", json={"age": 30, "gender": "female", "income": 50000, "category": "BPL"})
    assert res.status_code == 200
    assert "eligible_schemes" in res.json()
