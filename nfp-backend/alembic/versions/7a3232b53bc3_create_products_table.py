"""create products table

Revision ID: 7a3232b53bc3
Revises: 6ffdcb50e642
Create Date: 2022-12-22 20:02:44.288207

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import relationship


# revision identifiers, used by Alembic.
revision = '7a3232b53bc3'
down_revision = '6ffdcb50e642'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "products",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String),
        sa.Column("description", sa.String),
        sa.Column("price", sa.Integer),
        sa.Column("ask_price", sa.Integer),
        sa.Column("stock", sa.Integer),
        sa.Column("shop_id", sa.Integer, sa.ForeignKey("shops.id"), primary_key=True)
        # sa.ForeignKeyConstraint(['shop_id'], ['shops.id'], ondelete='cascade')
    )
    op.create_foreign_key(None, "products", "shops",["shop_id"],["id"])


def downgrade():
    op.drop_table("products")