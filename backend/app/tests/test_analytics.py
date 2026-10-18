import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_analytics_overview_empty():
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_flights"] == 0
    assert data["runway_utilization_rate"] == 0.0


def test_analytics_overview_with_data():
    client.post("/api/v1/flights", json={
        "flight_number": "ANA-101",
        "aircraft_type": "Boeing 787",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 2,
        "priority": 1,
        "is_emergency": True
    })
    client.post("/api/v1/flights", json={
        "flight_number": "JAL-202",
        "aircraft_type": "Airbus A350",
        "operation_type": "TAKEOFF",
        "arrival_time": 1,
        "duration": 3,
        "priority": 3,
        "is_emergency": False
    })

    client.post("/api/v1/simulation/step?steps=4")

    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_flights"] == 2
    assert data["emergency_flights"] == 1
    assert data["completed_flights"] >= 1


def test_analytics_scheduling():
    client.post("/api/v1/flights", json={
        "flight_number": "SCH-01",
        "aircraft_type": "A320",
        "operation_type": "TAKEOFF",
        "arrival_time": 0,
        "duration": 3,
        "priority": 2,
        "is_emergency": False
    })
    client.post("/api/v1/flights", json={
        "flight_number": "SCH-02",
        "aircraft_type": "B737",
        "operation_type": "LANDING",
        "arrival_time": 1,
        "duration": 2,
        "priority": 1,
        "is_emergency": True
    })

    res = client.get("/api/v1/analytics/scheduling")
    assert res.status_code == 200
    data = res.json()
    assert len(data["comparisons"]) >= 3
    algo_names = [c["algorithm"] for c in data["comparisons"]]
    assert "FCFS" in algo_names
