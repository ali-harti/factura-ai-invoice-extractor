import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address

try:
    from ..database.connection import get_db
    from ..models.user import User, UserRole
    from ..services.auth import (
        hash_password,
        verify_password,
        create_access_token,
        verify_google_token,
        get_current_user,
        JWT_EXPIRY_HOURS,
    )
except (ImportError, ValueError):
    from database.connection import get_db
    from models.user import User, UserRole
    from services.auth import (
        hash_password,
        verify_password,
        create_access_token,
        verify_google_token,
        get_current_user,
        JWT_EXPIRY_HOURS,
    )

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() in ["production", "prod"]


# Request & Response Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, description="Minimum 8 characters")
    full_name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None


class AuthSuccessResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def set_auth_cookie(response: Response, token: str):
    """
    Sets httpOnly JWT cookie with security flags.
    """
    max_age_seconds = JWT_EXPIRY_HOURS * 3600
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=max_age_seconds,
        expires=max_age_seconds,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="lax",
        path="/"
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    email_clean = payload.email.strip().lower()

    # Check if user already exists
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte avec cette adresse email existe déjà."
        )

    pwd_hash = hash_password(payload.password)
    new_user = User(
        email=email_clean,
        password_hash=pwd_hash,
        full_name=payload.full_name.strip(),
        role=UserRole.user,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role.value,
        avatar_url=new_user.avatar_url,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None
    )


@router.post("/login", response_model=AuthSuccessResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    email_clean = payload.email.strip().lower()

    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte a été désactivé."
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    })

    set_auth_cookie(response, token)

    return AuthSuccessResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            avatar_url=user.avatar_url,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )


@router.post("/google", response_model=AuthSuccessResponse)
async def google_login(
    response: Response,
    payload: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    google_claims = verify_google_token(payload.token)
    email = google_claims.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Adresse email manquante dans le token Google."
        )
    email_clean = email.strip().lower()
    google_id = google_claims.get("sub")
    full_name = google_claims.get("name")
    avatar_url = google_claims.get("picture")

    # Find existing user by email or google_id
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        # Update google_id and avatar if missing
        if not user.google_id and google_id:
            user.google_id = google_id
        if avatar_url:
            user.avatar_url = avatar_url
        if not user.full_name and full_name:
            user.full_name = full_name
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
    else:
        # Create user automatically with role user
        user = User(
            email=email_clean,
            google_id=google_id,
            full_name=full_name or email_clean.split("@")[0],
            avatar_url=avatar_url,
            role=UserRole.user,
            is_active=True,
            last_login_at=datetime.now(timezone.utc)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte a été désactivé."
        )

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    })

    set_auth_cookie(response, token)

    return AuthSuccessResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            avatar_url=user.avatar_url,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )
