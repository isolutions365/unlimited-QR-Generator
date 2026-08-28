import React, { memo, forwardRef, useRef, useEffect, useState } from 'react';
import { renderStyledQR } from '../utils/qrRenderer';
import { FrameStyle } from '../types';

export interface MemoizedQRCanvasProps {
  textToEncode: string;
  fgColor: string;
  bgColor: string;
  gradientType: 'none' | 'linear' | 'radial';
  gradientColor: string;
  dotStyle: 'square' | 'rounded' | 'dots' | 'classy';
  eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
  logoUrl?: string;
  logoScale: number;
  margin: number;
  logoRotation: number;
  logoAutoCenter: boolean;
  logoOffsetX: number;
  logoOffsetY: number;
  eyeColorTopLeft?: string;
  eyeColorTopRight?: string;
  eyeColorBottomLeft?: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  isPrintModalOpen: boolean;
  frameStyle?: FrameStyle;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  frameFontSize?: number;
  frameTextPosition?: 'bottom' | 'top';
  onDrawComplete?: () => void;
}

export const MemoizedQRCanvas = memo(
  forwardRef<HTMLCanvasElement, MemoizedQRCanvasProps>((props, forwardedRef) => {
    const {
      textToEncode,
      fgColor,
      bgColor,
      gradientType,
      gradientColor,
      dotStyle,
      eyeStyle,
      logoUrl,
      logoScale,
      margin,
      logoRotation,
      logoAutoCenter,
      logoOffsetX,
      logoOffsetY,
      eyeColorTopLeft,
      eyeColorTopRight,
      eyeColorBottomLeft,
      errorCorrectionLevel,
      isPrintModalOpen,
      frameStyle,
      frameText,
      frameColor,
      frameTextColor,
      frameFontSize,
      frameTextPosition,
      onDrawComplete
    } = props;

    const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isAnimatingRedraw, setIsAnimatingRedraw] = useState(false);
    const redrawTimeoutRef = useRef<any>(null);

    const lastDrawTimeRef = useRef<number>(0);
    const pendingDrawRef = useRef<(() => void) | null>(null);
    const drawThrottleTimeoutRef = useRef<any>(null);

    // Merge forwardedRef and localCanvasRef
    useEffect(() => {
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') {
        forwardedRef(localCanvasRef.current);
      } else {
        forwardedRef.current = localCanvasRef.current;
      }
    });

    useEffect(() => {
      const canvas = localCanvasRef.current;
      if (!canvas) return;

      const draw = () => {
        renderStyledQR(canvas, textToEncode, {
          fgColor,
          bgColor,
          gradientType,
          gradientColor,
          dotStyle,
          eyeStyle,
          logoUrl: logoUrl || undefined,
          logoScale,
          margin,
          logoRotation,
          logoAutoCenter,
          logoOffsetX,
          logoOffsetY,
          eyeColorTopLeft: eyeColorTopLeft || undefined,
          eyeColorTopRight: eyeColorTopRight || undefined,
          eyeColorBottomLeft: eyeColorBottomLeft || undefined,
          errorCorrectionLevel,
          frameStyle,
          frameText,
          frameColor,
          frameTextColor,
          frameFontSize,
          frameTextPosition,
          skipLogoImage: isPrintModalOpen ? false : true
        }).then(() => {
          if (onDrawComplete) {
            onDrawComplete();
          }
        }).catch((err) => {
          console.warn('[MemoizedQRCanvas] renderStyledQR error caught safely:', err);
        });

        // Trigger redraw animation
        setIsAnimatingRedraw(true);
        if (redrawTimeoutRef.current) {
          clearTimeout(redrawTimeoutRef.current);
        }
        redrawTimeoutRef.current = setTimeout(() => {
          setIsAnimatingRedraw(false);
        }, 450);

        lastDrawTimeRef.current = Date.now();
      };

      const now = Date.now();
      const timeSinceLastDraw = now - lastDrawTimeRef.current;
      const throttleDelay = 32; // Limit rendering to ~30 FPS for buttery smooth dragging with zero lag

      if (timeSinceLastDraw >= throttleDelay) {
        // Run immediately
        if (drawThrottleTimeoutRef.current) {
          clearTimeout(drawThrottleTimeoutRef.current);
          drawThrottleTimeoutRef.current = null;
        }
        draw();
      } else {
        // Save as pending and schedule
        pendingDrawRef.current = draw;
        if (!drawThrottleTimeoutRef.current) {
          const remaining = throttleDelay - timeSinceLastDraw;
          drawThrottleTimeoutRef.current = setTimeout(() => {
            if (pendingDrawRef.current) {
              pendingDrawRef.current();
              pendingDrawRef.current = null;
            }
            drawThrottleTimeoutRef.current = null;
          }, remaining);
        }
      }
    }, [
      textToEncode,
      fgColor,
      bgColor,
      gradientType,
      gradientColor,
      dotStyle,
      eyeStyle,
      logoUrl,
      logoScale,
      margin,
      logoRotation,
      logoAutoCenter,
      logoOffsetX,
      logoOffsetY,
      eyeColorTopLeft,
      eyeColorTopRight,
      eyeColorBottomLeft,
      errorCorrectionLevel,
      isPrintModalOpen,
      frameStyle,
      frameText,
      frameColor,
      frameTextColor,
      frameFontSize,
      frameTextPosition
    ]);

    useEffect(() => {
      return () => {
        if (redrawTimeoutRef.current) clearTimeout(redrawTimeoutRef.current);
        if (drawThrottleTimeoutRef.current) clearTimeout(drawThrottleTimeoutRef.current);
      };
    }, []);

    return (
      <div className="relative blur-up-placeholder-container rounded-lg" style={{ width: '264px', height: '264px' }}>
        <canvas
          ref={localCanvasRef}
          className={`max-w-full rounded-lg bg-white transition-all duration-300 group-hover:scale-[0.98] animate-blur-up ${
            isAnimatingRedraw ? 'animate-qr-fade-in' : ''
          }`}
          style={{ width: '264px', height: '264px' }}
        />
        {/* Premium diagonal shine sweep on design update */}
        {isAnimatingRedraw && (
          <div className="animate-sweep-shine pointer-events-none z-[8]" />
        )}
      </div>
    );
  })
);

MemoizedQRCanvas.displayName = 'MemoizedQRCanvas';
