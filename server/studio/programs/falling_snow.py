from typing import Literal
from . import shelf_groups, transition_color, get_random_color
from random import choice
# top to bottom
reversed_groups = list(shelf_groups)
reversed_groups.reverse()

fps = 10
wait_limit = int(fps / 2)

current_level = 0
target_color = (255, 255, 255)
wait_counter = 0
status: Literal["lighting", "waiting"] = "falling"

def setup(pixels):
    global current_level, wait_counter, status
    current_level = 0
    wait_counter = 0
    status = "falling"

def run(pixels):
    global current_level, target_color, wait_counter, status
    step = int(255 * 0.1)
    for led in range(len(pixels)):
        if tuple(pixels[led]) != (0, 0, 0):
            pixels[led] = transition_color(pixels[led], (0, 0, 0), step)

    if status == "waiting":
        if wait_counter == wait_limit:
            wait_counter = 0
            status = "falling"
        else:
            wait_counter += 1
    else:

        if current_level == len(reversed_groups):
            current_level = 0
            target_color = get_random_color()

        # pick a random group from the groups on the current level
        group = choice(reversed_groups[current_level])

        for led in group:
            pixels[led] = target_color
        
        current_level += 1
        status = "waiting"

    pixels.show()
