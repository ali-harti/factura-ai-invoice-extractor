import os
import uuid
from datetime import datetime
from fastapi import UploadFile
import shutil

class LocalStorageService:
    def __init__(self, base_dir: str = "uploads"):
        self.base_dir = base_dir

    def save_upload_file(self, upload_file: UploadFile) -> str:
        """
        Saves the file to disk in a structured directory: uploads/YYYY/MM/UUID.ext
        Returns the relative file path.
        """
        now = datetime.utcnow()
        year = now.strftime("%Y")
        month = now.strftime("%m")
        
        # Get extension
        _, ext = os.path.splitext(upload_file.filename)
        if not ext:
            ext = ".bin"
        
        file_id = str(uuid.uuid4())
        relative_dir = os.path.join(self.base_dir, year, month)
        
        # Create directory if it doesn't exist
        os.makedirs(relative_dir, exist_ok=True)
        
        relative_path = os.path.join(relative_dir, f"{file_id}{ext}")
        
        # Reset file cursor just in case it was read during validation
        upload_file.file.seek(0)
        
        with open(relative_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return relative_path

storage_service = LocalStorageService()
