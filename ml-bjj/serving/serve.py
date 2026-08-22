from __future__ import annotations

from waitress import serve

import app as serving


def run() -> None:
    port = serving.prepare_runtime()
    from scheduler import start_scheduler

    start_scheduler()
    print(f"[ml-bjj] waitress: http://127.0.0.1:{port}/")
    serve(serving.app, host="0.0.0.0", port=port, threads=4)


if __name__ == "__main__":
    run()
