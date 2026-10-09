import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { Y } from "./design";

// Both faces ship in public/fonts (synced from yalla/shared/fonts)
loadFont({
  family: Y.fonts.display.family,
  url: staticFile(Y.fonts.display.file),
  weight: Y.fonts.display.weight,
});
loadFont({
  family: Y.fonts.quran.family,
  url: staticFile(Y.fonts.quran.file),
  weight: Y.fonts.quran.weight,
});

export const DISPLAY = Y.fonts.display.family;
export const QURAN = Y.fonts.quran.family;
