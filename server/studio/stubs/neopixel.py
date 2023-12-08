import collections
from ..debug import debug


class NeoPixel(collections.UserList):
    pixels: list[list[int, int, int]]

    def __init__(self, pin, num, brightness=0.2, **kwargs):
        self.pin = pin
        self.num = num
        print(f"setting brightness to {brightness}")
        super().__init__([[0, 0, 0]] * num)

    def fill(self, color: tuple[int, int, int]):
        debug(f"filling all LEDs with {color}")
        for i in range(self.num):
            self.data[i] = list(color)

    def __setitem__(self, index, value):
        debug(f"setting LED {index} to {value}")
        super().__setitem__(index, value)

    def show(self):
        debug(f"writing pixels")
