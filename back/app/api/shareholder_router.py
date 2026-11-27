from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_roles
from app.core.enums import UserRole
from app.schemas.shareholder_schema import ShareholderPublicPageRead
from app.services import shareholder_service

FIRST_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

router = APIRouter(
    prefix="/shareholders",
    tags=["shareholders"],
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER))],
)


@router.get("", response_model=ShareholderPublicPageRead)
def list_shareholders(
    page: int = Query(FIRST_PAGE, ge=FIRST_PAGE),
    size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    db: Session = Depends(get_db),
) -> ShareholderPublicPageRead:
    return shareholder_service.list_shareholders(db, page=page, size=size)
