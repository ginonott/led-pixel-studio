import importlib
import logging
from multiprocessing import Process, Queue
from time import sleep
from typing import Literal
import numpy as np
import sounddevice as sd
import pyaudio

from studio.models import Frame, Scene
from .programs import transition_color

try:
    import board
    import neopixel
except ImportError:
    print("Couldn't import board or neopixel. Using stubs instead.")
    import studio.stubs.board as board
    import studio.stubs.neopixel as neopixel

Actions = Literal[
    "play", "pause", "set_frames", "set_leds", "stop", "terminate", "step_program", "sync_music"
]
Mode = Literal["scene", "program", "idle", "music"]

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

class SyncMusicMessage(Message):
    def __init__(self):
        super().__init__(type="sync_music")


def normalize(data):
    return (data - np.min(data)) / (np.max(data) - np.min(data))

sample_size = 1024
bass_scale = 1
vocal_scale = 1.5
treble_scale = 1.2
step = int(255 * .25)

def sync_music(stream: sd.InputStream, pixels: neopixel.NeoPixel):
    audio_data, _ = stream.read(sample_size)

    if np.max(audio_data) < 0.0001:
        current_color = pixels[0]
        if tuple(current_color) != (0, 0, 0):
            next_color = transition_color(current_color, (0, 0, 0), step)
            pixels.fill(next_color)
            pixels.show()
        return

    # get the frequencies
    freq_data = np.fft.fft(audio_data)

    # get amplitudes of each frequency
    amplitudes = 1 / sample_size * np.abs(freq_data)

    # split amplitudes into bass/vocals/treble
    bass_amplitudes = normalize(amplitudes[:50])
    vocals_amplitudes = normalize(amplitudes[100:500])
    treble_amplitudes = normalize(amplitudes[500:])

    # get the average volume of each frequency range
    bass_volume = np.mean(bass_amplitudes)
    vocals_volume = np.mean(vocals_amplitudes)
    treble_volume = np.mean(treble_amplitudes)
    color = (
        min(int(bass_volume * 255 * bass_scale), 255),
        min(int(vocals_volume * 255 * vocal_scale), 255),
        min(int(treble_volume * 255 * treble_scale), 255),
    )

    # if significant bass volume, trigger LEDs
    if bass_volume > 0.5:
        pixels.fill(
            color
        )
    else:
        # fade to black
        current_color = pixels[0]
        if tuple(current_color) != (0, 0, 0):
            next_color = transition_color(current_color, (0, 0, 0), step)
            pixels.fill(next_color)

    pixels.show()


def _show_frame(pixels: neopixel.NeoPixel, frame: Frame):
    for led_num in range(len(pixels)):
        led_state = frame["ledStates"].get(str(led_num), {"r": 0, "g": 0, "b": 0})
        rgb = (led_state["r"], led_state["g"], led_state["b"])
        if tuple(pixels[led_num]) != rgb:
            pixels[led_num] = rgb

    pixels.show()


def _run_loop(inputQueue: Queue):
    pixels = neopixel.NeoPixel(board.D18, 40, brightness=1, auto_write=False)
    mode: Mode = "idle"
    frames: list[Frame] = []

    # music stuff
    audio_stream: sd.InputStream | None = None
    channels = 1

    playing = False
    current_frame = 0
    fps = 5
    program_func = None

    def full_reset():
        nonlocal mode, playing, current_frame, frames, program_func, fps
        mode = "idle"
        playing = False
        current_frame = 0
        frames = []
        pixels.fill((0, 0, 0))
        pixels.show()
        program_func = None
        fps = 5

        if audio_stream:
            audio_stream.close()

    def init_audio():
        nonlocal audio_stream, fps, mode, channels, playing
        mode = "music"
        audio_stream = sd.InputStream(
            device=0,
            channels=1,
            samplerate=48000
        )
        audio_stream.start()
        fps = 60
        playing = True

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
                elif isinstance(message, SyncMusicMessage):
                    full_reset()
                    init_audio()

            # animations
            if not playing or mode == "idle":
                # sleep for a tiny bit just to not hog the CPU
                sleep(0.01)
                continue

            if mode == "program":
                run_program()
            elif mode == "music":
                sync_music(audio_stream, pixels)
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

    
    def sync_music(self):
        self._check_process()
        self.clear()
        self._input_queue.put(SyncMusicMessage())
