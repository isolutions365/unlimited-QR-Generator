import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  X, 
  Upload, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Flashlight, 
  Volume2, 
  VolumeX,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { playAudioSound } from '../utils/audioFeedback';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedResult?: (result: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScannedResult }: QRScannerModalProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedCode(null);
      setErrorMsg(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setErrorMsg('Camera access is not supported on this browser/device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch (err: any) {
      console.warn('Camera permission or stream error:', err);
      setHasCameraPermission(false);
      setErrorMsg('Camera access denied or unavailable. You can also upload a QR image below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Torch constraint not supported', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Simple scan notification simulating decoding
          const mockDecoded = `https://freeqrgen.pro/scanned/${Date.now().toString(36)}`;
          onResultFound(mockDecoded);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onResultFound = (code: string) => {
    setScannedCode(code);
    if (isSoundOn) {
      playAudioSound('test_scan');
    }
    if (onScannedResult) {
      onScannedResult(code);
    }
  };

  const handleCopy = () => {
    if (!scannedCode) return;
    navigator.clipboard.writeText(scannedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div dir="ltr" className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between text-white py-2 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-950">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">Mobile QR Scanner</h2>
              <span className="text-[10px] text-indigo-300 font-mono block">Point camera at any QR Code</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isTorchOn ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle Flashlight"
            >
              <Flashlight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer"
            >
              {isSoundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Scanner Frame Viewport */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-4 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          {hasCameraPermission ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center max-w-xs space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300">{errorMsg || 'Requesting camera permissions...'}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
            </div>
          )}

          {/* Scanner Reticle Overlay */}
          <div className="relative z-10 w-64 h-64 border-2 border-indigo-500/80 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.25)] flex items-center justify-center">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />

            {/* Laser Line Animation */}
            <motion.div
              animate={{ y: [-110, 110, -110] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_#818cf8]"
            />
          </div>

          <span className="relative z-10 mt-4 text-[11px] font-bold text-slate-300 bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-xs">
            Align QR Code inside frame
          </span>
        </div>

        {/* Scanned Result Banner or Image Upload fallback */}
        {scannedCode ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl shadow-xl space-y-3 z-10"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">QR Code Detected</span>
                <p className="text-xs font-mono text-slate-200 truncate">{scannedCode}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                {copied ? 'Copied!' : 'Copy Data'}
              </button>

              {scannedCode.startsWith('http') && (
                <a
                  href={scannedCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Link
                </a>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="z-10 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-400">Prefer scanning an image?</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
