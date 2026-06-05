import React, { useRef, useEffect, useState } from 'react';
import { QRProject } from '../types';
import { renderStyledQR, generateStyledSVG } from '../utils/qrRenderer';
import { Download, Copy, ExternalLink, Printer, Smartphone, Camera, Check, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PreviewPanelProps {
  currentProject: Partial<QRProject>;
  onTestScan?: (text: string) => void;
  onDownloadTrigger?: () => void;
}

export default function PreviewPanel({ currentProject, onTestScan, onDownloadTrigger }: PreviewPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [simulatedScanResult, setSimulatedScanResult] = useState<string | null>(null);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'PNG' | 'SVG' | 'PDF'>('PNG');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const successTimeoutRef = useRef<any>(null);

  // Clean up any pending success timeouts on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Deconstruct primitive design properties to prevent reference-dependent re-render loops
  const fgColor = currentProject.design?.fgColor || '#0f172a';
  const bgColor = currentProject.design?.bgColor || '#ffffff';
  const gradientType = currentProject.design?.gradientType || 'none';
  const gradientColor = currentProject.design?.gradientColor || '#4f46e5';
  const dotStyle = currentProject.design?.dotStyle || 'square';
  const eyeStyle = currentProject.design?.eyeStyle || 'square';
  const logoUrl = currentProject.design?.logoUrl || '';
  const logoScale = currentProject.design?.logoScale || 0.18;
  const margin = typeof currentProject.design?.margin === 'number' ? currentProject.design?.margin : 20;
  const logoRotation = currentProject.design?.logoRotation || 0;
  const eyeColorTopLeft = currentProject.design?.eyeColorTopLeft || '';
  const eyeColorTopRight = currentProject.design?.eyeColorTopRight || '';
  const eyeColorBottomLeft = currentProject.design?.eyeColorBottomLeft || '';
  const errorCorrectionLevel = currentProject.design?.errorCorrectionLevel || 'H';

  const qrContent = currentProject.content || 'https://google.com';
  const appUrl = (window as any).location?.origin || '';
  const trackingId = currentProject.trackingId || '';
  const trackingEnabled = currentProject.trackingEnabled || false;

  const trackingUrl = trackingId ? `${appUrl}/qr/${trackingId}` : null;
  const textToEncode = trackingEnabled && trackingUrl ? trackingUrl : qrContent;

  // Draw QR on standard Canvas when contents or style parameters change
  useEffect(() => {
    if (canvasRef.current) {
      renderStyledQR(canvasRef.current, textToEncode, {
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
        eyeColorTopLeft: eyeColorTopLeft || undefined,
        eyeColorTopRight: eyeColorTopRight || undefined,
        eyeColorBottomLeft: eyeColorBottomLeft || undefined,
        errorCorrectionLevel
      });
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
    eyeColorTopLeft,
    eyeColorTopRight,
    eyeColorBottomLeft,
    errorCorrectionLevel
  ]);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    if (selectedFormat === 'PNG') {
      const link = document.createElement('a');
      link.download = `${currentProject.name || 'qr-code'}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    } else if (selectedFormat === 'SVG') {
      const svgString = generateStyledSVG(textToEncode, {
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
        eyeColorTopLeft: eyeColorTopLeft || undefined,
        eyeColorTopRight: eyeColorTopRight || undefined,
        eyeColorBottomLeft: eyeColorBottomLeft || undefined,
        errorCorrectionLevel
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${currentProject.name || 'qr-code'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else if (selectedFormat === 'PDF') {
      const imgData = canvasRef.current.toDataURL('image/png');
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(15, 23, 42);
      pdf.text(currentProject.name || "Custom QR Code", 105, 35, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Generated with QR Code Analytics Hub", 105, 43, { align: "center" });

      pdf.addImage(imgData, 'PNG', 55, 55, 100, 100);

      pdf.setFontSize(9);
      pdf.setTextColor(79, 70, 229);
      pdf.text(`Content: ${textToEncode}`, 105, 172, { align: "center", maxWidth: 160 });

      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(148, 163, 184);
      pdf.text("Scan the QR code above to navigate/decode.", 105, 184, { align: "center" });

      pdf.save(`${currentProject.name || 'qr-code'}.pdf`);
    }

    // Trigger visual success checkmark animation
    setShowSuccessAnimation(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 2200);

    if (onDownloadTrigger) {
      onDownloadTrigger();
    }
  };

  const handleCopyLink = () => {
    if (!trackingUrl) return;
    navigator.clipboard.writeText(trackingUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLocalPrint = () => {
    if (!canvasRef.current) return;
    const windowPrint = window.open('', '', 'width=600,height=600');
    if (!windowPrint) return;
    windowPrint.document.write(`
      <html>
        <head><title>Print QR Code - ${currentProject.name || 'QR'}</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; margin:0;">
          <h2 style="margin-bottom:20px; color:#1e293b;">${currentProject.name || 'QR Code'}</h2>
          <img src="${canvasRef.current.toDataURL('image/png')}" width="300" height="300" style="border:1px solid #e2e8f0; border-radius:12px; padding:12px;" />
          <p style="margin-top:15px; font-size:12px; color:#64748b;">Generated beautifully</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  const playPingSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio feedback omitted due to security restriction", e);
    }
  };

  const simulateScan = () => {
    setIsScanningSim(true);
    setSimulatedScanResult(null);
    setTimeout(() => {
      setSimulatedScanResult(textToEncode);
      setIsScanningSim(false);
      playPingSound();
      if (onTestScan) {
        onTestScan(textToEncode);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* QR Board Canvas */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-250 shadow-inner flex items-center justify-center">
          <div className="relative bg-white p-2 rounded-xl shadow-xs group cursor-pointer overflow-hidden animate-fade-in" style={{ width: '280px', height: '280px' }}>
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg bg-white transition-transform duration-300 group-hover:scale-[0.98]"
              style={{ width: '264px', height: '264px' }}
            />

            {/* Elegant Hover QR Scanner Overlay */}
            <div className="absolute inset-2 bg-slate-950/40 backdrop-blur-[1.5px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-10 pointer-events-none select-none">
              {/* Animated Corner Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-400 group-hover:scale-110 transition-transform duration-300" />

              {/* Glowing sweeps laser line */}
              <div className="absolute left-3 right-3 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)] animate-qr-scan" />

              {/* Central scanning prompt */}
              <div className="flex flex-col items-center gap-1 bg-slate-900/95 text-white py-2 px-3.5 rounded-xl border border-slate-700/60 shadow-xl transform scale-95 group-hover:scale-100 transition-all duration-300">
                <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-200">READY TO SCAN</span>
              </div>
            </div>

            {/* Download file ready success animation overlay */}
            <AnimatePresence>
              {showSuccessAnimation && (
                <motion.div
                  id="success-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-0 bg-emerald-600/95 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center z-20 pointer-events-none select-none"
                >
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.12, 1], opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 320,
                      damping: 20,
                      delay: 0.05
                    }}
                    className="bg-white text-emerald-600 p-3.5 rounded-full shadow-lg flex items-center justify-center mb-2"
                  >
                    <Check className="w-8 h-8 stroke-[3.5]" />
                  </motion.div>
                  <motion.p
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ delay: 0.12, duration: 0.2 }}
                    className="text-white text-xs font-black tracking-wider uppercase text-center"
                  >
                    {selectedFormat} READY!
                  </motion.p>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.75 }}
                    transition={{ delay: 0.22 }}
                    className="text-emerald-100 text-[10px] font-medium mt-1"
                  >
                    Successfully Downloaded
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Informative metadata text */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-800">
            {trackingEnabled ? '🚀 Short Url Tracking Active' : '💾 Direct QR Code'}
          </p>
          <span className="text-[10px] text-slate-600 font-mono select-all truncate max-w-[260px] block mt-0.5">
            {textToEncode}
          </span>
        </div>

        {/* Printable/Export triggers */}
        <div className="w-full flex flex-col gap-3 mt-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <FileType className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Download Format</span>
            </div>
            <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-3xs">
              {(['PNG', 'SVG', 'PDF'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                  aria-label={`Select ${fmt} format`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="col-span-2 py-2.5 px-3 bg-gray-950 text-white hover:bg-black rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label={`Download QR Code as ${selectedFormat}`}
            >
              <Download className="w-4 h-4" />
              Download {selectedFormat}
            </button>
            <button
              type="button"
              onClick={handleLocalPrint}
              className="py-2.5 px-2 bg-white text-gray-800 hover:bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 shadow-3xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Print QR Code"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>

          <button
            type="button"
            onClick={simulateScan}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-indigo-100 cursor-pointer"
            aria-label="Simulate Live QR Code Scanner Viewfinder Test"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Live Viewfinder Scan Test
          </button>
        </div>

        {/* Tracking Details & Copying Option */}
        {trackingEnabled && trackingUrl && (
          <div className="w-full bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3 flex flex-col gap-2 mt-1">
            <span className="text-[10px] text-indigo-950 font-semibold uppercase tracking-wider">Tracking Short URL</span>
            <div className="flex items-center justify-between gap-2 overflow-hidden bg-white px-3 py-1.5 rounded-lg border border-indigo-100">
              <span className="text-xs font-mono text-indigo-800 truncate select-all">{trackingUrl}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-all"
                  title="Copy link"
                  aria-label="Copy short tracking URL"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-all"
                  title="Test scan redirect"
                  aria-label="Open tracking redirect URL in a new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Device Widget */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-5 shadow-xl border border-slate-800 relative flex flex-col gap-4">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-b-xl border border-slate-900" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Smartphone Simulator</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-350 font-mono">
            LIVE DECODER
          </span>
        </div>

        {/* Viewfinder block */}
        <div className="bg-black aspect-video rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden h-36">
          {isScanningSim ? (
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-6 h-6 text-indigo-400 animate-pulse" />
              <div className="w-32 h-1 bg-indigo-500 animate-bounce rounded-full shadow-lg shadow-indigo-500" />
              <span className="text-[10px] text-slate-300 font-mono">Decoding modules...</span>
            </div>
          ) : simulatedScanResult ? (
            <div className="text-center p-4">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">✓ QR Scan Success</span>
              <p className="text-xs text-white max-w-xs break-all truncate font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                {simulatedScanResult}
              </p>
              {simulatedScanResult.startsWith('http') && (
                <a
                  href={simulatedScanResult}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 hover:underline"
                >
                  Visit Destination URL
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-300">Viewfinder ready.</p>
              <button
                type="button"
                onClick={simulateScan}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-[10px] uppercase font-semibold transition-all border border-slate-800 cursor-pointer"
                aria-label="Scan Canvas QR Code"
              >
                Scan Canvas QR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
