import pyaudio
import numpy as np


p = pyaudio.PyAudio()
# pygame.init()
# screen = pygame.display.set_mode((1280, 720))
# clock = pygame.time.Clock()

sample_size = 1024
scale = 2


def transition_color(
    color1: tuple[int, int, int], color2: tuple[int, int, int], percent: float
):
    return (
        int(color1[0] + (color2[0] - color1[0]) * percent),
        int(color1[1] + (color2[1] - color1[1]) * percent),
        int(color1[2] + (color2[2] - color1[2]) * percent),
    )


def get_audio_stream():
    # display list of input devices
    # for i in range(p.get_device_count()):
    #     print(p.get_device_info_by_index(i))

    # # ask user to select input device
    # dev_index = int(input('Select input device number: '))
    dev_index = 0
    device = p.get_device_info_by_index(dev_index)
    channels = min(2, device["maxInputChannels"])
    stream = p.open(
        format=pyaudio.paInt16,
        channels=channels,
        rate=int(device["defaultSampleRate"]),
        input=True,
        frames_per_buffer=sample_size,
        input_device_index=dev_index,
    )
    return stream, channels


def normalize(data):
    return (data - np.min(data)) / (np.max(data) - np.min(data))


audio_stream = None
channels = None


def setup(pixels):
    global audio_stream, channels
    audio_stream, channels = get_audio_stream()
    pass


def run(pixels):
    buffer = audio_stream.read(1024, exception_on_overflow=False)

    if channels == 2:
        # split the stream into L and R
        buffer_L = buffer[::2]
        buffer_R = buffer[1::2]
        # convert to numpy array
        audio_data_L = np.frombuffer(buffer_L, dtype=np.int16)
        audio_data_R = np.frombuffer(buffer_R, dtype=np.int16)

        # average the two channels
        audio_data = (audio_data_L + audio_data_R) / 2
    else:
        audio_data = np.frombuffer(buffer, dtype=np.int16)

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

    # if significant bass volume, trigger LEDs
    if bass_volume > 0.2:
        pixels.fill(
            (
                min(int(bass_volume * 255) * scale, 255),
                min(int(vocals_volume * 255) * scale, 255),
                min(int(treble_volume * 255) * scale, 255),
            )
        )
    else:
        # fade to black
        color = pixels[0]
        if tuple(color) != (0, 0, 0):
            next_color = transition_color(color, (0, 0, 0), 0.1)
            pixels.fill(next_color)

    pixels.show()
