"""add must change password to app user

Revision ID: c7eae1c6d6eb
Revises: 13b7c0aa59d5
Create Date: 2026-11-27 12:43:17.802594

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'c7eae1c6d6eb'
down_revision: str | Sequence[str] | None = '13b7c0aa59d5'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('app_user', sa.Column('must_change_password', sa.Boolean(), server_default=sa.text('true'), nullable=False))


def downgrade() -> None:
    op.drop_column('app_user', 'must_change_password')
