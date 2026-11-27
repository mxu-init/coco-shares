from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.app_user_model import AppUser
from app.schemas.app_user_schema import UserDetailRead
from app.schemas.auth_schema import TokenRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenRead)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenRead:
    return auth_service.login(db, email=form_data.username, password=form_data.password)


@router.get("/me", response_model=UserDetailRead)
def read_current_user(current_user: AppUser = Depends(get_current_user)) -> AppUser:
    return current_user
