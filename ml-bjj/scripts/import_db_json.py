"""将 src/mock/db.json 导入 DATABASE_URL 指向的库（云端 detect_system）。可重复跑：先清空再插入。"""

from __future__ import annotations

import json
import sys
from pathlib import Path

SERVE_DIR = Path(__file__).resolve().parents[1] / "serving"
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from db import get_engine, session_scope  # noqa: E402
from models import Base, JSON_COLLECTIONS, camel_to_snake  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parents[2]
DB_JSON = REPO_ROOT / "src" / "mock" / "db.json"


def row_to_kwargs(model, item: dict) -> dict:
    columns = {column.name for column in model.__table__.columns}
    kwargs = {}
    for key, value in item.items():
        col = camel_to_snake(key)
        if col in columns:
            kwargs[col] = value
    return kwargs


def import_db_json(path: Path = DB_JSON) -> dict[str, int]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    engine = get_engine()
    Base.metadata.create_all(engine)
    counts: dict[str, int] = {}
    with session_scope() as session:
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.flush()
        for key, model in JSON_COLLECTIONS.items():
            rows = raw.get(key) or []
            for item in rows:
                session.add(model(**row_to_kwargs(model, item)))
            counts[key] = len(rows)
        session.flush()
    return counts


def main() -> None:
    counts = import_db_json()
    print("imported:", counts)


if __name__ == "__main__":
    main()
