from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for Factura",
    version="1.0.0"
)

from app.db.database import engine
from app.models.base import Base
from app.models.user import User
from app.models.invoice import Invoice
from app.models.extraction import Extraction

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}


from app.api.v1.endpoints import invoices
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["invoices"])
