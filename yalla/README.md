# يلا: "قبل ما يكبر... خليه يبدأ"

A 38-second vertical film (1080×1920, 30 fps, 1140 frames), built twice from one design system: once in HyperFrames and once in Remotion.

| Folder | What it is |
| --- | --- |
| `shared/` | The single source of truth: `design.json` (colour tokens, ornament and silhouette paths, scene frame ranges, copy, beats, recitation timing), plus fonts and audio beds |
| `hyperframes/` | HyperFrames build: `index.html` mounts one sub-composition per scene from `compositions/`; GSAP timelines; helpers in `assets/kit.js` |
| `remotion/` | Remotion build: one `<Composition>` with one `<Sequence>` per scene; `spring({ damping: 200 })` and ease-in-out cubic `interpolate()` |
| `exports/` | The two rendered MP4s |

## Editing the shared design

```console
node shared/build-design.mjs   # regenerate design.json (geometry is computed here)
python3 -I shared/make-audio.py # regenerate the room tone and pad beds
node shared/sync.mjs           # mirror design, fonts and audio into both projects
```

After a fresh clone, run `node shared/sync.mjs` once before previewing or rendering either project. HyperFrames reads `hyperframes/assets/design.js`, which is a generated mirror of `design.json`. Remotion imports `shared/design.json` directly.

## Adding the child's recitation

The recitation is the lead audio layer, and it is not included yet. It must be recorded clean and dry, with the family's consent.

1. Save it as `shared/audio/recitation.wav`, starting at frame 0.
2. Replace the placeholder timings in `shared/recitation-timing.json` with the ayah timestamps exported from the recording. Set `firstLongNote` to when the first long note lands and `end` to when the recitation stops. Then run `build-design.mjs` and `sync.mjs`. The waveform amplitude, the rosette bloom and the ayah underline all follow these timings.
3. HyperFrames: add `<audio id="recitation" src="assets/audio/recitation.wav" data-start="0" data-duration="16" data-track-index="9" data-volume="1">` in `index.html` next to the other two beds.
4. Remotion: render with `--props='{"withRecitation":true}'`.

The pad file stays silent until 16 s (frame 480), so no music ever plays under the recitation.

## Rendering

```console
cd hyperframes && npx --yes hyperframes@0.8.143 render --quality delivery --output renders/yalla.mp4
cd remotion && npx remotion render YallaFilm out/yalla.mp4
```

## Notes

- **Quranic text:** Surah Al-Ikhlas in Uthmani script, copied byte-for-byte from the Noble Qur'an Encyclopedia text (via the `quran-json` package). It is only ever faded or masked as a whole ayah.
- **Fonts:** Cairo for the colloquial lines, and Amiri Quran (SIL OFL) for the ayah. KFGQPC Uthmanic Hafs can be swapped in through `design.json` → `fonts.quran` if you hold a copy.
- **Palette:** #053C96, #F6F0E1 and #032A6B, plus #FFFFFF for the slogan only. No other hues.
