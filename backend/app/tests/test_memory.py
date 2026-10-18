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
    client.post("/api/v1/memory/reset")


def test_initial_memory_state():
    res = client.get("/api/v1/memory/state")
    assert res.status_code == 200
    data = res.json()
    assert data["total_memory"] == 1024
    assert data["used_memory"] == 0
    assert data["free_memory"] == 1024
    assert data["external_fragmentation"] == 0
    assert len(data["blocks"]) == 1


def test_first_fit_allocation():
    res = client.post("/api/v1/memory/allocate", json={
        "process_name": "RadarSystem",
        "requested_size": 256,
        "algorithm": "FIRST_FIT"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["used_memory"] == 256
    assert data["free_memory"] == 768
    assert len(data["blocks"]) == 2
    assert data["blocks"][0]["process_name"] == "RadarSystem"
    assert data["blocks"][0]["size"] == 256


def test_best_fit_allocation():
    client.post("/api/v1/memory/allocate", json={"process_name": "P1", "requested_size": 200, "algorithm": "FIRST_FIT"})
    client.post("/api/v1/memory/allocate", json={"process_name": "P2", "requested_size": 100, "algorithm": "FIRST_FIT"})
    client.post("/api/v1/memory/allocate", json={"process_name": "P3", "requested_size": 300, "algorithm": "FIRST_FIT"})
    client.post("/api/v1/memory/allocate", json={"process_name": "P4", "requested_size": 100, "algorithm": "FIRST_FIT"})

    state = client.get("/api/v1/memory/state").json()
    p2_id = next(b["block_id"] for b in state["blocks"] if b["process_name"] == "P2")
    p4_id = next(b["block_id"] for b in state["blocks"] if b["process_name"] == "P4")

    client.post("/api/v1/memory/deallocate", json={"block_id": p2_id})
    client.post("/api/v1/memory/deallocate", json={"block_id": p4_id})

    bf_res = client.post("/api/v1/memory/allocate", json={"process_name": "BestFitJob", "requested_size": 90, "algorithm": "BEST_FIT"})
    assert bf_res.status_code == 200
    bf_data = bf_res.json()
    bf_block = next(b for b in bf_data["blocks"] if b["process_name"] == "BestFitJob")
    assert bf_block["size"] == 90


def test_deallocation_and_coalescing():
    client.post("/api/v1/memory/allocate", json={"process_name": "A", "requested_size": 100, "algorithm": "FIRST_FIT"})
    client.post("/api/v1/memory/allocate", json={"process_name": "B", "requested_size": 100, "algorithm": "FIRST_FIT"})

    state = client.get("/api/v1/memory/state").json()
    a_id = next(b["block_id"] for b in state["blocks"] if b["process_name"] == "A")
    b_id = next(b["block_id"] for b in state["blocks"] if b["process_name"] == "B")

    client.post("/api/v1/memory/deallocate", json={"block_id": a_id})
    client.post("/api/v1/memory/deallocate", json={"block_id": b_id})

    after_state = client.get("/api/v1/memory/state").json()
    assert after_state["used_memory"] == 0
    assert len(after_state["blocks"]) == 1
    assert after_state["blocks"][0]["size"] == 1024


def test_allocation_failure_oom():
    bad_res = client.post("/api/v1/memory/allocate", json={
        "process_name": "OOMJob",
        "requested_size": 2048,
        "algorithm": "FIRST_FIT"
    })
    assert bad_res.status_code == 400
    assert "Cannot find contiguous block" in bad_res.json()["detail"]
