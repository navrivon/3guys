#!/bin/bash

# Create images directory
mkdir -p images

# List of unique unsplash image IDs
declare -a IMAGE_IDS=(
  "1593504049359-74330189a345:frame-1"
  "1628840042765-356cda07504e:frame-2"
  "1513104890138-7c749659a591:pizza-deep-dish"
  "1534308983496-4fabb1a015ee:frame-4"
  "1517686469429-8bdb88b9f907:frame-5"
  "1541745537411-b8046dc6d66c:pizza-vesuvio"
  "1571407970349-bc81e7e96d47:pizza-cheese"
  "1550547660-d9450f859349:burger-big-guy"
  "1568901346375-23c9450c58cd:burger-chicken"
  "1520072959219-c595dc870360:burger-taramri"
  "1630384060421-cb20d0e0649d:fries-loaded"
  "1518013431117-eb1465fa5752:fries-animal"
  "1530469912745-a215c6b256ea:wrap-beast"
)

echo "Downloading images from Unsplash..."
for entry in "${IMAGE_IDS[@]}"; do
  ID="${entry%:*}"
  NAME="${entry#*:}"
  URL="https://images.unsplash.com/photo-${ID}?auto=format&fit=crop&q=80&w=1200"
  
  echo "Downloading: $NAME ($ID)"
  curl -s -o "images/${NAME}.jpg" "$URL"
done

echo "Converting to WebP..."
for jpg in images/*.jpg; do
  webp_name="${jpg%.jpg}.webp"
  echo "Converting: $jpg to $webp_name"
  convert "$jpg" -quality 85 "$webp_name"
done

echo "Done! WebP images created in assets/images/"
ls -lh images/
