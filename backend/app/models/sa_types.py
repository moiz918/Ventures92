"""
Shared SQLAlchemy Enum type instances.

Defining each SA Enum exactly once guarantees Alembic sees a single
PostgreSQL type object per enum, preventing duplicate-CREATE or
name-clash errors during autogenerate.
"""
from sqlalchemy import Enum as SAEnum

from app.models.enums import (
    AreaUnit,
    AvailabilityStatus,
    InteractionType,
    LeadStatus,
    MediaType,
    MilestoneStatus,
    ProjectStatus,
    PropertyCategory,
    PropertyType,
    UserRole,
)

sa_user_role = SAEnum(UserRole, name="user_role")
sa_project_status = SAEnum(ProjectStatus, name="project_status")
sa_property_type = SAEnum(PropertyType, name="property_type")
sa_property_category = SAEnum(PropertyCategory, name="property_category")
sa_area_unit = SAEnum(AreaUnit, name="area_unit")
sa_availability_status = SAEnum(AvailabilityStatus, name="availability_status")
sa_media_type = SAEnum(MediaType, name="media_type")
sa_milestone_status = SAEnum(MilestoneStatus, name="milestone_status")
sa_lead_status = SAEnum(LeadStatus, name="lead_status")
sa_interaction_type = SAEnum(InteractionType, name="interaction_type")
