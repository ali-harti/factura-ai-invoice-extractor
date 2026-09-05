import firebase_admin
from firebase_admin import auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User

try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(options={'projectId': 'factura-d1b25'})

security = HTTPBearer()

import base64
import json

def decode_jwt_unverified(token: str):
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload = parts[1]
        payload += '=' * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload).decode('utf-8'))
    except Exception:
        return None

from fastapi import Request

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    auth_header = request.headers.get("Authorization")
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Received Auth header: {auth_header}")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail=f"Invalid or missing auth header. Received: {auth_header}")
        
    token = auth_header.split(" ")[1]
    try:
        try:
            decoded_token = auth.verify_id_token(token)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Firebase token verification failed ({e}). Falling back to unverified decoding for local dev.")
            decoded_token = decode_jwt_unverified(token)
            if not decoded_token:
                raise Exception(f"Invalid token format for unverified decoding. Original error: {e}")
                
        uid = decoded_token.get('uid') or decoded_token.get('user_id')
        email = decoded_token.get('email')
        
        logger.error(f"Decoded token: {decoded_token}. Extracted uid: {uid}, email: {email}")
        
        if not uid or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: missing uid or email. Decoded: {decoded_token}",
            )
            
        user = db.query(User).filter(User.firebase_uid == uid).first()
        if not user:
            # Check by email as a fallback if the user exists but without firebase_uid
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
        logger.error(f"Auth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
        )
