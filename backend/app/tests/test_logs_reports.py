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


def test_logs_persistence_and_filtering():
    client.post("/api/v1/flights", json={
        "flight_number": "LOG-1",
        "aircraft_type": "A320",
        "operation_type": "TAKEOFF",
        "arrival_time": 0,
        "duration": 2,
        "priority": 3,
        "is_emergency": False
    })

    res = client.get("/api/v1/logs")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(item["event_type"] == "FLIGHT_CREATED" for item in data["items"])

    filtered = client.get("/api/v1/logs?event_type=FLIGHT_CREATED")
    assert filtered.status_code == 200
    assert all(item["event_type"] == "FLIGHT_CREATED" for item in filtered.json()["items"])


def test_csv_export():
    client.post("/api/v1/flights", json={
        "flight_number": "CSV-01",
        "aircraft_type": "Boeing 777",
        "operation_type": "LANDING",
        "arrival_time": 1,
        "duration": 4,
        "priority": 2,
        "is_emergency": True
    })

    res = client.get("/api/v1/reports/flights.csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment; filename=flights_report.csv" in res.headers["content-disposition"]

    csv_text = res.text
    lines = csv_text.strip().split("\r\n") if "\r\n" in csv_text else csv_text.strip().split("\n")
    assert len(lines) >= 2
    assert "Flight Number" in lines[0]
    assert "CSV-01" in lines[1]
    assert "Boeing 777" in lines[1]


def test_clear_logs_protection():
    bad_req = client.delete("/api/v1/logs")
    assert bad_req.status_code == 400

    confirmed = client.delete("/api/v1/logs?confirm=true")
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "success"
