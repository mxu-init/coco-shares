from sqlalchemy import Row, func, select
from sqlalchemy.orm import Session

from app.models.app_user_model import AppUser
from app.models.representation_form_model import RepresentationForm
from app.models.shareholder_model import Shareholder

PUBLIC_SHAREHOLDER_COLUMNS = (
    Shareholder.id,
    AppUser.first_name,
    AppUser.last_name,
    Shareholder.representative_name,
    Shareholder.shares_count,
    Shareholder.shares_percentage,
    Shareholder.share_capital,
)


def list_public_paginated(db: Session, *, page: int, size: int) -> tuple[list[Row], int]:
    total = db.scalar(select(func.count()).select_from(Shareholder)) or 0
    rows = db.execute(
        select(*PUBLIC_SHAREHOLDER_COLUMNS)
        .join(Shareholder.user)
        .order_by(Shareholder.shares_count.desc(), Shareholder.id)
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return list(rows), total


def add(db: Session, shareholder: Shareholder) -> Shareholder:
    db.add(shareholder)
    db.commit()
    db.refresh(shareholder)
    return shareholder


def save(db: Session, shareholder: Shareholder) -> Shareholder:
    db.commit()
    db.refresh(shareholder)
    return shareholder


def delete(db: Session, shareholder: Shareholder) -> None:
    db.delete(shareholder)
    db.commit()


def has_representation_forms(db: Session, shareholder_id: int) -> bool:
    stmt = select(RepresentationForm.id).where(RepresentationForm.shareholder_id == shareholder_id).limit(1)
    return db.scalar(stmt) is not None
