import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

try:
    from .routers import extract, history, export, auth
    from .routers.auth import limiter
    from .utils.storage import STORAGE_DIR
except (ImportError, ValueError):
    from routers import extract, history, export, auth
    from routers.auth import limiter
    from utils.storage import STORAGE_DIR

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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
FRONTEND_URLS = os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
FRONTEND_URLS.extend([
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1",
    "http://127.0.0.1:5174",
])
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(FRONTEND_URLS)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check (accessible via /health and /api/health)
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(extract.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(history.router, prefix="/api/v1/invoices", tags=["History"])
app.include_router(export.router, prefix="/api/v1/invoices", tags=["Export"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
