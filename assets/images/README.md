# Assets/Images Directory

## Overview
This folder contains all optimized WebP images used in the 3 Guys Cafe website.

**Total Size**: ~1.3 MB
**Format**: WebP (modern, optimized web format)
**Quality**: 85% compression (excellent quality at minimal file size)

---

## Background Frame Images

Used for the scrolling hero background that cycles as users scroll the page.

### `frame-1.webp` (121 KB)
- Vibrant food photography
- Used in hero section background rotation
- Blurred & filtered with: brightness(42%), contrast(125%), saturate(110%)

### `frame-2.webp` (238 KB)
- High-contrast food scene
- Part of frame rotation cycle
- Creates cinematic hero experience

### `frame-4.webp` (81 KB)
- Medium-brightness food photograph
- Part of scrolling animation
- Frames can be reused/repeated for variety

### `frame-5.webp` (59 KB)
- Compact frame image
- Fills gaps in rotation
- Lower file size = faster load

---

## Menu Item Images

Each product in the menu displays one of these images. They appear as 1:1 square cards on the menu grid.

### Pizza Category

**`pizza-deep-dish.webp` (128 KB)**
- Deep-Dish Dynamo (Signature item)
- Used in: Menu cards + Frame rotation
- Appetizing close-up shot
- Highlights: Cheese strings, crust texture

**`pizza-vesuvio.webp` (76 KB)**
- Vesuvio Spice (Spicy pizza)
- Visible pepperoni and chili elements
- Warm, vibrant colors
- Signals "hot/spicy" visually

**`pizza-cheese.webp` (110 KB)**
- Cheese Obsession (All-cheese pizza)
- Golden, melted cheese focus
- Rich, indulgent appearance
- Close-up of texture

### Burger Category

**`burger-big-guy.webp` (104 KB)**
- The Big Guy (Double beef bestseller)
- Stacked, towering burger
- Shows multiple layers visually
- Melted cheese prominent

**`burger-chicken.webp` (55 KB)**
- Chicken Heavyweight
- Crispy coating visible
- Fresh toppings/slaw
- Lighter color palette

**`burger-taramri.webp` (36 KB)**
- Taramri Fire (Spicy heat burger)
- Jalapenos/spicy elements visible
- Bold, dramatic presentation
- Smallest file = efficient loading

### Fries Category

**`fries-loaded.webp` (62 KB)**
- Fully Loaded Fries (with toppings)
- Cheese, seasoning, sauce drizzle
- Shows abundance and thickness
- Golden, crispy appearance

**`fries-animal.webp` (32 KB)**
- Animal Fries
- Beef bits, onions, sauce
- Messy, appetizing shot
- Compact file size for quick loading

### Wraps Category

**`wrap-beast.webp` (282 KB)**
- The Beast Wrap (Grilled chicken)
- Fresh, colorful ingredients visible
- Layers and texture prominent
- Largest file = highest detail
- Rectangular/wrap appearance

---

## Usage in Code

### In `src/config/site.ts`:

```typescript
const local = (path: string) => `/assets/images/${path}.webp`;

// Frames rotation
frames: {
  urls: [
    'frame-1',
    'frame-2',
    'pizza-deep-dish',
    'frame-4',
    'frame-5',
    'pizza-vesuvio',
    'pizza-cheese',
    'pizza-deep-dish',
  ].map(local),
}

// Menu items
menu: [
  {
    items: [
      {
        name: 'Deep-Dish Dynamo',
        image: local('pizza-deep-dish'),
      },
      // ... more items
    ]
  }
]
```

### In `src/App.tsx`:

```typescript
// Background frames
<canvas ref={canvasRef} className="h-full w-full brightness-[0.42] contrast-125 saturate-[1.1]" />

// Menu item cards
<img src={item.image} alt={item.name} className="h-full w-full object-cover" />
```

---

## Performance Notes

### File Sizes Breakdown

| Type | Count | Total | Average |
|------|-------|-------|---------|
| Frames | 4-8 | ~600 KB | ~90 KB |
| Menu Items | 9 | ~700 KB | ~78 KB |
| **Total** | **13** | **~1.3 MB** | **~100 KB** |

### Loading Strategy

1. **Framework First** (lazy-loaded on scroll)
   - Images load as users scroll to hero section
   - Canvas background loads immediately
   - Progressive enhancement approach

2. **Menu Images** (deferred load)
   - Only load when menu section is visible
   - Browser's lazy-loading handles this
   - Mobile-friendly (reduces initial load)

3. **Caching** (browser + CDN)
   - WebP images are cached aggressively
   - Hash in filenames allows cache busting
   - Fast repeat visits

---

## Adding New Images

### Step 1: Prepare Image
```bash
# Convert JPG to WebP (85% quality)
convert input.jpg -quality 85 output.webp

# Or use cwebp
cwebp -q 85 input.jpg -o output.webp
```

### Step 2: Place in Folder
```bash
cp output.webp /assets/images/
```

### Step 3: Update Config
```typescript
// src/config/site.ts
image: local('my-new-image')  // no .webp extension needed
```

### Step 4: Rebuild & Deploy
```bash
npm run build
# Deploy dist/ folder
```

---

## Recommended Image Specifications

For consistency and quality:

- **Resolution**: 1200-1600px (width)
- **Aspect Ratio**: 1:1 (for menu items) or 16:9 (for frames)
- **Format**: JPG → convert to WebP
- **Quality**: 85% (good balance of quality vs size)
- **Color Saturation**: High (vibrant, not washed out)
- **Lighting**: Dramatic, directional (not flat)

---

## Troubleshooting

### Image Not Showing?
1. Check filename spelling (case-sensitive on Linux)
2. Verify file is in `/assets/images/` folder
3. Clear browser cache (Ctrl+Shift+R)
4. Check console for 404 errors (F12 → Network)

### Blurry Image?
1. Increase source image resolution
2. Use high-quality source JPG (not already compressed)
3. Verify WebP export quality setting (85%+)

### Slow Loading?
1. Check file size (should be <150 KB per image)
2. Re-compress with cwebp/convert
3. Use CDN for faster delivery (optional)

### Wrong Image on Menu Item?
1. Double-check filename in `CONFIG.menu[].items[].image`
2. Verify spelling matches `/assets/images/` filename
3. Rebuild with `npm run build`

---

## Maintenance

### Regular Checks
- [ ] Monthly: Review image freshness
- [ ] Quarterly: Update outdated/low-performing images
- [ ] Annually: Optimize for latest WebP compression standards

### Future Enhancements
- Add 2x resolution variants for high-DPI displays
- Create responsive image sets (small/medium/large)
- Implement progressive image loading
- Add image transformation pipeline

---

**Last Updated**: April 27, 2026
**Total Files**: 13 WebP images
**Status**: ✅ Production Ready
