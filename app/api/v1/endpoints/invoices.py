from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.invoice import Invoice
from app.models.user import User
from app.services.storage import storage_service
from app.services.file_validation import validate_invoice_file
from app.worker.tasks import process_invoice
from pydantic import BaseModel
from typing import Optional, Any, List
from app.schemas.invoice import InvoiceExtractionSchema
from app.api.deps import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class InvoiceResponse(BaseModel):
    id: int
    status: str
    message: str

class InvoiceStatusResponse(BaseModel):
    id: int
    status: str
    error_message: Optional[str] = None
    extracted_data: Optional[Any] = None # Or InvoiceExtractionSchema if typed

class InvoiceHistoryResponse(BaseModel):
    id: int
    original_filename: str
    file_type: str
    file_size: int
    status: str
    created_at: Any

@router.post("/upload", response_model=InvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
        status="queued"
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # 4. Trigger Celery Task
    process_invoice.delay(new_invoice.id)

    return InvoiceResponse(
        id=new_invoice.id, 
        status=new_invoice.status, 
        message="Invoice uploaded and queued for processing."
    )

@router.get("/status/{invoice_id}", response_model=InvoiceStatusResponse)
def get_invoice_status(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    response = InvoiceStatusResponse(
        id=invoice.id,
        status=invoice.status,
        error_message=invoice.error_message
    )
    
    if invoice.status == "completed" and invoice.extraction:
        response.extracted_data = invoice.extraction.parsed_data
        
    return response

@router.get("/", response_model=List[InvoiceHistoryResponse])
def get_invoice_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoices = db.query(Invoice).filter(Invoice.user_id == current_user.id).order_by(Invoice.created_at.desc()).all()
    return invoices
