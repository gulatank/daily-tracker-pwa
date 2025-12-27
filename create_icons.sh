#!/bin/bash
# Create simple colored square icons as placeholders
# You can replace these later with proper app icons

# Create 192x192 icon using sips (macOS built-in)
sips -s format png -z 192 192 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out public/icons/icon-192.png 2>/dev/null || \
convert -size 192x192 xc:'#3b82f6' -fill white -gravity center -pointsize 80 -annotate +0+0 '🎤' public/icons/icon-192.png 2>/dev/null || \
echo "Please create icons manually: 192x192 and 512x512 PNG files in public/icons/"

# Create 512x512 icon
sips -s format png -z 512 512 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out public/icons/icon-512.png 2>/dev/null || \
convert -size 512x512 xc:'#3b82f6' -fill white -gravity center -pointsize 200 -annotate +0+0 '🎤' public/icons/icon-512.png 2>/dev/null || \
echo "Please create icons manually: 192x192 and 512x512 PNG files in public/icons/"

echo "Icon creation attempted. If icons weren't created, please create them manually."
