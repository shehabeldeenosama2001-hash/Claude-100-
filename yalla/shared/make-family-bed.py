"""Synthesizes audio/family-bed.wav: a soft, percussion-free bed for the family film.

It sits at -26 dBFS so a voiceover can go on top later.
Run with: python3 -I yalla/shared/make-family-bed.py
"""

import importlib.util
import os

import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("beds", os.path.join(here, "make-audio.py"))
beds = importlib.util.module_from_spec(spec)
spec.loader.exec_module(beds)

LENGTH = 44.3
t = np.arange(int(beds.SR * LENGTH)) / beds.SR
beds.t = t

# Dmaj9 -> Gmaj7 -> D, changing under the scene cuts
d_l, d_r = beds.voice([146.83, 220.0, 293.66, 329.63, 369.99], 3)
g_l, g_r = beds.voice([98.0, 146.83, 246.94, 293.66, 369.99], 4)
mix = beds.smoothstep(18.0, 20.0, t) * (1 - beds.smoothstep(32.0, 34.0, t))
left = d_l * (1 - mix) + g_l * mix
right = d_r * (1 - mix) + g_r * mix
left, right = beds.one_pole(left, 1600), beds.one_pole(right, 1600)
env = beds.smoothstep(0.0, 2.5, t) * (1 - beds.smoothstep(LENGTH - 2.5, LENGTH, t))
left, right = left * env, right * env
gain = beds.db(-26) / max(np.max(np.abs(left)), np.max(np.abs(right)))
beds.write("family-bed.wav", left * gain, right * gain)
print("wrote family-bed.wav")
