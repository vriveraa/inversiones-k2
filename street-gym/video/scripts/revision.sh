#!/usr/bin/env bash
# Hojas de contacto del video para revisión visual: un fotograma cada PASO, 4x4 por hoja, con código de tiempo.
set -euo pipefail
VIDEO=${1:-../entrega/video_street_gym.mp4}
PASO=${2:-5}
OUT=${3:-out/revision}
rm -rf "$OUT" && mkdir -p "$OUT"
ffmpeg -loglevel error -i "$VIDEO" -vf "select='not(mod(n\,$PASO))',scale=480:270,drawtext=text='%{eif\:n*$PASO\:d} · %{pts\:hms}':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=0x13202E@0.8:boxborderw=5,tile=4x4:padding=4:color=white" -vsync vfr "$OUT/hoja-%02d.jpg"
ls "$OUT" | wc -l
