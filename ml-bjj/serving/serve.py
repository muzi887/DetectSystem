from __future__ import annotations

from waitress import serve

import app as serving


def run() -> None:
    port = serving.prepare_runtime()
    print(f"[ml-bjj] waitress: http://127.0.0.1:{port}/api/analysis/image")
    serve(serving.app, host="0.0.0.0", port=port, threads=4)


if __name__ == "__main__":
    run()
