import logging
import asyncio
from sqlalchemy.orm import Session
from app.models.invoice import Invoice
from app.models.extraction import Extraction
from app.services.image_processing import process_file_to_base64_images
from app.services.ai_provider import OpenRouterQwenProvider

logger = logging.getLogger(__name__)
ai_provider = OpenRouterQwenProvider()

async def _async_run_extraction(db: Session, invoice: Invoice):
    """
    Async implementation of the extraction logic.
    """
    logger.info(f"Starting extraction for invoice {invoice.id}")
    
    # 1. Process images
    try:
        base64_images = process_file_to_base64_images(invoice.file_path, invoice.file_type)
    except Exception as e:
        logger.error(f"Failed to process file for invoice {invoice.id}: {e}")
        invoice.status = "failed"
        invoice.error_message = f"File processing failed: {str(e)}"
        db.commit()
        return

    # 2. Call AI Provider
    try:
        extracted_data = await ai_provider.extract_invoice(base64_images)
    except Exception as e:
        logger.error(f"AI Provider failed for invoice {invoice.id}: {e}")
        invoice.status = "failed"
        invoice.error_message = f"AI Extraction failed: {str(e)}"
        db.commit()
        return

    if not extracted_data:
        invoice.status = "failed"
        invoice.error_message = "AI Extraction returned empty result."
        db.commit()
        return

    # 3. Store result
    try:
        extraction = Extraction(
            invoice_id=invoice.id,
            parsed_data=extracted_data.model_dump(mode='json'),
            model_used=ai_provider.model
        )
        db.add(extraction)
        
        invoice.status = "completed"
        db.commit()
        logger.info(f"Successfully extracted data for invoice {invoice.id}")
    except Exception as e:
        logger.error(f"Failed to save extraction to DB for invoice {invoice.id}: {e}")
        db.rollback()
        invoice.status = "failed"
        invoice.error_message = f"Database save failed: {str(e)}"
        db.commit()

from typing import Any

async def process_invoice_background(invoice_id: Any):
    """
    Background task to process the invoice, runs in the asyncio event loop.
    Replaces the old Celery/Threading implementation.
    """
    from app.db.database import SessionLocal
    db = SessionLocal()
    
    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            logger.error(f"Invoice {invoice_id} not found in database.")
            return
            
        if invoice.status != "queued" and invoice.status != "processing":
            logger.warning(f"Invoice {invoice_id} is in status '{invoice.status}'. Skipping.")
            return
            
        invoice.status = "processing"
        db.commit()
        
        # Run the async extraction
        await _async_run_extraction(db, invoice)
        
    except Exception as exc:
        logger.error(f"Unhandled exception processing invoice {invoice_id}: {exc}")
        db.rollback()
        
        # Ensure we update status properly
        try:
            invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
            if invoice:
                invoice.status = "failed"
                invoice.error_message = f"Processing failed: {str(exc)}"
                db.commit()
        except Exception as inner_exc:
            logger.error(f"Failed to update invoice status after exception: {inner_exc}")
            
    finally:
        db.close()
