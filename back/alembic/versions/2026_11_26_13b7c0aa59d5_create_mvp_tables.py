"""create mvp tables

Revision ID: 13b7c0aa59d5
Revises: 
Create Date: 2026-11-26 11:32:56.275768

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '13b7c0aa59d5'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('app_user',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('role', sa.Enum('admin', 'manager', 'user', name='role', native_enum=False, create_constraint=True), nullable=False),
    sa.Column('person_type', sa.Enum('individual', 'legal_entity', name='person_type', native_enum=False, create_constraint=True), nullable=False),
    sa.Column('first_name', sa.String(length=100), nullable=False),
    sa.Column('last_name', sa.String(length=150), nullable=True),
    sa.Column('tax_id', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('address', sa.String(length=255), nullable=True),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_app_user')),
    sa.UniqueConstraint('email', name=op.f('uq_app_user_email')),
    sa.UniqueConstraint('tax_id', name=op.f('uq_app_user_tax_id'))
    )
    op.create_table('meeting',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('type', sa.Enum('ordinary', 'extraordinary', name='type', native_enum=False, create_constraint=True), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('announcement', sa.Text(), nullable=False),
    sa.Column('legal_terms', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('draft', 'published', name='status', native_enum=False, create_constraint=True), nullable=False),
    sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['app_user.id'], name=op.f('fk_meeting_created_by_app_user'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_meeting'))
    )
    op.create_index(op.f('ix_meeting_created_by'), 'meeting', ['created_by'], unique=False)
    op.create_table('page_content',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('page_key', sa.String(length=50), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('body', sa.Text(), nullable=False),
    sa.Column('updated_by', sa.Integer(), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['updated_by'], ['app_user.id'], name=op.f('fk_page_content_updated_by_app_user'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_page_content')),
    sa.UniqueConstraint('page_key', name=op.f('uq_page_content_page_key'))
    )
    op.create_index(op.f('ix_page_content_updated_by'), 'page_content', ['updated_by'], unique=False)
    op.create_table('shareholder',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('representative_name', sa.String(length=200), nullable=True),
    sa.Column('representative_tax_id', sa.String(length=20), nullable=True),
    sa.Column('shares_count', sa.BigInteger(), nullable=False),
    sa.Column('shares_percentage', sa.Numeric(precision=7, scale=4), nullable=False),
    sa.Column('share_capital', sa.Numeric(precision=15, scale=2), nullable=False),
    sa.CheckConstraint('share_capital >= 0', name=op.f('ck_shareholder_share_capital_non_negative')),
    sa.CheckConstraint('shares_count >= 0', name=op.f('ck_shareholder_shares_count_non_negative')),
    sa.CheckConstraint('shares_percentage BETWEEN 0 AND 100', name=op.f('ck_shareholder_shares_percentage_range')),
    sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], name=op.f('fk_shareholder_user_id_app_user'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_shareholder')),
    sa.UniqueConstraint('user_id', name=op.f('uq_shareholder_user_id'))
    )
    op.create_table('document',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('meeting_id', sa.Integer(), nullable=False),
    sa.Column('uploaded_by', sa.Integer(), nullable=True),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('file_path', sa.String(length=500), nullable=False),
    sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['meeting_id'], ['meeting.id'], name=op.f('fk_document_meeting_id_meeting'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['uploaded_by'], ['app_user.id'], name=op.f('fk_document_uploaded_by_app_user'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_document'))
    )
    op.create_index(op.f('ix_document_meeting_id'), 'document', ['meeting_id'], unique=False)
    op.create_index(op.f('ix_document_uploaded_by'), 'document', ['uploaded_by'], unique=False)
    op.create_table('meeting_call',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('meeting_id', sa.Integer(), nullable=False),
    sa.Column('call_number', sa.Integer(), nullable=False),
    sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('location', sa.String(length=255), nullable=True),
    sa.Column('online_url', sa.String(length=500), nullable=True),
    sa.CheckConstraint('call_number IN (1, 2)', name=op.f('ck_meeting_call_call_number_valid')),
    sa.ForeignKeyConstraint(['meeting_id'], ['meeting.id'], name=op.f('fk_meeting_call_meeting_id_meeting'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_meeting_call')),
    sa.UniqueConstraint('meeting_id', 'call_number', name=op.f('uq_meeting_call_meeting_id_call_number'))
    )
    op.create_table('representation_form',
    sa.Column('id', sa.Integer(), sa.Identity(always=False), nullable=False),
    sa.Column('meeting_id', sa.Integer(), nullable=False),
    sa.Column('shareholder_id', sa.Integer(), nullable=False),
    sa.Column('sent_to', sa.String(length=255), nullable=False),
    sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('status', sa.Enum('sent', 'failed', name='status', native_enum=False, create_constraint=True), nullable=False),
    sa.ForeignKeyConstraint(['meeting_id'], ['meeting.id'], name=op.f('fk_representation_form_meeting_id_meeting'), ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['shareholder_id'], ['shareholder.id'], name=op.f('fk_representation_form_shareholder_id_shareholder'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_representation_form')),
    sa.UniqueConstraint('meeting_id', 'shareholder_id', name=op.f('uq_representation_form_meeting_id_shareholder_id'))
    )
    op.create_index(op.f('ix_representation_form_shareholder_id'), 'representation_form', ['shareholder_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_representation_form_shareholder_id'), table_name='representation_form')
    op.drop_table('representation_form')
    op.drop_table('meeting_call')
    op.drop_index(op.f('ix_document_uploaded_by'), table_name='document')
    op.drop_index(op.f('ix_document_meeting_id'), table_name='document')
    op.drop_table('document')
    op.drop_table('shareholder')
    op.drop_index(op.f('ix_page_content_updated_by'), table_name='page_content')
    op.drop_table('page_content')
    op.drop_index(op.f('ix_meeting_created_by'), table_name='meeting')
    op.drop_table('meeting')
    op.drop_table('app_user')
