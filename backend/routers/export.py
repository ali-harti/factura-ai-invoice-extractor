import csv
import io
import json
from datetime import datetime, timezone
from typing import List, Literal, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..database.connection import get_db
from ..models.invoice import Invoice, Extraction

router = APIRouter()

class ExportRequest(BaseModel):
    ids: List[str]
    format: Literal["csv", "json"]

class PatchCorrections(BaseModel):
    human_corrections: Dict[str, Any]

@router.post("/export")
async def export_invoices(
    req: ExportRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Invoice).options(selectinload(Invoice.extraction)).filter(Invoice.id.in_(req.ids))
    result = await db.execute(stmt)
    invoices = result.scalars().all()
    
    if not invoices:
        raise HTTPException(status_code=404, detail={"error": "Not Found", "detail": "No invoices found for the given IDs"})

    timestamp = datetime.now().strftime("%Y-%m-%d")
    
    if req.format == "json":
        data = []
        for inv in invoices:
            if inv.extraction:
                # Merge parsed_data with human_corrections for the export representation if desired,
                # or just return full extraction
                item = inv.extraction.parsed_data.copy()
                item["human_corrections"] = inv.extraction.human_corrections
                item["invoice_id"] = str(inv.id)
                data.append(item)
                
        json_str = json.dumps(data, indent=2)
        return StreamingResponse(
            io.StringIO(json_str),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=factura-export-{timestamp}.json"}
        )

    elif req.format == "csv":
        output = io.StringIO()
        fieldnames = [
            "invoice_id", "vendor_name", "vendor_address", "invoice_number", 
            "invoice_date", "due_date", "currency", "subtotal", "tax_rate", 
            "tax_amount", "total_amount", "language_detected", "confidence_score",
            "line_description", "line_quantity", "line_unit_price", "line_total"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for inv in invoices:
            if inv.extraction:
                base_data = inv.extraction.parsed_data
                # If there are human corrections, we could override base_data fields here
                corrections = inv.extraction.human_corrections
                merged = {**base_data, **corrections}

                base_row = {
                    "invoice_id": str(inv.id),
                    "vendor_name": merged.get("vendor_name"),
                    "vendor_address": merged.get("vendor_address"),
                    "invoice_number": merged.get("invoice_number"),
                    "invoice_date": merged.get("invoice_date"),
                    "due_date": merged.get("due_date"),
                    "currency": merged.get("currency"),
                    "subtotal": merged.get("subtotal"),
                    "tax_rate": merged.get("tax_rate"),
                    "tax_amount": merged.get("tax_amount"),
                    "total_amount": merged.get("total_amount"),
                    "language_detected": merged.get("language_detected"),
                    "confidence_score": inv.extraction.confidence_score
                }
                
                line_items = merged.get("line_items", [])
                if not line_items:
                    writer.writerow(base_row)
                else:
                    for line in line_items:
                        row = base_row.copy()
                        row.update({
                            "line_description": line.get("description"),
                            "line_quantity": line.get("quantity"),
                            "line_unit_price": line.get("unit_price"),
                            "line_total": line.get("total")
                        })
                        writer.writerow(row)
        
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=factura-export-{timestamp}.csv"}
        )


@router.patch("/{id}")
async def patch_invoice(
    id: str,
    payload: PatchCorrections,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Extraction).filter(Extraction.invoice_id == id)
    result = await db.execute(stmt)
    extraction = result.scalars().first()
    
    if not extraction:
        raise HTTPException(status_code=404, detail={"error": "Not Found", "detail": "Invoice extraction not found"})

    # Update human_corrections JSONB
    # Since it's JSONB in SQLAlchemy, we should replace or deeply update it
    current_corrections = extraction.human_corrections or {}
    current_corrections.update(payload.human_corrections)
    
    # Re-assign to trigger SQLAlchemy change tracking
    extraction.human_corrections = current_corrections
    
    await db.commit()
    await db.refresh(extraction)
    
    return {"status": "success", "human_corrections": extraction.human_corrections}
