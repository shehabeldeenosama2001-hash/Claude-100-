"""Synthesizes the two beds in audio/ (the recitation itself is recorded, never synthesized).

- room-tone.wav: a very soft room tone under the whole film.
- pad.wav: a percussion-free pad. Silent under the recitation, enters at 16s
  (frame 480) at -24 dBFS, swells slightly in scene 7, resolves in scene 8 and
  ends before the final still.

Run with: python3 -I yalla/shared/make-audio.py
"""

import os
import wave

import numpy as np

SR = 48000
LENGTH = 38.0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")
rng = np.random.default_rng(5)
t = np.arange(int(SR * LENGTH)) / SR


def db(x):
    return 10 ** (x / 20)


def one_pole(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def smoothstep(a, b, x):
    u = np.clip((x - a) / (b - a), 0, 1)
    return u * u * (3 - 2 * u)


def write(name, left, right):
    data = np.clip(np.stack([left, right], axis=1), -1, 1)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((data * 32767).astype("<i2").tobytes())


def room_tone():
    sides = []
    for _ in range(2):
        n = one_pole(rng.uniform(-1, 1, len(t)), 380)
        n = one_pole(n, 900)
        sides.append(n / np.sqrt(np.mean(n**2)) * db(-54))
    fade = smoothstep(0, 0.5, t) * (1 - smoothstep(37.4, 38.0, t))
    return sides[0] * fade, sides[1] * fade


def voice(freqs, detune_seed):
    local = np.random.default_rng(detune_seed)
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for f in freqs:
        for cents, pan in ((-4, 0.3), (4, 0.7)):
            ff = f * 2 ** (cents / 1200)
            phase = local.uniform(0, 2 * np.pi)
            lfo = 0.75 + 0.25 * np.sin(2 * np.pi * local.uniform(0.05, 0.11) * t + phase)
            s = (np.sin(2 * np.pi * ff * t + phase) + 0.12 * np.sin(4 * np.pi * ff * t)) * lfo
            left += s * np.sqrt(1 - pan)
            right += s * np.sqrt(pan)
    return left, right


def pad():
    # Gmaj9 under scenes 5-7, resolving to D(add9) in scene 8
    a_l, a_r = voice([98.0, 146.83, 246.94, 369.99, 440.0], 1)
    b_l, b_r = voice([146.83, 220.0, 293.66, 329.63, 369.99], 2)
    to_b = smoothstep(33.6, 34.8, t)
    left = a_l * (1 - to_b) + b_l * to_b
    right = a_r * (1 - to_b) + b_r * to_b
    left, right = one_pole(left, 1800), one_pole(right, 1800)
    env = (
        smoothstep(16.0, 18.5, t)
        * (1 + 0.4 * smoothstep(30.0, 32.0, t) * (1 - smoothstep(33.0, 34.0, t)))
        * (1 - smoothstep(35.6, 37.4, t))
    )
    left, right = left * env, right * env
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
    gain = db(-24) / peak
    return left * gain, right * gain


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write("room-tone.wav", *room_tone())
    write("pad.wav", *pad())
    print("wrote", sorted(f for f in os.listdir(OUT) if f.endswith(".wav")))
