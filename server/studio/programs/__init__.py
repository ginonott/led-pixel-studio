import os
import pathlib

dir_path = os.path.dirname(os.path.realpath(__file__))
programs = pathlib.Path(dir_path).glob("*.py")

programs_list = [program.stem for program in programs if program.stem != "__init__"]

groups = (
    (0, 1, 2),
    (3, 4, 5),
    (6, 7, 8),
    (9, 10, 11),
    (12, 13, 14),
    (15, 16, 17),
    (18, 19, 20),
    (21, 22, 23),
    (24, 25, 26, 27),
    (28, 29, 30),
    (31, 32, 33),
    (34, 35, 36),
    (37, 38, 39),
)

shelf_groups = (
    (groups[0], groups[1]),
    (groups[2], groups[3], groups[4], groups[5]),
    (groups[6], groups[7], groups[8]),
    (groups[9], groups[10], groups[11]),
    (groups[12],),
)


def transition(from_: int, to: int, step: int) -> int:
    if from_ == to:
        return to

    if from_ < to:
        return min(int(from_ + step), to)

    return max(int(from_ - step), to)


def transition_color(
    from_: tuple[int, int, int], to: tuple[int, int, int], step: int
) -> tuple[int, int, int]:
    return (
        transition(from_[0], to[0], step),
        transition(from_[1], to[1], step),
        transition(from_[2], to[2], step),
    )
