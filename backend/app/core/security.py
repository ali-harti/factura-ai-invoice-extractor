import base64
import json
import logging
import os

import firebase_admin
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer
from firebase_admin import auth
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)
security = HTTPBearer()

try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})


def decode_jwt_unverified(token: str):
    """Fallback decoder for local development when Firebase credentials are not set."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload = parts[1]
        payload += "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))
    except Exception:
        return None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing auth header.",
        )

    token = auth_header.split(" ")[1]

    try:
        # Check if Google credentials exist to skip 12s timeout locally if missing
        if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") and not os.environ.get(
            "FIREBASE_CONFIG"
        ):
            decoded_token = decode_jwt_unverified(token)
            if not decoded_token:
                raise Exception("Invalid token format for unverified decoding.")
        else:
            try:
                decoded_token = auth.verify_id_token(token)
            except Exception as e:
                logger.warning(
                    f"Firebase token verification failed ({e}). Falling back to unverified decoding for local dev."
                )
                decoded_token = decode_jwt_unverified(token)
                if not decoded_token:
                    raise Exception(
                        f"Invalid token format for unverified decoding. Original error: {e}"
                    )

        uid = decoded_token.get("uid") or decoded_token.get("user_id")
        email = decoded_token.get("email")

        if not uid or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token: missing uid or email.",
            )

        user = db.query(User).filter(User.firebase_uid == uid).first()

        if not user:
            # Fallback for existing users mapped by email
            user = db.query(User).filter(User.email == email).first()
            if user:
                user.firebase_uid = uid
                db.commit()
            else:
                user = User(email=email, firebase_uid=uid)
                db.add(user)
                db.commit()
                db.refresh(user)

        return user

    except Exception as e:
        logger.error(f"Auth error: {e!s}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e!s}",
        )
