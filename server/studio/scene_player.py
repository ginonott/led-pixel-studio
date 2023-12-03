from multiprocessing import Process, Value
from time import sleep
from .models import Frame, Scene
from .debug import debug

try:
    import board
    import neopixel
except ImportError:
    print("Couldn't import board or neopixel. Using stubs instead.")
    import studio.stubs.board as board
    import studio.stubs.neopixel as neopixel


def set_frame(
    frame: Frame, leds: int, pixels: list[tuple[int, int, int]], clear_previous=True
):
    pixels = neopixel.NeoPixel(board.D18, leds)

    # set all pixels to black to start
    if clear_previous:
        pixels.fill((0, 0, 0))

    for led_num in range(leds):
        led_state = frame["ledStates"].get(str(led_num))
        if led_state:
            pixels[led_num] = (led_state["r"], led_state["g"], led_state["b"])
        else:
            pixels[led_num] = (0, 0, 0)


def clear_pixels(leds: int):
    pixels = neopixel.NeoPixel(board.D18, leds)
    pixels.fill((0, 0, 0))


def scene_loop(is_playing: bool, frames: list[Frame], leds: int, fps: int):
    pixels = neopixel.NeoPixel(board.D18, leds)

    # set all pixels to black to start
    pixels.fill((0, 0, 0))

    cur_frame = 0
    while is_playing:
        if cur_frame >= len(frames):
            cur_frame = 0

        debug(f"showing frame {cur_frame}")
        set_frame(frames[cur_frame], leds, pixels, clear_previous=False)

        cur_frame += 1

        sleep(1 / fps)

    pixels.fill((0, 0, 0))


def show_frame(frame: Frame, leds: int):
    pixels = neopixel.NeoPixel(board.D18, leds)

    # set all pixels to black to start
    pixels.fill((0, 0, 0))

    set_frame(frame, leds, pixels, clear_previous=True)


class ScenePlayer:
    _is_playing: bool
    _proc: Process | None
    _current_scene_id: int | None
    _pixel_cnt = 0

    def _get_num_leds(self, scene: Scene):
        return len(scene["ledPositions"].keys())

    def __init__(self):
        self._is_playing = Value("b", False)
        self._current_scene_id = None
        self._proc = None

    def play_scene(self, scene: Scene):
        self.stop_scene()

        self._is_playing = True
        self._current_scene_id = scene["id"]
        self._pixel_cnt = self._get_num_leds(scene)
        self._proc = Process(
            target=scene_loop,
            args=(scene["frames"], self._pixel_cnt, scene["fps"]),
        )
        self._proc.start()

    def stop_scene(self):
        if self._proc:
            self._is_playing = False
            self._proc.join(timeout=0.5)
            self._proc = None

        self._is_playing = False
        self._current_scene_id = None

    def _update_status(self):
        if self._proc:
            is_exitted = self._proc.exitcode
            if is_exitted:
                self._is_playing = False
                self._current_scene_id = None
                self._proc = None
                clear_pixels(self._pixel_cnt)

    def show_frame(self, scene: Scene, frame_num: int):
        # stop the current scene if it's playing
        self.stop_scene()
        show_frame(scene["frames"][frame_num], self._get_num_leds(scene))

    def get_status(self):
        self._update_status()

        return {"isPlaying": self._is_playing, "sceneId": self._current_scene_id}


player = ScenePlayer()
