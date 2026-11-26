from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_model import User


def find_by_email(session: Session, email: str) -> User | None:
    return session.scalar(select(User).where(User.email == email))


def add(session: Session, user: User) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
