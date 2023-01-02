"""create all_products table

Revision ID: def8f9617580
Revises: c647d71c71ee
Create Date: 2022-12-28 21:14:33.863049

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'def8f9617580'
down_revision = 'c647d71c71ee'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "all_products",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String),
    )


def downgrade():
    op.drop_table("all_products")