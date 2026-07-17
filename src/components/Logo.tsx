import React from 'react';

interface LogoProps {
  size?: number; // size in px, defaults to 52
  hideText?: boolean;
  className?: string;
}

export default function Logo({ size = 52, hideText = false, className = '' }: LogoProps) {
  const gradientStyle = {
    background: 'linear-gradient(135deg, #FF0080, #FF8C00, #FFD500, #00E676, #00B0FF, #7C4DFF, #FF0080)',
    backgroundSize: '400% 400%',
  };

  const textGradientStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #FF0080, #FF8C00, #FFD500, #00E676, #00B0FF, #7C4DFF, #FF0080)',
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    display: 'inline-block',
  };

  // 24% border-radius creates a gorgeous rounded square squircle (like Apple's app icons)
  const iconBorderRadius = `${Math.round(size * 0.24)}px`;

  return (
    <div 
      dir="ltr"
      className={`relative inline-flex items-center gap-3 select-none ${className} ltr-lock`}
      style={{
        position: 'relative',
        direction: 'ltr',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Dynamic Animated Rainbow Icon */}
      <div
        className="animate-huewave animate-logo-breath flex items-center justify-center shrink-0 relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: iconBorderRadius,
          ...gradientStyle,
        }}
      >
        {/* White QR-style square dots (5 rectangles with rounded corners) */}
        <svg
          viewBox="0 0 100 100"
          className="w-[55%] h-[55%] text-white fill-white block"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rect 1: Top-Left Finder */}
          <rect x="14" y="14" width="28" height="28" rx="7" fill="white" />
          {/* Rect 2: Top-Right Finder */}
          <rect x="58" y="14" width="28" height="28" rx="7" fill="white" />
          {/* Rect 3: Bottom-Left Finder */}
          <rect x="14" y="58" width="28" height="28" rx="7" fill="white" />
          {/* Rect 4: Bottom-Right Alignment Dot 1 */}
          <rect x="58" y="58" width="12" height="12" rx="3" fill="white" />
          {/* Rect 5: Bottom-Right Alignment Dot 2 */}
          <rect x="74" y="74" width="12" height="12" rx="3" fill="white" />
        </svg>
      </div>

      {!hideText && (
        <div className="flex items-center gap-1.5 font-sans text-lg sm:text-xl font-black tracking-tight leading-none">
          {/* "Free" plain color text adapting to theme */}
          <span className="text-slate-900 dark:text-white transition-colors duration-300">
            Free
          </span>
          {/* "QR Generator" rainbow gradient animated text */}
          <span
            className="animate-huewave transition-all duration-300"
            style={textGradientStyle}
          >
            QR Generator
          </span>
        </div>
      )}
    </div>
  );
}
