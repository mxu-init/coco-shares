from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.app_user_model import AppUser


def find_by_email(session: Session, email: str) -> AppUser | None:
    return session.scalar(select(AppUser).where(AppUser.email == email))


def add(session: Session, user: AppUser) -> AppUser:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
