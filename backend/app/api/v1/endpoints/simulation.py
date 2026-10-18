from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.settings import SimulationSettingsUpdate
from app.simulation import (
    get_simulation_state,
    step_simulation,
    rewind_simulation,
    start_simulation,
    pause_simulation,
    resume_simulation,
    reset_simulation,
    get_or_create_settings,
    load_sample_data
)
from app.services.runway_service import init_default_runways

router = APIRouter()


@router.get("/state")
def read_simulation_state(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return get_simulation_state(db)


@router.post("/start")
def trigger_start(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return start_simulation(db)


@router.post("/pause")
def trigger_pause(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return pause_simulation(db)


@router.post("/resume")
def trigger_resume(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return resume_simulation(db)


@router.post("/step")
def trigger_step(
    steps: int = Query(1, ge=1, le=100),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    return step_simulation(db, steps=steps)


@router.post("/rewind")
def trigger_rewind(
    steps: int = Query(1, ge=1, le=100),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    return rewind_simulation(db, steps=steps)


@router.post("/reset")
def trigger_reset(db: Session = Depends(get_db)) -> Dict[str, Any]:
    return reset_simulation(db)


@router.patch("/settings")
def update_settings(
    settings_in: SimulationSettingsUpdate,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    settings = get_or_create_settings(db)
    update_data = settings_in.model_dump(exclude_unset=True)

    if "runway_count" in update_data:
        new_count = update_data["runway_count"]
        settings.runway_count = new_count
        init_default_runways(db, count=new_count)

    for field, value in update_data.items():
        if field != "runway_count":
            setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return get_simulation_state(db)


@router.post("/sample-data")
def trigger_load_sample_data(
    overwrite: bool = Query(False, description="Whether to overwrite existing records"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    return load_sample_data(db=db, overwrite=overwrite)
