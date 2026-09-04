import math
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, func
try:
    from ..database.connection import get_db
    from ..models.invoice import Invoice, InvoiceStatus, Extraction
except (ImportError, ValueError):
    from database.connection import get_db
    from models.invoice import Invoice, InvoiceStatus, Extraction

router = APIRouter()

@router.get("/")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    vendor: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    
    stmt = select(Invoice).options(selectinload(Invoice.extraction))
    count_stmt = select(func.count(Invoice.id))
    
    if vendor:
        stmt = stmt.join(Extraction).filter(
            Extraction.parsed_data.op("->>")("vendor_name").ilike(f"%{vendor}%")
        )
        count_stmt = count_stmt.join(Extraction).filter(
            Extraction.parsed_data.op("->>")("vendor_name").ilike(f"%{vendor}%")
        )
    if status and status.lower() not in ["", "all", "tous"]:
        try:
            status_enum = InvoiceStatus(status.lower())
            stmt = stmt.filter(Invoice.status == status_enum)
            count_stmt = count_stmt.filter(Invoice.status == status_enum)
        except ValueError:
            pass
            
    if date_from:
        try:
            dt_from = datetime.fromisoformat(date_from)
            stmt = stmt.filter(Invoice.created_at >= dt_from)
            count_stmt = count_stmt.filter(Invoice.created_at >= dt_from)
        except ValueError:
            pass
            
    if date_to:
        try:
            dt_to = datetime.fromisoformat(date_to)
            # Include entire day if only date is provided
            if dt_to.hour == 0 and dt_to.minute == 0 and dt_to.second == 0:
                dt_to = dt_to.replace(hour=23, minute=59, second=59, microsecond=999999)
            stmt = stmt.filter(Invoice.created_at <= dt_to)
            count_stmt = count_stmt.filter(Invoice.created_at <= dt_to)
        except ValueError:
            pass

    # Execute count
    total_count_res = await db.execute(count_stmt)
    total_count = total_count_res.scalar() or 0
    pages = math.ceil(total_count / limit) if total_count > 0 else 1

    # Execute items query
    stmt = stmt.order_by(desc(Invoice.created_at)).offset(offset).limit(limit)
    result = await db.execute(stmt)
    invoices = result.scalars().all()
    
    items = []
    for inv in invoices:
        item = {
            "id": str(inv.id),
            "original_filename": inv.original_filename,
            "status": inv.status.value,
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
            "vendor_name": None,
            "vendor_address": None,
            "invoice_number": None,
            "invoice_date": None,
            "total_amount": None,
            "currency": None,
            "confidence_score": None
        }
        if inv.extraction:
            parsed = inv.extraction.parsed_data or {}
            corrections = inv.extraction.human_corrections or {}
            merged = {**parsed, **corrections}
            
            item["vendor_name"] = merged.get("vendor_name")
            item["vendor_address"] = merged.get("vendor_address")
            item["invoice_number"] = merged.get("invoice_number")
            item["invoice_date"] = merged.get("invoice_date")
            item["total_amount"] = merged.get("total_amount")
            item["currency"] = merged.get("currency")
            item["confidence_score"] = inv.extraction.confidence_score
            
        items.append(item)
        
    return {
        "items": items,
        "data": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": pages
    }


@router.get("/{id}")
async def get_invoice(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        uuid_obj = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=400, detail={"error": "Invalid ID", "detail": "Invalid UUID format"})
    
    stmt = select(Invoice).options(selectinload(Invoice.extraction)).filter(Invoice.id == uuid_obj)
    result = await db.execute(stmt)
    inv = result.scalars().first()
    
    if not inv:
        raise HTTPException(status_code=404, detail={"error": "Not Found", "detail": "Invoice not found"})
        
    merged_data = {}
    if inv.extraction:
        base = inv.extraction.parsed_data or {}
        corr = inv.extraction.human_corrections or {}
        merged_data = {**base, **corr}
        
    return {
        "id": str(inv.id),
        "invoice_id": str(inv.id),
        "original_filename": inv.original_filename,
        "status": inv.status.value,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "processed_at": inv.processed_at.isoformat() if inv.processed_at else None,
        "confidence_score": inv.extraction.confidence_score if inv.extraction else None,
        "language_detected": inv.extraction.language_detected if inv.extraction else None,
        "extraction": merged_data,
        **merged_data
    }

