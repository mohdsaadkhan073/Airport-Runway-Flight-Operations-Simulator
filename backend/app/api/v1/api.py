from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    flights,
    scheduling,
    runways,
    simulation,
    memory,
    logs,
    reports,
    analytics,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(flights.router, prefix="/flights", tags=["Flights"])
api_router.include_router(scheduling.router, prefix="/scheduling", tags=["Scheduling"])
api_router.include_router(runways.router, prefix="/runways", tags=["Runways"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
api_router.include_router(memory.router, prefix="/memory", tags=["Memory"])
api_router.include_router(logs.router, prefix="/logs", tags=["Logs"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
