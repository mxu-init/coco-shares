import hashlib
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.enums import UserRole

password_hasher = PasswordHash.recommended()

PASSWORD_MIN_LENGTH = 12
PASSWORD_MAX_LENGTH = 128
PASSWORD_SPECIAL_CHARACTERS = "!@#$%&*?-_+="
PASSWORD_CHARACTER_GROUPS = (
    string.ascii_uppercase,
    string.ascii_lowercase,
    string.digits,
    PASSWORD_SPECIAL_CHARACTERS,
)
UNUSABLE_PASSWORD_BYTES = 32
REQUIRED_TOKEN_CLAIMS = ["exp", "sub"]
ACTIVATION_TOKEN_AUDIENCE = "activation"
ACTIVATION_TOKEN_EXPIRE_HOURS = 48
REQUIRED_ACTIVATION_TOKEN_CLAIMS = ["exp", "sub", "aud", "fingerprint"]


def hash_password(plain_password: str) -> str:
    return password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return password_hasher.verify(plain_password, password_hash)


def create_access_token(subject: str, role: UserRole) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": subject, "role": role.value, "exp": expires_at}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": REQUIRED_TOKEN_CLAIMS},
    )


def is_strong_password(password: str) -> bool:
    return PASSWORD_MIN_LENGTH <= len(password) <= PASSWORD_MAX_LENGTH and all(
        any(character in group for character in password) for group in PASSWORD_CHARACTER_GROUPS
    )


def generate_unusable_password() -> str:
    return secrets.token_urlsafe(UNUSABLE_PASSWORD_BYTES)


def password_hash_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode()).hexdigest()


def create_activation_token(user_id: int, password_hash: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ACTIVATION_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user_id),
        "aud": ACTIVATION_TOKEN_AUDIENCE,
        "fingerprint": password_hash_fingerprint(password_hash),
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_activation_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        audience=ACTIVATION_TOKEN_AUDIENCE,
        options={"require": REQUIRED_ACTIVATION_TOKEN_CLAIMS},
    )
