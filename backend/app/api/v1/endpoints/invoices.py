import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.invoice import Invoice
from app.models.user import User
from app.services.ocr import process_invoice_background
from app.services.storage import storage_service
from app.utils.validators import validate_invoice_file

logger = logging.getLogger(__name__)

router = APIRouter()


class InvoiceResponse(BaseModel):
    id: Any
    status: str
    message: str


class InvoiceStatusResponse(BaseModel):
    id: Any
    status: str
    error_message: str | None = None
    extracted_data: Any | None = None  # Or InvoiceExtractionSchema if typed


class InvoiceHistoryResponse(BaseModel):
    id: Any
    original_filename: str
    file_type: str
    file_size: int
    status: str
    created_at: Any


@router.post("/upload", response_model=InvoiceResponse)
async def upload_invoice(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvoiceResponse:
    """
    Upload a new invoice for processing.

    Validates the uploaded file, saves it securely to the storage system,
    creates a database record for tracking, and triggers a background
    OCR extraction task.

    Args:
        background_tasks: FastAPI background tasks dependency.
        file: The uploaded invoice file (PDF, PNG, JPEG).
        db: The database session dependency.
        current_user: The currently authenticated user.

    Returns:
        InvoiceResponse: Status information and ID of the newly created invoice.

    Raises:
        HTTPException: If file validation fails or storage saving encounters an error.
    """
    # 1. Validate File
    validate_invoice_file(file)

    # 2. Save File
    try:
        saved_path = storage_service.save_upload_file(file)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save file securely.")

    # 3. Create DB Record
    file.file.seek(0, 2)
    file_size = file.file.tell()

    new_invoice = Invoice(
        user_id=current_user.id,
        original_filename=file.filename,
        file_path=saved_path,
        file_type=file.content_type,
        file_size=file_size,
        status="queued",
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # 4. Trigger Background Task
    background_tasks.add_task(process_invoice_background, new_invoice.id)

    return InvoiceResponse(
        id=new_invoice.id,
        status=new_invoice.status,
        message="Invoice uploaded and queued for processing.",
    )


@router.get("/status/{invoice_id}", response_model=InvoiceStatusResponse)
def get_invoice_status(
    invoice_id: Any,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InvoiceStatusResponse:
    """
    Retrieve the processing status and extracted data of a specific invoice.

    Args:
        invoice_id: The unique identifier of the invoice.
        db: The database session dependency.
        current_user: The currently authenticated user.

    Returns:
        InvoiceStatusResponse: The status of the invoice, along with extracted data if completed.

    Raises:
        HTTPException: If the invoice is not found or the user is not authorized to view it.
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this invoice"
        )

    response = InvoiceStatusResponse(
        id=invoice.id, status=invoice.status, error_message=invoice.error_message
    )

    if invoice.status == "completed" and invoice.extraction:
        response.extracted_data = invoice.extraction.parsed_data

    return response


@router.get("/", response_model=list[InvoiceHistoryResponse])
def get_invoice_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InvoiceHistoryResponse]:
    """
    Retrieve the upload history of invoices for the current user.

    Supports pagination through skip and limit query parameters.

    Args:
        skip: The number of records to skip (offset).
        limit: The maximum number of records to return.
        db: The database session dependency.
        current_user: The currently authenticated user.

    Returns:
        List[InvoiceHistoryResponse]: A list of the user's past invoice uploads.
    """
    invoices = (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id)
        .order_by(Invoice.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return invoices
