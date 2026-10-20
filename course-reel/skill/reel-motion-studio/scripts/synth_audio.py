"""Synthesize royalty-free SFX + a lo-fi music bed for the course reel (no external assets)."""
import numpy as np, wave, sys, os
SR = 44100
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

def save(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.89, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(SR * d)) / SR
def lp(x, a):  # one-pole lowpass, a in (0,1)
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

# whoosh: noise through a sweeping lowpass, swelling envelope
d = 0.55; n = rng.standard_normal(len(t(d)))
alpha = np.linspace(0.02, 0.35, len(n)) ** 1.5
y = np.zeros_like(n); acc = 0.0
for i in range(len(n)): acc += alpha[i] * (n[i] - acc); y[i] = acc
env = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2
save("whoosh", y * env)

# pop: short pitched blip
tt = t(0.09); f = 900 * np.exp(-tt * 30) + 300
save("pop", np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 45))

# ding: bell partials
tt = t(1.2)
save("ding", sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * k) for fr, a, k in
                 [(1318, 1, 3), (2637, .5, 5), (3951, .25, 7), (1975, .3, 4)]))

# impact: sub boom + noise crack
tt = t(0.9); f = 120 * np.exp(-tt * 6) + 38
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5)
crack = rng.standard_normal(len(tt)) * np.exp(-tt * 40) * 0.6
save("impact", boom + crack)

# riser: rising saw-ish tone + noise
tt = t(1.6); f = 200 * (2 ** (tt * 2.2))
riser = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25 + rng.standard_normal(len(tt)) * 0.3
save("riser", lp(riser, 0.15) * (tt / tt[-1]) ** 2)

# camera shutter / click
tt = t(0.06); save("click", rng.standard_normal(len(tt)) * np.exp(-tt * 120))

# cash / success chime (two quick notes)
a = t(0.18); b = t(0.6)
n1 = np.sin(2*np.pi*1567*a)*np.exp(-a*12); n2 = np.sin(2*np.pi*2093*b)*np.exp(-b*5)
save("chime", np.concatenate([n1, n2]))

# lo-fi music bed: 92 BPM, Am - F - C - G, kick/snare/hat + warm pads
bpm = 92; beat = 60 / bpm; dur = 46.0
N = int(SR * dur); mix = np.zeros(N)
def add(sig, at):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: mix[i:j] += sig[: j - i]
kt = t(0.35); kick = np.sin(2*np.pi*np.cumsum(55+90*np.exp(-kt*25))/SR)*np.exp(-kt*9)
st_ = t(0.25); snare = lp(rng.standard_normal(len(st_)), 0.5)*np.exp(-st_*18)*0.5
ht = t(0.05); hat = (rng.standard_normal(len(ht)) - lp(rng.standard_normal(len(ht)), .3))*np.exp(-ht*80)*0.18
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [130.8, 164.8, 196], [196, 246.9, 293.7]]
nbeats = int(dur / beat)
for b_ in range(nbeats):
    at = b_ * beat
    if b_ % 4 in (0, 2) or (b_ % 8 == 7): add(kick, at)
    if b_ % 4 in (1, 3): add(snare, at)
    add(hat, at); add(hat * 0.6, at + beat / 2)
    if b_ % 4 == 0:
        ch = chords[(b_ // 4) % 4]; pt = t(beat * 4)
        pad = sum(np.sin(2*np.pi*fq*pt) + 0.3*np.sin(2*np.pi*fq*2.003*pt) for fq in ch)
        add(lp(pad * np.minimum(1, pt * 3) * np.exp(-pt * 0.35), 0.08) * 0.35, at)
fade = np.ones(N); fl = int(SR * 2); fade[-fl:] = np.linspace(1, 0, fl); fade[:int(SR*.3)] = np.linspace(0,1,int(SR*.3))
save("music_bed", lp(mix, 0.6) * fade)
print("ok")
