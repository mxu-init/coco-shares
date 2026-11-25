from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import UserRole
from app.core.security import hash_password
from app.models.user_model import User
from app.repositories import user_repository


def create_first_admin(session: Session) -> None:
    if user_repository.find_by_email(session, settings.ADMIN_EMAIL) is not None:
        return
    admin = User(
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        full_name=settings.ADMIN_FULL_NAME,
        role=UserRole.ADMIN,
    )
    user_repository.add(session, admin)


def seed_initial_data(session: Session) -> None:
    create_first_admin(session)
