from app.core.database import Base, engine
from app.models.app_user_model import AppUser
from app.models.document_model import Document
from app.models.meeting_call_model import MeetingCall
from app.models.meeting_model import Meeting
from app.models.page_content_model import PageContent
from app.models.representation_form_model import RepresentationForm
from app.models.shareholder_model import Shareholder

__all__ = [
    "AppUser",
    "Document",
    "Meeting",
    "MeetingCall",
    "PageContent",
    "RepresentationForm",
    "Shareholder",
    "create_tables",
]


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
