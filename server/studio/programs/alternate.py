# settings
fps = 5

# state
counter = 0


def setup():
    global counter
    counter = 0


def run(pixels):
    global counter
    num_pixels = len(pixels)
    for led in range(num_pixels):
        color = [0, 0, 0]
        pos = (counter + led) % 4
        if not pos == 0:
            color[pos - 1] = 255

        pixels[led] = tuple(color)

    pixels.show()

    counter += 1
    if counter > 4:
        counter = 0
