from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database_connection import get_db
from app.models.test_model import TestModel
from app.schemas.test_schema import TestCreate, TestRead
from app.services import test_service

router = APIRouter(prefix="/test", tags=["Test"])


@router.post("/", status_code=201, response_model=TestRead)
def create_new_test(test: TestCreate, db: Session = Depends(get_db)) -> TestModel:
    return test_service.create_test(db=db, test=test)
