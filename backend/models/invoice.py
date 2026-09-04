import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

class Base(DeclarativeBase):
    pass

class InvoiceStatus(str, Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    original_filename: Mapped[str] = mapped_column(String, nullable=False)
    storage_path: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(SQLAlchemyEnum(InvoiceStatus), default=InvoiceStatus.queued)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="invoices")
    extraction = relationship("Extraction", back_populates="invoice", cascade="all, delete-orphan", uselist=False)

class Extraction(Base):
    __tablename__ = "extractions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, unique=True)
    raw_model_response: Mapped[str] = mapped_column(String, nullable=False)
    parsed_data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    human_corrections: Mapped[dict] = mapped_column(JSONB, default=dict)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    language_detected: Mapped[str] = mapped_column(String, nullable=True)
    model_used: Mapped[str] = mapped_column(String, nullable=True)
    exported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    invoice = relationship("Invoice", back_populates="extraction")
