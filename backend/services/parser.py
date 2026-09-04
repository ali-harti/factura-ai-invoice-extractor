import re
import json
from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError

class LineItem(BaseModel):
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total: Optional[float] = None

class InvoiceSchema(BaseModel):
    vendor_name: Optional[str] = None
    vendor_address: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    currency: Optional[str] = None
    line_items: List[LineItem] = Field(default_factory=list)
    subtotal: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    language_detected: Optional[str] = None
    confidence_score: Optional[float] = None

def parse_model_response(raw_response: str) -> dict:
    """
    Extract JSON from the model response, stripping markdown fences if any,
    and validate it against the expected invoice schema. Missing fields become null.
    """
    # Extract JSON block
    json_match = re.search(r'```(?:json)?\n(.*?)\n```', raw_response, re.DOTALL)
    json_str = json_match.group(1) if json_match else raw_response.strip()

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        # Fallback to empty if it completely fails to parse as JSON
        data = {}

    try:
        validated_data = InvoiceSchema(**data)
        return validated_data.model_dump()
    except ValidationError:
        # If there's an unexpected validation error, we still don't raise
        # We try to coerce by passing an empty dict which defaults fields to None
        return InvoiceSchema().model_dump()
