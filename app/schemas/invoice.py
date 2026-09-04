from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class LineItemSchema(BaseModel):
    description: Optional[str] = Field(None, description="Description of the item or service")
    quantity: Optional[float] = Field(None, description="Quantity of the item")
    unit_price: Optional[float] = Field(None, description="Price per unit of the item")
    total: Optional[float] = Field(None, description="Total amount for this line item")

class InvoiceExtractionSchema(BaseModel):
    vendor_name: Optional[str] = Field(None, description="Name of the vendor/issuer")
    vendor_address: Optional[str] = Field(None, description="Address of the vendor")
    invoice_number: Optional[str] = Field(None, description="Unique invoice identifier")
    invoice_date: Optional[date] = Field(None, description="Date the invoice was issued (YYYY-MM-DD)")
    due_date: Optional[date] = Field(None, description="Date the payment is due (YYYY-MM-DD)")
    currency: Optional[str] = Field(None, description="Currency of the invoice amounts (e.g., USD, EUR, MAD)")
    
    line_items: List[LineItemSchema] = Field(default_factory=list, description="List of items in the invoice")
    
    subtotal: Optional[float] = Field(None, description="Total amount before taxes")
    tax_rate: Optional[float] = Field(None, description="Tax rate applied (percentage)")
    tax_amount: Optional[float] = Field(None, description="Total tax amount")
    total_amount: Optional[float] = Field(None, description="Total amount including taxes")
    
    language_detected: Optional[str] = Field(None, description="Language detected in the invoice (e.g., en, fr, ar, mixed)")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Estimated confidence score of the extraction (0.0 to 1.0)")
