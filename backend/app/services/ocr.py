import base64
import json
import logging
from abc import ABC, abstractmethod
from io import BytesIO
from typing import Any

import httpx
from openai import AsyncOpenAI
from pdf2image import convert_from_path
from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.extraction import Extraction
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceExtractionSchema

logger = logging.getLogger(__name__)
MAX_EDGE_SIZE = 2500


def _resize_and_encode_image(image: Image.Image) -> str:
    """Resizes image if longest edge > MAX_EDGE_SIZE while preserving aspect ratio. Returns base64."""
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    width, height = image.size
    if width > MAX_EDGE_SIZE or height > MAX_EDGE_SIZE:
        if width > height:
            new_width = MAX_EDGE_SIZE
            new_height = int(MAX_EDGE_SIZE * (height / width))
        else:
            new_height = MAX_EDGE_SIZE
            new_width = int(MAX_EDGE_SIZE * (width / height))

        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

    buffered = BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def process_file_to_base64_images(file_path: str, mime_type: str) -> list[str]:
    """Processes a file (image or PDF) and returns a list of base64 encoded images."""
    base64_images = []
    if mime_type == "application/pdf":
        pages = convert_from_path(file_path, dpi=200)
        for page in pages:
            b64 = _resize_and_encode_image(page)
            base64_images.append(b64)
    else:
        with Image.open(file_path) as img:
            b64 = _resize_and_encode_image(img)
            base64_images.append(b64)
    return base64_images


class BaseAIProvider(ABC):
    """
    Abstract base class for AI OCR providers.

    Any AI implementation for invoice extraction must inherit from this
    class and implement the `extract_invoice` method.
    """

    @abstractmethod
    async def extract_invoice(
        self, images_base64: list[str]
    ) -> InvoiceExtractionSchema | None:
        """
        Extract invoice data from a list of base64 encoded images.

        Args:
            images_base64: List of base64 encoded image strings representing the invoice pages.

        Returns:
            InvoiceExtractionSchema if successful, None otherwise.
        """


class OpenRouterQwenProvider(BaseAIProvider):
    """
    OpenRouter API provider for Qwen Vision model.

    Implements invoice data extraction using the Qwen model via OpenRouter API.
    Handles the asynchronous HTTP client and prompt generation.
    """

    def __init__(self):
        http_client = httpx.AsyncClient(timeout=httpx.Timeout(60.0))
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            http_client=http_client,
        )
        self.model = settings.AI_MODEL_NAME

    async def extract_invoice(
        self, images_base64: list[str]
    ) -> InvoiceExtractionSchema | None:
        """
        Performs the extraction using the configured OpenRouter model.

        Uses an expert prompt and JSON schema validation to guarantee
        the response matches the InvoiceExtractionSchema.
        """
        if settings.OPENROUTER_API_KEY == "test_key":
            parsed_data = {
                "vendor_name": "Mock Vendor",
                "vendor_address": "123 Mock St",
                "invoice_number": "INV-MOCK-01",
                "invoice_date": "2023-01-01",
                "due_date": "2023-01-31",
                "currency": "USD",
                "line_items": [
                    {
                        "description": "Mock Item",
                        "quantity": 1,
                        "unit_price": 100.00,
                        "total": 100.00,
                    }
                ],
                "subtotal": 100.00,
                "tax_rate": 0,
                "tax_amount": 0,
                "total_amount": 100.00,
                "language_detected": "en",
                "confidence_score": 0.99,
            }
            return InvoiceExtractionSchema(**parsed_data)

        schema_json = InvoiceExtractionSchema.model_json_schema()
        prompt = (
            "You are an expert OCR and data extraction specialist. Extract the data from this invoice image.\n\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. Extract ONLY information visibly present in the invoice. NEVER invent or guess missing values.\n"
            "2. If a field is missing, illegible, or not applicable, return `null`.\n"
            "3. Preserve invoice numbers and vendor names EXACTLY as they appear.\n"
            "4. Distinguish carefully between subtotal, total_amount, tax_rate, and tax_amount.\n"
            "5. Preserve currency codes (e.g., USD, EUR, MAD). Do not restrict to any specific currency.\n"
            "6. Support Arabic, French, English, and mixed language invoices seamlessly.\n"
            "7. Normalize dates to ISO 8601 format (YYYY-MM-DD).\n"
            "8. Respond strictly in valid JSON format matching the schema below. No markdown formatting or extra text.\n\n"
            f"Schema:\n{json.dumps(schema_json, indent=2)}"
        )

        content_list = [{"type": "text", "text": prompt}]
        for b64 in images_base64:
            content_list.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                }
            )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": content_list}],
                max_tokens=4096,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            raw_content = response.choices[0].message.content.strip()
            raw_content = raw_content.removeprefix("```json")
            raw_content = raw_content.removesuffix("```")
            parsed_data = json.loads(raw_content)
            return InvoiceExtractionSchema(**parsed_data)
        except Exception as e:
            logger.error(f"Error during AI extraction: {e!s}")
            return None


ai_provider = OpenRouterQwenProvider()


async def _async_run_extraction(db: Session, invoice: Invoice):
    """Async implementation of the extraction logic."""
    logger.info(f"Starting extraction for invoice {invoice.id}")

    try:
        base64_images = process_file_to_base64_images(
            invoice.file_path, invoice.file_type
        )
    except Exception as e:
        logger.error(f"Failed to process file for invoice {invoice.id}: {e}")
        invoice.status = "failed"
        invoice.error_message = f"File processing failed: {e!s}"
        db.commit()
        return

    try:
        extracted_data = await ai_provider.extract_invoice(base64_images)
    except Exception as e:
        logger.error(f"AI Provider failed for invoice {invoice.id}: {e}")
        invoice.status = "failed"
        invoice.error_message = f"AI Extraction failed: {e!s}"
        db.commit()
        return

    if not extracted_data:
        invoice.status = "failed"
        invoice.error_message = "AI Extraction returned empty result."
        db.commit()
        return

    try:
        extraction = Extraction(
            invoice_id=invoice.id,
            parsed_data=extracted_data.model_dump(mode="json"),
            model_used=ai_provider.model,
        )
        db.add(extraction)

        invoice.status = "completed"
        db.commit()
        logger.info(f"Successfully extracted data for invoice {invoice.id}")
    except Exception as e:
        logger.error(f"Failed to save extraction to DB for invoice {invoice.id}: {e}")
        db.rollback()
        invoice.status = "failed"
        invoice.error_message = f"Database save failed: {e!s}"
        db.commit()


async def process_invoice_background(invoice_id: Any):
    """Background task to process the invoice, runs in the asyncio event loop."""
    from app.db.database import SessionLocal

    db = SessionLocal()

    try:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            logger.error(f"Invoice {invoice_id} not found in database.")
            return

        if invoice.status != "queued" and invoice.status != "processing":
            logger.warning(
                f"Invoice {invoice_id} is in status '{invoice.status}'. Skipping."
            )
            return

        invoice.status = "processing"
        db.commit()

        await _async_run_extraction(db, invoice)

    except Exception as exc:
        logger.error(f"Unhandled exception processing invoice {invoice_id}: {exc}")
        db.rollback()
        try:
            invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
            if invoice:
                invoice.status = "failed"
                invoice.error_message = f"Processing failed: {exc!s}"
                db.commit()
        except Exception as inner_exc:
            logger.error(
                f"Failed to update invoice status after exception: {inner_exc}"
            )
    finally:
        db.close()
