from sqlalchemy.orm import Session

from app.models.test_model import TestModel
from app.repositories import test_repository
from app.schemas.test_schema import TestCreate


def create_test(db: Session, test: TestCreate) -> TestModel:
    return test_repository.create_test(
        db, test_name=test.test_name, test_type=test.test_type
    )
