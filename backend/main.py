import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .routers import extract, history, export
from .utils.storage import STORAGE_DIR

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage directory exists on startup
    if not STORAGE_DIR.exists():
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown logic if any

app = FastAPI(
    title="Factura Backend API",
    description="Production-ready FastAPI backend for Invoice OCR",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

# Register routers
app.include_router(extract.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(history.router, prefix="/api/v1/invoices", tags=["History"])
app.include_router(export.router, prefix="/api/v1/invoices", tags=["Export"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
