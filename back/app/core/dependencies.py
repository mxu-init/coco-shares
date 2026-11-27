from collections.abc import Callable, Iterator
from typing import Any

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.enums import UserRole
from app.core.exceptions import PermissionDeniedError, UnauthorizedError
from app.core.security import decode_access_token
from app.models.app_user_model import AppUser
from app.services import app_user_service

INVALID_SESSION_MESSAGE = "La sesión no es válida o ha caducado"

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/token",
    auto_error=False,
)


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session


def get_token_payload(token: str | None = Depends(oauth2_scheme)) -> dict[str, Any]:
    if token is None:
        raise UnauthorizedError()
    try:
        return decode_access_token(token)
    except jwt.PyJWTError:
        raise UnauthorizedError(INVALID_SESSION_MESSAGE) from None


def get_current_user(
    payload: dict[str, Any] = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> AppUser:
    subject = str(payload.get("sub"))
    if not (subject.isascii() and subject.isdigit()):
        raise UnauthorizedError(INVALID_SESSION_MESSAGE)
    user = app_user_service.find_active_user(db, int(subject))
    if user is None:
        raise UnauthorizedError(INVALID_SESSION_MESSAGE)
    return user


def require_roles(*allowed_roles: UserRole) -> Callable[..., AppUser]:
    def check_role(current_user: AppUser = Depends(get_current_user)) -> AppUser:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedError()
        return current_user

    return check_role
