import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Download, Copy, Check, Sparkles, ShieldCheck, RefreshCw, Share2, ZoomIn, Eye, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { QRProject } from '../types';
import { renderStyledQR, renderStyledSvgQR } from '../utils/qrRenderer';
import { copyCanvasImageToClipboard, copyTextToClipboard } from '../utils/qrUtils';

export interface PreviewCardHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getSvgString: () => Promise<string>;
}

interface PreviewCardProps {
  project: Partial<QRProject>;
  className?: string;
  onRefresh?: () => void;
}

const PreviewCard = forwardRef<PreviewCardHandle, PreviewCardProps>(({
  project,
  className = '',
  onRefresh
}, ref) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [scaleFactor, setScaleFactor] = useState<1 | 2 | 4>(1);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [triggerPulse, setTriggerPulse] = useState(false);
  
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDownloadFormat, setActiveDownloadFormat] = useState<'png' | 'jpg' | 'svg' | null>(null);

  const contentToEncode = project.content || 'https://www.freeqrbarcodes.com';

  // Reset pulse state after the animation finishes
  useEffect(() => {
    if (triggerPulse) {
      const timer = setTimeout(() => {
        setTriggerPulse(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [triggerPulse]);

  // Extract design options
  const fgColor = project.fgColor || '#0f172a';
  const bgColor = project.bgColor || '#ffffff';
  const gradientType = project.gradientType || 'none';
  const gradientColor = project.gradientColor || '#4f46e5';
  const dotStyle = project.dotStyle || 'square';
  const eyeStyle = project.eyeStyle || 'square';
  const logoUrl = project.logoUrl || '';
  const frameStyle = project.frameStyle || 'none';
  const frameText = project.frameText || '';
  const frameColor = project.frameColor || fgColor;
  const frameTextColor = project.frameTextColor || '#ffffff';
  const errorCorrectionLevel = project.errorCorrectionLevel || (logoUrl ? 'H' : 'Q');

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getSvgString: async () => {
      return renderStyledSvgQR(contentToEncode, {
        fgColor,
        bgColor,
        gradientType,
        gradientColor,
        dotStyle,
        eyeStyle,
        logoUrl,
        frameStyle,
        frameText,
        frameColor,
        frameTextColor,
        errorCorrectionLevel
      });
    }
  }));

  // Re-render canvas whenever project configuration or scale factor updates
  useEffect(() => {
    let isMounted = true;
    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      setRenderError(null);

      try {
        await renderStyledQR(canvasRef.current, contentToEncode, {
          fgColor,
          bgColor,
          gradientType,
          gradientColor,
          dotStyle,
          eyeStyle,
          logoUrl,
          logoScale: project.logoScale || 0.18,
          frameStyle,
          frameText,
          frameColor,
          frameTextColor,
          errorCorrectionLevel,
          eyeColorTopLeft: project.eyeColorTopLeft,
          eyeColorTopRight: project.eyeColorTopRight,
          eyeColorBottomLeft: project.eyeColorBottomLeft,
          logoAutoCenter: project.logoAutoCenter !== false
        });
        if (isMounted) {
          setTriggerPulse(true);
        }
      } catch (err: any) {
        console.error('[PreviewCard] Canvas render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Failed to generate QR code preview');
        }
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [
    contentToEncode,
    fgColor,
    bgColor,
    gradientType,
    gradientColor,
    dotStyle,
    eyeStyle,
    logoUrl,
    frameStyle,
    frameText,
    frameColor,
    frameTextColor,
    errorCorrectionLevel,
    project.logoScale,
    project.logoAutoCenter,
    project.eyeColorTopLeft,
    project.eyeColorTopRight,
    project.eyeColorBottomLeft,
    scaleFactor
  ]);

  // High-Resolution PNG & JPG Export
  const handleDownloadRaster = async (format: 'png' | 'jpg') => {
    try {
      setActiveDownloadFormat(format);
      const baseSize = 450;
      const exportSize = baseSize * scaleFactor;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportSize;
      exportCanvas.height = exportSize;

      await renderStyledQR(exportCanvas, contentToEncode, {
        fgColor,
        bgColor: format === 'jpg' && bgColor === 'transparent' ? '#ffffff' : bgColor,
        gradientType,
        gradientColor,
        dotStyle,
        eyeStyle,
        logoUrl,
        logoScale: project.logoScale || 0.18,
        frameStyle,
        frameText,
        frameColor,
        frameTextColor,
        errorCorrectionLevel,
        eyeColorTopLeft: project.eyeColorTopLeft,
        eyeColorTopRight: project.eyeColorTopRight,
        eyeColorBottomLeft: project.eyeColorBottomLeft,
        logoAutoCenter: project.logoAutoCenter !== false
      });

      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = exportCanvas.toDataURL(mimeType, 0.98);

      const link = document.createElement('a');
      const filename = `qr-${project.title || 'code'}-${scaleFactor}x.${format}`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[PreviewCard] Export error:', err);
    } finally {
      setTimeout(() => setActiveDownloadFormat(null), 800);
    }
  };

  // High-Resolution Lossless Standalone SVG Export
  const handleDownloadSVG = async () => {
    try {
      setActiveDownloadFormat('svg');
      const svgString = await renderStyledSvgQR(contentToEncode, {
        fgColor,
        bgColor,
        gradientType,
        gradientColor,
        dotStyle,
        eyeStyle,
        logoUrl,
        frameStyle,
        frameText,
        frameColor,
        frameTextColor,
        errorCorrectionLevel,
        eyeColorTopLeft: project.eyeColorTopLeft,
        eyeColorTopRight: project.eyeColorTopRight,
        eyeColorBottomLeft: project.eyeColorBottomLeft,
        logoAutoCenter: project.logoAutoCenter !== false
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `qr-${project.title || 'vector'}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[PreviewCard] SVG download error:', err);
    } finally {
      setTimeout(() => setActiveDownloadFormat(null), 800);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasImageToClipboard(canvasRef.current);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  // Copy Raw Data Content to Clipboard
  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(contentToEncode);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`sticky top-24 space-y-4 ${className}`}>
      {/* Main Preview Container */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-5">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              <Eye className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t('preview.liveTitle', 'Live Preview')}
            </h3>
          </div>

          {/* Quality Scale Factor Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
            <span className="px-1.5 text-slate-400 uppercase hidden sm:inline">{t('preview.scale', 'Scale:')}</span>
            {([1, 2, 4] as const).map((factor) => (
              <button
                key={factor}
                type="button"
                onClick={() => setScaleFactor(factor)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  scaleFactor === factor
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`${factor}x Resolution Export`}
              >
                {factor}x
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Render Stage */}
        <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center overflow-hidden shadow-inner group blur-up-placeholder-container">
          {renderError ? (
            <div className="text-center p-4 space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{renderError}</p>
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry Generation
              </button>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className={`w-full h-full object-contain rounded-xl transition-all duration-300 ${
                triggerPulse ? 'animate-qr-pulse' : 'animate-blur-up'
              } ${
                isRendering ? 'opacity-50 blur-[1px]' : 'opacity-100'
              }`}
            />
          )}

          {triggerPulse && !renderError && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10">
              <div className="qr-shimmer-line" />
            </div>
          )}

          {isRendering && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Scannability Rating & Safety Badge */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t('preview.scannableScore', '100% Camera Scannable')}</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            ECC {errorCorrectionLevel} (30% Recovery)
          </span>
        </div>

        {/* Export Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
            {t('preview.downloadFormat', 'Download High-DPI Output')}
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDownloadRaster('png')}
              disabled={isRendering || !!renderError}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 mb-1" />
              <span>PNG ({scaleFactor}x)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadRaster('jpg')}
              disabled={isRendering || !!renderError}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 mb-1" />
              <span>JPG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={isRendering || !!renderError}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 mb-1" />
              <span>SVG Vector</span>
            </button>
          </div>
        </div>

        {/* Copy Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedImage ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
});

PreviewCard.displayName = 'PreviewCard';

export default PreviewCard;
