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
    client.post("/api/v1/memory/reset")
    yield
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_full_airport_simulation_lifecycle():
    sample_res = client.post("/api/v1/simulation/sample-data")
    assert sample_res.status_code == 200
    state = sample_res.json()
    assert state["scheduled_flights_count"] == 8
    assert len(state["runways"]) == 3

    comp_res = client.post("/api/v1/scheduling/compare", json={"time_quantum": 3})
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["workload_count"] == 8
    assert len(comp_data["results"]) == 3

    for step in range(5):
        step_res = client.post("/api/v1/simulation/step?steps=1")
        assert step_res.status_code == 200

    step_state = client.get("/api/v1/simulation/state").json()
    assert step_state["current_time"] == 5
    assert step_state["active_flights_count"] + step_state["completed_flights_count"] > 0

    mem_alloc1 = client.post("/api/v1/memory/allocate", json={
        "process_name": "TelemetryService",
        "requested_size": 256,
        "algorithm": "FIRST_FIT"
    })
    assert mem_alloc1.status_code == 200
    mem_state1 = mem_alloc1.json()
    assert mem_state1["used_memory"] == 256

    mem_alloc2 = client.post("/api/v1/memory/allocate", json={
        "process_name": "RadarSubsystem",
        "requested_size": 128,
        "algorithm": "BEST_FIT"
    })
    assert mem_alloc2.status_code == 200
    mem_state2 = mem_alloc2.json()
    assert mem_state2["used_memory"] == 384

    block_to_free = next(b["block_id"] for b in mem_state2["blocks"] if b["process_name"] == "TelemetryService")
    mem_dealloc = client.post("/api/v1/memory/deallocate", json={"block_id": block_to_free})
    assert mem_dealloc.status_code == 200
    mem_state3 = mem_dealloc.json()
    assert mem_state3["used_memory"] == 128

    logs_res = client.get("/api/v1/logs")
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert logs_data["total"] > 10

    csv_res = client.get("/api/v1/reports/flights.csv")
    assert csv_res.status_code == 200
    assert "SIM-EMERG99" in csv_res.text
    assert "SIM-AA101" in csv_res.text

    analytics_res = client.get("/api/v1/analytics/overview")
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_flights"] == 8
    assert analytics_data["total_runways"] == 3

    reset_res = client.post("/api/v1/simulation/reset")
    assert reset_res.status_code == 200
    reset_state = reset_res.json()
    assert reset_state["current_time"] == 0
    assert reset_state["scheduled_flights_count"] == 8
