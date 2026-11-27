from sqlalchemy.orm import Session

from app.repositories import shareholder_repository
from app.schemas.shareholder_schema import ShareholderPublicPageRead


def list_shareholders(db: Session, *, page: int, size: int) -> ShareholderPublicPageRead:
    items, total = shareholder_repository.list_public_paginated(db, page=page, size=size)
    return ShareholderPublicPageRead(items=items, total=total, page=page, size=size)
