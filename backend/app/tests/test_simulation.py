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


def test_runway_crud_and_status():
    res = client.get("/api/v1/runways")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    create_res = client.post("/api/v1/runways", json={"name": "Runway 36", "supported_operations": "TAKEOFF"})
    assert create_res.status_code == 201
    runway_id = create_res.json()["id"]

    stat_res = client.get("/api/v1/runways/status")
    assert stat_res.status_code == 200
    assert stat_res.json()["total_runways"] >= 2

    patch_res = client.patch(f"/api/v1/runways/{runway_id}", json={"status": "UNAVAILABLE"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "UNAVAILABLE"


def test_simulation_step_and_lifecycle():
    client.post("/api/v1/flights", json={
        "flight_number": "SIM-01",
        "aircraft_type": "A320",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 2,
        "priority": 3,
        "is_emergency": False
    })

    initial_state = client.get("/api/v1/simulation/state").json()
    assert initial_state["current_time"] == 0

    step1 = client.post("/api/v1/simulation/step?steps=1").json()
    assert step1["current_time"] == 1
    assert step1["runways"][0]["status"] == "OCCUPIED"
    assert step1["runways"][0]["current_flight"]["flight_number"] == "SIM-01"

    step2 = client.post("/api/v1/simulation/step?steps=1").json()
    assert step2["current_time"] == 2

    step3 = client.post("/api/v1/simulation/step?steps=1").json()
    assert step3["current_time"] == 3
    assert step3["runways"][0]["status"] == "AVAILABLE"
    assert step3["completed_flights_count"] == 1


def test_emergency_priority_in_simulation():
    client.patch("/api/v1/simulation/settings", json={"default_algorithm": "PRIORITY"})

    client.post("/api/v1/flights", json={
        "flight_number": "NORM-1",
        "aircraft_type": "B737",
        "operation_type": "TAKEOFF",
        "arrival_time": 0,
        "duration": 5,
        "priority": 1,
        "is_emergency": False
    })
    client.post("/api/v1/flights", json={
        "flight_number": "EMERG-1",
        "aircraft_type": "A320",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 3,
        "priority": 4,
        "is_emergency": True
    })

    step = client.post("/api/v1/simulation/step?steps=1").json()
    assert step["runways"][0]["current_flight"]["flight_number"] == "EMERG-1"


def test_simulation_reset():
    client.post("/api/v1/flights", json={
        "flight_number": "RST-1",
        "aircraft_type": "A350",
        "operation_type": "TAKEOFF",
        "arrival_time": 0,
        "duration": 2,
        "priority": 2,
        "is_emergency": False
    })
    client.post("/api/v1/simulation/step?steps=3")

    reset_state = client.post("/api/v1/simulation/reset").json()
    assert reset_state["current_time"] == 0
    assert reset_state["is_running"] is False
    assert reset_state["completed_flights_count"] == 0
    assert reset_state["scheduled_flights_count"] == 1


def test_cannot_set_occupied_runway_unavailable():
    client.post("/api/v1/flights", json={
        "flight_number": "OCC-1",
        "aircraft_type": "A320",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 10,
        "priority": 1,
        "is_emergency": False
    })
    step = client.post("/api/v1/simulation/step?steps=1").json()
    runway_id = step["runways"][0]["id"]

    resp = client.patch(f"/api/v1/runways/{runway_id}", json={"status": "UNAVAILABLE"})
    assert resp.status_code == 400
    assert "actively occupied" in resp.json()["detail"]
