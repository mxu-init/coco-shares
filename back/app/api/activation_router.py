from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.activation_schema import ActivationRequest
from app.services import activation_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/activate", status_code=status.HTTP_204_NO_CONTENT)
def activate_account(activation_data: ActivationRequest, db: Session = Depends(get_db)) -> None:
    activation_service.activate_account(db, activation_data)
