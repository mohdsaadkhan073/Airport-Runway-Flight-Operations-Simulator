from typing import List, Dict, Any
from app.schemas.scheduling import FlightScheduleItem, GanttInterval, SchedulingResult


def calculate_sjf(workload: List[Dict[str, Any]]) -> SchedulingResult:
    if not workload:
        return SchedulingResult(
            algorithm="SJF (Shortest Job First)",
            items=[],
            gantt_intervals=[],
            average_waiting_time=0.0,
            average_turnaround_time=0.0,
            throughput=0.0,
            total_duration=0
        )

    current_time = 0
    items: List[FlightScheduleItem] = []
    gantt_intervals: List[GanttInterval] = []

    remaining = list(workload)

    while remaining:
        ready = [f for f in remaining if f["arrival_time"] <= current_time]
        if not ready:
            current_time = min(f["arrival_time"] for f in remaining)
            ready = [f for f in remaining if f["arrival_time"] <= current_time]

        ready.sort(
            key=lambda f: (
                0 if f.get("is_emergency", False) else 1,
                f.get("duration", 1),
                f.get("arrival_time", 0),
                f.get("id", 0)
            )
        )

        flight = ready[0]
        remaining.remove(flight)

        start_time = max(current_time, flight["arrival_time"])
        completion_time = start_time + flight["duration"]
        turnaround_time = completion_time - flight["arrival_time"]
        waiting_time = start_time - flight["arrival_time"]

        items.append(FlightScheduleItem(
            flight_id=flight["id"],
            flight_number=flight["flight_number"],
            operation_type=flight["operation_type"],
            arrival_time=flight["arrival_time"],
            duration=flight["duration"],
            priority=flight["priority"],
            is_emergency=flight["is_emergency"],
            start_time=start_time,
            completion_time=completion_time,
            waiting_time=waiting_time,
            turnaround_time=turnaround_time
        ))

        gantt_intervals.append(GanttInterval(
            flight_id=flight["id"],
            flight_number=flight["flight_number"],
            start_time=start_time,
            end_time=completion_time,
            is_emergency=flight["is_emergency"]
        ))

        current_time = completion_time

    n = len(items)
    avg_wt = sum(i.waiting_time for i in items) / n if n > 0 else 0.0
    avg_tat = sum(i.turnaround_time for i in items) / n if n > 0 else 0.0
    total_time = current_time if current_time > 0 else 1
    throughput = round(n / total_time, 4)

    return SchedulingResult(
        algorithm="SJF (Shortest Job First)",
        items=items,
        gantt_intervals=gantt_intervals,
        average_waiting_time=round(avg_wt, 2),
        average_turnaround_time=round(avg_tat, 2),
        throughput=throughput,
        total_duration=current_time
    )
