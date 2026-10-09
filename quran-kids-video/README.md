# Quran kids course promo

A 44-second vertical (1080×1920) promo video for a kids' Quran course, built with [Remotion](https://www.remotion.dev).

The story moves from time passing, through the distractions a child memorizes, to the hadith «كلكم راعٍ وكلكم مسئول عن رعيته». It then rises into a dawn and the logo reveal, presents the course features (one-on-one lessons, fiqh, hadith, memorization, reading), and closes on the child's du'a («أو ولد صالح يدعو له») and a call to action.

## Structure

- `src/QuranKidsPromo.tsx`: the main timeline (9 scenes joined by crossfades)
- `src/scenes/`: one file per scene, each also registered on its own in the Studio
- `src/motion/`: the shared motion system
  - `easing.ts`: expo easing curves and the blur/slide `reveal()` helper
  - `Words.tsx`: word-by-word kinetic type (Arabic animates per word, never per letter)
  - `Atmosphere.tsx`: light, particles, pattern, camera push/shake, light rays, clock ring, grain and vignette
  - `AnimatedLogo.tsx`: the logo mark building itself
- `public/fonts/`: Baloo Bhaijaan 2, El Messiri and Amiri Quran (SIL OFL), bundled so renders work offline
- `public/sfx/`: synthesized sound effects (no music), regenerated with `python3 scripts/make-sfx.py`
- `exports/`: the rendered video and logo

## Commands

```console
npm i
npm run dev                                      # preview in Remotion Studio
npx remotion render QuranKidsPromo out/video.mp4 # render the video
npx remotion still LogoPoster out/logo.png       # render the square logo
```

Note that some entities need a company license to use Remotion. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
