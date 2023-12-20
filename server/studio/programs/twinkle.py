from colour import Color
from random import choice
from . import groups

fps = 5

# orangish color
base_color = Color(rgb=(227/255, 165/255, 50/255))

min_luminance = 0.1
max_luminance = 0.8
change_amt = 0.05

# because of float math errors, we want to work with the color object and not convert from float -> int -> float
pixel_colors: list[Color] = []

def color_to_pixel_rgb(c: Color) -> tuple[int, int, int]:
    return (int(c.get_red() * 255), int(c.get_green() * 255), int(c.get_blue() * 255))

def setup(pixels):
    global pixel_colors
    pixel_colors = [base_color] * len(pixels)
    # all start off the same color
    pixels.fill(color_to_pixel_rgb(base_color))
    pixels.show()

def run(pixels):
    global pixel_colors
    for group in groups:
        group_color = pixel_colors[group[0]]
        luminance = group_color.get_luminance()
        # don't let it get too dark
        if luminance < min_luminance:
            group_color.set_luminance(luminance + (luminance * change_amt))
        elif luminance > max_luminance:
            group_color.set_luminance(luminance - (luminance * change_amt))
        else:
            # pick a random amount
            coefficient = choice((1, -1))
            group_color.set_luminance(luminance + ((luminance * change_amt) * coefficient))

        # set all leds in the group to that color
        for led in group:
            pixels[led] = color_to_pixel_rgb(group_color)
            # save the new color
            pixel_colors[led] = group_color

    pixels.show()

