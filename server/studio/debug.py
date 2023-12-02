import os


def debug(msg: str) -> None:
    if os.environ.get("DEBUG_OUTPUT"):
        print(f"{msg}")
