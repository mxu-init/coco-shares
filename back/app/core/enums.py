from enum import Enum

class UserRole(str, Enum):
    SHAREHOLDER = "shareholder"
    MANAGER = "manager"
    ADMIN = "admin"

class HealthStatus(str, Enum):
    OK = "ok"

class PersonType(str, Enum):
    INDIVIDUAL = "individual"
    LEGAL_ENTITY = "legal_entity"