from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.page_content_model import PageContent


def find_by_page_key(session: Session, page_key: str) -> PageContent | None:
    return session.scalar(select(PageContent).where(PageContent.page_key == page_key))


def add(session: Session, page_content: PageContent) -> PageContent:
    session.add(page_content)
    session.commit()
    session.refresh(page_content)
    return page_content
