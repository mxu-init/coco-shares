from enum import StrEnum

class UserRole(StrEnum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"


class PersonType(StrEnum):
    INDIVIDUAL = "individual"
    LEGAL_ENTITY = "legal_entity"


class MeetingType(StrEnum):
    ORDINARY = "ordinary"
    EXTRAORDINARY = "extraordinary"


class MeetingStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"


class RepresentationFormStatus(StrEnum):
    SENT = "sent"
    FAILED = "failed"


class PageKey(StrEnum):
    DEFAULT_LEGAL_TERMS = "default_legal_terms"
    NO_ACTIVE_MEETING = "no_active_meeting"
    DEFAULT_ANNOUNCEMENT = "default_announcement"


class HealthStatus(StrEnum):
    OK = "ok"
