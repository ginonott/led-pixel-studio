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
