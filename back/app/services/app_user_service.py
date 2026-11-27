from sqlalchemy.orm import Session

from app.core.enums import PersonType, UserRole
from app.core.exceptions import NotFoundError
from app.models.app_user_model import AppUser
from app.repositories import app_user_repository
from app.schemas.app_user_schema import UserPageRead


def list_users(
    db: Session,
    *,
    search: str | None,
    role: UserRole | None,
    person_type: PersonType | None,
    is_active: bool | None,
    page: int,
    size: int,
) -> UserPageRead:
    items, total = app_user_repository.list_paginated(
        db,
        search=search,
        role=role,
        person_type=person_type,
        is_active=is_active,
        page=page,
        size=size,
    )
    return UserPageRead(items=items, total=total, page=page, size=size)


def get_user(db: Session, user_id: int) -> AppUser:
    user = app_user_repository.get_detail_by_id(db, user_id)
    if user is None:
        raise NotFoundError("Usuario no encontrado")
    return user