import logging
import asyncio
from worker.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3)
def process_invoice(self, invoice_id: str):
    logger.info(f"Processing invoice task for ID: {invoice_id}")
    return {"status": "success", "invoice_id": invoice_id}
