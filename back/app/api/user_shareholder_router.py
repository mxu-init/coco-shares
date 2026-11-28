from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_roles
from app.core.enums import UserRole
from app.models.shareholder_model import Shareholder
from app.schemas.app_user_schema import ShareholderCreate, ShareholderRead
from app.schemas.shareholder_schema import ShareholderUpdate
from app.services import shareholder_service

router = APIRouter(
    prefix="/users/{user_id}/shareholder",
    tags=["shareholders"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.post("", response_model=ShareholderRead, status_code=status.HTTP_201_CREATED)
def create_shareholder(
    user_id: int, shareholder_data: ShareholderCreate, db: Session = Depends(get_db)
) -> Shareholder:
    return shareholder_service.create_shareholder(db, user_id, shareholder_data)


@router.patch("", response_model=ShareholderRead)
def update_shareholder(user_id: int, changes: ShareholderUpdate, db: Session = Depends(get_db)) -> Shareholder:
    return shareholder_service.update_shareholder(db, user_id, changes)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_shareholder(user_id: int, db: Session = Depends(get_db)) -> None:
    shareholder_service.delete_shareholder(db, user_id)
