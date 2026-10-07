"""v2 sound design: siren alarm hook, impacts, whooshes, knife swishes + a premium minimal beat.
Usage: sound_v2.py <outdir> <ad|ugc>  -> writes music_<kind>_v2.wav and sfx_<kind>_v2.wav (15s, 48k stereo)."""
import sys
import numpy as np, soundfile as sf

SR = 48000; T = 25.0 if (len(sys.argv) > 2 and sys.argv[2] in ("ad25", "ugc25")) else 15.0; N = int(T * SR)
rng = np.random.default_rng(22)
t_all = np.arange(N) / SR

def env(n, a, d):
    t = np.arange(n) / SR
    return np.exp(-t / d) * np.minimum(1, t / max(a, 1e-4))
def add(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[: j - i] * g

def siren(dur):
    """two-tone European-style alarm with a rising wail + pulsing beeper."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.where((t * 2.5) % 1 < 0.5, 960, 740) * (1 + 0.04 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sign(np.sin(ph)) * 0.35 + np.sin(ph) * 0.5 + 0.2 * np.sin(2 * ph)
    beep = (np.sin(2 * np.pi * 1850 * t) * ((t * 8) % 1 < 0.35)) * 0.18
    out = np.tanh(1.4 * (tone + beep))
    fade = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.12)
    return out * fade
def boom(g=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR; f = 32 + 90 * np.exp(-t / 0.07)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .5) + rng.standard_normal(n) * env(n, .001, .12) * .35) * g
def whoosh(dur=0.42, up=True):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    k = np.linspace(60, 6, n).astype(int) if up else np.linspace(6, 60, n).astype(int)
    c = np.cumsum(x); idx = np.arange(n); y = (c - c[np.maximum(idx - k, 0)]) / k
    return y * np.sin(np.pi * t / dur) ** 2 * 2.2
def swish():
    n = int(0.28 * SR); t = np.arange(n) / SR; x = np.diff(rng.standard_normal(n + 1))
    return x * np.sin(np.pi * t / 0.28) ** 3 * 0.5
def ting(f=2400):
    n = int(1.0 * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * h * t) / h for h in (1, 2.76, 5.4)) * env(n, .001, .25) * 0.22
def pop():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 + 2500 * t / 0.06) * t) * env(n, .001, .015) * 0.3
def kick():
    n = int(.4 * SR); t = np.arange(n) / SR; f = 45 + 120 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .14)
def hat(d=.03):
    n = int(.1 * SR); x = np.diff(rng.standard_normal(n + 1)); return x * env(n, .001, d) * .22
def clap():
    n = int(.22 * SR); return np.convolve(rng.standard_normal(n), [1, -.7], "same") * env(n, .001, .07) * .3
def pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.3 * t)) for f in freqs) / len(freqs)
    return s * np.minimum(1, t / .4) * np.minimum(1, (dur - t) / .4) * .22
def pluck(f, d=.3):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * h * t) / h for h in (1, 2, 3)) * env(n, .002, .09) * .14

def beat(start, bpm=118, chords=None):
    m = np.zeros(N); b = 60 / bpm
    chords = chords or [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]]
    arp = [659.3, 554.4, 440, 554.4, 587.3, 493.9, 392, 493.9]
    t, bar = start, 0
    while t < T:
        add(m, pad(chords[bar % 4], 4 * b), t, 1.0)
        for k in range(4):
            tb = t + k * b
            if tb >= T: break
            add(m, kick(), tb, .85)
            if k % 2: add(m, clap(), tb, .8)
            add(m, hat(.02), tb, .6); add(m, hat(.05), tb + b / 2, .8)
            add(m, pluck(arp[(bar * 4 + k) % 8]), tb + b / 2, 1)
            sub = chords[bar % 4][0] / 4
            n = int(b * .9 * SR); tt = np.arange(n) / SR
            add(m, np.tanh(2 * np.sin(2 * np.pi * sub * tt)) * env(n, .005, b * .6) * .3, tb)
        t += 4 * b; bar += 1
    return m

def build(kind):
    sfx = np.zeros(N)
    if kind == "ad":
        add(sfx, siren(3.0), 0.0, 0.55)
        add(sfx, boom(), 0.0, .9)
        add(sfx, boom(.7), 1.8)                      # "feeding you PLASTIC" hit
        for tt in (3.2, 3.62): add(sfx, swish(), tt, 1)
        add(sfx, whoosh(), 2.75, .9); add(sfx, boom(.8), 3.0)
        add(sfx, whoosh(.5), 5.35, .9); add(sfx, boom(.9), 5.95); add(sfx, ting(2200), 6.6)
        for tt in (7.85, 8.7, 9.55, 10.45, 11.3): add(sfx, whoosh(.32), tt, .55)
        for i in range(14): add(sfx, pop(), 8.12 + i * 0.04, .7)
        add(sfx, swish(), 9.05, 1.1); add(sfx, ting(3100), 9.3, .7)
        add(sfx, whoosh(.4, False), 9.95, .6)
        for i in range(10): add(sfx, pop(), 11.55 + i * 0.06, .6)
        add(sfx, whoosh(.45), 12.0, .8); add(sfx, boom(.8), 12.35); add(sfx, ting(1800), 13.5, .8)
        music = beat(3.0)
    elif kind == "ad25":
        add(sfx, siren(3.0), 0.0, 0.55)
        add(sfx, boom(), 0.0, .9); add(sfx, boom(.7), 1.75)
        add(sfx, whoosh(), 2.75, .9); add(sfx, boom(.8), 3.0)
        for tt in (4.3, 5.0, 5.7): add(sfx, swish(), tt - .1, .7)
        add(sfx, ting(1500), 4.0, .5)
        add(sfx, whoosh(.34), 6.3, .6)
        for tt in (6.6, 7.1, 7.6): add(sfx, whoosh(.3, False), tt, .35)
        add(sfx, whoosh(.5), 8.95, .9); add(sfx, boom(.9), 9.5); add(sfx, ting(2200), 10.2)
        for tt in (11.6, 13.95, 15.65, 18.9, 21.2): add(sfx, whoosh(.34), tt, .55)
        add(sfx, swish(), 14.4, .9)
        add(sfx, whoosh(.7, False), 17.6, .6); add(sfx, ting(2600), 18.1, .6)
        for i in range(10): add(sfx, pop(), 21.55 + i * 0.06, .6)
        add(sfx, whoosh(.45), 22.35, .8); add(sfx, boom(.8), 22.75); add(sfx, ting(1800), 23.8, .8)
        music = beat(3.0)
    elif kind == "ugc25":
        add(sfx, siren(2.95), 0.0, 0.5)
        add(sfx, boom(), 0.0, .8)
        add(sfx, whoosh(), 2.75, .8); add(sfx, boom(.6), 3.0)
        for tt in (4.6, 5.4, 6.2): add(sfx, swish(), tt - .1, .7)
        for tt in (7.1, 8.4, 9.1, 11.5, 14.3, 15.68, 18.36, 19.93): add(sfx, whoosh(.3), tt - .15, .45)
        add(sfx, whoosh(.5), 9.45, .8); add(sfx, ting(2200), 10.1, .8)
        add(sfx, swish(), 14.5, .9)
        add(sfx, whoosh(.65, False), 17.15, .6); add(sfx, ting(2600), 17.7, .5)
        for i in range(10): add(sfx, pop(), 20.15 + i * 0.07, .6)
        add(sfx, whoosh(.45), 21.45, .8); add(sfx, ting(1800), 22.45, .8)
        music = beat(3.0, bpm=104, chords=[[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]])
    else:
        add(sfx, siren(2.9), 0.0, 0.5)
        add(sfx, boom(), 0.0, .8)
        add(sfx, whoosh(), 2.75, .8); add(sfx, boom(.6), 3.0)
        for tt in (3.3, 3.8, 4.4): add(sfx, swish(), tt, .9)
        add(sfx, whoosh(.5), 5.65, .8); add(sfx, ting(2200), 6.3, .8)
        for tt in (7.7, 9.25, 10.8, 12.0, 13.2): add(sfx, whoosh(.3), tt - .15, .45)
        add(sfx, swish(), 9.6, 1.0)
        for i in range(10): add(sfx, pop(), 12.1 + i * 0.06, .6)
        music = beat(3.0, bpm=104, chords=[[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]])
    f = int(.5 * SR); music[-f:] *= np.linspace(1, 0, f)
    music /= np.abs(music).max() + 1e-9; sfx /= max(1.0, np.abs(sfx).max())
    return np.stack([music, music], 1) * .9, np.stack([sfx, sfx], 1)

out, kind = sys.argv[1], sys.argv[2]
m, s = build(kind)
sf.write(f"{out}/music_{kind}_v2.wav", m, SR); sf.write(f"{out}/sfx_{kind}_v2.wav", s, SR)
print("ok", kind)
