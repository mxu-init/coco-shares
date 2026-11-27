from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_roles
from app.core.enums import PersonType, UserRole
from app.models.app_user_model import AppUser
from app.schemas.app_user_schema import (
    TemporaryPasswordRead,
    UserCreate,
    UserCreatedRead,
    UserDetailRead,
    UserPageRead,
    UserStatusUpdate,
    UserUpdate,
)
from app.services import app_user_service

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


@router.post("", response_model=UserCreatedRead, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)) -> UserCreatedRead:
    return app_user_service.create_user(db, user_data)


@router.patch("/{user_id}", response_model=UserDetailRead)
def update_user(
    user_id: int,
    changes: UserUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppUser:
    return app_user_service.update_user(db, user_id, changes, current_user)


@router.patch("/{user_id}/status", response_model=UserDetailRead)
def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppUser:
    return app_user_service.update_user_status(db, user_id, status_data.is_active, current_user)


@router.patch("/{user_id}/password", response_model=TemporaryPasswordRead)
def reset_user_password(user_id: int, db: Session = Depends(get_db)) -> TemporaryPasswordRead:
    return app_user_service.reset_user_password(db, user_id)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: AppUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    app_user_service.delete_user(db, user_id, current_user)
