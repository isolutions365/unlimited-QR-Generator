import { Jimp, loadFont } from 'jimp';
import { SANS_64_BLACK, SANS_32_BLACK } from 'jimp/fonts';
import * as path from 'path';
import * as fs from 'fs';

// Color stops from /public/logo.svg rainbow-grad
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
  const t = Math.max(0, Math.min(1, d));
  
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

// Check if a 512x512-mapped point is inside any of the white shapes of the brand logo
function isInsideWhiteLogoShapes(ox, oy) {
  // Top-Left finder: rx=154.624, ry=154.624, rw=78.848, rh=78.848, rad=19.712
  if (isInsideRoundedRect(ox, oy, 154.624, 154.624, 78.848, 78.848, 19.712)) return true;
  // Top-Right finder: rx=278.528, ry=154.624, rw=78.848, rh=78.848, rad=19.712
  if (isInsideRoundedRect(ox, oy, 278.528, 154.624, 78.848, 78.848, 19.712)) return true;
  // Bottom-Left finder: rx=154.624, ry=278.528, rw=78.848, rh=78.848, rad=19.712
  if (isInsideRoundedRect(ox, oy, 154.624, 278.528, 78.848, 78.848, 19.712)) return true;
  // Alignment 1: rx=278.528, ry=278.528, rw=33.792, rh=33.792, rad=8.448
  if (isInsideRoundedRect(ox, oy, 278.528, 278.528, 33.792, 33.792, 8.448)) return true;
  // Alignment 2: rx=323.584, ry=323.584, rw=33.792, rh=33.792, rad=8.448
  if (isInsideRoundedRect(ox, oy, 323.584, 323.584, 33.792, 33.792, 8.448)) return true;
  
  return false;
}

async function generate() {
  const WIDTH = 1200;
  const HEIGHT = 630;
  
  console.log('Initializing premium 1200x630 pixel off-white background canvas...');
  // Sophisticated off-white color (#f8fafc)
  const img = new Jimp({ width: WIDTH, height: HEIGHT, color: 0xf8fafcff });
  
  // Brand Logo Container sizing & positioning (400x400)
  const logoX = 110;
  const logoY = 115;
  const logoSize = 400;
  const logoRadius = 96; // 122.88 * (400/512) = 96
  
  console.log('Drawing high-quality brand logo matching /public/logo.svg perfectly...');
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // Check if pixel falls inside the 400x400 brand logo squircle
      if (isInsideRoundedRect(x, y, logoX, logoY, logoSize, logoSize, logoRadius)) {
        // Map the coordinates back to the original 512x512 logo coordinates
        const ox = (x - logoX) / 0.78125;
        const oy = (y - logoY) / 0.78125;
        
        if (isInsideWhiteLogoShapes(ox, oy)) {
          // Inside white shapes -> Paint solid white
          img.setPixelColor(0xffffffff, x, y);
        } else {
          // Outside white shapes but inside logo squircle -> Paint linear gradient matching SVG
          const d = (ox / 512 + oy / 512) / 2;
          const col = interpolateColor(d);
          const colorVal = ((col.r << 24) | (col.g << 16) | (col.b << 8) | 255) >>> 0;
          img.setPixelColor(colorVal, x, y);
        }
      }
    }
  }
  
  // Draw an elegant, ultra-subtle divider line next to the logo container
  const dividerX = 570;
  const dividerYStart = 160;
  const dividerHeight = 310;
  const dividerThickness = 3;
  // Slate-200 color: #e2e8f0 (r=226, g=232, b=240, alpha=255)
  for (let dy = 0; dy < dividerHeight; dy++) {
    for (let dx = 0; dx < dividerThickness; dx++) {
      img.setPixelColor(0xe2e8f0ff, dividerX + dx, dividerYStart + dy);
    }
  }

  console.log('Loading Jimp fonts for crisp text rendering...');
  const font64 = await loadFont(SANS_64_BLACK);
  const font32 = await loadFont(SANS_32_BLACK);
  
  console.log('Rendering text onto Open Graph template...');
  // Title
  img.print({ font: font64, x: 610, y: 145, text: 'FreeQRGen' });
  
  // Subtitle
  img.print({ font: font32, x: 610, y: 225, text: 'Free Unlimited QR Code Generator' });
  
  // Description sub-bullets with precise geometric alignments
  img.print({ font: font32, x: 610, y: 300, text: '• Custom Colors, Gradients & Logos' });
  img.print({ font: font32, x: 610, y: 350, text: '• Dynamic Redirects & Scan Analytics' });
  img.print({ font: font32, x: 610, y: 400, text: '• 100% Free, Private & Unlimited' });
  img.print({ font: font32, x: 610, y: 450, text: '• No Signup or Account Required' });
  
  // Save the final image to /public/og-image.jpg as a high-quality JPEG
  const outputPath = path.join('public', 'og-image.jpg');
  console.log(`Writing high-quality, properly encoded JPG output to ${outputPath}...`);
  const buffer = await img.getBuffer('image/jpeg', { quality: 92 });
  fs.writeFileSync(outputPath, buffer);
  console.log('OG image successfully created and saved!');
}

generate().catch((err) => {
  console.error('Error during OG image generation:', err);
  process.exit(1);
});
