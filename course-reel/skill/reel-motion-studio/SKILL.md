---
name: reel-motion-studio
description: Turn a vertical talking-head clip (course promo, product pitch, "N reasons/features" video) into a finished TikTok/Reels edit on top of OpenMontage + Remotion — cold-open hook (3 variants), one bespoke motion graphic per feature in a split-screen layout, word-pop Arabic/RTL TikTok captions, CTA end card, synthesized royalty-free music bed and SFX. Use when the user asks for subtitles + motion graphics + a hook on a talking-head reel, or says "زي ريل الكورس". Runs fully local and free.
---

# Reel Motion Studio

A reusable Remotion template built on OpenMontage (https://github.com/calesthio/OpenMontage).
The first production made with it is the course-promo reel in `course-reel/` of the
`claude/openmontage-overview-l9b7cf` branch (renders + review sheets there).

## What the template renders (1080×1920, 30 fps)

| Part | Look |
|---|---|
| Hook (default 2.4 s) | Frozen expressive frame, slow push-in, RGB split + shake, scanlines, slammed kinetic text. A = shock stat + hazard tape, B = rolling "+N students" counter, C = stopwatch countdown. White flash into the clip. |
| Intro | Full screen, big kicker ("٥ حاجات") slam + white pill headline, punch-in zoom mid-sentence. |
| Features | Screen splits: 860 px motion panel on top, speaker slides down. Lime wipe + whoosh between features. Built-in kinds: `practical` (laptop typing code + 3 ticking steps), `certificate` (3D flip, gold seal stamp, shockwave, confetti), `mentor` (chat thread + typing dots), `projects` (fanned portfolio cards + growth line + counter), `lifetime` (self-drawing ∞ with comet + rolling years). |
| CTA | Full screen, diagonal ticker tape, pulsing shiny button, "link in bio". Captions hide here (the button says it). |
| Captions | Cairo Black, RTL, ≤3 words/page, always one line (auto-shrinks), active word gets lime pill + spring pop, keywords tinted lime. Low in split mode so they never cover the mouth. |
| Audio | Original speech + 92 BPM lo-fi bed (ducked under speech) + whoosh/impact/riser/pop/ding/chime, all synthesized by `scripts/synth_audio.py` — no licensing. |

Emoji are drawn as Noto PNGs (headless Chromium renders colour-emoji web fonts unreliably).
Add new emoji to `EMOJIS` in `scripts/install_into_openmontage.py` and re-run it.

## Setup (once per machine)

1. `git clone https://github.com/calesthio/OpenMontage.git` then `make setup` inside it
   (Windows without make: follow the README's PowerShell one-liner).
2. `python scripts/install_into_openmontage.py <path-to-OpenMontage>` — copies the template into
   `remotion-composer/src/course-reel/`, registers the `CourseReel` composition in `Root.tsx`,
   installs `@fontsource/cairo`, `@fontsource/montserrat`, `emoji-datasource-google`, copies the
   emoji PNGs and synthesizes the SFX. Idempotent.

## Making a reel

1. Put the clip at `remotion-composer/public/course-reel/raw.mp4` (any vertical talking head).
2. Find speech segments: `ffmpeg -i raw.mp4 -af silencedetect=noise=-35dB:d=0.35 -f null -`.
3. Transcribe with OpenMontage's `transcriber` tool (faster-whisper, needs huggingface.co reachable)
   to get word timestamps. If transcription is impossible, say so plainly — never present
   placeholder captions as the speaker's words.
4. Edit `remotion-composer/src/course-reel/plan.json` (shape: `template/plan.example.json`):
   - `segments[]`: `{start, end, role: intro|feature|cta, feature?, text, words?}` in *source* seconds.
     `words` = real `[{word,start,end}]`; without it the text is spread across the segment.
   - `features[]`: `{kind, title, subtitle, steps?}` — one per feature index.
   - `hooks.A|B|C`, `hookVariant` (`"none"` drops the cold open), `intro`, `cta`, `trimStart/trimEnd`.
5. Review stills before a full render (fast, catches layout problems):
   `node render-course-reel.mjs stills review/ 50,140,365,656,817,1130 [props.json]`
   Check: text not over eyes/mouth, emoji visible, nothing clipped at the panel edge.
6. Render: `node render-course-reel.mjs video out.mp4 [props.json] [start-end]`
   (~2 min for 40 s on 4 cores). Verify with ffprobe + volumedetect and a frame contact sheet.

Set `REMOTION_BROWSER=<path to chrome/headless_shell>` to reuse an installed Chromium;
otherwise Remotion downloads its own the first time.

## Adding a new feature graphic

Add a component in `FeatureGraphics.tsx` sized for the 1080×860 panel (content between y≈380 and
y≈820; the header sits above), add its `kind` to the `Feature` union, `ACCENTS` and the
`FeaturePanel` switch, and give it a cue in `SfxForFeature` in `CourseReel.tsx`.

## House rules from the user

- Everything free unless the user explicitly approves spending (no Higgsfield credits etc.).
- Talk to the user in Egyptian Arabic.
- Before a paid or major change (provider, model, runtime), announce it and ask — OpenMontage's
  `AGENT_GUIDE.md` rules still apply.
