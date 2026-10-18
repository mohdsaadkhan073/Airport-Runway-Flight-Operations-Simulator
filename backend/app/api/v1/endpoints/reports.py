from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.report_service import generate_flights_csv

router = APIRouter()


@router.get("/flights.csv")
def export_flights_csv(db: Session = Depends(get_db)):
    csv_data = generate_flights_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=flights_report.csv"
        }
    )
