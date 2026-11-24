from sqlalchemy.orm import Session

from app.models.test_model import TestModel


def create_test(db: Session, test_name: str, test_type: str) -> TestModel:
    db_test = TestModel(test_name=test_name, test_type=test_type)
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test
