from sqlalchemy.orm import Session

from app.core.enums import PersonType, UserRole
from app.core.exceptions import ConflictError, InvalidDataError, NotFoundError
from app.core.tax_id_validators import is_valid_dni_or_nie, is_valid_nif
from app.core.security import generate_temporary_password, hash_password
from app.models.app_user_model import AppUser
from app.models.shareholder_model import Shareholder
from app.schemas.app_user_schema import UserCreate, UserCreatedRead, UserDetailRead, UserPageRead
from app.repositories import app_user_repository


DUPLICATED_EMAIL_MESSAGE = "Ya existe un usuario con ese email"
DUPLICATED_TAX_ID_MESSAGE = "Ya existe un usuario con ese NIF"

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


def find_active_user(db: Session, user_id: int) -> AppUser | None:
    user = app_user_repository.find_by_id(db, user_id)
    if user is None or not user.is_active:
        return None
    return user


def get_user(db: Session, user_id: int) -> AppUser:
    user = app_user_repository.get_detail_by_id(db, user_id)
    if user is None:
        raise NotFoundError("Usuario no encontrado")
    return user


def create_user(db: Session, user_data: UserCreate) -> UserCreatedRead:
    apply_person_type_rules(user_data)
    ensure_shareholder_has_contact(user_data)
    ensure_user_is_unique(db, user_data)
    temporary_password = generate_temporary_password()
    user = app_user_repository.add(db, build_user(user_data, temporary_password))
    created_user = UserDetailRead.model_validate(user)
    return UserCreatedRead(**created_user.model_dump(), temporary_password=temporary_password)


def apply_person_type_rules(user_data: UserCreate) -> None:
    if user_data.person_type == PersonType.INDIVIDUAL:
        ensure_individual_is_valid(user_data)
    else:
        ensure_legal_entity_is_valid(user_data)


def ensure_individual_is_valid(user_data: UserCreate) -> None:
    if not user_data.last_name or not is_valid_dni_or_nie(user_data.tax_id):
        raise InvalidDataError()


def ensure_legal_entity_is_valid(user_data: UserCreate) -> None:
    user_data.last_name = None
    if not is_valid_nif(user_data.tax_id):
        raise InvalidDataError()


def ensure_shareholder_has_contact(user_data: UserCreate) -> None:
    if user_data.shareholder is not None and not (user_data.phone and user_data.address):
        raise InvalidDataError()


def ensure_user_is_unique(db: Session, user_data: UserCreate) -> None:
    if app_user_repository.find_by_email(db, user_data.email) is not None:
        raise ConflictError(DUPLICATED_EMAIL_MESSAGE)
    if app_user_repository.find_by_tax_id(db, user_data.tax_id) is not None:
        raise ConflictError(DUPLICATED_TAX_ID_MESSAGE)


def build_user(user_data: UserCreate, temporary_password: str) -> AppUser:
    user = AppUser(
        **user_data.model_dump(exclude={"shareholder"}),
        password_hash=hash_password(temporary_password),
        must_change_password=True,
    )
    if user_data.shareholder is not None:
        user.shareholder = Shareholder(**user_data.shareholder.model_dump())
    return user
