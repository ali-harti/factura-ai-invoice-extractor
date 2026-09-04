import pytest
from pydantic import ValidationError
from datetime import date
from app.schemas.invoice import InvoiceExtractionSchema, LineItemSchema

def test_valid_invoice_data():
    data = {
        "invoice_number": "INV-123",
        "invoice_date": "2023-10-27",
        "vendor_name": "Acme Corp",
        "vendor_address": "123 Coyote Way, Desert, AZ",
        "line_items": [
            {
                "description": "Anvil",
                "quantity": 1.0,
                "unit_price": 150.00,
                "total": 150.00
            }
        ],
        "subtotal": 150.00,
        "tax_amount": 15.00,
        "total_amount": 165.00,
        "currency": "USD",
        "confidence_score": 0.95,
        "language_detected": "en"
    }
    invoice = InvoiceExtractionSchema(**data)
    assert invoice.invoice_number == "INV-123"
    assert invoice.invoice_date == date(2023, 10, 27)
    assert invoice.vendor_name == "Acme Corp"
    assert len(invoice.line_items) == 1
    assert invoice.line_items[0].description == "Anvil"
    assert invoice.subtotal == 150.00
    assert invoice.confidence_score == 0.95

def test_confidence_score_bounds():
    # Valid bound
    InvoiceExtractionSchema(confidence_score=1.0)
    InvoiceExtractionSchema(confidence_score=0.0)
    
    # Invalid lower bound
    with pytest.raises(ValidationError) as exc_info:
        InvoiceExtractionSchema(confidence_score=-0.1)
    assert "Input should be greater than or equal to 0" in str(exc_info.value)
    
    # Invalid upper bound
    with pytest.raises(ValidationError) as exc_info:
        InvoiceExtractionSchema(confidence_score=1.1)
    assert "Input should be less than or equal to 1" in str(exc_info.value)

def test_date_parsing():
    data = {
        "invoice_number": "INV-123",
        "invoice_date": "invalid-date",
        "confidence_score": 0.9
    }
    
    # invalid date format
    with pytest.raises(ValidationError) as exc_info:
        InvoiceExtractionSchema(**data)
    assert "invoice_date" in str(exc_info.value)
