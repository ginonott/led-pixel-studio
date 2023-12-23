from time import sleep
import numpy as np
import board
import neopixel
import sounddevice as sd

pixels = neopixel.NeoPixel(board.D18, 40, brightness=1)
step = int(255 * 0.25)
bass_scale = 1
vocal_scale = 1.2
treble_scale = 1

def transition(from_: int, to: int, step: int) -> int:
    if from_ == to:
        return to

    if from_ < to:
        return min(int(from_ + step), to)

    return max(int(from_ - step), to)


def transition_color(
    from_: tuple[int, int, int], to: tuple[int, int, int], step: int
) -> tuple[int, int, int]:
    return (
        transition(from_[0], to[0], step),
        transition(from_[1], to[1], step),
        transition(from_[2], to[2], step),
    )


# pygame.init()
# screen = pygame.display.set_mode((1280, 720))
# clock = pygame.time.Clock()

sample_size = 1024


def normalize(data):
    return (data - np.min(data)) / (np.max(data) - np.min(data))

stream = sd.InputStream(
    device=0,
    channels=1,
    samplerate=48000
)
stream.start()

while True:
    audio_data, _ = stream.read(sample_size)

    if np.max(audio_data) < 0.0001:
        current_color = pixels[0]
        if tuple(current_color) != (0, 0, 0):
            next_color = transition_color(current_color, (0, 0, 0), step)
            pixels.fill(next_color)
            pixels.show()
        sleep(1/24)
        continue

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

    sleep(1/24)