import os
import re
import uuid
from pathlib import Path

STORAGE_DIR = Path("/data/invoices")

def get_storage_path(original_filename: str) -> str:
    """
    Sanitize the original filename and return a storage path with a unique UUID prefix.
    Ensures that the storage directory exists.
    """
    if not STORAGE_DIR.exists():
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        
    # Sanitize: keep alphanumeric, dots, hyphens, and underscores
    sanitized = re.sub(r'[^a-zA-Z0-9.\-_]', '_', original_filename)
    
    unique_name = f"{uuid.uuid4()}_{sanitized}"
    
    return str(STORAGE_DIR / unique_name)
