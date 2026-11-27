from sqlalchemy.orm import Session

from seeders.first_admin_seeder import seed_first_admin
from seeders.page_content_seeder import seed_page_contents


def seed_initial_data(session: Session) -> None:
    seed_first_admin(session)
    seed_page_contents(session)
