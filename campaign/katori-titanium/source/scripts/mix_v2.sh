#!/usr/bin/env bash
# Usage: mix_v2.sh <silent.mp4> <music.wav> <sfx.wav> <out.mp4> <vo.wav>@<sec> ...
# VO on top; music ducked hard under VO, SFX (siren/whooshes) ducked lightly; -14 LUFS for social.
set -euo pipefail
video=$1; music=$2; sfx=$3; out=$4; shift 4
inputs=(); filt=""; labels=""; i=3
for spec in "$@"; do
  f=${spec%@*}; t=${spec#*@}; ms=$(python3 -c "print(int(float('$t')*1000))")
  inputs+=(-i "$f")
  filt+="[$i:a]aresample=48000,aformat=channel_layouts=mono,adelay=${ms}:all=1,apad[v$i];"
  labels+="[v$i]"; i=$((i+1))
done
filt+="${labels}amix=inputs=$#:normalize=0:duration=longest,atrim=0:15,highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,volume=1.7,asplit=3[vo][sc1][sc2];"
filt+="[1:a]aresample=48000,volume=${MUSIC_VOL:-0.5}[mu];[mu][sc1]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=280[mud];"
filt+="[2:a]aresample=48000,volume=${SFX_VOL:-0.8}[fx];[fx][sc2]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=200[fxd];"
filt+="[vo]aformat=channel_layouts=stereo[vos];[mud][fxd][vos]amix=inputs=3:normalize=0,atrim=0:15,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
ffmpeg -y -v error -i "$video" -i "$music" -i "$sfx" "${inputs[@]}" -filter_complex "$filt" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$out"
