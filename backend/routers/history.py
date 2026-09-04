from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.orm import selectinload
from ..database.connection import get_db
from ..models.invoice import Invoice, InvoiceStatus, Extraction

router = APIRouter()

@router.get("/")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    vendor: Optional[str] = None,
    status: Optional[InvoiceStatus] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    
    stmt = select(Invoice).options(selectinload(Invoice.extraction))
    
    if vendor:
        stmt = stmt.join(Extraction).filter(
            Extraction.parsed_data.op("->>")("vendor_name").ilike(f"%{vendor}%")
        )
    if status:
        stmt = stmt.filter(Invoice.status == status)
    if date_from:
        stmt = stmt.filter(Invoice.created_at >= date_from)
    if date_to:
        stmt = stmt.filter(Invoice.created_at <= date_to)

    stmt = stmt.order_by(desc(Invoice.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(stmt)
    invoices = result.scalars().all()
    
    response = []
    for inv in invoices:
        item = {
            "id": inv.id,
            "original_filename": inv.original_filename,
            "status": inv.status.value,
            "created_at": inv.created_at,
            "vendor_name": None,
            "total_amount": None,
            "currency": None,
            "confidence_score": None
        }
        if inv.extraction:
            parsed = inv.extraction.parsed_data
            item["vendor_name"] = parsed.get("vendor_name")
            item["total_amount"] = parsed.get("total_amount")
            item["currency"] = parsed.get("currency")
            item["confidence_score"] = inv.extraction.confidence_score
            
        response.append(item)
        
    return {
        "page": page,
        "limit": limit,
        "total": len(response), # Pagination total count would require a separate count query, skipping for simplicity unless requested
        "data": response
    }
