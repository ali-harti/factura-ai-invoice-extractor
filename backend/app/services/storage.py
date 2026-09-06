import os
import shutil
import uuid
from datetime import datetime, timezone

from fastapi import UploadFile


class LocalStorageService:
    """
    A service for handling local file storage operations.

    This class manages the saving of uploaded files to a structured
    directory hierarchy based on the current year and month.
    """

    def __init__(self, base_dir: str = "uploads"):
        self.base_dir = base_dir

    def save_upload_file(self, upload_file: UploadFile) -> str:
        """
        Save an uploaded file to the local disk.

        Files are organized into a structured directory: uploads/YYYY/MM/UUID.ext.

        Args:
            upload_file: The FastAPI UploadFile object containing the file data.

        Returns:
            str: The relative file path where the file was saved.
        """
        now = datetime.now(timezone.utc)
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
