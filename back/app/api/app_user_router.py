from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_roles
from app.core.enums import PersonType, UserRole
from app.schemas.app_user_schema import UserCreate, UserDetailRead, UserPageRead
from app.services import app_user_service
from app.models.app_user_model import AppUser

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.get("", response_model=UserPageRead)
def list_users(
    search: str | None = Query(None, description="Nombre, apellidos, email o NIF"),
    role: UserRole | None = None,
    person_type: PersonType | None = None,
    is_active: bool | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> UserPageRead:
    return app_user_service.list_users(
        db,
        search=search,
        role=role,
        person_type=person_type,
        is_active=is_active,
        page=page,
        size=size,
    )


@router.get("/{user_id}", response_model=UserDetailRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return app_user_service.get_user(db, user_id)


@router.post("", response_model=UserDetailRead, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)) -> AppUser:
    return app_user_service.create_user(db, user_data)