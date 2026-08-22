"""initial detect_system tables

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-22
"""

from __future__ import annotations

import sys
from pathlib import Path

from alembic import op

SERVE_DIR = Path(__file__).resolve().parents[2]
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from models import Base  # noqa: E402

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
