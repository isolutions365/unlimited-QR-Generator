import qrcode from 'qrcode';

interface DrawOptions {
  fgColor: string;
  bgColor: string;
  gradientType: 'none' | 'linear' | 'radial';
  gradientColor: string;
  dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
  eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
  logoUrl?: string;
  logoScale?: number;
  margin?: number;
  logoRotation?: number;
  eyeColorTopLeft?: string;
  eyeColorTopRight?: string;
  eyeColorBottomLeft?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
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

  const margin = typeof options.margin === 'number' ? options.margin : 20;
  const qrSize = Math.max(100, size - margin * 2);

  // Generate QR Matrix using standard qrcode package API
  const qr = qrcode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel || 'H' });
  const modulesCount = qr.modules.size;
  const cellSize = qrSize / modulesCount;

  // Setup foreground styling (gradients)
  let fillStyle: string | CanvasGradient = options.fgColor;
  if (options.gradientType === 'linear') {
    const grad = ctx.createLinearGradient(margin, margin, size - margin, size - margin);
    grad.addColorStop(0, options.fgColor);
    grad.addColorStop(1, options.gradientColor);
    fillStyle = grad;
  } else if (options.gradientType === 'radial') {
    const grad = ctx.createRadialGradient(size / 2, size / 2, cellSize, size / 2, size / 2, qrSize * 0.7);
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

  // Skip rendering default cells in finder spots. We will draw custom ones below
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (isEye(r, c)) continue; // We skip eyes, we will render customized eyes with perfect geometry

      const isActive = qr.modules.get(r, c);
      if (!isActive) continue;

      const x = margin + c * cellSize;
      const y = margin + r * cellSize;

      ctx.beginPath();
      if (options.dotStyle === 'dots') {
        const radius = cellSize / 2 * 0.85;
        ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (options.dotStyle === 'rounded') {
        const padding = cellSize * 0.05;
        const radius = cellSize * 0.4;
        roundRect(ctx, x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
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
  drawEye(margin, margin, options.eyeColorTopLeft);
  // Top-Right Eye
  drawEye(margin + (modulesCount - 7) * cellSize, margin, options.eyeColorTopRight);
  // Bottom-Left Eye
  drawEye(margin, margin + (modulesCount - 7) * cellSize, options.eyeColorBottomLeft);

  // Apply visual logo centered safely inside the layout
  if (options.logoUrl) {
    const logoScale = options.logoScale || 0.18;
    const logoSize = size * logoScale;
    const halfSize = logoSize / 2;

    // Use context state preservation to translate and rotate precisely about the QR center
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const angleInRadians = ((options.logoRotation || 0) * Math.PI) / 180;
    ctx.rotate(angleInRadians);

    // Draw solid backplate behind the brand logo to optimize scan accuracy
    ctx.fillStyle = options.bgColor;
    ctx.beginPath();
    roundRect(ctx, -halfSize - cellSize, -halfSize - cellSize, logoSize + cellSize * 2, logoSize + cellSize * 2, cellSize * 1.5);
    ctx.fill();

    // Try rendering image logo
    try {
      if (options.logoUrl.startsWith('http') || options.logoUrl.startsWith('data:image')) {
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
 * Fallback / Custom utility to draw initials or emojis inside centerpiece of QR
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

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 3).toUpperCase(), lx + size / 2, ly + size / 2 + size * 0.02);
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
  const margin = typeof options.margin === 'number' ? options.margin : 20;
  const qrSize = Math.max(100, size - margin * 2);

  // Generate QR Matrix
  const qr = qrcode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel || 'H' });
  const modulesCount = qr.modules.size;
  const cellSize = qrSize / modulesCount;

  // Background
  const bgRect = `<rect width="${size}" height="${size}" fill="${options.bgColor}" />`;

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

  // Render individual code modules/dots
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (isEye(r, c)) continue;

      const isActive = qr.modules.get(r, c);
      if (!isActive) continue;

      const x = margin + c * cellSize;
      const y = margin + r * cellSize;

      if (options.dotStyle === 'dots') {
        const radius = (cellSize / 2) * 0.85;
        paths += `    <circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${radius}" fill="${fillStyle}" />\n`;
      } else if (options.dotStyle === 'rounded') {
        const padding = cellSize * 0.05;
        const width = cellSize - padding * 2;
        const radius = cellSize * 0.4;
        paths += `    <rect x="${x + padding}" y="${y + padding}" width="${width}" height="${width}" rx="${radius}" ry="${radius}" fill="${fillStyle}" />\n`;
      } else if (options.dotStyle === 'classy') {
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;
        const classyPath = `M ${cx} ${y + cellSize * 0.1} Q ${cx} ${cy} ${x + cellSize * 0.9} ${cy} Q ${cx} ${cy} ${cx} ${y + cellSize * 0.9} Q ${cx} ${cy} ${x + cellSize * 0.1} ${cy} Q ${cx} ${cy} ${cx} ${y + cellSize * 0.1} Z`;
        paths += `    <path d="${classyPath}" fill="${fillStyle}" />\n`;
      } else {
        paths += `    <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillStyle}" />\n`;
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

  paths += buildEyeSvg(margin, margin, options.eyeColorTopLeft);
  paths += buildEyeSvg(margin + (modulesCount - 7) * cellSize, margin, options.eyeColorTopRight);
  paths += buildEyeSvg(margin, margin + (modulesCount - 7) * cellSize, options.eyeColorBottomLeft);

  // Centered Mascot / Branding Logo Embed
  let logoSvg = '';
  if (options.logoUrl) {
    const logoScale = options.logoScale || 0.18;
    const logoSize = size * logoScale;
    const halfSize = logoSize / 2;
    const angle = options.logoRotation || 0;

    // Apply matrix offsets
    logoSvg += `  <g transform="translate(${size / 2}, ${size / 2}) rotate(${angle})">\n`;
    logoSvg += `    <!-- Backplate boundary to preserve scan compatibility -->\n`;
    logoSvg += `    <rect x="${-halfSize - cellSize}" y="${-halfSize - cellSize}" width="${logoSize + cellSize * 2}" height="${logoSize + cellSize * 2}" rx="${cellSize * 1.5}" ry="${cellSize * 1.5}" fill="${options.bgColor}" />\n`;

    if (options.logoUrl.startsWith('http') || options.logoUrl.startsWith('data:image')) {
      logoSvg += `    <image href="${options.logoUrl}" x="${-halfSize}" y="${-halfSize}" width="${logoSize}" height="${logoSize}" />\n`;
    } else {
      const logoText = options.logoUrl.slice(0, 3).toUpperCase();
      const fontSize = logoSize * 0.4;
      logoSvg += `    <rect x="${-halfSize}" y="${-halfSize}" width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.25}" ry="${logoSize * 0.25}" fill="#4f46e5" />\n`;
      logoSvg += `    <text x="0" y="${fontSize * 0.08}" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#ffffff">${logoText}</text>\n`;
    }
    logoSvg += `  </g>\n`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2500/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${defs ? `<defs>${defs}\n  </defs>` : ''}
  ${bgRect}
  <g id="qr-modules">
${paths}  </g>
${logoSvg}</svg>`;
}
