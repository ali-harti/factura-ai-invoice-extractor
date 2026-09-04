import os
import aiofiles
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.connection import get_db
from ..models.invoice import Invoice, InvoiceStatus, Extraction
from ..utils.storage import get_storage_path
from ..services.ocr import extract

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf"}

@router.post("/upload")
async def upload_invoice(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail={"error": "Invalid file type", "detail": "Only image/jpeg, image/png, application/pdf allowed."}
        )

    # Check file size without loading entirely into memory upfront if possible, 
    # but we'll read it and check size since we have to save it anyway.
    file_bytes = await file.read()
    max_size_mb = int(os.getenv("MAX_FILE_SIZE_MB", 20))
    if len(file_bytes) > max_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail={"error": "File too large", "detail": f"File exceeds {max_size_mb}MB limit."}
        )

    storage_path = get_storage_path(file.filename)
    async with aiofiles.open(storage_path, 'wb') as out_file:
        await out_file.write(file_bytes)

    invoice = Invoice(
        original_filename=file.filename,
        storage_path=storage_path,
        status=InvoiceStatus.processing
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)

    try:
        raw_response, parsed_data = await extract(storage_path)
        
        extraction = Extraction(
            invoice_id=invoice.id,
            raw_model_response=raw_response,
            parsed_data=parsed_data,
            confidence_score=parsed_data.get("confidence_score"),
            language_detected=parsed_data.get("language_detected"),
            model_used=os.getenv("MODEL_NAME", "qwen/qwen2.5-vl-72b-instruct")
        )
        db.add(extraction)
        
        invoice.status = InvoiceStatus.completed
        invoice.processed_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(extraction)

        return {
            "invoice_id": invoice.id,
            "status": invoice.status,
            "extraction": parsed_data
        }

    except Exception as e:
        invoice.status = InvoiceStatus.failed
        await db.commit()
        raise HTTPException(
            status_code=500,
            detail={"error": "Extraction failed", "detail": str(e)}
        )
