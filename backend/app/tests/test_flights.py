import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.flight import FlightStatus

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_create_flight_success():
    payload = {
        "flight_number": "AI-101",
        "aircraft_type": "Airbus A320",
        "operation_type": "LANDING",
        "arrival_time": 5,
        "duration": 4,
        "priority": 2,
        "is_emergency": False
    }
    response = client.post("/api/v1/flights", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["flight_number"] == "AI-101"
    assert data["status"] == "SCHEDULED"
    assert data["remaining_duration"] == 4
    assert data["id"] is not None


def test_create_flight_duplicate_number():
    payload = {
        "flight_number": "BA-202",
        "aircraft_type": "Boeing 777",
        "operation_type": "TAKEOFF",
        "arrival_time": 2,
        "duration": 6,
        "priority": 3,
        "is_emergency": False
    }
    resp1 = client.post("/api/v1/flights", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/flights", json=payload)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"]


def test_create_flight_invalid_duration():
    payload = {
        "flight_number": "EK-500",
        "aircraft_type": "Boeing 737",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 0,
        "priority": 1,
        "is_emergency": False
    }
    response = client.post("/api/v1/flights", json=payload)
    assert response.status_code == 422


def test_get_flight_by_id():
    payload = {
        "flight_number": "LH-404",
        "aircraft_type": "Airbus A350",
        "operation_type": "TAKEOFF",
        "arrival_time": 1,
        "duration": 5,
        "priority": 2,
        "is_emergency": False
    }
    create_resp = client.post("/api/v1/flights", json=payload)
    flight_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/v1/flights/{flight_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["flight_number"] == "LH-404"


def test_update_flight():
    payload = {
        "flight_number": "QR-777",
        "aircraft_type": "Boeing 787",
        "operation_type": "LANDING",
        "arrival_time": 4,
        "duration": 5,
        "priority": 3,
        "is_emergency": False
    }
    create_resp = client.post("/api/v1/flights", json=payload)
    flight_id = create_resp.json()["id"]

    patch_resp = client.patch(f"/api/v1/flights/{flight_id}", json={
        "is_emergency": True,
        "priority": 1,
        "duration": 7
    })
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["is_emergency"] is True
    assert updated["priority"] == 1
    assert updated["duration"] == 7
    assert updated["remaining_duration"] == 7


def test_invalid_state_transition():
    payload = {
        "flight_number": "SQ-321",
        "aircraft_type": "Boeing 747",
        "operation_type": "TAKEOFF",
        "arrival_time": 0,
        "duration": 3,
        "priority": 3,
        "is_emergency": False
    }
    create_resp = client.post("/api/v1/flights", json=payload)
    flight_id = create_resp.json()["id"]

    client.patch(f"/api/v1/flights/{flight_id}", json={"status": "COMPLETED"})

    bad_resp = client.patch(f"/api/v1/flights/{flight_id}", json={"status": "WAITING"})
    assert bad_resp.status_code == 400


def test_delete_flight():
    payload = {
        "flight_number": "AF-111",
        "aircraft_type": "Airbus A380",
        "operation_type": "LANDING",
        "arrival_time": 2,
        "duration": 5,
        "priority": 4,
        "is_emergency": False
    }
    create_resp = client.post("/api/v1/flights", json=payload)
    flight_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/flights/{flight_id}")
    assert del_resp.status_code == 200

    get_resp = client.get(f"/api/v1/flights/{flight_id}")
    assert get_resp.status_code == 404


def test_cannot_delete_flight_on_runway():
    payload = {
        "flight_number": "UA-999",
        "aircraft_type": "Boeing 737",
        "operation_type": "LANDING",
        "arrival_time": 0,
        "duration": 4,
        "priority": 3,
        "is_emergency": False
    }
    create_resp = client.post("/api/v1/flights", json=payload)
    flight_id = create_resp.json()["id"]

    client.patch(f"/api/v1/flights/{flight_id}", json={"status": FlightStatus.ON_RUNWAY.value})

    del_resp = client.delete(f"/api/v1/flights/{flight_id}")
    assert del_resp.status_code == 400
    assert "actively occupying a runway" in del_resp.json()["detail"]


def test_list_and_filter_flights():
    flights = [
        {"flight_number": "FL-001", "aircraft_type": "A320", "operation_type": "TAKEOFF", "arrival_time": 1, "duration": 3, "priority": 3, "is_emergency": False},
        {"flight_number": "FL-002", "aircraft_type": "B737", "operation_type": "LANDING", "arrival_time": 2, "duration": 4, "priority": 1, "is_emergency": True},
        {"flight_number": "FL-003", "aircraft_type": "A350", "operation_type": "LANDING", "arrival_time": 3, "duration": 5, "priority": 2, "is_emergency": False},
    ]
    for f in flights:
        client.post("/api/v1/flights", json=f)

    all_res = client.get("/api/v1/flights")
    assert all_res.status_code == 200
    assert all_res.json()["total"] == 3

    emerg_res = client.get("/api/v1/flights?is_emergency=true")
    assert emerg_res.status_code == 200
    assert emerg_res.json()["total"] == 1
    assert emerg_res.json()["items"][0]["flight_number"] == "FL-002"

    landing_res = client.get("/api/v1/flights?operation_type=LANDING")
    assert landing_res.status_code == 200
    assert landing_res.json()["total"] == 2
