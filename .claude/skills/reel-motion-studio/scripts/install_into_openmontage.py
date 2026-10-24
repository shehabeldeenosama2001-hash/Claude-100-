"""Install the reel-motion-studio template into an OpenMontage checkout.

Usage:  python install_into_openmontage.py <path-to-OpenMontage>

Copies the Remotion composition into remotion-composer/src/course-reel/, registers the
`CourseReel` composition in Root.tsx, installs the font/emoji npm packages, copies the
emoji PNGs and synthesizes the music bed + SFX. Safe to run more than once.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
EMOJIS = "😳 👇 🔥 👆 ⏱️ 🤔 👌 👩‍🏫 🛒 📱 📊 ✅ 🎓 💡 🚀".split()

COMPOSITION = """      <Composition
        id="CourseReel"
        component={CourseReel}
        durationInFrames={30 * 40}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={coursePlan as unknown as CourseReelProps}
        calculateMetadata={calculateCourseReelMetadata}
      />
"""
IMPORTS = (
    'import { CourseReel, CourseReelProps, calculateCourseReelMetadata } from "./course-reel/CourseReel";\n'
    'import coursePlan from "./course-reel/plan.json";\n'
)


def main(om: Path) -> None:
    rc = om / "remotion-composer"
    if not (rc / "src" / "Root.tsx").exists():
        sys.exit(f"Not an OpenMontage checkout (missing {rc / 'src/Root.tsx'}). Run `make setup` there first.")

    dst = rc / "src" / "course-reel"
    dst.mkdir(parents=True, exist_ok=True)
    for f in (SKILL / "template").glob("*.ts*"):
        shutil.copy(f, dst / f.name)
    if not (dst / "plan.json").exists():
        shutil.copy(SKILL / "template" / "plan.example.json", dst / "plan.json")
    shutil.copy(HERE / "render-course-reel.mjs", rc / "render-course-reel.mjs")

    root = rc / "src" / "Root.tsx"
    s = root.read_text(encoding="utf-8")
    if 'id="CourseReel"' not in s:
        first_import_end = s.index("\n", s.index("import ")) + 1
        s = s[:first_import_end] + IMPORTS + s[first_import_end:]
        i = s.rfind("    </>\n  );")
        s = s[:i] + COMPOSITION + s[i:]
        root.write_text(s, encoding="utf-8")
        print("Registered CourseReel in Root.tsx")

    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    subprocess.run([npm, "i", "--no-save", "@fontsource/cairo@5", "@fontsource/montserrat@5", "emoji-datasource-google@16.0.0"],
                   cwd=rc, check=True)

    pub = rc / "public" / "course-reel"
    (pub / "emoji").mkdir(parents=True, exist_ok=True)
    src = rc / "node_modules" / "emoji-datasource-google" / "img" / "google" / "64"
    for e in EMOJIS:
        cps = [f"{ord(c):04x}" for c in e]
        alt = "-".join(c for c in cps if c != "fe0f")
        for name in ("-".join(cps) + ".png", alt + ".png"):
            if (src / name).exists():
                shutil.copy(src / name, pub / "emoji" / f"{alt}.png")
                break
        else:
            print("missing emoji image:", e)

    (pub / "sfx").mkdir(parents=True, exist_ok=True)
    subprocess.run([sys.executable, str(HERE / "synth_audio.py"), str(pub / "sfx")], check=True)
    print(f"\nDone. Put the talking-head clip at {pub / 'raw.mp4'}, edit {dst / 'plan.json'}, then from {rc}:")
    print("  node render-course-reel.mjs video out.mp4 [props.json] [startFrame-endFrame]")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]).resolve())
