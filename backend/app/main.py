import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import invoices
from app.core.config import settings
from app.db.database import engine
from app.models.base import Base
from app.models.extraction import Extraction  # noqa: F401
from app.models.invoice import Invoice  # noqa: F401

# Importing models here ensures they are registered with SQLAlchemy's metadata
from app.models.user import User  # noqa: F401

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.

    Handles startup and shutdown events. During startup, it ensures that all
    database tables are created.
    """
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    yield
    logger.info("Shutting down FastAPI application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for Factura - High-performance AI invoice extractor.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        FRONTEND_URL, # Vercel production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns a simple JSON response indicating the API is active and healthy.
    Useful for uptime monitoring and load balancers.
    """
    return {"status": "healthy", "project": settings.PROJECT_NAME}


# Include API routers
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["invoices"])
