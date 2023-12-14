from multiprocessing import Process, Queue, set_start_method
from time import sleep
from typing import Literal

from studio.models import Frame, Scene


try:
    import board
    import neopixel
except ImportError:
    print("Couldn't import board or neopixel. Using stubs instead.")
    import studio.stubs.board as board
    import studio.stubs.neopixel as neopixel

Actions = Literal["play", "pause", "set_frames", "set_leds"]


class Message:
    type: Actions
    data: list | dict

    def __init__(self, type: Actions):
        self.type = type


class PlayMessage(Message):
    def __init__(self):
        super().__init__(type="play")


class PauseMessage(Message):
    def __init__(self):
        super().__init__(type="play")


class SetSceneMessage(Message):
    def __init__(self, frames: list[Frame], fps: int, brightness: float):
        super().__init__(type="set_frames")
        self.frames = frames
        self.fps = fps
        self.brightness = brightness


class SetLedsMessage(Message):
    def __init__(self, leds: list[tuple[int, int, int]]):
        super().__init__(type="set_frames")
        self.leds = leds


class SetFrameMessage(Message):
    def __init__(self, frame: Frame):
        super().__init__(type="set_frame")
        self.frame = frame


def _run_loop(queue: Queue):
    pixels = neopixel.NeoPixel(board.D10, 40, brightness=1, auto_write=False)
    frames: list[Frame] = []
    playing = False
    current_frame = 0
    fps = 30

    while True:
        # check for messages
        if not queue.empty():
            message: Message = queue.get(block=False)
            if isinstance(message, PlayMessage):
                playing = True
            elif isinstance(message, PauseMessage):
                playing = False
            elif isinstance(message, SetSceneMessage):
                current_frame = 0
                frames = message.frames
                fps = message.fps
            elif isinstance(message, SetLedsMessage):
                playing = False
                current_frame = 0
                frames = []
                pixels.fill((0, 0, 0))
                pixels[:] = message.leds
                pixels.show()
            elif isinstance(message, SetFrameMessage):
                playing = True
                fps = 60
                current_frame = 0
                frames = [message.frame]

        # animations
        if not playing:
            # sleep for a tiny bit just to not hog the CPU
            sleep(0.01)
            continue

        frame = frames[current_frame]
        current_frame += 1
        if current_frame >= len(frames):
            current_frame = 0

        pixels.fill((0, 0, 0))

        for led_num in range(len(pixels)):
            led_state = frame["ledStates"].get(str(led_num))
            if led_state:
                pixels[led_num] = (led_state["r"], led_state["g"], led_state["b"])
            else:
                pixels[led_num] = (0, 0, 0)

        pixels.show()

        # sleep
        sleep(1 / fps)


class ScenePlayer:
    _proc: Process | None
    _queue: Queue
    _current_scene: Scene | None
    _is_playing: bool

    def _check_process(self):
        if self._proc.is_alive():
            return

        print(self._proc.exitcode)
        raise RuntimeError("ScenePlayer process is not alive")

    def __init__(self):
        self._queue = Queue()
        self._current_scene = None
        self._is_playing = False
        set_start_method("spawn")
        self._proc = Process(target=_run_loop, args=(self._queue,))
        self._proc.start()

    def play(self):
        self._queue.put(PlayMessage())
        self._is_playing = True

    def pause(self):
        self._queue.put(PauseMessage())
        self._is_playing = False

    def play_scene(self, scene: Scene):
        self.set_scene(scene)
        self.play()

    def set_scene(self, scene: Scene):
        self._queue.put(
            SetSceneMessage(
                frames=scene.get("frames"),
                fps=scene.get("fps"),
                brightness=scene.get("brightness"),
            )
        )
        self._current_scene = scene

    def set_leds(self, leds: list[tuple[int, int, int]]):
        self._queue.put(SetLedsMessage(leds=leds))
        self._current_scene = None
        self._is_playing = False

    def set_frame(self, frame: Frame):
        self._queue.put(SetFrameMessage(frame=frame))
        self._current_scene = None
        self._is_playing = False

    def is_playing(self):
        return self._is_playing

    def get_scene(self):
        return self._current_scene
