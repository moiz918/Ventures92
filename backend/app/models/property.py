import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, SmallInteger, String, Table, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.enums import AreaUnit, AvailabilityStatus, MediaType, PropertyCategory, PropertyType
from app.models.sa_types import (
    sa_area_unit,
    sa_availability_status,
    sa_media_type,
    sa_property_category,
    sa_property_type,
)

if TYPE_CHECKING:
    from app.models.lead import Lead
    from app.models.project import Project


# Association table — no extra columns, so a plain Table object is correct.
property_amenities = Table(
    "property_amenities",
    Base.metadata,
    Column("property_id", ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    property_type: Mapped[PropertyType] = mapped_column(sa_property_type, nullable=False)
    property_category: Mapped[PropertyCategory] = mapped_column(sa_property_category, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    area_size: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    area_unit: Mapped[AreaUnit] = mapped_column(sa_area_unit, nullable=False)
    bedrooms: Mapped[Optional[int]] = mapped_column(SmallInteger)
    bathrooms: Mapped[Optional[int]] = mapped_column(SmallInteger)
    address_details: Mapped[Optional[str]] = mapped_column(String(255))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    availability_status: Mapped[AvailabilityStatus] = mapped_column(
        sa_availability_status, nullable=False, default=AvailabilityStatus.AVAILABLE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    project: Mapped[Optional["Project"]] = relationship("Project", back_populates="properties")
    media: Mapped[List["PropertyMedia"]] = relationship(
        "PropertyMedia", back_populates="property", cascade="all, delete-orphan"
    )
    amenities: Mapped[List["Amenity"]] = relationship(
        "Amenity", secondary=property_amenities, back_populates="properties"
    )
    leads: Mapped[List["Lead"]] = relationship("Lead", back_populates="property")


class PropertyMedia(Base):
    __tablename__ = "property_media"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"), nullable=False
    )
    media_type: Mapped[MediaType] = mapped_column(
        sa_media_type, nullable=False, default=MediaType.IMAGE
    )
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="media")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    icon_name: Mapped[Optional[str]] = mapped_column(String(100))

    properties: Mapped[List["Property"]] = relationship(
        "Property", secondary=property_amenities, back_populates="amenities"
    )
