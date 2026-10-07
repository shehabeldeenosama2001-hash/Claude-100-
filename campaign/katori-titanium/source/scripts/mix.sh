#!/usr/bin/env bash
# Usage: mix.sh <silent.mp4> <music.wav> <out.mp4> <vo1.wav>@<sec> [<vo2.wav>@<sec> ...]
# Lays VO clips at offsets, ducks music under VO (sidechain), normalizes to -14 LUFS (social spec), muxes.
set -euo pipefail
video=$1; music=$2; out=$3; shift 3
inputs=(); filt=""; labels=""; i=2
for spec in "$@"; do
  f=${spec%@*}; t=${spec#*@}; ms=$(python3 -c "print(int(float('$t')*1000))")
  inputs+=(-i "$f")
  filt+="[$i:a]aresample=48000,aformat=channel_layouts=mono,adelay=${ms}:all=1,apad[v$i];"
  labels+="[v$i]"; i=$((i+1))
done
n=$#
filt+="${labels}amix=inputs=$n:normalize=0:duration=longest,atrim=0:15,highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,volume=1.6,asplit=2[vo][sc];"
filt+="[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${MUSIC_VOL:-0.55}[mu];"
filt+="[mu][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck];"
filt+="[vo]aformat=channel_layouts=stereo[vos];[duck][vos]amix=inputs=2:normalize=0,atrim=0:15,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
ffmpeg -y -v error -i "$video" -i "$music" "${inputs[@]}" -filter_complex "$filt" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$out"
