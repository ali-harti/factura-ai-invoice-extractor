import logging
from app.worker.celery_app import celery_app
from app.db.database import SessionLocal
from app.models.invoice import Invoice
from app.services.extraction_service import run_extraction
import sys

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def process_invoice(self, invoice_id: int):
    logger.info(f"Received task to process invoice {invoice_id}")
    db = SessionLocal()
    
    try:
        # 1. Check and lock invoice for processing
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            logger.error(f"Invoice {invoice_id} not found.")
            return
            
        if invoice.status != "queued":
            logger.warning(f"Invoice {invoice_id} is in status '{invoice.status}', not 'queued'. Skipping.")
            return
            
        invoice.status = "processing"
        db.commit()
        
        # 2. Run extraction
        run_extraction(db, invoice_id)
        
    except Exception as exc:
        logger.error(f"Unhandled exception processing invoice {invoice_id}: {exc}")
        db.rollback()
        
        # Re-fetch in a fresh transaction to ensure we update status properly
        try:
            invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
            if invoice:
                invoice.status = "failed"
                invoice.error_message = f"Worker failed: {str(exc)}"
                db.commit()
        except Exception as inner_exc:
            logger.error(f"Failed to update invoice status after exception: {inner_exc}")
            
        # Retry logic if it's not a permanent error (could refine exception types here)
        raise self.retry(exc=exc, countdown=2 ** self.request.retries) # exponential backoff
        
    finally:
        db.close()
