import qrcode from 'qrcode';
import { FrameStyle } from '../types';

interface DrawOptions {
  fgColor: string;
  bgColor: string;
  gradientType: 'none' | 'linear' | 'radial';
  gradientColor: string;
  dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond';
  eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
  logoUrl?: string;
  logoScale?: number;
  margin?: number;
  logoRotation?: number;
  eyeColorTopLeft?: string;
  eyeColorTopRight?: string;
  eyeColorBottomLeft?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logoAutoCenter?: boolean;
  logoBackgroundMask?: boolean;
  logoOffsetX?: number;
  logoOffsetY?: number;
  skipLogoImage?: boolean;
  frameStyle?: FrameStyle;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  frameFontSize?: number;
  frameTextPosition?: 'bottom' | 'top';
  smartOptimize?: boolean;
  modulePadding?: number;
}

/**
 * Custom-renders a styled QR Code to an HTML5 Canvas.
 */
export async function renderStyledQR(
  canvas: HTMLCanvasElement,
  text: string,
  options: DrawOptions
): Promise<void> {
  const size = 450;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, size, size);

  const hasFrame = options.frameStyle && options.frameStyle !== 'none';
  const margin = typeof options.margin === 'number' ? options.margin : 20;

  let qrSize = Math.max(100, size - margin * 2);
  let margin_x = margin;
  let margin_y = margin;

  const isTop = options.frameTextPosition === 'top';

  if (hasFrame) {
    qrSize = 260;
    margin_x = 35 + (380 - qrSize) / 2;
    margin_y = (isTop ? 95 : 35) + (320 - qrSize) / 2;
  }

  const center_x = margin_x + qrSize / 2;
  const center_y = margin_y + qrSize / 2;

  // Render Frame background first so the QR renders inside its inner card on top
  if (hasFrame) {
    const frameColor = options.frameColor || options.fgColor || '#4f46e5';
    const frameTextColor = options.frameTextColor || '#ffffff';
    let label = 'SCAN ME';
    if (options.frameStyle === 'menu') label = 'VIEW MENU';
    else if (options.frameStyle === 'website' || options.frameStyle === 'visit-website') label = 'VISIT WEBSITE';
    else if (options.frameStyle === 'wifi' || options.frameStyle === 'wifi-password' || options.frameStyle === 'join-wifi') label = 'CONNECT WIFI';
    else if (options.frameStyle === 'download-app') label = 'DOWNLOAD APP';
    else if (options.frameStyle === 'follow-us') label = 'FOLLOW US';
    else if (options.frameStyle === 'order-now') label = 'ORDER NOW';
    else if (options.frameStyle === 'pay-here') label = 'PAY HERE';
    else if (options.frameStyle === 'save-contact') label = 'SAVE CONTACT';
    else if (options.frameStyle === 'rate-us') label = 'RATE & REVIEW';
    else if (options.frameStyle === 'custom') label = 'CUSTOM LABEL';

    if (options.frameText && ((val) => (val || '').trim())(options.frameText) !== '') {
      label = options.frameText;
    }
    label = label.toUpperCase();

    // 1. Draw Outer Frame Container (beautiful rounded block)
    ctx.fillStyle = frameColor;
    roundRect(ctx, 20, 20, 410, 410, 24);
    ctx.fill();

    // 2. Draw Inner white/bgColor Card (the QR Code canvas surface)
    ctx.fillStyle = options.bgColor;
    const innerCardY = isTop ? 95 : 35;
    roundRect(ctx, 35, innerCardY, 380, 320, 16);
    ctx.fill();

    // 3. Render precise centered label text inside banner with auto-scaling to prevent overflow
    ctx.fillStyle = frameTextColor;
    let fontSize = options.frameFontSize || 20;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    
    // Auto-scale font size if custom text is long
    const measuredWidth = ctx.measureText(label).width;
    const maxTextWidth = 360;
    if (measuredWidth > maxTextWidth && measuredWidth > 0) {
      fontSize = Math.max(10, Math.floor(fontSize * (maxTextWidth / measuredWidth)));
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textY = isTop ? 62 : 388;
    ctx.fillText(label, 225, textY);
  }

  // Generate QR Matrix using standard qrcode package API
  let qr;
  const contentToEncode = (text && text.trim() !== '') ? text : 'https://www.freeqrbarcodes.com';
  try {
    qr = qrcode.create(contentToEncode, { errorCorrectionLevel: options.errorCorrectionLevel || 'H' });
  } catch (err) {
    console.error("Fatal: QR Code Matrix generation failed inside qrcode package:", err);
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QR Code Generation Failed', size / 2, size / 2 - 12);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Content might be too long or corrupt.', size / 2, size / 2 + 15);
    return;
  }
  const modulesCount = qr.modules.size;
  const cellSize = qrSize / modulesCount;

  // Setup foreground styling (gradients)
  let fillStyle: string | CanvasGradient = options.fgColor;
  if (options.gradientType === 'linear') {
    const grad = ctx.createLinearGradient(margin_x, margin_y, margin_x + qrSize, margin_y + qrSize);
    grad.addColorStop(0, options.fgColor);
    grad.addColorStop(1, options.gradientColor);
    fillStyle = grad;
  } else if (options.gradientType === 'radial') {
    const grad = ctx.createRadialGradient(center_x, center_y, cellSize, center_x, center_y, qrSize * 0.7);
    grad.addColorStop(0, options.fgColor);
    grad.addColorStop(1, options.gradientColor);
    fillStyle = grad;
  }

  ctx.fillStyle = fillStyle;

  // Let's identify cells belonging to Finder Patterns (Eyes) to style them customize-ably
  const isEye = (row: number, col: number): boolean => {
    // Top-Left Finder
    if (row < 7 && col < 7) return true;
    // Top-Right Finder
    if (row < 7 && col >= modulesCount - 7) return true;
    // Bottom-Left Finder
    if (row >= modulesCount - 7 && col < 7) return true;
    return false;
  };

  const paddingPct = typeof options.modulePadding === 'number' ? options.modulePadding : 0;
  const dotScale = 1 - (paddingPct / 100);

  // Skip rendering default cells in finder spots. We will draw custom ones below
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (isEye(r, c)) continue; // We skip eyes, we will render customized eyes with perfect geometry

      const isActive = qr.modules.get(r, c);
      if (!isActive) continue;

      const x = margin_x + c * cellSize;
      const y = margin_y + r * cellSize;

      ctx.beginPath();
      
      const shouldScale = dotScale < 1;
      if (shouldScale) {
        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);
        ctx.scale(dotScale, dotScale);
        ctx.translate(-(x + cellSize / 2), -(y + cellSize / 2));
      }

      if (options.dotStyle === 'dots') {
        const radius = cellSize / 2 * 0.85;
        ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (options.dotStyle === 'rounded') {
        const padding = cellSize * 0.05;
        const radius = cellSize * 0.4;
        roundRect(ctx, x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
        ctx.fill();
      } else if (options.dotStyle === 'leaf') {
        const pad = cellSize * 0.04;
        const lx = x + pad;
        const ly = y + pad;
        const w = cellSize - pad * 2;
        const r = w * 0.55;
        ctx.moveTo(lx, ly + r);
        ctx.arcTo(lx, ly, lx + r, ly, r);
        ctx.lineTo(lx + w, ly);
        ctx.lineTo(lx + w, ly + w - r);
        ctx.arcTo(lx + w, ly + w, lx + w - r, ly + w, r);
        ctx.lineTo(lx, ly + w);
        ctx.closePath();
        ctx.fill();
      } else if (options.dotStyle === 'diamond') {
        const pad = cellSize * 0.06;
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        ctx.moveTo(cx, y + pad);
        ctx.lineTo(x + cellSize - pad, cy);
        ctx.lineTo(cx, y + cellSize - pad);
        ctx.lineTo(x + pad, cy);
        ctx.closePath();
        ctx.fill();
      } else if (options.dotStyle === 'classy') {
        // Starry cross elegant shape
        ctx.moveTo(x + cellSize / 2, y + cellSize * 0.1);
        ctx.quadraticCurveTo(cellSize / 2 + x, cellSize / 2 + y, cellSize * 0.9 + x, cellSize / 2 + y);
        ctx.quadraticCurveTo(cellSize / 2 + x, cellSize / 2 + y, cellSize / 2 + x, cellSize * 0.9 + y);
        ctx.quadraticCurveTo(cellSize / 2 + x, cellSize / 2 + y, cellSize * 0.1 + x, cellSize / 2 + y);
        ctx.quadraticCurveTo(cellSize / 2 + x, cellSize / 2 + y, cellSize / 2 + x, cellSize * 0.1 + y);
        ctx.fill();
      } else {
        // Standard high-contrast square
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      if (shouldScale) {
        ctx.restore();
      }
    }
  }

  // Draw 3 Custom Finder Eyes
  const drawEye = (ox: number, oy: number, customColor?: string) => {
    const eyeSize = cellSize * 7;
    const currentEyeStyle = customColor || fillStyle;
    ctx.strokeStyle = currentEyeStyle;
    ctx.fillStyle = currentEyeStyle;
    ctx.lineWidth = cellSize;

    // Draw Outer Frame
    ctx.beginPath();
    if (options.eyeStyle === 'rounded') {
      roundRect(ctx, ox + cellSize / 2, oy + cellSize / 2, eyeSize - cellSize, eyeSize - cellSize, cellSize * 1.5);
    } else if (options.eyeStyle === 'circle') {
      ctx.arc(ox + eyeSize / 2, oy + eyeSize / 2, eyeSize / 2 - cellSize / 2, 0, Math.PI * 2);
    } else if (options.eyeStyle === 'leaf') {
      // Leaf corners symmetry design
      ctx.moveTo(ox + cellSize / 2, oy + eyeSize / 2);
      ctx.arcTo(ox + cellSize / 2, oy + cellSize / 2, ox + eyeSize / 2, oy + cellSize / 2, cellSize * 2);
      ctx.lineTo(ox + eyeSize - cellSize / 2, oy + cellSize / 2);
      ctx.arcTo(ox + eyeSize - cellSize / 2, oy + eyeSize - cellSize / 2, ox + eyeSize / 2, oy + eyeSize - cellSize / 2, cellSize * 2);
      ctx.lineTo(ox + cellSize / 2, oy + eyeSize - cellSize / 2);
      ctx.closePath();
    } else {
      // Default elegant sharp square
      ctx.rect(ox + cellSize / 2, oy + cellSize / 2, eyeSize - cellSize, eyeSize - cellSize);
    }
    ctx.stroke();

    // Draw Inner Dot (Central block)
    ctx.beginPath();
    const dotOffset = cellSize * 2;
    const dotSize = cellSize * 3;
    if (options.eyeStyle === 'rounded' || options.eyeStyle === 'leaf') {
      roundRect(ctx, ox + dotOffset, oy + dotOffset, dotSize, dotSize, cellSize);
      ctx.fill();
    } else if (options.eyeStyle === 'circle') {
      ctx.arc(ox + eyeSize / 2, oy + eyeSize / 2, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(ox + dotOffset, oy + dotOffset, dotSize, dotSize);
    }
  };

  // Top-Left Eye
  drawEye(margin_x, margin_y, options.eyeColorTopLeft);
  // Top-Right Eye
  drawEye(margin_x + (modulesCount - 7) * cellSize, margin_y, options.eyeColorTopRight);
  // Bottom-Left Eye
  drawEye(margin_x, margin_y + (modulesCount - 7) * cellSize, options.eyeColorBottomLeft);

  // Apply visual logo centered safely inside the layout
  if (options.logoUrl) {
    const logoScale = options.logoScale || 0.18;
    const logoSize = size * logoScale;
    const halfSize = logoSize / 2;

    const isAutoCentered = options.logoAutoCenter !== false;
    let offsetX = 0;
    let offsetY = 0;
    if (isAutoCentered) {
      // Auto-calculate exact optical center relative to the asymmetric heavy finder eye frames
      const eyeSize = cellSize * 7;
      offsetX = Math.round(eyeSize * 0.04);
      offsetY = Math.round(eyeSize * 0.04);
    } else {
      offsetX = options.logoOffsetX || 0;
      offsetY = options.logoOffsetY || 0;
    }

    // Use context state preservation to translate and rotate precisely about the QR center
    ctx.save();
    ctx.translate(center_x + offsetX, center_y + offsetY);
    const angleInRadians = ((options.logoRotation || 0) * Math.PI) / 180;
    ctx.rotate(angleInRadians);

    // Draw solid backplate behind the brand logo to optimize scan accuracy
    const useCircularMask = options.logoBackgroundMask === true;
    ctx.fillStyle = useCircularMask ? '#ffffff' : options.bgColor;
    ctx.beginPath();
    if (useCircularMask) {
      // Circular white badge mask extending slightly beyond the logo boundary
      const maskRadius = (logoSize + cellSize * 2.2) / 2;
      ctx.arc(0, 0, maskRadius, 0, Math.PI * 2);
    } else {
      roundRect(ctx, -halfSize - cellSize, -halfSize - cellSize, logoSize + cellSize * 2, logoSize + cellSize * 2, cellSize * 1.5);
    }
    ctx.fill();

    // Add subtle crisp border around the circular white mask for extra contrast on light/dark backgrounds
    if (useCircularMask) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Try rendering image logo
    try {
      if (options.skipLogoImage) {
        // Skip rendering the centerpiece image/text inside the canvas to allow a smooth Framer Motion overlay instead
      } else if (options.logoUrl.startsWith('http') || options.logoUrl.startsWith('data:image')) {
        const img = new Image();
        img.src = options.logoUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, -halfSize, -halfSize, logoSize, logoSize);
            resolve();
          };
          img.onerror = () => {
            // Fallback render text/placeholder if bad image load
            renderCustomPlaceholderLogo(ctx, options.logoUrl || 'Logo', -halfSize, -halfSize, logoSize);
            resolve();
          };
          // Timeout safe boundary
          setTimeout(resolve, 800);
        });
      } else {
        // Draw Text/Emoji centerpieces (extremely resilient fallback & visual convenience)
        renderCustomPlaceholderLogo(ctx, options.logoUrl, -halfSize, -halfSize, logoSize);
      }
    } catch {
      console.warn("Error rendering emblem centerpiece onto QR");
    }

    ctx.restore();
  }
}

/**
 * Dynamically auto-scale the font size to fit inside the center logo area without truncation.
 * We want to fit the text within 85% of the container size for a 7.5% safe margin on each side.
 * This leverages canvas-based measurement when available for 100% precision across languages, Unicode, and emojis.
 */
export function getEmblemFontSize(text: string, containerSize: number): number {
  if (!text) return containerSize * 0.38;
  
  const maxTextWidth = containerSize * 0.85;
  const numChars = text.length || 1;
  
  // Starting point using a conservative character-based heuristic estimate
  let fontSize = containerSize * 0.38;
  if (numChars > 2) {
    const estimatedCharWidth = 0.62;
    fontSize = maxTextWidth / (numChars * estimatedCharWidth);
  }
  
  // Try to refine the font size using standard canvas measurement for exact precision
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        const metrics = ctx.measureText(text);
        if (metrics.width > maxTextWidth && metrics.width > 0) {
          fontSize = fontSize * (maxTextWidth / metrics.width);
        }
      }
    }
  } catch (e) {
    console.warn("getEmblemFontSize fallback triggered:", e);
  }
  
  // Cap between minimum readable font size (5% of container) and visual max (38% of container)
  return Math.max(containerSize * 0.05, Math.min(containerSize * 0.38, fontSize));
}

/**
 * Fallback / Custom utility to draw initials, full text or emojis inside centerpiece of QR
 */
function renderCustomPlaceholderLogo(
  ctx: CanvasRenderingContext2D,
  text: string,
  lx: number,
  ly: number,
  size: number
) {
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  roundRect(ctx, lx, ly, size, size, size * 0.25);
  ctx.fill();

  ctx.save(); // Save context to modify state such as direction and alignment cleanly

  ctx.fillStyle = '#ffffff';
  
  // Dynamic font size computation with 100% precision
  const fontSize = getEmblemFontSize(text, size);
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Support RTL (Arabic, Urdu, Hebrew) and other directional scripts dynamically
  const isRtl = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u200F]/.test(text);
  if (isRtl) {
    ctx.direction = 'rtl';
  } else {
    ctx.direction = 'ltr';
  }

  // Draw full text exactly as typed (preserving uppercase/lowercase and full character set)
  ctx.fillText(text, lx + size / 2, ly + size / 2);

  ctx.restore();
}

/**
 * Standard utility drawing responsive rounded rectangles
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/**
 * Generates a high-quality, pixel-precise vector SVG of the styled QR Code.
 */
export function generateStyledSVG(
  text: string,
  options: DrawOptions
): string {
  const size = 450;
  const hasFrame = options.frameStyle && options.frameStyle !== 'none';
  const margin = typeof options.margin === 'number' ? options.margin : 20;

  let qrSize = Math.max(100, size - margin * 2);
  let margin_x = margin;
  let margin_y = margin;

  const isTop = options.frameTextPosition === 'top';

  if (hasFrame) {
    qrSize = 260;
    margin_x = 35 + (380 - qrSize) / 2;
    margin_y = (isTop ? 95 : 35) + (320 - qrSize) / 2;
  }

  const center_x = margin_x + qrSize / 2;
  const center_y = margin_y + qrSize / 2;

  // Generate QR Matrix
  let qr;
  const contentToEncode = (text && text.trim() !== '') ? text : 'https://www.freeqrbarcodes.com';
  try {
    qr = qrcode.create(contentToEncode, { errorCorrectionLevel: options.errorCorrectionLevel || 'H' });
  } catch (err) {
    console.error("Fatal: SVG QR Code Matrix generation failed inside qrcode package:", err);
    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${options.bgColor}" />
  <text x="${size / 2}" y="${size / 2 - 10}" font-family="system-ui, sans-serif" font-weight="bold" font-size="15" fill="#ef4444" text-anchor="middle">QR Code Generation Failed</text>
  <text x="${size / 2}" y="${size / 2 + 15}" font-family="system-ui, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Input content is invalid or too long.</text>
</svg>`;
  }
  const modulesCount = qr.modules.size;
  const cellSize = qrSize / modulesCount;

  // Background and Frame elements
  let bgElements = `<rect width="${size}" height="${size}" fill="${options.bgColor}" />`;
  if (hasFrame) {
    const frameColor = options.frameColor || options.fgColor || '#4f46e5';
    const frameTextColor = options.frameTextColor || '#ffffff';
    let label = 'SCAN ME';
    if (options.frameStyle === 'menu') label = 'VIEW MENU';
    else if (options.frameStyle === 'website' || options.frameStyle === 'visit-website') label = 'VISIT WEBSITE';
    else if (options.frameStyle === 'wifi' || options.frameStyle === 'wifi-password' || options.frameStyle === 'join-wifi') label = 'CONNECT WIFI';
    else if (options.frameStyle === 'download-app') label = 'DOWNLOAD APP';
    else if (options.frameStyle === 'follow-us') label = 'FOLLOW US';
    else if (options.frameStyle === 'order-now') label = 'ORDER NOW';
    else if (options.frameStyle === 'pay-here') label = 'PAY HERE';
    else if (options.frameStyle === 'save-contact') label = 'SAVE CONTACT';
    else if (options.frameStyle === 'rate-us') label = 'RATE & REVIEW';
    else if (options.frameStyle === 'custom') label = 'CUSTOM LABEL';

    if (options.frameText && ((val) => (val || '').trim())(options.frameText) !== '') {
      label = options.frameText;
    }
    label = label.toUpperCase();

    const innerCardY = isTop ? 95 : 35;
    const textY = isTop ? 62 : 388;
    let fontSize = options.frameFontSize || 20;
    
    // Estimate character width for SVG font auto-scaling
    const estimatedWidth = label.length * (fontSize * 0.65);
    const maxTextWidth = 360;
    if (estimatedWidth > maxTextWidth && label.length > 0) {
      fontSize = Math.max(10, Math.floor((maxTextWidth / (label.length * 0.65))));
    }

    // Escape any special characters for XML/SVG safety
    const safeLabel = label
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    bgElements = `
  <!-- Outer Frame Container -->
  <rect x="20" y="20" width="410" height="410" rx="24" ry="24" fill="${frameColor}" />
  <!-- Inner White/bgColor Card -->
  <rect x="35" y="${innerCardY}" width="380" height="320" rx="16" ry="16" fill="${options.bgColor}" />
  <!-- Banner Label Text -->
  <text x="225" y="${textY}" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${fontSize}" fill="${frameTextColor}" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>
    `;
  }

  // Define gradients if requested
  let defs = '';
  let fillStyle = options.fgColor;
  if (options.gradientType === 'linear') {
    defs = `
    <linearGradient id="qr-svg-grad-${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.gradientColor}" />
    </linearGradient>`;
    fillStyle = `url(#qr-svg-grad-${Date.now()})`;
  } else if (options.gradientType === 'radial') {
    defs = `
    <radialGradient id="qr-svg-grad-${Date.now()}" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.gradientColor}" />
    </radialGradient>`;
    fillStyle = `url(#qr-svg-grad-${Date.now()})`;
  }

  // Identify finder eye elements
  const isEye = (row: number, col: number): boolean => {
    if (row < 7 && col < 7) return true;
    if (row < 7 && col >= modulesCount - 7) return true;
    if (row >= modulesCount - 7 && col < 7) return true;
    return false;
  };

  let paths = '';
  const paddingPctSvg = typeof options.modulePadding === 'number' ? options.modulePadding : 0;
  const dotScaleSvg = 1 - (paddingPctSvg / 100);

  // Render individual code modules/dots
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (isEye(r, c)) continue;

      const isActive = qr.modules.get(r, c);
      if (!isActive) continue;

      const x = margin_x + c * cellSize;
      const y = margin_y + r * cellSize;

      const cx = x + cellSize / 2;
      const cy = y + cellSize / 2;
      const transformAttr = dotScaleSvg < 1 ? ` transform="translate(${cx}, ${cy}) scale(${dotScaleSvg}) translate(${-cx}, ${-cy})"` : '';

      if (options.dotStyle === 'dots') {
        const radius = (cellSize / 2) * 0.85;
        paths += `    <circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${radius}" fill="${fillStyle}"${transformAttr} />\n`;
      } else if (options.dotStyle === 'rounded') {
        const padding = cellSize * 0.05;
        const width = cellSize - padding * 2;
        const radius = cellSize * 0.4;
        paths += `    <rect x="${x + padding}" y="${y + padding}" width="${width}" height="${width}" rx="${radius}" ry="${radius}" fill="${fillStyle}"${transformAttr} />\n`;
      } else if (options.dotStyle === 'leaf') {
        const pad = cellSize * 0.04;
        const lx = x + pad;
        const ly = y + pad;
        const w = cellSize - pad * 2;
        const r = w * 0.55;
        const leafPath = `M ${lx + r} ${ly} L ${lx + w} ${ly} L ${lx + w} ${ly + w - r} A ${r} ${r} 0 0 1 ${lx + w - r} ${ly + w} L ${lx} ${ly + w} L ${lx} ${ly + r} A ${r} ${r} 0 0 1 ${lx + r} ${ly} Z`;
        paths += `    <path d="${leafPath}" fill="${fillStyle}"${transformAttr} />\n`;
      } else if (options.dotStyle === 'diamond') {
        const pad = cellSize * 0.06;
        const diamondPath = `M ${cx} ${y + pad} L ${x + cellSize - pad} ${cy} L ${cx} ${y + cellSize - pad} L ${x + pad} ${cy} Z`;
        paths += `    <path d="${diamondPath}" fill="${fillStyle}"${transformAttr} />\n`;
      } else if (options.dotStyle === 'classy') {
        const classyPath = `M ${cx} ${y + cellSize * 0.1} Q ${cx} ${cy} ${x + cellSize * 0.9} ${cy} Q ${cx} ${cy} ${cx} ${y + cellSize * 0.9} Q ${cx} ${cy} ${x + cellSize * 0.1} ${cy} Q ${cx} ${cy} ${cx} ${y + cellSize * 0.1} Z`;
        paths += `    <path d="${classyPath}" fill="${fillStyle}"${transformAttr} />\n`;
      } else {
        paths += `    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillStyle}"${transformAttr} />\n`;
      }
    }
  }

  // Build high-compatibility SVG eye vectors
  const buildEyeSvg = (ox: number, oy: number, customColor?: string) => {
    const eyeSize = cellSize * 7;
    const currentEyeStyle = customColor || fillStyle;
    const strokeWidth = cellSize;
    let eyePaths = '';

    // Outer Frame Outline
    if (options.eyeStyle === 'rounded') {
      const radius = cellSize * 1.5;
      eyePaths += `    <rect x="${ox + cellSize / 2}" y="${oy + cellSize / 2}" width="${eyeSize - cellSize}" height="${eyeSize - cellSize}" rx="${radius}" ry="${radius}" fill="none" stroke="${currentEyeStyle}" stroke-width="${strokeWidth}" />\n`;
    } else if (options.eyeStyle === 'circle') {
      eyePaths += `    <circle cx="${ox + eyeSize / 2}" cy="${oy + eyeSize / 2}" r="${eyeSize / 2 - cellSize / 2}" fill="none" stroke="${currentEyeStyle}" stroke-width="${strokeWidth}" />\n`;
    } else if (options.eyeStyle === 'leaf') {
      const leafPath = `M ${ox + cellSize / 2} ${oy + eyeSize / 2} A ${cellSize * 2} ${cellSize * 2} 0 0 1 ${ox + eyeSize / 2} ${oy + cellSize / 2} L ${ox + eyeSize - cellSize / 2} ${oy + cellSize / 2} A ${cellSize * 2} ${cellSize * 2} 0 0 1 ${ox + eyeSize - cellSize / 2} ${oy + eyeSize - cellSize / 2} L ${ox + eyeSize / 2} ${oy + eyeSize - cellSize / 2} Z`;
      eyePaths += `    <path d="${leafPath}" fill="none" stroke="${currentEyeStyle}" stroke-width="${strokeWidth}" />\n`;
    } else {
      eyePaths += `    <rect x="${ox + cellSize / 2}" y="${oy + cellSize / 2}" width="${eyeSize - cellSize}" height="${eyeSize - cellSize}" fill="none" stroke="${currentEyeStyle}" stroke-width="${strokeWidth}" />\n`;
    }

    // Inner Dot Pupil
    const dotOffset = cellSize * 2;
    const dotSize = cellSize * 3;
    if (options.eyeStyle === 'rounded' || options.eyeStyle === 'leaf') {
      eyePaths += `    <rect x="${ox + dotOffset}" y="${oy + dotOffset}" width="${dotSize}" height="${dotSize}" rx="${cellSize}" ry="${cellSize}" fill="${currentEyeStyle}" />\n`;
    } else if (options.eyeStyle === 'circle') {
      eyePaths += `    <circle cx="${ox + eyeSize / 2}" cy="${oy + eyeSize / 2}" r="${dotSize / 2}" fill="${currentEyeStyle}" />\n`;
    } else {
      eyePaths += `    <rect x="${ox + dotOffset}" y="${oy + dotOffset}" width="${dotSize}" height="${dotSize}" fill="${currentEyeStyle}" />\n`;
    }

    return eyePaths;
  };

  paths += buildEyeSvg(margin_x, margin_y, options.eyeColorTopLeft);
  paths += buildEyeSvg(margin_x + (modulesCount - 7) * cellSize, margin_y, options.eyeColorTopRight);
  paths += buildEyeSvg(margin_x, margin_y + (modulesCount - 7) * cellSize, options.eyeColorBottomLeft);

  // Centered Mascot / Branding Logo Embed
  let logoSvg = '';
  if (options.logoUrl) {
    const logoScale = options.logoScale || 0.18;
    const logoSize = size * logoScale;
    const halfSize = logoSize / 2;
    const angle = options.logoRotation || 0;

    const isAutoCentered = options.logoAutoCenter !== false;
    let offsetX = 0;
    let offsetY = 0;
    if (isAutoCentered) {
      const eyeSize = cellSize * 7;
      offsetX = Math.round(eyeSize * 0.04);
      offsetY = Math.round(eyeSize * 0.04);
    } else {
      offsetX = options.logoOffsetX || 0;
      offsetY = options.logoOffsetY || 0;
    }

    // Apply matrix offsets
    logoSvg += `  <g transform="translate(${center_x + offsetX}, ${center_y + offsetY}) rotate(${angle})">\n`;
    logoSvg += `    <!-- Backplate boundary to preserve scan compatibility -->\n`;
    const useCircularMaskSvg = options.logoBackgroundMask === true;
    if (useCircularMaskSvg) {
      const maskRadius = (logoSize + cellSize * 2.2) / 2;
      logoSvg += `    <circle cx="0" cy="0" r="${maskRadius}" fill="#ffffff" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" />\n`;
    } else {
      logoSvg += `    <rect x="${-halfSize - cellSize}" y="${-halfSize - cellSize}" width="${logoSize + cellSize * 2}" height="${logoSize + cellSize * 2}" rx="${cellSize * 1.5}" ry="${cellSize * 1.5}" fill="${options.bgColor}" />\n`;
    }

    if (options.logoUrl.startsWith('http') || options.logoUrl.startsWith('data:image')) {
      logoSvg += `    <image href="${options.logoUrl}" x="${-halfSize}" y="${-halfSize}" width="${logoSize}" height="${logoSize}" />\n`;
    } else {
      const logoText = options.logoUrl;
      const fontSize = getEmblemFontSize(logoText, logoSize);
      const isRtl = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\u200F]/.test(logoText);
      const directionAttr = isRtl ? ' direction="rtl" unicode-bidi="embed"' : '';
      logoSvg += `    <rect x="${-halfSize}" y="${-halfSize}" width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.25}" ry="${logoSize * 0.25}" fill="#4f46e5" />\n`;
      logoSvg += `    <text x="0" y="${fontSize * 0.08}" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#ffffff"${directionAttr}>${logoText}</text>\n`;
    }
    logoSvg += `  </g>\n`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${defs ? `<defs>${defs}\n  </defs>` : ''}
  ${bgElements}
  <g id="qr-modules">
${paths}  </g>
${logoSvg}</svg>`;
}

export const renderStyledSvgQR = generateStyledSVG;

