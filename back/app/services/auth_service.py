from sqlalchemy.orm import Session

from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, verify_password
from app.models.app_user_model import AppUser
from app.repositories import app_user_repository
from app.schemas.auth_schema import TokenRead

INVALID_CREDENTIALS_MESSAGE = "Email o contraseña incorrectos"
INACTIVE_USER_MESSAGE = "Tu usuario está desactivado. Contacta con el administrador"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def authenticate_user(db: Session, email: str, password: str) -> AppUser:
    user = app_user_repository.find_by_email(db, normalize_email(email))
    if user is None or not verify_password(password, user.password_hash):
        raise UnauthorizedError(INVALID_CREDENTIALS_MESSAGE)
    if not user.is_active:
        raise UnauthorizedError(INACTIVE_USER_MESSAGE)
    return user


def login(db: Session, email: str, password: str) -> TokenRead:
    user = authenticate_user(db, email, password)
    return TokenRead(access_token=create_access_token(subject=str(user.id), role=user.role))
