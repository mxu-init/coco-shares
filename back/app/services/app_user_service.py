from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.enums import PersonType, UserRole
from app.core.exceptions import ConflictError, InvalidDataError, NotFoundError
from app.core.tax_id_validators import is_valid_dni_or_nie, is_valid_nif
from app.core.security import generate_temporary_password, hash_password
from app.models.app_user_model import AppUser
from app.models.shareholder_model import Shareholder
from app.schemas.app_user_schema import (
    ShareholderUpdate,
    TemporaryPasswordRead,
    UserCreate,
    UserCreatedRead,
    UserDetailRead,
    UserPageRead,
    UserUpdate,
)
from app.repositories import app_user_repository


DUPLICATED_EMAIL_MESSAGE = "Ya existe un usuario con ese email"
DUPLICATED_TAX_ID_MESSAGE = "Ya existe un usuario con ese NIF"
USER_NOT_FOUND_MESSAGE = "Usuario no encontrado"
SELF_ADMIN_ROLE_REMOVAL_MESSAGE = "No puede quitarse a sí mismo el rol de administrador"
SELF_DEACTIVATION_MESSAGE = "No puede desactivar su propio usuario"
SELF_DELETION_MESSAGE = "No puede borrar su propio usuario"
LAST_ACTIVE_ADMIN_MESSAGE = "Debe quedar al menos un administrador activo"
MIN_ACTIVE_ADMINS = 1
EDITABLE_USER_FIELDS = ("role", "person_type", "first_name", "last_name", "email", "tax_id", "phone", "address")
EDITABLE_SHAREHOLDER_FIELDS = (
    "representative_name",
    "representative_tax_id",
    "shares_count",
    "shares_percentage",
    "share_capital",
)

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
        raise NotFoundError(USER_NOT_FOUND_MESSAGE)
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


def ensure_user_is_unique(db: Session, user_data: UserCreate, current_user_id: int | None = None) -> None:
    if is_taken_by_another_user(app_user_repository.find_by_email(db, user_data.email), current_user_id):
        raise ConflictError(DUPLICATED_EMAIL_MESSAGE)
    if is_taken_by_another_user(app_user_repository.find_by_tax_id(db, user_data.tax_id), current_user_id):
        raise ConflictError(DUPLICATED_TAX_ID_MESSAGE)


def is_taken_by_another_user(found_user: AppUser | None, current_user_id: int | None) -> bool:
    return found_user is not None and found_user.id != current_user_id


def build_user(user_data: UserCreate, temporary_password: str) -> AppUser:
    user = AppUser(
        **user_data.model_dump(exclude={"shareholder"}),
        password_hash=hash_password(temporary_password),
        must_change_password=True,
    )
    if user_data.shareholder is not None:
        user.shareholder = Shareholder(**user_data.shareholder.model_dump())
    return user


def update_user(db: Session, user_id: int, changes: UserUpdate, current_user: AppUser) -> AppUser:
    user = get_user(db, user_id)
    user_data = merge_user_changes(user, changes)
    if user.role == UserRole.ADMIN and user_data.role != UserRole.ADMIN:
        protect_admin_access(db, user, current_user, SELF_ADMIN_ROLE_REMOVAL_MESSAGE)
    apply_person_type_rules(user_data)
    ensure_shareholder_has_contact(user_data)
    ensure_user_is_unique(db, user_data, current_user_id=user.id)
    apply_user_changes(user, user_data)
    return app_user_repository.save(db, user)


def merge_user_changes(user: AppUser, changes: UserUpdate) -> UserCreate:
    user_values = {field: getattr(user, field) for field in EDITABLE_USER_FIELDS}
    user_values.update(changes.model_dump(exclude_unset=True, exclude={"shareholder"}))
    user_values["shareholder"] = merge_shareholder_changes(user, changes.shareholder)
    try:
        return UserCreate.model_validate(user_values)
    except ValidationError:
        raise InvalidDataError() from None


def merge_shareholder_changes(user: AppUser, changes: ShareholderUpdate | None) -> dict | None:
    shareholder_values = read_shareholder_values(user)
    if changes is not None:
        shareholder_values.update(changes.model_dump(exclude_unset=True))
    return shareholder_values or None


def read_shareholder_values(user: AppUser) -> dict:
    if user.shareholder is None:
        return {}
    return {field: getattr(user.shareholder, field) for field in EDITABLE_SHAREHOLDER_FIELDS}


def apply_user_changes(user: AppUser, user_data: UserCreate) -> None:
    for field, value in user_data.model_dump(exclude={"shareholder"}).items():
        setattr(user, field, value)
    if user_data.shareholder is not None:
        apply_shareholder_changes(user, user_data.shareholder.model_dump())


def apply_shareholder_changes(user: AppUser, shareholder_values: dict) -> None:
    if user.shareholder is None:
        user.shareholder = Shareholder(**shareholder_values)
        return
    for field, value in shareholder_values.items():
        setattr(user.shareholder, field, value)


def update_user_status(db: Session, user_id: int, is_active: bool, current_user: AppUser) -> AppUser:
    user = get_user(db, user_id)
    if not is_active:
        protect_admin_access(db, user, current_user, SELF_DEACTIVATION_MESSAGE)
    user.is_active = is_active
    return app_user_repository.save(db, user)


def reset_user_password(db: Session, user_id: int) -> TemporaryPasswordRead:
    user = get_user(db, user_id)
    temporary_password = generate_temporary_password()
    user.password_hash = hash_password(temporary_password)
    user.must_change_password = True
    app_user_repository.save(db, user)
    return TemporaryPasswordRead(temporary_password=temporary_password)


def delete_user(db: Session, user_id: int, current_user: AppUser) -> None:
    user = get_user(db, user_id)
    protect_admin_access(db, user, current_user, SELF_DELETION_MESSAGE)
    app_user_repository.delete(db, user)


def protect_admin_access(db: Session, user: AppUser, current_user: AppUser, self_action_message: str) -> None:
    if user.id == current_user.id:
        raise ConflictError(self_action_message)
    if is_active_admin(user) and app_user_repository.count_active_admins(db) <= MIN_ACTIVE_ADMINS:
        raise ConflictError(LAST_ACTIVE_ADMIN_MESSAGE)


def is_active_admin(user: AppUser) -> bool:
    return user.role == UserRole.ADMIN and user.is_active
