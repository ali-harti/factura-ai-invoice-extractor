import uuid

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base


class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    invoice_id = Column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    raw_model_response = Column(String, nullable=True)
    parsed_data = Column(JSON, nullable=True)
    human_corrections = Column(JSON, nullable=True)

    confidence_score = Column(Float, nullable=True)
    language_detected = Column(String, nullable=True)
    model_used = Column(String, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="extraction")
