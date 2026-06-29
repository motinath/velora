import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import engine, Base
from app.api import auth, projects, designs
from app.events.handlers import register_event_handlers

# Setup logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables automatically
logger.info("Initializing database schemas...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VELORA API",
    description="AI Semiconductor Engineering Copilot Backend",
    version="1.0.0"
)

# CORS Setup for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Event Bus Handlers
register_event_handlers()

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(designs.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "model_provider": settings.MODEL_PROVIDER
    }
