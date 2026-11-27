import jwt
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDataError
from app.core.security import (
    decode_activation_token,
    hash_password,
    is_strong_password,
    password_hash_fingerprint,
)
from app.models.app_user_model import AppUser
from app.repositories import app_user_repository
from app.schemas.activation_schema import ActivationRequest
from app.services import app_user_service


def activate_account(db: Session, activation_data: ActivationRequest) -> None:
    user = find_user_to_activate(db, activation_data.token)
    if not is_strong_password(activation_data.new_password):
        raise InvalidDataError()
    user.password_hash = hash_password(activation_data.new_password)
    app_user_repository.add(db, user)


def find_user_to_activate(db: Session, token: str) -> AppUser:
    try:
        payload = decode_activation_token(token)
    except jwt.PyJWTError:
        raise InvalidDataError() from None
    subject = payload["sub"]
    if not (subject.isascii() and subject.isdigit()):
        raise InvalidDataError()
    user = app_user_service.find_active_user(db, int(subject))
    if user is None or payload["fingerprint"] != password_hash_fingerprint(user.password_hash):
        raise InvalidDataError()
    return user
