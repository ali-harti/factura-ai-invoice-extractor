import csv
import io
import json
from datetime import datetime, timezone
from typing import List, Literal, Dict, Any, Optional
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
    language: Optional[str] = "en"

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
    is_fr = bool(req.language and req.language.lower().startswith("fr"))
    
    if req.format == "json":
        data = []
        for inv in invoices:
            if inv.extraction:
                base_data = inv.extraction.parsed_data or {}
                corrections = inv.extraction.human_corrections or {}
                merged = {**base_data, **corrections}

                if is_fr:
                    item = {
                        "id_facture": str(inv.id),
                        "nom_fournisseur": merged.get("vendor_name"),
                        "adresse_fournisseur": merged.get("vendor_address"),
                        "numero_facture": merged.get("invoice_number"),
                        "date_facture": merged.get("invoice_date"),
                        "date_echeance": merged.get("due_date"),
                        "devise": merged.get("currency"),
                        "sous_total": merged.get("subtotal"),
                        "taux_taxe": merged.get("tax_rate"),
                        "montant_taxe": merged.get("tax_amount"),
                        "montant_total": merged.get("total_amount"),
                        "langue_detectee": merged.get("language_detected"),
                        "score_confiance": inv.extraction.confidence_score,
                        "corrections_humaines": corrections,
                        "articles": [
                            {
                                "description": line.get("description"),
                                "quantite": line.get("quantity"),
                                "prix_unitaire": line.get("unit_price"),
                                "total": line.get("total")
                            }
                            for line in (merged.get("line_items") or [])
                        ]
                    }
                else:
                    item = merged.copy()
                    item["human_corrections"] = corrections
                    item["invoice_id"] = str(inv.id)
                    item["confidence_score"] = inv.extraction.confidence_score
                data.append(item)
                
        json_str = json.dumps(data, indent=2, ensure_ascii=False)
        filename = f"facture-export-{timestamp}.json" if is_fr else f"invoice-export-{timestamp}.json"
        return StreamingResponse(
            io.StringIO(json_str),
            media_type="application/json; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    elif req.format == "csv":
        output = io.StringIO()
        # UTF-8 BOM for Microsoft Excel compatibility
        output.write('\ufeff')
        writer = csv.writer(output)
        
        summary_title = "RÉSUMÉ DE LA FACTURE" if is_fr else "INVOICE SUMMARY"
        labels = {
            "invoice_number": "Numéro de facture" if is_fr else "Invoice Number",
            "vendor_name": "Nom du fournisseur" if is_fr else "Vendor Name",
            "vendor_address": "Adresse du fournisseur" if is_fr else "Vendor Address",
            "invoice_date": "Date de facture" if is_fr else "Invoice Date",
            "due_date": "Date d'échéance" if is_fr else "Due Date",
            "currency": "Devise" if is_fr else "Currency",
            "subtotal": "Sous-total" if is_fr else "Subtotal",
            "tax_rate": "Taux de taxe" if is_fr else "Tax Rate",
            "tax_amount": "Montant de taxe" if is_fr else "Tax Amount",
            "total_amount": "Montant total" if is_fr else "Total Amount",
            "confidence_score": "Score de confiance" if is_fr else "Confidence Score",
        }
        items_title = "ARTICLES" if is_fr else "LINE ITEMS"
        item_headers = ["N°", "Description", "Quantité", "Prix unitaire", "Total"] if is_fr else ["Item #", "Description", "Quantity", "Unit Price", "Total"]

        for idx, inv in enumerate(invoices):
            if idx > 0:
                writer.writerow([])
                writer.writerow(["=" * 40])
                writer.writerow([])

            if inv.extraction:
                base_data = inv.extraction.parsed_data or {}
                corrections = inv.extraction.human_corrections or {}
                merged = {**base_data, **corrections}

                writer.writerow([summary_title])
                writer.writerow([labels["invoice_number"], merged.get("invoice_number", "")])
                writer.writerow([labels["vendor_name"], merged.get("vendor_name", "")])
                writer.writerow([labels["vendor_address"], merged.get("vendor_address", "")])
                writer.writerow([labels["invoice_date"], merged.get("invoice_date", "")])
                writer.writerow([labels["due_date"], merged.get("due_date", "")])
                writer.writerow([labels["currency"], merged.get("currency", "")])
                writer.writerow([labels["subtotal"], merged.get("subtotal", "")])
                tax_rate = merged.get("tax_rate")
                writer.writerow([labels["tax_rate"], f"{tax_rate}%" if tax_rate is not None else ""])
                writer.writerow([labels["tax_amount"], merged.get("tax_amount", "")])
                writer.writerow([labels["total_amount"], merged.get("total_amount", "")])
                if inv.extraction.confidence_score is not None:
                    writer.writerow([labels["confidence_score"], f"{int(inv.extraction.confidence_score * 100)}%"])
                
                writer.writerow([])
                writer.writerow([items_title])
                writer.writerow(item_headers)
                
                line_items = merged.get("line_items", [])
                for i, item in enumerate(line_items, 1):
                    writer.writerow([
                        i,
                        item.get("description", ""),
                        item.get("quantity", ""),
                        item.get("unit_price", ""),
                        item.get("total", "")
                    ])
        
        output.seek(0)
        filename = f"facture-export-{timestamp}.csv" if is_fr else f"invoice-export-{timestamp}.csv"
        return StreamingResponse(
            output,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
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
