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
        raise UnauthorizedError("La sesión no es válida o ha caducado") from None


def require_roles(*allowed_roles: UserRole) -> Callable[..., dict[str, Any]]:
    allowed_role_values = {role.value for role in allowed_roles}

    def check_role(payload: dict[str, Any] = Depends(get_token_payload)) -> dict[str, Any]:
        if payload.get("role") not in allowed_role_values:
            raise PermissionDeniedError()
        return payload

    return check_role
