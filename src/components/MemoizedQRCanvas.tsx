import React, { memo, forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { renderStyledQR } from '../utils/qrRenderer';
import { FrameStyle } from '../types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface MemoizedQRCanvasProps {
  textToEncode: string;
  fgColor: string;
  bgColor: string;
  gradientType: 'none' | 'linear' | 'radial';
  gradientColor: string;
  dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond';
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
  onDrawError?: (errorMessage: string) => void;
  retryNonce?: number;
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
      onDrawComplete,
      onDrawError,
      retryNonce = 0
    } = props;

    const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isAnimatingRedraw, setIsAnimatingRedraw] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
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

    const executeRender = useCallback(() => {
      const canvas = localCanvasRef.current;
      if (!canvas) return;

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
        setRenderError(null);
        if (onDrawComplete) {
          onDrawComplete();
        }
      }).catch((err) => {
        console.warn('[MemoizedQRCanvas] renderStyledQR error caught safely:', err);
        const msg = err?.message || String(err || 'QR canvas rendering failed');
        setRenderError(msg);
        if (onDrawError) {
          onDrawError(msg);
        }
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
      frameTextPosition,
      onDrawComplete,
      onDrawError
    ]);

    const handleRegenerate = useCallback(() => {
      setIsRegenerating(true);
      setRenderError(null);
      const canvas = localCanvasRef.current;
      if (canvas) {
        try {
          // Clear stale canvas state & reset drawing context dimensions
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          canvas.width = 450;
          canvas.height = 450;
        } catch (e) {
          console.warn('[MemoizedQRCanvas] Error clearing canvas state during regenerate:', e);
        }
      }

      setTimeout(() => {
        executeRender();
        setIsRegenerating(false);
      }, 50);
    }, [executeRender]);

    useEffect(() => {
      const now = Date.now();
      const timeSinceLastDraw = now - lastDrawTimeRef.current;
      const throttleDelay = 32; // Limit rendering to ~30 FPS for buttery smooth dragging with zero lag

      if (timeSinceLastDraw >= throttleDelay) {
        if (drawThrottleTimeoutRef.current) {
          clearTimeout(drawThrottleTimeoutRef.current);
          drawThrottleTimeoutRef.current = null;
        }
        executeRender();
      } else {
        pendingDrawRef.current = executeRender;
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
    }, [executeRender, retryNonce]);

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
        {isAnimatingRedraw && !renderError && (
          <div className="animate-sweep-shine pointer-events-none z-[8]" />
        )}

        {/* Fallback Overlay & Regenerate Button when Canvas Rendering Fails */}
        {renderError && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xs rounded-xl p-4 flex flex-col items-center justify-center text-center z-30 shadow-xl border border-rose-500/30 animate-fade-in">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-full mb-2 animate-bounce">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-1">
              Canvas Render Error
            </h4>
            <p className="text-slate-300 text-[10px] leading-snug mb-3 max-w-[220px] line-clamp-2">
              {renderError}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRegenerate();
              }}
              disabled={isRegenerating}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Re-initializing...' : 'Regenerate'}</span>
            </button>
          </div>
        )}
      </div>
    );
  })
);

MemoizedQRCanvas.displayName = 'MemoizedQRCanvas';
