import os
from multiprocessing import Process
import sys
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

LEDS = int(os.environ.get("LEDS", "41"))
BRIGHTNESS = float(os.environ.get("BRIGHTNESS", 1))

REALTIME_SCENE_ID = -525

pixels = None
if not pixels:
    pixels = neopixel.NeoPixel(board.D10, LEDS, brightness=BRIGHTNESS, auto_write=False)


def set_frame(frame: Frame, clear_previous=True):
    # set all pixels to black to start
    pixels.fill((0, 0, 0))

    for led_num in range(len(pixels)):
        led_state = frame["ledStates"].get(str(led_num))
        if led_state:
            pixels[led_num] = (led_state["r"], led_state["g"], led_state["b"])
        else:
            pixels[led_num] = (0, 0, 0)

    pixels.show()


def clear_pixels():
    pixels.fill((0, 0, 0))


def scene_loop(frames: list[Frame], fps: int):
    # set all pixels to black to start
    pixels.fill((0, 0, 0))

    cur_frame = 0
    while True:
        if cur_frame >= len(frames):
            cur_frame = 0

        sys.stdout.write(f"\rPlaying frame {cur_frame} of {len(frames)}")
        set_frame(frames[cur_frame], clear_previous=False)

        cur_frame += 1

        sleep(1 / fps)


def show_frame(frame: Frame):
    # set all pixels to black to start
    pixels.fill((0, 0, 0))

    set_frame(frame, clear_previous=True)


class ScenePlayer:
    _is_playing: bool
    _proc: Process | None
    _current_scene_id: int | None

    def __init__(self):
        self._is_playing = False
        self._current_scene_id = None
        self._proc = None

    def stop_scene(self):
        if self._proc:
            self._is_playing = False
            self._proc.terminate()
            self._proc.join()
            self._proc = None

        self._is_playing = False
        self._current_scene_id = None
        clear_pixels()

    def play_scene(self, scene: Scene):
        global pixels
        self.stop_scene()

        self._is_playing = True
        self._current_scene_id = scene["id"]

        self._proc = Process(
            target=scene_loop,
            args=(
                scene["frames"],
                scene["fps"],
            ),
        )
        self._proc.start()

    def _update_status(self):
        if self._proc:
            is_exitted = self._proc.exitcode
            if is_exitted:
                self.stop_scene()

    def show_frame(self, scene: Scene, frame_num: int):
        # stop the current scene if it's playing
        self.stop_scene()
        show_frame(scene["frames"][frame_num])

    def get_status(self):
        self._update_status()

        return {"isPlaying": self._is_playing, "sceneId": self._current_scene_id}

    def init_realtime_player(self, num_leds, brightness):
        self.stop_scene()
        self._is_playing = True
        self._current_scene_id = REALTIME_SCENE_ID

    def set_live_frame(self, frame: Frame):
        set_frame(frame)

    def set_live_pixels(self, output: list[tuple[int, int, int]]):
        if not (self._is_playing and self._current_scene_id == REALTIME_SCENE_ID):
            raise Exception("Realtime player not initialized")

        pixels.fill((0, 0, 0))
        pixels[:] = output
        pixels.show()


player = ScenePlayer()
