from random import randint
from typing import Literal
from . import groups, transition_color

current_led_group = 0
direction: Literal[1, -1] = 1

target_color = (0, 0, 0)
step = 255 * 0.05
fps = 15

def pick_new_target_color():
    global target_color

    # to avoid basically all white, we pick a more dominant color with a higher minimum
    target_color = [randint(0, 50), randint(0, 50), randint(0, 50)]
    dominant_color_pos = randint(0, 2)
    target_color[dominant_color_pos] = randint(150, 255)

    # make it readonly
    target_color = tuple(target_color)


def setup(pixels):
    pixels.fill((0, 0, 0))
    pixels.show()

    pick_new_target_color()

def run(pixels):
    global current_led_group, direction

    if current_led_group == len(groups):
        pick_new_target_color()
        direction *= -1
        current_led_group += direction
        return
    
    if current_led_group == -1:
        pick_new_target_color()
        direction *= -1
        current_led_group += direction
        return
    
    pixel_value = pixels[groups[current_led_group][0]]

    if tuple(pixel_value) == target_color:
        # we did it! move on
        current_led_group += direction
        return
    
    for led in groups[current_led_group]:
        pixels[led] = transition_color(pixels[led], target_color, step)

    pixels.show()
