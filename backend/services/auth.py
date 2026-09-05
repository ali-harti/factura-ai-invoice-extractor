import os
import uuid
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

try:
    from ..database.connection import get_db
    from ..models.user import User, UserRole
except (ImportError, ValueError):
    from database.connection import get_db
    from models.user import User, UserRole

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-factura-ai-key-min-32-chars-long-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 8))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """
    Hash password with bcrypt (cost factor 12).
    Bcrypt enforces max 72 bytes.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against bcrypt hash.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token with payload { sub, email, role, exp }.
    Default expiry: 8 hours.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token.
    Raises HTTPException(401) on failure.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_google_token(token: str) -> Dict[str, Any]:
    """
    Verify Google ID token using Google public keys.
    Returns token claims or raises HTTPException.
    """
    try:
        client_id = GOOGLE_CLIENT_ID if (GOOGLE_CLIENT_ID and not GOOGLE_CLIENT_ID.startswith("your-")) else None
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=client_id
        )
        return id_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Échec de validation du token Google: {str(e)}"
        )


async def get_current_user(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and authenticate current user.
    (Bypassed: Returns a default user)
    """
    stmt = select(User).where(User.email == "default@factura.local")
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email="default@factura.local",
            full_name="Default User",
            role=UserRole.admin,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
