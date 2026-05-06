import enum


class UserRole(enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    AGENT = "AGENT"
    INVESTOR = "INVESTOR"
    BUYER_TENANT = "BUYER_TENANT"


class ProjectStatus(enum.Enum):
    PLANNING = "PLANNING"
    UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION"
    COMPLETED = "COMPLETED"


class PropertyType(enum.Enum):
    RESIDENTIAL = "RESIDENTIAL"
    COMMERCIAL = "COMMERCIAL"


class PropertyCategory(enum.Enum):
    PLOT = "PLOT"
    HOUSE = "HOUSE"
    APARTMENT = "APARTMENT"
    OFFICE = "OFFICE"
    SHOP = "SHOP"


class AreaUnit(enum.Enum):
    SQ_FT = "SQ_FT"
    SQ_YARD = "SQ_YARD"
    MARLA = "MARLA"
    KANAL = "KANAL"


class AvailabilityStatus(enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"


class MediaType(enum.Enum):
    IMAGE = "IMAGE"
    FLOOR_PLAN = "FLOOR_PLAN"
    VIDEO_LINK = "VIDEO_LINK"
    DOCUMENT = "DOCUMENT"


class MilestoneStatus(enum.Enum):
    EXCAVATION = "EXCAVATION"
    STRUCTURE = "STRUCTURE"
    FINISHING = "FINISHING"
    READY_FOR_POSSESSION = "READY_FOR_POSSESSION"
    DELIVERED = "DELIVERED"


class LeadStatus(enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    IN_PROGRESS = "IN_PROGRESS"
    QUALIFIED = "QUALIFIED"
    LOST = "LOST"
    CLOSED = "CLOSED"


class InteractionType(enum.Enum):
    NOTE = "NOTE"
    CALL = "CALL"
    EMAIL = "EMAIL"
    MEETING = "MEETING"
