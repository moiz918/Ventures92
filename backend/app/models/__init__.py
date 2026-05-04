# Import every model so SQLAlchemy registers them against Base.metadata
# and Alembic can detect the full schema during autogenerate.
from app.models.corporate_partner import CorporatePartner  # noqa: F401
from app.models.lead import Lead, LeadInteraction  # noqa: F401
from app.models.location import Location  # noqa: F401
from app.models.project import Project, ProjectMilestone  # noqa: F401
from app.models.property import Amenity, Property, PropertyMedia, property_amenities  # noqa: F401
from app.models.site_setting import SiteSetting  # noqa: F401
from app.models.user import User  # noqa: F401
