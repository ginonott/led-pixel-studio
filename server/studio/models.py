from typing import Any, Literal, TypedDict


class LedState(TypedDict):
    r: int
    b: int
    g: int


class Frame(TypedDict):
    ledStates: dict[int, LedState]


class Scene(TypedDict):
    id: int
    name: str
    ledPositions: dict[int, Any]
    frames: list[Frame]
    fps: int
    brightness: float
    type: Literal["loop", "music"]
