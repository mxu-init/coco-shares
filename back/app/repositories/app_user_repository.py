from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.enums import PersonType, UserRole
from app.models.app_user_model import AppUser


def find_by_email(session: Session, email: str) -> AppUser | None:
    return session.scalar(select(AppUser).where(AppUser.email == email))
    
def find_by_tax_id(session: Session, tax_id: str) -> AppUser | None:
    return session.scalar(select(AppUser).where(AppUser.tax_id == tax_id))

def find_by_id(session: Session, user_id: int) -> AppUser | None:
    return session.get(AppUser, user_id)


def add(session: Session, user: AppUser) -> AppUser:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def list_paginated(
    db: Session,
    *,
    search: str | None,
    role: UserRole | None,
    person_type: PersonType | None,
    is_active: bool | None,
    page: int,
    size: int,
) -> tuple[list[AppUser], int]:
    stmt = select(AppUser)

    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                AppUser.first_name.ilike(like),
                AppUser.last_name.ilike(like),
                AppUser.email.ilike(like),
                AppUser.tax_id.ilike(like),
            )
        )
    if role is not None:
        stmt = stmt.where(AppUser.role == role)
    if person_type is not None:
        stmt = stmt.where(AppUser.person_type == person_type)
    if is_active is not None:
        stmt = stmt.where(AppUser.is_active == is_active)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.scalars(
        stmt.order_by(AppUser.last_name.asc().nulls_last(), AppUser.first_name, AppUser.id)
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return list(items), total


def get_detail_by_id(db: Session, user_id: int) -> AppUser | None:
    stmt = (
        select(AppUser)
        .options(joinedload(AppUser.shareholder))
        .where(AppUser.id == user_id)
    )
    return db.scalars(stmt).first()
