import collections
from ..debug import debug


class NeoPixel(collections.UserList):
    pixels: list[list[int, int, int]]

    def __init__(self, pin, num):
        self.pin = pin
        self.num = num
        super().__init__([[0, 0, 0]] * num)

    def fill(self, color: tuple[int, int, int]):
        debug(f"filling all LEDs with {color}")
        for i in range(self.num):
            self.data[i] = list(color)

    def __setitem__(self, index, value):
        debug(f"setting LED {index} to {value}")
        super().__setitem__(index, value)
