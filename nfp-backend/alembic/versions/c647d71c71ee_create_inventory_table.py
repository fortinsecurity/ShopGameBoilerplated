"""create inventory table

Revision ID: c647d71c71ee
Revises: 7a3232b53bc3
Create Date: 2022-12-28 12:14:55.667562

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c647d71c71ee'
down_revision = '7a3232b53bc3'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String),
        sa.Column("description", sa.String),
        sa.Column("quantity", sa.Integer),
        sa.Column("user_username", sa.String, sa.ForeignKey("users.username"), primary_key=True)
        # sa.ForeignKeyConstraint(['shop_id'], ['shops.id'], ondelete='cascade')
    )
    op.create_foreign_key(None, "inventory", "users",["user_username"],["username"])


def downgrade():
    op.drop_table("inventory")