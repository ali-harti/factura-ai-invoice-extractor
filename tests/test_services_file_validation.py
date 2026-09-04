import pytest
from fastapi import UploadFile, HTTPException
from app.services.file_validation import validate_invoice_file
import io

class MockUploadFile:
    def __init__(self, filename: str, content_type: str, size: int):
        self.filename = filename
        self.content_type = content_type
        # Create a dummy file-like object of specific size
        self.file = io.BytesIO(b"x" * size)

def test_validate_invoice_file_valid_jpeg():
    file = MockUploadFile("invoice.jpeg", "image/jpeg", 1024)
    # Should not raise exception
    validate_invoice_file(file)

def test_validate_invoice_file_valid_pdf():
    file = MockUploadFile("invoice.pdf", "application/pdf", 1024)
    validate_invoice_file(file)

def test_validate_invoice_file_invalid_mime():
    file = MockUploadFile("invoice.txt", "text/plain", 1024)
    with pytest.raises(HTTPException) as exc_info:
        validate_invoice_file(file)
    assert exc_info.value.status_code == 400
    assert "Unsupported file type" in exc_info.value.detail

def test_validate_invoice_file_extension_mismatch():
    file = MockUploadFile("invoice.pdf", "image/jpeg", 1024)
    with pytest.raises(HTTPException) as exc_info:
        validate_invoice_file(file)
    assert exc_info.value.status_code == 400
    assert "does not match content type" in exc_info.value.detail

def test_validate_invoice_file_too_large():
    # 21 MB
    file = MockUploadFile("large.pdf", "application/pdf", 21 * 1024 * 1024)
    with pytest.raises(HTTPException) as exc_info:
        validate_invoice_file(file)
    assert exc_info.value.status_code == 400
    assert "exceeds the 20MB limit" in exc_info.value.detail
