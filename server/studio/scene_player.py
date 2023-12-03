from multiprocessing import Process
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

leds = 50
pixels = neopixel.NeoPixel(board.D18, 50, brightness=0.2, auto_write=False)


def set_frame(frame: Frame, clear_previous=True):
    # set all pixels to black to start
    if clear_previous:
        pixels.fill((0, 0, 0))

    for led_num in range(leds):
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

        debug(f"showing frame {cur_frame}")
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

    def play_scene(self, scene: Scene):
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

    def stop_scene(self):
        if self._proc:
            self._is_playing = False
            self._proc.terminate()
            self._proc.join()
            self._proc = None
            clear_pixels()

        self._is_playing = False
        self._current_scene_id = None

    def _update_status(self):
        if self._proc:
            is_exitted = self._proc.exitcode
            if is_exitted:
                self._is_playing = False
                self._current_scene_id = None
                self._proc = None
                clear_pixels()

    def show_frame(self, scene: Scene, frame_num: int):
        # stop the current scene if it's playing
        self.stop_scene()
        show_frame(scene["frames"][frame_num])

    def get_status(self):
        self._update_status()

        return {"isPlaying": self._is_playing, "sceneId": self._current_scene_id}


player = ScenePlayer()
