import importlib
import logging
from multiprocessing import Process, Queue
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

Actions = Literal[
    "play", "pause", "set_frames", "set_leds", "stop", "terminate", "step_program"
]
Mode = Literal["scene", "program", "idle"]

logger = logging.getLogger(__name__)


class Message:
    type: Actions

    def __init__(self, type: Actions):
        self.type = type


class PlayMessage(Message):
    def __init__(self):
        super().__init__(type="play")


class PauseMessage(Message):
    def __init__(self):
        super().__init__(type="play")


class StopMessage(Message):
    def __init__(self):
        super().__init__(type="stop")


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


class SetProgramMessage(Message):
    def __init__(self, program: str):
        super().__init__(type="set_program")
        self.program = program


class TerminateMessage(Message):
    def __init__(self):
        super().__init__(type="terminate")


def _show_frame(pixels: neopixel.NeoPixel, frame: Frame):
    for led_num in range(len(pixels)):
        led_state = frame["ledStates"].get(str(led_num))
        if led_state:
            pixels[led_num] = (led_state["r"], led_state["g"], led_state["b"])
        else:
            pixels[led_num] = (0, 0, 0)

    pixels.show()


def _run_loop(inputQueue: Queue):
    pixels = neopixel.NeoPixel(board.D18, 40, brightness=1, auto_write=False)
    mode: Literal["scene", "program", "idle"] = "scene"
    frames: list[Frame] = []

    playing = False
    current_frame = 0
    fps = 5
    program_func = None

    def full_reset():
        nonlocal mode, playing, current_frame, frames, program_func
        mode = "idle"
        playing = False
        current_frame = 0
        frames = []
        pixels.fill((0, 0, 0))
        pixels.show()
        program_func = None

    def save_error(e: Exception):
        logger.error(e)

    def run_program():
        # a program consist of a python file that defines a function called
        # "run" that returns a list of led states
        nonlocal mode, pixels, program_func
        program_func(pixels)

    try:
        while True:
            # check for messages
            if not inputQueue.empty():
                message: Message = inputQueue.get(block=False)
                logger.debug(f"handling message: {message}")

                if isinstance(message, PlayMessage):
                    playing = True
                elif isinstance(message, PauseMessage):
                    playing = False
                elif isinstance(message, SetSceneMessage):
                    mode = "scene"
                    current_frame = 0
                    frames = message.frames
                    fps = message.fps
                elif isinstance(message, SetLedsMessage):
                    full_reset()
                    mode = "scene"
                    pixels[:] = message.leds
                    pixels.show()
                elif isinstance(message, SetFrameMessage):
                    full_reset()
                    mode = "scene"
                    _show_frame(pixels, message.frame)
                elif isinstance(message, TerminateMessage):
                    break
                elif isinstance(message, SetProgramMessage):
                    full_reset()
                    mode = "program"
                    program_module = importlib.import_module(message.program)
                    if hasattr(program_module, "setup"):
                        program_module.setup(pixels)

                    if hasattr(program_module, "fps"):
                        fps = program_module.fps

                    program_func = program_module.run

                elif isinstance(message, StopMessage):
                    full_reset()

            # animations
            if not playing or mode == "idle":
                # sleep for a tiny bit just to not hog the CPU
                sleep(0.01)
                continue

            if mode == "program":
                run_program()
            else:
                frame = frames[current_frame]
                current_frame += 1
                if current_frame >= len(frames):
                    current_frame = 0

                _show_frame(pixels, frame)

            # sleep
            sleep(1 / fps)
    except Exception as e:
        save_error(e)
        raise e


class ScenePlayer:
    _proc: Process | None = None
    _input_queue: Queue = Queue()
    _current_scene: Scene | None = None
    _current_program: str | None = None
    _is_playing: bool = False

    def _check_process(self):
        if self._proc.is_alive():
            return

        logger.error("RunLoop process is not alive. resetting...")
        self.reset()

    def reset(self):
        if self._proc and self._proc.is_alive():
            self._input_queue.put(TerminateMessage())
            try:
                self._proc.join(1.0)
            except Exception:
                if self._proc.is_alive():
                    self._proc.kill()

        self._input_queue = Queue()
        self._current_scene = None
        self._is_playing = False
        self._proc = Process(target=_run_loop, args=(self._input_queue,))
        self._proc.start()

    def clear(self):
        self._check_process()

        self._input_queue.put(StopMessage())
        self._current_scene = None
        self._current_program = None
        self._is_playing = False

    def __init__(self):
        self.reset()

    def play(self):
        self._check_process()

        self._input_queue.put(PlayMessage())
        self._is_playing = True

    def pause(self):
        self._check_process()

        self._input_queue.put(PauseMessage())
        self._is_playing = False

    def play_scene(self, scene: Scene):
        self._check_process()
        self.set_scene(scene)
        self.play()

    def set_scene(self, scene: Scene):
        self._check_process()
        self.clear()
        self._input_queue.put(
            SetSceneMessage(
                frames=scene.get("frames"),
                fps=scene.get("fps"),
                brightness=scene.get("brightness"),
            )
        )
        self._current_scene = scene

    def set_leds(self, leds: list[tuple[int, int, int]]):
        self._check_process()
        self.clear()

        self._input_queue.put(SetLedsMessage(leds=leds))

    def set_frame(self, frame: Frame):
        self._check_process()
        self.clear()

        self._input_queue.put(SetFrameMessage(frame=frame))

    def get_state(self):
        self._check_process()

        return {
            "is_playing": self._is_playing,
            "current_scene": self._current_scene,
            "current_program": self._current_program,
        }

    def stop(self):
        self._check_process()
        self.clear()

    def run_program(self, program_name: str):
        self._check_process()
        self.clear()

        # ensure we can import it
        name = "studio.programs." + program_name
        importlib.import_module(name)

        self._input_queue.put(SetProgramMessage(program=name))
        self.play()
        self._current_program = program_name
