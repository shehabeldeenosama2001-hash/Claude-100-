import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts ship in public/fonts so renders work offline (all are SIL OFL)
export const balooFont = "Baloo Bhaijaan 2";
export const quranFont = "Amiri Quran";
export const messiriFont = "El Messiri";

loadFont({
  family: balooFont,
  url: staticFile("fonts/BalooBhaijaan2.ttf"),
  weight: "400 800",
});

loadFont({
  family: quranFont,
  url: staticFile("fonts/AmiriQuran.ttf"),
  weight: "400",
});

loadFont({
  family: messiriFont,
  url: staticFile("fonts/ElMessiri.ttf"),
  weight: "400 700",
});
