# Video Edit Instructions

**Source video:** a 145 s, 1920x1080 screen recording of a language lesson. An illustrated city map, a student giving directions to the hospital in spoken Arabic, and a Hebrew translation line under the Arabic captions.

**Goal:** apply every change below in one pass. Do not change what the speaker says or the order of the lesson.

---

## 1. Length and pacing
- Cut the video from about 145 s to about **45–60 s**.
- Remove silences, hesitations, filler and repetition, without cutting a sentence in the middle.
- Make something change visually **every 3–5 seconds** (a zoom, a new step appearing, a piece of the route being drawn).

## 2. Hook (first 3 seconds)
- Open with the result: the final route already drawn in yellow on the map.
- Add a large on-screen question: **"Can you find the hospital?"**
- Then jump back to the start of the lesson and run it step by step.

## 3. Framing (reframe)
- Convert to **9:16 (1080x1920)**. Crop tightly around the map and the steps list.
- Remove the empty black bars, the blurred webcam tile, and the small logo in the top corner.

## 4. Zoom and camera
- Punch-in **1.3x–1.5x** on the part of the map being described (the current street or corner), with smooth ease-in-out motion.
- Return to the full map view at each change of direction (left / right / straight).

## 5. Yellow route line
- Draw the route in yellow on the map **step by step**, in sync with each spoken direction. Do not draw it all at once at the end.

## 6. Steps list (right side)
- Make it larger, with clear screen space.
- Each step enters with a slide + fade animation and a short **"tick/ding"** sound at the moment it fills in.
- Fixed color per word type:

| Word type | Color |
|---|---|
| Right | Green |
| Straight | Blue |
| Left / north | Yellow-orange |
| Corner / next to / down | Light gray |

## 7. Captions
- **Arabic:** large, max 1–2 lines, max 6–7 words per line, placed in the safe zone near the bottom so it never covers the map.
- **Hebrew translation:** smaller and lighter, directly under the Arabic, one line only.
- **Fix the RTL problems:**
  - Punctuation (for example question marks) must sit at the correct end of the line in the Hebrew translation.
  - No word may be cut off at the edges.
- **Highlight in yellow only the target vocabulary** (left, right, straight, corner, hospital). Give each word a small scale-pulse the moment it is spoken.
- Use the same color per word type as in the steps list.

## 8. Audio
- Clean background noise and normalize the voice level.
- Add very light background music, ducked under the voice.
- Add a short **"ding"** SFX for every step that completes.

## 9. Ending
- Replace the abrupt Hebrew text card with a clean end card:
  - a 5-word summary of the lesson,
  - one clear call-to-action button (for example **"Next lesson →"**),
  - held for 2–3 seconds.

## 10. Export
- H.264, **1080x1920**, 30 fps, about 8–12 Mbps, AAC audio.
- Set a clean still frame as the cover / thumbnail.

---

## Ready-to-paste prompt (one block)

```
You are a professional video editor. Edit the attached video (a screen recording of a language lesson: an illustrated city map, a student giving directions to the hospital in spoken Arabic, with a Hebrew translation line) and apply ALL of the following changes in one pass. Do not change what the speaker says or the order of the lesson.

1) LENGTH & PACING: Cut from ~145s to ~45-60s. Remove silences, hesitations, filler and repetition without cutting a sentence in the middle. Something must visually change every 3-5 seconds (zoom, new step appearing, part of the route being drawn).

2) HOOK (first 3 seconds): Open with the result: the final route already drawn in yellow on the map, with a large on-screen question: "Can you find the hospital?" Then jump back to the start of the lesson and run it step by step.

3) FRAMING: Convert to 9:16 (1080x1920). Crop tightly around the map and the steps list. Remove the black bars, the blurred webcam tile and the small logo.

4) ZOOM / CAMERA: Punch-in 1.3x-1.5x on the part of the map being described, smooth ease-in-out. Return to the full map at each change of direction (left / right / straight).

5) YELLOW ROUTE LINE: Draw the route in yellow step by step, in sync with each spoken direction, not all at once at the end.

6) STEPS LIST (RIGHT SIDE): Larger, with clear screen space. Each step enters with slide + fade and a short "tick/ding" at the moment it fills in. Fixed color per word type: right = green, straight = blue, left/north = yellow-orange, corner/next to/down = light gray.

7) CAPTIONS: Arabic caption large, max 1-2 lines, max 6-7 words per line, in the safe zone near the bottom, never covering the map. Hebrew translation smaller and lighter, directly under the Arabic, one line only. Fix RTL issues (punctuation at the correct end of the Hebrew line, no word cut at the edges). Highlight in yellow ONLY the target vocabulary (left, right, straight, corner, hospital) with a small scale-pulse when spoken, using the same colors as the steps list.

8) AUDIO: Clean background noise, normalize voice level, add very light background music ducked under the voice, and a short "ding" SFX for every completed step.

9) ENDING: Replace the abrupt Hebrew text card with a clean end card: a 5-word summary + one clear call-to-action button (e.g. "Next lesson →"), held 2-3 seconds.

10) EXPORT: H.264, 1080x1920, 30 fps, ~8-12 Mbps, AAC audio. Set a clean still frame as the cover.
```
