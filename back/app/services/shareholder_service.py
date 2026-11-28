from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidDataError, NotFoundError
from app.models.app_user_model import AppUser
from app.models.shareholder_model import Shareholder
from app.repositories import shareholder_repository
from app.schemas.app_user_schema import ShareholderCreate
from app.schemas.shareholder_schema import ShareholderPublicPageRead, ShareholderUpdate
from app.services import app_user_service

SHAREHOLDER_ALREADY_EXISTS_MESSAGE = "El usuario ya tiene una ficha de accionista"
SHAREHOLDER_NOT_FOUND_MESSAGE = "El usuario no tiene ficha de accionista"
SHAREHOLDER_HAS_DEPENDENCIES_MESSAGE = "No se puede eliminar la ficha porque tiene boletines de representación"
SHAREHOLDER_CONTACT_REQUIRED_MESSAGE = "El usuario debe tener teléfono y dirección para tener ficha de accionista"
EDITABLE_SHAREHOLDER_FIELDS = tuple(ShareholderCreate.model_fields)


def list_shareholders(db: Session, *, page: int, size: int) -> ShareholderPublicPageRead:
    items, total = shareholder_repository.list_public_paginated(db, page=page, size=size)
    return ShareholderPublicPageRead(items=items, total=total, page=page, size=size)


def create_shareholder(db: Session, user_id: int, shareholder_data: ShareholderCreate) -> Shareholder:
    user = app_user_service.get_user(db, user_id)
    if user.shareholder is not None:
        raise ConflictError(SHAREHOLDER_ALREADY_EXISTS_MESSAGE)
    ensure_user_has_contact(user)
    shareholder = Shareholder(user_id=user.id, **shareholder_data.model_dump())
    try:
        return shareholder_repository.add(db, shareholder)
    except IntegrityError:
        db.rollback()
        raise ConflictError(SHAREHOLDER_ALREADY_EXISTS_MESSAGE) from None


def update_shareholder(db: Session, user_id: int, changes: ShareholderUpdate) -> Shareholder:
    shareholder = get_user_shareholder(db, user_id)
    shareholder_data = merge_shareholder_changes(shareholder, changes)
    for field, value in shareholder_data.model_dump().items():
        setattr(shareholder, field, value)
    return shareholder_repository.save(db, shareholder)


def delete_shareholder(db: Session, user_id: int) -> None:
    shareholder = get_user_shareholder(db, user_id)
    if shareholder_repository.has_representation_forms(db, shareholder.id):
        raise ConflictError(SHAREHOLDER_HAS_DEPENDENCIES_MESSAGE)
    shareholder_repository.delete(db, shareholder)


def get_user_shareholder(db: Session, user_id: int) -> Shareholder:
    user = app_user_service.get_user(db, user_id)
    if user.shareholder is None:
        raise NotFoundError(SHAREHOLDER_NOT_FOUND_MESSAGE)
    return user.shareholder


def ensure_user_has_contact(user: AppUser) -> None:
    if not (user.phone and user.address):
        raise InvalidDataError(SHAREHOLDER_CONTACT_REQUIRED_MESSAGE)


def merge_shareholder_changes(shareholder: Shareholder, changes: ShareholderUpdate) -> ShareholderCreate:
    shareholder_values = {field: getattr(shareholder, field) for field in EDITABLE_SHAREHOLDER_FIELDS}
    shareholder_values.update(changes.model_dump(exclude_unset=True))
    try:
        return ShareholderCreate.model_validate(shareholder_values)
    except ValidationError as error:
        raise RequestValidationError(error.errors(include_url=False)) from None
