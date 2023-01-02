"""create shops table

Revision ID: 6ffdcb50e642
Revises: 7bb035cc0f48
Create Date: 2022-12-22 20:02:38.249586

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6ffdcb50e642'
down_revision = '7bb035cc0f48'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "shops",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, unique=True),
        sa.Column("description", sa.String)
    )


def downgrade():
    op.drop_table("shops")
