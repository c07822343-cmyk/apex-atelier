#!/usr/bin/env bash
# Responsive image pipeline. Usage: assets.sh <src_dir> <out_dir>
# Needs one of: avifenc/cwebp (brew install libavif webp) or ImageMagick 'magick'. Falls back to sips JPEG.
set -u; S="$1"; O="$2"; mkdir -p "$O"
for f in "$S"/*.{jpg,jpeg,png,JPG,PNG}; do [ -f "$f" ] || continue
  n=$(basename "${f%.*}"); W=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')
  set=""; for w in 640 1024 1600 2400; do [ "${W:-9999}" -lt $w ] && continue
    sips -Z $w "$f" --out "$O/$n-$w.jpg" -s format jpeg -s formatOptions 78 >/dev/null 2>&1
    command -v cwebp >/dev/null && cwebp -quiet -q 78 "$O/$n-$w.jpg" -o "$O/$n-$w.webp"
    command -v avifenc >/dev/null && avifenc -q 55 -s 6 "$O/$n-$w.jpg" "$O/$n-$w.avif" >/dev/null 2>&1
    set="$set $w"; done
  H=$(sips -g pixelHeight "$f" | awk '/pixelHeight/{print $2}'); top=$(echo $set | awk '{print $NF}')
  src(){ for w in $set; do printf "%s %sw, " "$n-$w.$1" "$w"; done | sed 's/, $//'; }
  echo "<picture>"
  command -v avifenc >/dev/null && echo "  <source type=\"image/avif\" srcset=\"$(src avif)\" sizes=\"100vw\">"
  command -v cwebp >/dev/null && echo "  <source type=\"image/webp\" srcset=\"$(src webp)\" sizes=\"100vw\">"
  echo "  <img src=\"$n-$top.jpg\" srcset=\"$(src jpg)\" sizes=\"100vw\" width=\"$W\" height=\"$H\" alt=\"[[NEEDS: alt]]\" loading=\"lazy\" decoding=\"async\">"
  echo "</picture>"
done
