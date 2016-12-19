#!/bin/sh
cd "${0%/*}"
inkscape --export-png=512.png --export-background-opacity=0 --without-gui -h 512 -w 512 icon.svg
for i in 16 32 48 128 256; do echo $i; convert 512.png -resize $i $i.png; done
png2icns icon.icns 16.png 32.png 48.png 128.png 256.png 512.png
rm 16.png 32.png 48.png 128.png 256.png 512.png
