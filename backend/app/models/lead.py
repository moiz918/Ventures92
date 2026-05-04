import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import InteractionType, LeadStatus, PropertyType
from app.models.sa_types import sa_interaction_type, sa_lead_status, sa_property_type

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("properties.id", ondelete="SET NULL")
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text)
    # Reuses the shared sa_property_type — same PostgreSQL enum type as properties.property_type
    preferred_property_type: Mapped[Optional[PropertyType]] = mapped_column(sa_property_type)
    min_budget: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    max_budget: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 2))
    preferred_location: Mapped[Optional[str]] = mapped_column(String(200))
    status: Mapped[LeadStatus] = mapped_column(
        sa_lead_status, nullable=False, default=LeadStatus.NEW
    )
    assigned_agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    property: Mapped[Optional["Property"]] = relationship("Property", back_populates="leads")
    user: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[user_id], back_populates="leads_owned"
    )
    assigned_agent: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[assigned_agent_id], back_populates="leads_assigned"
    )
    interactions: Mapped[List["LeadInteraction"]] = relationship(
        "LeadInteraction", back_populates="lead", cascade="all, delete-orphan"
    )


class LeadInteraction(Base):
    __tablename__ = "lead_interactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("leads.id", ondelete="CASCADE"), nullable=False
    )
    agent_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    interaction_type: Mapped[InteractionType] = mapped_column(
        sa_interaction_type, nullable=False
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    lead: Mapped["Lead"] = relationship("Lead", back_populates="interactions")
    agent: Mapped["User"] = relationship("User", back_populates="lead_interactions")
