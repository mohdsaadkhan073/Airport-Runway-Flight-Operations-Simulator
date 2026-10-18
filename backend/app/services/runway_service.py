from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.runway import Runway, RunwayStatus
from app.schemas.runway import RunwayCreate, RunwayUpdate, RunwayStatusSummary, RunwayResponse
from app.services.log_service import create_log


def init_default_runways(db: Session, count: int = 1) -> List[Runway]:
    existing_count = db.query(Runway).count()
    if existing_count == 0:
        names = ["Runway 09L", "Runway 27R", "Runway 14/32", "Runway 04/22"]
        created = []
        for i in range(min(count, len(names))):
            r = Runway(name=names[i], status=RunwayStatus.AVAILABLE, supported_operations="ALL")
            db.add(r)
            created.append(r)
        db.commit()
        for r in created:
            db.refresh(r)
            create_log(
                db=db,
                event_type="RUNWAY_CREATED",
                runway_id=r.id,
                description=f"{r.name} initialized and available."
            )
        return created
    return db.query(Runway).all()


def get_runways(db: Session) -> List[Runway]:
    runways = db.query(Runway).all()
    if not runways:
        runways = init_default_runways(db, 1)
    return runways


def get_runway_by_id(db: Session, runway_id: int) -> Optional[Runway]:
    return db.query(Runway).filter(Runway.id == runway_id).first()


def create_runway(db: Session, runway_in: RunwayCreate) -> Runway:
    existing = db.query(Runway).filter(Runway.name == runway_in.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Runway '{runway_in.name}' already exists."
        )

    runway = Runway(
        name=runway_in.name.strip(),
        supported_operations=runway_in.supported_operations.strip(),
        status=RunwayStatus.AVAILABLE
    )
    db.add(runway)
    db.commit()
    db.refresh(runway)

    create_log(
        db=db,
        event_type="RUNWAY_CREATED",
        runway_id=runway.id,
        description=f"Runway {runway.name} was created."
    )
    return runway


def update_runway(db: Session, runway: Runway, runway_in: RunwayUpdate) -> Runway:
    update_data = runway_in.model_dump(exclude_unset=True)

    if "name" in update_data:
        new_name = update_data["name"].strip()
        if new_name != runway.name:
            existing = db.query(Runway).filter(Runway.name == new_name).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Runway '{new_name}' already exists."
                )
            runway.name = new_name

    if "status" in update_data:
        new_status = update_data["status"]
        if runway.status == RunwayStatus.OCCUPIED and new_status == RunwayStatus.UNAVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot set runway {runway.name} to UNAVAILABLE while it is actively occupied by a flight."
            )
        runway.status = new_status

    if "supported_operations" in update_data:
        runway.supported_operations = update_data["supported_operations"].strip()

    db.commit()
    db.refresh(runway)

    create_log(
        db=db,
        event_type="RUNWAY_UPDATED",
        runway_id=runway.id,
        description=f"Runway {runway.name} status updated to {runway.status.value}."
    )
    return runway


def get_runway_status_summary(db: Session) -> RunwayStatusSummary:
    runways = get_runways(db)
    total = len(runways)
    available = sum(1 for r in runways if r.status == RunwayStatus.AVAILABLE)
    occupied = sum(1 for r in runways if r.status == RunwayStatus.OCCUPIED)
    unavailable = sum(1 for r in runways if r.status == RunwayStatus.UNAVAILABLE)

    items = [RunwayResponse.model_validate(r) for r in runways]
    return RunwayStatusSummary(
        total_runways=total,
        available_runways=available,
        occupied_runways=occupied,
        unavailable_runways=unavailable,
        runways=items
    )
