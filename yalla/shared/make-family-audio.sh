#!/usr/bin/env bash
# Builds audio/family-mix.wav for the YallaFamily film with FFmpeg only:
# a percussion-free chord bed, transition effects at the cut points, and a
# limited final mix trimmed to the film's exact length (1327 frames at 30fps).
#
# Needs a full FFmpeg build (the one bundled with Remotion has no fades or
# filters). Run with: bash yalla/shared/make-family-audio.sh
set -euo pipefail

FFMPEG="${FFMPEG:-ffmpeg}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/audio"
WORK="$(mktemp -d)"
trap 'rm -rf -- "$WORK"' EXIT
LENGTH=44.233
ff() { "$FFMPEG" -nostdin -hide_banner -loglevel error -y "$@"; }

# One chord: each note doubled with a slightly detuned copy, gently swelling
chord() { # name duration freq...
  local name=$1 dur=$2
  shift 2
  local inputs=() mix="" n=0
  for f in "$@"; do
    for detune in 0.997 1.003; do
      inputs+=(-f lavfi -i "sine=frequency=$(awk "BEGIN{print $f*$detune}"):duration=$dur:sample_rate=48000")
      mix+="[$n:a]"
      n=$((n + 1))
    done
  done
  ff "${inputs[@]}" -filter_complex \
    "${mix}amix=inputs=$n:normalize=1,tremolo=f=0.13:d=0.35,lowpass=f=1400,aformat=channel_layouts=stereo" \
    "$WORK/$name.wav"
}

# Dmaj9 under the mother and father, Gmaj7 under the children, D for the close
chord a 22.5 146.83 220 293.66 329.63 369.99
chord b 12.5 98 146.83 246.94 293.66 369.99
chord c 13.5 146.83 220 293.66 369.99 440
ff -i "$WORK/a.wav" -i "$WORK/b.wav" -i "$WORK/c.wav" -filter_complex \
  "[0][1]acrossfade=d=1.6:c1=qsin:c2=qsin[ab];[ab][2]acrossfade=d=1.6:c1=qsin:c2=qsin,aecho=0.8:0.6:70|140:0.25|0.15,afade=t=in:d=2.5,afade=t=out:st=$(awk "BEGIN{print $LENGTH-2.8}"):d=2.8,atrim=0:$LENGTH" \
  "$WORK/bed.wav"

# Soft whoosh for the dissolves
ff -f lavfi -i "anoisesrc=d=0.9:c=pink:a=0.8:r=48000" -af \
  "bandpass=f=1100:width_type=h:w=1400,afade=t=in:d=0.42:curve=exp,afade=t=out:st=0.42:d=0.48:curve=qsin,aformat=channel_layouts=stereo" \
  "$WORK/whoosh.wav"
# Sharp whip for the whip pan
ff -f lavfi -i "anoisesrc=d=0.38:c=white:a=0.9:r=48000" -af \
  "highpass=f=700,bandpass=f=2600:width_type=h:w=3000,afade=t=in:d=0.06,afade=t=out:st=0.08:d=0.3:curve=exp,aformat=channel_layouts=stereo" \
  "$WORK/whip.wav"
# Soft chime for the logo
ff -f lavfi -i "sine=frequency=1318.5:duration=2.4:sample_rate=48000" \
  -f lavfi -i "sine=frequency=1760:duration=2.4:sample_rate=48000" \
  -f lavfi -i "sine=frequency=2637:duration=2.4:sample_rate=48000" -filter_complex \
  "[0]volume=1[x];[1]adelay=90,volume=0.7[y];[2]adelay=180,volume=0.4[z];[x][y][z]amix=inputs=3:normalize=0,afade=t=out:st=0.05:d=2.3:curve=exp,aecho=0.8:0.5:120|240:0.3|0.2,aformat=channel_layouts=stereo" \
  "$WORK/chime.wav"

# Cut points in film frames (see FamilyFilm.tsx): dissolves at 158, 405, 795,
# 967; the whip pan at 635; the logo draws at 1217
ms() { awk "BEGIN{printf \"%d\", $1 * 1000 / 30}"; }
ff -i "$WORK/bed.wav" -i "$WORK/whoosh.wav" -i "$WORK/whip.wav" -i "$WORK/chime.wav" -filter_complex "
  [0]volume=10dB[bed];
  [1]asplit=4[w1][w2][w3][w4];
  [w1]adelay=$(ms 150)|$(ms 150),volume=-6dB[s1];
  [w2]adelay=$(ms 397)|$(ms 397),volume=-6dB[s2];
  [w3]adelay=$(ms 787)|$(ms 787),volume=-6dB[s3];
  [w4]adelay=$(ms 959)|$(ms 959),volume=-5dB[s4];
  [2]adelay=$(ms 633)|$(ms 633),volume=4dB[whip];
  [3]adelay=$(ms 1217)|$(ms 1217),volume=4dB[chime];
  [bed][s1][s2][s3][s4][whip][chime]amix=inputs=7:normalize=0:duration=first,alimiter=limit=0.7:level=false,apad=whole_dur=$LENGTH,atrim=0:$LENGTH" \
  -ar 48000 -c:a pcm_s16le "$OUT/family-mix.wav"

echo "wrote $OUT/family-mix.wav"
