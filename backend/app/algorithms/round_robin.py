from typing import List, Dict, Any
from collections import deque
from app.schemas.scheduling import FlightScheduleItem, GanttInterval, SchedulingResult


def calculate_round_robin(workload: List[Dict[str, Any]], time_quantum: int = 3) -> SchedulingResult:
    if not workload:
        return SchedulingResult(
            algorithm="Round Robin",
            items=[],
            gantt_intervals=[],
            average_waiting_time=0.0,
            average_turnaround_time=0.0,
            throughput=0.0,
            total_duration=0
        )

    time_quantum = max(1, time_quantum)
    sorted_workload = sorted(
        workload,
        key=lambda f: (f["arrival_time"], f.get("id", 0))
    )

    remaining_burst = {f["id"]: f["duration"] for f in sorted_workload}
    first_start_time = {}
    completion_times = {}

    gantt_intervals: List[GanttInterval] = []
    ready_queue: deque = deque()
    unvisited = list(sorted_workload)

    current_time = 0

    while unvisited or ready_queue:
        while unvisited and unvisited[0]["arrival_time"] <= current_time:
            ready_queue.append(unvisited.pop(0))

        if not ready_queue:
            if unvisited:
                current_time = unvisited[0]["arrival_time"]
                while unvisited and unvisited[0]["arrival_time"] <= current_time:
                    ready_queue.append(unvisited.pop(0))
            else:
                break

        flight = ready_queue.popleft()
        f_id = flight["id"]

        if f_id not in first_start_time:
            first_start_time[f_id] = current_time

        exec_time = min(time_quantum, remaining_burst[f_id])
        slice_start = current_time
        slice_end = current_time + exec_time
        current_time = slice_end
        remaining_burst[f_id] -= exec_time

        gantt_intervals.append(GanttInterval(
            flight_id=f_id,
            flight_number=flight["flight_number"],
            start_time=slice_start,
            end_time=slice_end,
            is_emergency=flight.get("is_emergency", False)
        ))

        while unvisited and unvisited[0]["arrival_time"] <= current_time:
            ready_queue.append(unvisited.pop(0))

        if remaining_burst[f_id] > 0:
            ready_queue.append(flight)
        else:
            completion_times[f_id] = current_time

    items: List[FlightScheduleItem] = []
    for f in sorted_workload:
        f_id = f["id"]
        ct = completion_times.get(f_id, current_time)
        st = first_start_time.get(f_id, f["arrival_time"])
        tat = ct - f["arrival_time"]
        wt = tat - f["duration"]

        items.append(FlightScheduleItem(
            flight_id=f_id,
            flight_number=f["flight_number"],
            operation_type=f["operation_type"],
            arrival_time=f["arrival_time"],
            duration=f["duration"],
            priority=f["priority"],
            is_emergency=f["is_emergency"],
            start_time=st,
            completion_time=ct,
            waiting_time=max(0, wt),
            turnaround_time=max(0, tat)
        ))

    n = len(items)
    avg_wt = sum(i.waiting_time for i in items) / n if n > 0 else 0.0
    avg_tat = sum(i.turnaround_time for i in items) / n if n > 0 else 0.0
    total_time = current_time if current_time > 0 else 1
    throughput = round(n / total_time, 4)

    return SchedulingResult(
        algorithm="Round Robin",
        items=items,
        gantt_intervals=gantt_intervals,
        average_waiting_time=round(avg_wt, 2),
        average_turnaround_time=round(avg_tat, 2),
        throughput=throughput,
        total_duration=current_time
    )
