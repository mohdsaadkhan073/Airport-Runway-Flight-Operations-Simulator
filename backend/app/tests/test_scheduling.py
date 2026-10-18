import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from app.db.session import engine
from app.algorithms.fcfs import calculate_fcfs
from app.algorithms.priority import calculate_priority
from app.algorithms.round_robin import calculate_round_robin

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def test_fcfs_basic_calculation():
    workload = [
        {"id": 1, "flight_number": "FL1", "operation_type": "TAKEOFF", "arrival_time": 0, "duration": 4, "priority": 3, "is_emergency": False},
        {"id": 2, "flight_number": "FL2", "operation_type": "LANDING", "arrival_time": 1, "duration": 3, "priority": 3, "is_emergency": False},
        {"id": 3, "flight_number": "FL3", "operation_type": "TAKEOFF", "arrival_time": 2, "duration": 1, "priority": 3, "is_emergency": False},
    ]
    res = calculate_fcfs(workload)
    assert res.algorithm == "FCFS"
    assert len(res.items) == 3
    assert res.items[0].flight_number == "FL1"
    assert res.items[0].start_time == 0
    assert res.items[0].completion_time == 4
    assert res.items[0].waiting_time == 0
    assert res.items[0].turnaround_time == 4

    assert res.items[1].flight_number == "FL2"
    assert res.items[1].start_time == 4
    assert res.items[1].completion_time == 7
    assert res.items[1].waiting_time == 3
    assert res.items[1].turnaround_time == 6

    assert res.items[2].flight_number == "FL3"
    assert res.items[2].start_time == 7
    assert res.items[2].completion_time == 8
    assert res.items[2].waiting_time == 5
    assert res.items[2].turnaround_time == 6

    assert res.average_waiting_time == round((0 + 3 + 5) / 3, 2)
    assert res.average_turnaround_time == round((4 + 6 + 6) / 3, 2)


def test_priority_scheduling_with_emergency():
    workload = [
        {"id": 1, "flight_number": "REG1", "operation_type": "TAKEOFF", "arrival_time": 0, "duration": 5, "priority": 4, "is_emergency": False},
        {"id": 2, "flight_number": "REG2", "operation_type": "LANDING", "arrival_time": 1, "duration": 3, "priority": 2, "is_emergency": False},
        {"id": 3, "flight_number": "EMERG1", "operation_type": "LANDING", "arrival_time": 1, "duration": 2, "priority": 3, "is_emergency": True},
    ]
    res = calculate_priority(workload)
    assert res.algorithm == "Priority Scheduling"
    assert res.items[0].flight_number == "REG1"
    assert res.items[1].flight_number == "EMERG1"
    assert res.items[2].flight_number == "REG2"


def test_round_robin_slicing():
    workload = [
        {"id": 1, "flight_number": "RR1", "operation_type": "TAKEOFF", "arrival_time": 0, "duration": 5, "priority": 3, "is_emergency": False},
        {"id": 2, "flight_number": "RR2", "operation_type": "LANDING", "arrival_time": 0, "duration": 3, "priority": 3, "is_emergency": False},
    ]
    res = calculate_round_robin(workload, time_quantum=2)
    assert res.algorithm == "Round Robin"
    assert len(res.gantt_intervals) >= 4
    assert res.gantt_intervals[0].flight_number == "RR1"
    assert res.gantt_intervals[0].start_time == 0
    assert res.gantt_intervals[0].end_time == 2
    assert res.gantt_intervals[1].flight_number == "RR2"
    assert res.gantt_intervals[1].start_time == 2
    assert res.gantt_intervals[1].end_time == 4


def test_idle_periods_handling():
    workload = [
        {"id": 1, "flight_number": "IDLE1", "operation_type": "TAKEOFF", "arrival_time": 10, "duration": 2, "priority": 3, "is_emergency": False},
    ]
    res = calculate_fcfs(workload)
    assert res.items[0].start_time == 10
    assert res.items[0].completion_time == 12
    assert res.items[0].waiting_time == 0


def test_scheduling_api_endpoints():
    flights = [
        {"flight_number": "SCH-1", "aircraft_type": "A320", "operation_type": "TAKEOFF", "arrival_time": 0, "duration": 4, "priority": 3, "is_emergency": False},
        {"flight_number": "SCH-2", "aircraft_type": "B737", "operation_type": "LANDING", "arrival_time": 2, "duration": 3, "priority": 1, "is_emergency": True},
    ]
    for f in flights:
        client.post("/api/v1/flights", json=f)

    run_res = client.post("/api/v1/scheduling/run", json={"algorithm": "PRIORITY"})
    assert run_res.status_code == 200
    data = run_res.json()
    assert data["algorithm"] == "Priority Scheduling"
    assert len(data["items"]) == 2

    comp_res = client.post("/api/v1/scheduling/compare", json={"time_quantum": 2})
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["workload_count"] == 2
    assert len(comp_data["results"]) == 3
