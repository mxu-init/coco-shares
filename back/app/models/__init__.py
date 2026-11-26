from app.core.database import Base, engine
from app.models.user_model import User

__all__ = ["User", "create_tables"]


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
