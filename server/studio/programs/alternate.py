from . import groups

# settings
fps = 1

# state
counter = 0


def setup():
    global counter
    counter = 0


def run(pixels):
    global counter
    for group_num, group in enumerate(groups):
        color = [0, 0, 0]
        pos = (counter + group_num) % 4
        if not pos == 0:
            color[pos - 1] = 255

        for led in group:
            pixels[led] = tuple(color)

    pixels.show()

    counter += 1
    if counter > 4:
        counter = 0
