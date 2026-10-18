import csv
import io
from sqlalchemy.orm import Session
from app.models.flight import Flight


def generate_flights_csv(db: Session) -> str:
    flights = db.query(Flight).order_by(Flight.id.asc()).all()
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Flight Number",
        "Aircraft Type",
        "Operation Type",
        "Arrival Time",
        "Duration",
        "Priority",
        "Is Emergency",
        "Status",
        "Remaining Duration",
        "Created At",
        "Updated At"
    ])

    for f in flights:
        writer.writerow([
            f.id,
            f.flight_number,
            f.aircraft_type,
            f.operation_type.value if hasattr(f.operation_type, "value") else str(f.operation_type),
            f.arrival_time,
            f.duration,
            f.priority,
            f.is_emergency,
            f.status.value if hasattr(f.status, "value") else str(f.status),
            f.remaining_duration,
            f.created_at.isoformat() if f.created_at else "",
            f.updated_at.isoformat() if f.updated_at else ""
        ])

    return output.getvalue()
