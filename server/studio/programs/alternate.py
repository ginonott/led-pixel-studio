# settings
fps = 1

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
