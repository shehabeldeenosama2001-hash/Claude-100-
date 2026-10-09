---
workflow: general-video
flow: automation
storyboard: no
message: "قبل ما يكبر... خليه يبدأ"
destination: reels
aspect: 1080x1920
language: ar
audience: Egyptian mothers of young children
length: 38s
---

## Intent

A 38-second vertical film for "يلا", a kids' Quran course. A child's own recitation opens the film. His mother hears him read alone for the first time. Each step of memorization becomes credit in her balance too, and the film ends on the slogan "قبل ما يكبر... خليه يبدأ". The tone is quiet, warm and reverent, not a hard sell.

## Assets

- ../shared/design.json: colour tokens, ornament and silhouette paths, scene frame ranges and recitation timing. This is the single source of truth, mirrored into assets/design.js by ../shared/sync.mjs.
- assets/fonts/Cairo.ttf: colloquial lines. assets/fonts/AmiriQuran.ttf: Quranic text (OFL Uthmani-capable face, standing in for KFGQPC Uthmanic Hafs).
- assets/audio/room-tone.wav and assets/audio/pad.wav: synthesized beds.
- assets/audio/recitation.wav: NOT YET PROVIDED. The child's recitation must be recorded clean and dry, with consent. Timings in design.json are placeholders until it exists.

## Customizations

- Scene build follows the user's frame-by-frame table exactly (8 scenes, 0–1140 frames at 30fps).
- Transitions: cream line sweeps right-to-left, and octagram iris wipes for the chapter cards and the payoff.
- The ayah underline is driven by the recitation timing JSON.

## Notes

- Palette is strictly #053C96 background, #F6F0E1 cream, #032A6B navy depth, and #FFFFFF for the slogan only. No other hues.
- Ornaments use 1.5–2px strokes at 40–70% opacity. They are drawn (stroke-dashoffset) or rotated at 6°/s or less, never bounced.
- Quranic text is never split, scrambled, letter-animated, elastically scaled or overlapped. It is only faded or masked whole.
- No music under the recitation. The pad runs only from frame 480 at −24 dB.
- Motion is soft (spring with damping 200, no overshoot) or ease-in-out cubic.
