---
name: reel-motion-studio
description: End-to-end TikTok/Reels montage for a vertical talking-head clip (course promo, product pitch, "N features/reasons" video) on top of OpenMontage + Remotion — watch/analyze reference videos, transcribe, then render a cold-open hook (3 variants), one bespoke motion graphic per feature in a split-screen layout, word-pop Arabic/RTL TikTok captions, a CTA card and a synthesized royalty-free music bed + SFX. Use when the user sends a talking-head video and asks for subtitles, motion graphics, a hook, "مونتاج", "صب تايتل", "موشن جرافيك", "زي ريل الكورس", or pastes a reference reel to copy its style. Fully local and free.
---

# Reel Motion Studio

Built in the "OpenMontage repository overview" session: OpenMontage
(https://github.com/calesthio/OpenMontage) supplies the Remotion renderer, Python tools and
pipeline rules; this skill adds a reusable reel template on top. The first production is in
`course-reel/` (renders, `PLAN.md`, `reel_plan.json`, review sheets).

## The user (read first)

- Speaks Egyptian Arabic — reply in Egyptian Arabic, plain words, no jargon.
- **Everything free.** Never spend credits (Higgsfield, Everygen, paid APIs) without an explicit yes.
  Prefer local tools; say "0$" when that is the case.
- Likes to fire off a brief and come back later: "اعمل كل الأفكار وأنا هتشك بعدين". Do the
  maximum, render real outputs, and deliver files — but never fake a part you could not do.
- Wants things he can reuse: package new work as skills/templates, keep files on the branch.

## Workflow

### 0. Environment check (cloud sessions)
Before promising anything, test what the network allows:
`curl -sS -o /dev/null -w "%{http_code}" <host>` and `curl -sS "$HTTPS_PROXY/__agentproxy/status"`.
In the original cloud session `huggingface.co` (Whisper models), `openaipublic.azureedge.net`
(OpenAI Whisper weights) and `tiktok.com` were blocked; only pypi, npm and GitHub (git) were reachable. If a needed host
is blocked, tell the user the exact host and that they add it under the environment's Network
access → Allowed domains (https://code.claude.com/docs/en/cloud-environments#network-access).
Do not route the user's media through third-party services to dodge a block.

### 1. Setup (once per machine)
1. `git clone https://github.com/calesthio/OpenMontage.git` → `make setup` inside it
   (Windows without make: README's PowerShell one-liner).
2. `python scripts/install_into_openmontage.py <OpenMontage>` — copies `template/` into
   `remotion-composer/src/course-reel/`, registers the `CourseReel` composition, installs
   Cairo/Montserrat fonts and Noto emoji PNGs, synthesizes the SFX. Idempotent.
3. Read OpenMontage's `AGENT_GUIDE.md` — its rules (announce provider/model before paid calls,
   ask before major changes, present Remotion vs HyperFrames) still apply.

### 2. Understand the inputs
- **Source clip:** `ffprobe` it, make a contact sheet
  (`ffmpeg -i in.mp4 -vf "fps=1/5,scale=240:-1,tile=4x2" sheet.jpg`) and look at it.
- **Speech segments:** `ffmpeg -i in.mp4 -af silencedetect=noise=-35dB:d=0.35 -f null -`
  — each gap is usually a new sentence/feature.
- **Reference reel (link or file):** use the `watch` skill (`.claude/skills/watch`) — local engine
  extracts frames + captions; Gemini engine needs a free key. TikTok links need tiktok.com reachable.
  If nothing can open it, ask the user to save the video and send the file. Never describe a video
  you did not see.

### 3. Transcribe
OpenMontage `tools/analysis/transcriber.py` (faster-whisper, `model_size: medium`, word timestamps)
or the `watch` skill's WhisperX backend. Both download models from huggingface.co.
`pocketsphinx` (pypi) is English-only and useless for Arabic — don't bother.
**If transcription is impossible:** say so, then (only if the user wants a preview anyway) render
with clearly-labelled placeholder copy: `showDemoBadge: true` and tell the user the captions are
not the speaker's words. Never present placeholder text as a transcript.

### 4. Plan → `plan.json` (shape: `template/plan.example.json`)
- `segments[]`: `{start, end, role: intro|feature|cta, feature?, text, words?}` in *source* seconds;
  `words` = real `[{word,start,end}]`, else text is spread over the segment.
- `features[]`: `{kind, title, subtitle, steps?}`; kinds: `practical`, `certificate`, `mentor`,
  `projects`, `lifetime` (add more — see below).
- `hooks.A|B|C` + `hookVariant` (`"none"` = no cold open), `intro`, `cta`, `trimStart/trimEnd`.
- Write 3 differentiated hooks: A shock stat, B social-proof counter, C time promise.

### 5. Review stills, then render
- `node render-course-reel.mjs stills review/ 50,140,365,656,817,1130 [props.json]`
  and tile them: `ffmpeg -pattern_type glob -i 'review/f*.jpg' -vf "scale=360:-1,tile=5x2" sheet.jpg`.
  Check: captions not over eyes/mouth, emoji visible, nothing clipped, RTL order right.
- `node render-course-reel.mjs video out.mp4 [props.json] [start-end]` (~2 min / 40 s on 4 cores).
  Hook variants: render only `0-170` with `props_hookB.json` etc.
- Verify: ffprobe duration/streams, `volumedetect` (max ≈ -1.5 dB, no clipping), a contact sheet of
  the final file.
- Set `REMOTION_BROWSER` to reuse a Chromium (cloud: `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`).

### 6. Deliver
Copy renders into the repo working dir, send them with SendUserFile, commit + push. Report:
what's in the video (timeline), what is placeholder/unverified, cost, what the user must decide
(hook choice, real course name/handle, transcript).

## What the template renders (1080×1920, 30 fps)

| Part | Look |
|---|---|
| Hook (2.4 s) | Frozen expressive frame, slow push-in, RGB split + shake, scanlines, slammed text; A hazard tape, B rolling counter, C stopwatch. White flash in. |
| Intro | Full screen kicker slam ("٥ حاجات") + pill headline, punch-in zoom. |
| Features | Split: 860 px motion panel on top, speaker slid down 590 px. Lime wipe + whoosh between features; badge, "01 / 05" counter, word-by-word title. |
| CTA | Diagonal ticker, pulsing shiny button, "link in bio"; captions hidden. |
| Captions | Cairo Black RTL, ≤3 words/page, always one line (auto-shrink), lime pill + spring pop on the active word, keywords tinted. |
| Audio | Speech + 92 BPM lo-fi bed ducked under speech + whoosh/impact/riser/pop/ding/chime from `scripts/synth_audio.py`. |

## Lessons learned (keep these)

- **Emoji:** headless Chromium did not render the Noto colour-emoji *web font* inside bold Arabic
  text (blank glyphs). Emoji are therefore `<img>` PNGs via `withEmoji()`; add new ones to `EMOJIS`
  in `install_into_openmontage.py` and re-run it.
- **Caption placement:** in split mode the face sits low — captions at `bottom: 150`; two-line
  pages climbed onto the mouth, hence forced single-line pages.
- **CTA:** a pointing emoji above the button landed on the speaker's nose — keep CTA elements below
  the face line.
- **Projects panel:** keep the chart at `scale(.8)` or it collides with the fanned cards.
- **Remotion ESM script** must live inside `remotion-composer/` to resolve `@remotion/*`.
- **Stills first:** a 9-frame still pass (~30 s) caught every layout bug before the 2-minute render.
- Do not commit third-party AGPL trees (OpenMontage itself) to the user's repo; commit only our code
  and outputs.

## Adding a feature graphic

New component in `template/FeatureGraphics.tsx` for the 1080×860 panel (content y≈380–820),
add its `kind` to the `Feature` union, `ACCENTS`, the `FeaturePanel` switch, and an SFX cue in
`SfxForFeature` (`template/CourseReel.tsx`). Re-run the installer to copy it into OpenMontage.
