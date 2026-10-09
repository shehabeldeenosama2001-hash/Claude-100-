"""Synthesizes the sound effects in public/sfx (no music, effects only).

Run with: python3 scripts/make-sfx.py
"""

import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
rng = np.random.default_rng(11)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def svf_bandpass(x, cutoff, q=0.9):
    """State-variable filter with a per-sample cutoff array. Returns (low, band, high)."""
    low = np.zeros_like(x)
    band = np.zeros_like(x)
    high = np.zeros_like(x)
    lo = bp = 0.0
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(cutoff[i], SR / 6) / SR)
        hp = x[i] - lo - damp * bp
        bp += f * hp
        lo += f * bp
        low[i], band[i], high[i] = lo, bp, hp
    return low, band, high


def one_pole_lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def normalize(x, peak):
    m = np.max(np.abs(x))
    return x if m == 0 else x / m * peak


def write(name, left, right=None):
    right = left if right is None else right
    data = np.stack([left, right], axis=1)
    data = np.clip(data, -1, 1)
    pcm = (data * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def click(freq):
    t = t_axis(0.12)
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 85)
    noise = rng.uniform(-1, 1, len(t)) * np.exp(-t * 260)
    _, _, hp = svf_bandpass(noise, np.full(len(t), 3000.0))
    return normalize(0.7 * body + 0.4 * hp, 0.55)


def whoosh(seconds=0.9):
    t = t_axis(seconds)
    noise = rng.uniform(-1, 1, len(t))
    p = t / seconds
    cutoff = 350 + 3600 * np.sin(np.pi * p) ** 2
    _, band, _ = svf_bandpass(noise, cutoff, q=1.4)
    env = np.sin(np.pi * p) ** 1.6
    sig = normalize(band * env, 0.6)
    pan = 0.5 + 0.45 * np.cos(np.pi * p)
    return sig * np.sqrt(1 - pan), sig * np.sqrt(pan)


def boom():
    t = t_axis(2.2)
    phase = 2 * np.pi * np.cumsum(62 - 30 * np.minimum(t, 1)) / SR
    sub = np.sin(phase) * np.exp(-t * 2.4)
    thump = one_pole_lowpass(rng.uniform(-1, 1, len(t)), 220) * np.exp(-t * 14) * 6
    sig = np.tanh(1.6 * (sub + thump))
    return normalize(sig, 0.85)


def riser(seconds=2.2):
    t = t_axis(seconds)
    p = t / seconds
    noise = rng.uniform(-1, 1, len(t))
    _, band, _ = svf_bandpass(noise, 300 + 7000 * p**2.2, q=1.1)
    tone = 0.25 * np.sin(2 * np.pi * np.cumsum(180 + 520 * p**2) / SR)
    env = p**2.4
    sig = normalize((band + tone) * env, 0.6)
    sig[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return sig


def pop():
    t = t_axis(0.16)
    phase = 2 * np.pi * np.cumsum(1150 - 3200 * t) / SR
    return normalize(np.sin(phase) * np.exp(-t * 34), 0.45)


def swell(seconds=3.0):
    t = t_axis(seconds)
    brown = np.cumsum(rng.uniform(-1, 1, len(t)))
    brown -= one_pole_lowpass(brown, 8)
    sig = one_pole_lowpass(brown, 600)
    env = np.sin(np.pi * t / seconds) ** 2
    return normalize(sig * env, 0.5)


def sparkle(seconds=1.4):
    t = t_axis(seconds)
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for _ in range(26):
        start = rng.uniform(0, seconds * 0.7)
        freq = rng.uniform(2800, 7200)
        n = int(0.25 * SR)
        i0 = int(start * SR)
        seg = t[:n]
        grain = np.sin(2 * np.pi * freq * seg) * np.exp(-seg * rng.uniform(14, 30))
        gain = 1 - start / seconds
        pan = rng.uniform(0.15, 0.85)
        end = min(i0 + n, len(t))
        left[i0:end] += grain[: end - i0] * gain * np.sqrt(1 - pan)
        right[i0:end] += grain[: end - i0] * gain * np.sqrt(pan)
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
    return left / peak * 0.3, right / peak * 0.3


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write("tick.wav", click(2600))
    write("tock.wav", click(1700))
    write("whoosh.wav", *whoosh())
    write("boom.wav", boom())
    write("riser.wav", riser())
    write("pop.wav", pop())
    write("swell.wav", swell())
    write("sparkle.wav", *sparkle())
    print("wrote", sorted(os.listdir(OUT)))
