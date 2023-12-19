import random
from . import groups

MIN_COLOR_VALUE = 0
MIN_GROUPS_ON = 4
MAX_GROUPS_ON = 8

fps = 1


def setup():
    pass


def run(pixels):
    pixels.fill((0, 0, 0))
    groups_on = random.randint(MIN_GROUPS_ON, MAX_GROUPS_ON)
    groups_to_turn_on = random.sample(groups, groups_on)
    for group in groups_to_turn_on:
        color = [random.randint(MIN_COLOR_VALUE, 255) for _ in range(3)]
        for led in group:
            pixels[led] = tuple(color)

    pixels.show()
