import { Jimp } from 'jimp';
import * as fs from 'fs';
import * as path from 'path';

// Color stops for the 135deg linear gradient
const stops = [
  { offset: 0.000, r: 255, g: 0,   b: 128 }, // #FF0080
  { offset: 0.166, r: 255, g: 140, b: 0   }, // #FF8C00
  { offset: 0.333, r: 255, g: 213, b: 0   }, // #FFD500
  { offset: 0.500, r: 0,   g: 230, b: 118 }, // #00E676
  { offset: 0.666, r: 0,   g: 176, b: 255 }, // #00B0FF
  { offset: 0.833, r: 124, g: 77,  b: 255 }, // #7C4DFF
  { offset: 1.000, r: 255, g: 0,   b: 128 }  // #FF0080
];

function interpolateColor(d) {
  // Clamp d to [0, 1]
  const t = Math.max(0, Math.min(1, d));
  
  // Find the two stops to interpolate between
  let i = 0;
  while (i < stops.length - 1 && t > stops[i + 1].offset) {
    i++;
  }
  
  const s0 = stops[i];
  const s1 = stops[i + 1];
  
  const range = s1.offset - s0.offset;
  const factor = range === 0 ? 0 : (t - s0.offset) / range;
  
  const r = Math.round(s0.r + (s1.r - s0.r) * factor);
  const g = Math.round(s0.g + (s1.g - s0.g) * factor);
  const b = Math.round(s0.b + (s1.b - s0.b) * factor);
  
  return { r, g, b };
}

// Check if a point is inside a rounded rect
function isInsideRoundedRect(tx, ty, rx, ry, rw, rh, rad) {
  if (tx < rx || tx > rx + rw || ty < ry || ty > ry + rh) {
    return false;
  }
  // Check corners
  // Top-Left corner
  if (tx < rx + rad && ty < ry + rad) {
    const dist = Math.sqrt(Math.pow(rx + rad - tx, 2) + Math.pow(ry + rad - ty, 2));
    return dist <= rad;
  }
  // Top-Right corner
  if (tx > rx + rw - rad && ty < ry + rad) {
    const dist = Math.sqrt(Math.pow(tx - (rx + rw - rad), 2) + Math.pow(ry + rad - ty, 2));
    return dist <= rad;
  }
  // Bottom-Left corner
  if (tx < rx + rad && ty > ry + rh - rad) {
    const dist = Math.sqrt(Math.pow(rx + rad - tx, 2) + Math.pow(ty - (ry + rh - rad), 2));
    return dist <= rad;
  }
  // Bottom-Right corner
  if (tx > rx + rw - rad && ty > ry + rh - rad) {
    const dist = Math.sqrt(Math.pow(tx - (rx + rw - rad), 2) + Math.pow(ty - (ry + rh - rad), 2));
    return dist <= rad;
  }
  return true;
}

// Check if a point is inside the QR finder shapes
function isInsideFinderShapes(tx, ty) {
  // Finder 1 (Top-Left): x=14, y=14, w=28, h=28, rad=7
  if (isInsideRoundedRect(tx, ty, 14, 14, 28, 28, 7)) return true;
  // Finder 2 (Top-Right): x=58, y=14, w=28, h=28, rad=7
  if (isInsideRoundedRect(tx, ty, 58, 14, 28, 28, 7)) return true;
  // Finder 3 (Bottom-Left): x=14, y=58, w=28, h=28, rad=7
  if (isInsideRoundedRect(tx, ty, 14, 58, 28, 28, 7)) return true;
  // Alignment 1: x=58, y=58, w=12, h=12, rad=3
  if (isInsideRoundedRect(tx, ty, 58, 58, 12, 12, 3)) return true;
  // Alignment 2: x=74, y=74, w=12, h=12, rad=3
  if (isInsideRoundedRect(tx, ty, 74, 74, 12, 12, 3)) return true;
  
  return false;
}

async function generate() {
  const SIZE = 1024; // Super-sampled size
  const img = new Jimp({ width: SIZE, height: SIZE, color: 0x00000000 });
  
  const R = SIZE * 0.24; // Apple squircle-like corner radius (24%)
  const offset = SIZE * 0.225; // 22.5% centering offset
  const scale = 100 / (SIZE * 0.55); // 55% scale factor
  
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // 1. Check if pixel is inside outer squircle
      let insideOuter = true;
      let coverage = 1.0;
      
      // Determine if pixel is in a corner of the squircle
      if (x < R && y < R) {
        const dist = Math.sqrt(Math.pow(R - x, 2) + Math.pow(R - y, 2));
        if (dist > R + 0.5) insideOuter = false;
        else if (dist > R - 0.5) coverage = R + 0.5 - dist;
      } else if (x > SIZE - R && y < R) {
        const dist = Math.sqrt(Math.pow(x - (SIZE - R), 2) + Math.pow(R - y, 2));
        if (dist > R + 0.5) insideOuter = false;
        else if (dist > R - 0.5) coverage = R + 0.5 - dist;
      } else if (x < R && y > SIZE - R) {
        const dist = Math.sqrt(Math.pow(R - x, 2) + Math.pow(y - (SIZE - R), 2));
        if (dist > R + 0.5) insideOuter = false;
        else if (dist > R - 0.5) coverage = R + 0.5 - dist;
      } else if (x > SIZE - R && y > SIZE - R) {
        const dist = Math.sqrt(Math.pow(x - (SIZE - R), 2) + Math.pow(y - (SIZE - R), 2));
        if (dist > R + 0.5) insideOuter = false;
        else if (dist > R - 0.5) coverage = R + 0.5 - dist;
      }
      
      if (!insideOuter) {
        continue; // Fully transparent pixel
      }
      
      // 2. Map coordinates to 100x100 space for QR finder shapes
      const tx = (x - offset) * scale;
      const ty = (y - offset) * scale;
      
      let r, g, b, a;
      if (tx >= 0 && tx <= 100 && ty >= 0 && ty <= 100 && isInsideFinderShapes(tx, ty)) {
        // Inner white QR shapes
        r = 255;
        g = 255;
        b = 255;
        a = Math.round(255 * coverage);
      } else {
        // Background diagonal 135deg linear gradient
        const d = (x + y) / (SIZE * 2);
        const col = interpolateColor(d);
        r = col.r;
        g = col.g;
        b = col.b;
        a = Math.round(255 * coverage);
      }
      
      // Pack RGBA color
      const colorVal = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
      img.setPixelColor(colorVal, x, y);
    }
  }
  
  console.log('Successfully rendered 1024x1024 super-sampled logo master.');
  
  // Create output paths
  const targets = [
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];
  
  for (const target of targets) {
    const resized = img.clone().resize({ w: target.size, h: target.size });
    await resized.write(path.join('public', target.name));
    console.log(`Generated public/${target.name} (${target.size}x${target.size})`);
  }
}

generate().catch(console.error);
