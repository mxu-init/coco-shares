from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import PersonType, UserRole
from app.core.security import hash_password
from app.models.app_user_model import AppUser
from app.repositories import app_user_repository


def seed_first_admin(session: Session) -> None:
    if app_user_repository.find_by_email(session, settings.FIRST_ADMIN_EMAIL) is not None:
        return
    admin = AppUser(
        role=UserRole.ADMIN,
        person_type=PersonType.INDIVIDUAL,
        first_name=settings.FIRST_ADMIN_FIRST_NAME,
        last_name=settings.FIRST_ADMIN_LAST_NAME,
        tax_id=settings.FIRST_ADMIN_TAX_ID,
        email=settings.FIRST_ADMIN_EMAIL,
        password_hash=hash_password(settings.FIRST_ADMIN_PASSWORD),
    )
    app_user_repository.add(session, admin)
