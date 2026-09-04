from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "invoice_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Worker configuration
    worker_prefetch_multiplier=1, # process one at a time per worker process
    task_acks_late=True, # Ack after processing
    task_always_eager=True, # Run tasks synchronously since Redis is not available
)

import app.worker.tasks # Load tasks
