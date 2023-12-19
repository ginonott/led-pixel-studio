"""
Program that makes the tree slowly glow and fade.
"""
from random import randint
from typing import Literal

from . import shelf_groups, transition_color

# constants
increment_percentage = 0.05

current_mode: Literal["fade_to_color", "fade_to_black"] = "fade_to_color"
current_shelf = 0
target_color = (255, 255, 255)
step = 255 * increment_percentage
fps = 15

def flatten(iterable):
    return [item for sublist in iterable for item in sublist]


def reset(pixels):
    global target_color, step, current_shelf, current_mode
    current_shelf = 0
    current_mode = "fade_to_color"
    pixels.fill((0, 0, 0))
    pixels.show()

    # to avoid basically all white, we pick a more dominant color with a higher minimum
    target_color = [randint(0, 50), randint(0, 50), randint(0, 50)]
    dominant_color_pos = randint(0, 2)
    target_color[dominant_color_pos] = randint(150, 255)

    # make it readonly
    target_color = tuple(target_color)



def setup(pixels):
    reset(pixels)


def run(pixels):
    global current_mode, current_shelf

    if current_mode == "fade_to_black":
        pixel_value = pixels[0]

        if tuple(pixel_value) == (0, 0, 0):
            reset(pixels)
            return

        # all pixels should be the same value at this point so iterate through all of them
        # and transition to black
        for led in flatten(flatten(shelf_groups)):
            pixels[led] = transition_color(pixel_value, (0, 0, 0), step)

        pixels.show()

        return

    # fade_to_color mode
    if current_shelf == len(shelf_groups):
        # fade to black mode
        current_mode = "fade_to_black"
        return

    pixel_value = pixels[shelf_groups[current_shelf][0][0]]

    # are we there yet?
    if tuple(pixel_value) == target_color:
        current_shelf += 1
        return

    # nope - we need to keep going
    leds = flatten(shelf_groups[current_shelf])
    for led in leds:
        current_color = pixels[led]
        pixels[led] = transition_color(current_color, target_color, step)

    pixels.show()
