import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import UserRole
from app.models.sa_types import sa_user_role

if TYPE_CHECKING:
    from app.models.lead import Lead, LeadInteraction


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    role: Mapped[UserRole] = mapped_column(
        sa_user_role, nullable=False, default=UserRole.INVESTOR
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    leads_owned: Mapped[List["Lead"]] = relationship(
        "Lead", foreign_keys="Lead.user_id", back_populates="user"
    )
    leads_assigned: Mapped[List["Lead"]] = relationship(
        "Lead", foreign_keys="Lead.assigned_agent_id", back_populates="assigned_agent"
    )
    lead_interactions: Mapped[List["LeadInteraction"]] = relationship(
        "LeadInteraction", back_populates="agent"
    )
