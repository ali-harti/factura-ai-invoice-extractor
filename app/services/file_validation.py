from fastapi import UploadFile, HTTPException
import os

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "application/pdf": [".pdf"],
}

MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

def validate_invoice_file(upload_file: UploadFile) -> None:
    """
    Validates that the file is an allowed type and within size limits.
    Raises HTTPException if validation fails.
    """
    if upload_file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {upload_file.content_type}. Allowed types are: JPEG, PNG, PDF."
        )
        
    _, ext = os.path.splitext(upload_file.filename.lower())
    if ext not in ALLOWED_MIME_TYPES[upload_file.content_type]:
         raise HTTPException(
            status_code=400, 
            detail=f"File extension {ext} does not match content type {upload_file.content_type}."
        )
         
    # Check size by seeking to the end
    upload_file.file.seek(0, 2)
    file_size = upload_file.file.tell()
    upload_file.file.seek(0) # Reset to beginning
    
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit."
        )
