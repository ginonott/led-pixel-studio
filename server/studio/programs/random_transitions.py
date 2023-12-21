from . import groups, get_random_color, transition_color

target_colors: list[tuple[int, int, int]]
step = int(255 * 0.05)

def pick_new_target(position: int):
    global target_colors
    target_colors[position] = get_random_color()

def setup(pixels):
    global target_colors
    target_colors = [get_random_color() for _ in groups]

def run(pixels):
    for pos, group in enumerate(groups):
        target_color = target_colors[pos]
        pixel_value = pixels[group[0]]

        if tuple(pixel_value) == target_color:
            pick_new_target(pos)
            continue

        for led in group:
            pixels[led] = transition_color(pixels[led], target_color, step)

    pixels.show()