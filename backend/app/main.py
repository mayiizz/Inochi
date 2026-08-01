from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import modules, profile, tutor

app = FastAPI(title="Inochi API", version="0.1.0")

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(modules.router)
app.include_router(tutor.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
