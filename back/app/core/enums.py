from enum import Enum


class UserRole(str, Enum):
    SHAREHOLDER = "shareholder"
    MANAGER = "manager"
    ADMIN = "admin"


class HealthStatus(str, Enum):
    OK = "ok"
