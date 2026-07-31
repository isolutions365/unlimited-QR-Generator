import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { 
  Download, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Barcode, 
  HelpCircle, 
  Layers, 
  CheckCircle2, 
  Info,
  Palette,
  Sliders
} from 'lucide-react';

interface BarcodeGeneratorProps {
  locale?: string;
}

// Preset definitions for high utility pre-fills
interface PresetOption {
  id: string;
  label: string;
  description: string;
  recommendedFormat: string;
  sampleValue: string;
}

const PAYLOAD_PRESETS: PresetOption[] = [
  {
    id: 'general',
    label: 'General Product Tag',
    description: 'Basic alpha-numeric product code for standard labeling.',
    recommendedFormat: 'CODE128',
    sampleValue: 'PROD-7749-W2'
  },
  {
    id: 'retail_sku_ean',
    label: 'Retail SKU (EAN-13)',
    description: '12-digit global standard product identification code.',
    recommendedFormat: 'EAN13',
    sampleValue: '590123412345'
  },
  {
    id: 'retail_sku_upc',
    label: 'Retail SKU (UPC-A)',
    description: '11-digit North American standard product identification.',
    recommendedFormat: 'UPC',
    sampleValue: '01234567890'
  },
  {
    id: 'serial',
    label: 'Device Serial Number',
    description: 'High-density alphanumeric unique identifier.',
    recommendedFormat: 'CODE128',
    sampleValue: 'SN-2026-99A8X'
  },
  {
    id: 'inventory',
    label: 'Inventory Asset ID',
    description: 'Industrial warehouse asset tracking identifier.',
    recommendedFormat: 'CODE39',
    sampleValue: 'ASSET-904-XYZ'
  }
];

export default function BarcodeGenerator({ locale = 'en' }: BarcodeGeneratorProps) {
  const [value, setValue] = useState<string>('PROD-7749-W2');
  const [format, setFormat] = useState<string>('CODE128');
  const [selectedPreset, setSelectedPreset] = useState<string>('general');
  const [height, setHeight] = useState<number>(100);
  const [width, setWidth] = useState<number>(2);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [background, setBackground] = useState<string>('#ffffff');
  const [margin, setMargin] = useState<number>(10);
  
  // Validation and Status states
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<{
    status: 'success' | 'warning' | 'error';
    text: string;
  }>({ status: 'success', text: 'Valid barcode format.' });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Helper validation function
  const validateInput = (val: string, fmt: string) => {
    const cleanVal = val.trim();
    if (!cleanVal) {
      return {
        status: 'error' as const,
        text: 'Please enter a value to generate a barcode.'
      };
    }

    if (fmt === 'EAN13') {
      if (!/^\d+$/.test(cleanVal)) {
        return {
          status: 'error' as const,
          text: 'EAN-13 requires numeric characters only (0-9).'
        };
      }
      if (cleanVal.length !== 12 && cleanVal.length !== 13) {
        return {
          status: 'warning' as const,
          text: `EAN-13 requires exactly 12 or 13 digits (Current: ${cleanVal.length}). A 12-digit input automatically gets its checksum appended.`
        };
      }
    } else if (fmt === 'UPC') {
      if (!/^\d+$/.test(cleanVal)) {
        return {
          status: 'error' as const,
          text: 'UPC-A requires numeric characters only (0-9).'
        };
      }
      if (cleanVal.length !== 11 && cleanVal.length !== 12) {
        return {
          status: 'warning' as const,
          text: `UPC-A requires exactly 11 or 12 digits (Current: ${cleanVal.length}). An 11-digit input automatically gets its checksum appended.`
        };
      }
    } else if (fmt === 'CODE39') {
      const allowed = /^[0-9A-Z\-\.\ \$\/\+\%]+$/i;
      if (!allowed.test(cleanVal)) {
        return {
          status: 'error' as const,
          text: 'CODE39 supports 0-9, A-Z (caps), space, and symbols: - . $ / + %'
        };
      }
    } else if (fmt === 'CODE128') {
      const allowedAscii = /^[\x00-\x7F]*$/;
      if (!allowedAscii.test(cleanVal)) {
        return {
          status: 'error' as const,
          text: 'CODE128 supports standard 128 ASCII characters only.'
        };
      }
    }

    return {
      status: 'success' as const,
      text: 'Format validation passed! High physical contrast is ready to render.'
    };
  };

  // Perform active live rendering & validation updates
  useEffect(() => {
    const result = validateInput(value, format);
    setValidationMessage(result);

    if (result.status === 'error') {
      setError(result.text);
      return;
    }

    if (!svgRef.current) return;

    try {
      setError(null);
      
      // Render using JsBarcode
      JsBarcode(svgRef.current, value.trim(), {
        format: format,
        height: height,
        width: width,
        displayValue: displayValue,
        lineColor: lineColor,
        background: background,
        margin: margin,
        valid: (valid) => {
          if (!valid) {
            setError(`The renderer failed to parse this payload for ${format}. Please verify your format characters.`);
          }
        }
      });
    } catch (err: any) {
      console.warn('Barcode rendering error:', err);
      setError(err?.message || 'Unsupported characters for the selected barcode format.');
    }
  }, [value, format, height, width, displayValue, lineColor, background, margin]);

  // Handler for manual random generator
  const handleRandomize = () => {
    let randVal = '';
    if (format === 'EAN13') {
      // EAN13 standard 12-digit number (checksum is automatically added by JsBarcode)
      randVal = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    } else if (format === 'UPC') {
      // UPC-A standard 11-digit number
      randVal = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    } else if (format === 'CODE39') {
      // CODE39 alphanumeric string
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-';
      randVal = 'ID-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } else {
      // CODE128 random tracking sequence
      const prefix = 'TRK';
      const num = Math.floor(10000000 + Math.random() * 90000000).toString();
      const suffix = Array.from({ length: 2 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      randVal = `${prefix}-${num}-${suffix}`;
    }
    setValue(randVal);
    setSelectedPreset('custom'); // Set to custom since user randomized it
  };

  // Handler for preset product type selections
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === 'custom') return;

    const preset = PAYLOAD_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFormat(preset.recommendedFormat);
      setValue(preset.sampleValue);
    }
  };

  const downloadSVG = () => {
    if (!svgRef.current || error) return;
    try {
      const svgEl = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);

      if (!source.match(/^<svg[^>]+xmlns="http\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+"http\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `barcode-${format}-${value}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download SVG', err);
    }
  };

  const downloadPNG = () => {
    if (!svgRef.current || error) return;
    try {
      const svgEl = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const padding = 20;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, padding, padding);
          
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `barcode-${format}-${value}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      console.error('Failed to download PNG', err);
    }
  };

  const getFormatHelp = () => {
    switch (format) {
      case 'EAN13':
        return 'EAN-13 requires exactly 12 numeric digits (the 13th checksum digit is computed automatically).';
      case 'UPC':
        return 'UPC-A requires exactly 11 numeric digits (the 12th checksum digit is computed automatically).';
      case 'CODE39':
        return 'CODE39 supports uppercase letters (A-Z), numbers (0-9), and characters: - . $ / + % space.';
      default:
        return 'CODE128 is highly flexible and encodes all ASCII characters (letters, numbers, symbols).';
    }
  };

  return (
    <div id="barcode-generator-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Settings Panel */}
      <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Barcode className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Barcode Generation Station</h2>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            Generate crisp, industry-standard linear barcodes with precision rendering, physical scanner validation safeguards, and custom color presets.
          </p>
        </div>

        {/* Preset Category Picker */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <label className="text-xs font-bold text-slate-800">Payload Categories & Industry Presets</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYLOAD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                className={`text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                  selectedPreset === preset.id
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-bold">{preset.label}</div>
                <div className="text-[9px] text-slate-400 font-normal line-clamp-1 mt-0.5">{preset.description}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              className={`text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                selectedPreset === 'custom'
                  ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-bold">Custom Values</div>
              <div className="text-[9px] text-slate-400 font-normal line-clamp-1 mt-0.5">Freeform manual data payload inputs</div>
            </button>
          </div>
        </div>

        {/* Input Value & Randomizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Barcode Payload Content
            </label>
            <button
              type="button"
              onClick={handleRandomize}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all cursor-pointer bg-indigo-50 hover:bg-indigo-100/80 px-2 py-1 rounded-lg"
            >
              <RefreshCw className="w-3 h-3" />
              Generate Random Code
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setSelectedPreset('custom');
              }}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-indigo-500 rounded-xl py-3 px-4 outline-hidden transition-all font-mono"
              placeholder="Enter text or number sequence"
            />
          </div>

          {/* Real-time Formatting Validation Helper Display */}
          <div className={`text-[10px] p-2 rounded-lg flex items-start gap-1.5 ${
            validationMessage.status === 'success' 
              ? 'bg-emerald-50/60 text-emerald-800 border border-emerald-100' 
              : validationMessage.status === 'warning'
              ? 'bg-amber-50/60 text-amber-800 border border-amber-100'
              : 'bg-rose-50/60 text-rose-800 border border-rose-100'
          }`}>
            {validationMessage.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
            {validationMessage.status === 'warning' && <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
            {validationMessage.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
            <span className="font-medium">{validationMessage.text}</span>
          </div>

          <p className="text-[10px] text-slate-400 flex items-start gap-1 pt-1">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>{getFormatHelp()}</span>
          </p>
        </div>

        {/* Format Selection & Layout Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Symbology Format</label>
            <select
              value={format}
              onChange={(e) => {
                const newFmt = e.target.value;
                setFormat(newFmt);
                setSelectedPreset('custom');
                // Adjust default inputs based on formats
                if (newFmt === 'EAN13') {
                  setValue('123456789012');
                } else if (newFmt === 'UPC') {
                  setValue('12345678901');
                } else {
                  setValue('PROD-7749-W2');
                }
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3 outline-hidden transition-all cursor-pointer font-semibold"
            >
              <option value="CODE128">CODE128 (Universal - Text & Numbers)</option>
              <option value="EAN13">EAN-13 (Standard Retail - 12/13 digits)</option>
              <option value="UPC">UPC-A (Standard Retail North America - 11/12 digits)</option>
              <option value="CODE39">CODE39 (Industrial & Automotive)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Margin Whitespace (px)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3 outline-hidden transition-all font-mono font-semibold"
            />
          </div>
        </div>

        {/* Height and Width Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Bar Height ({height}px)
              </label>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Line Thickness ({width}px)
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Color controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Line Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 outline-hidden transition-all font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 outline-hidden transition-all font-mono text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Extra Display Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">Render Value Text</span>
            <span className="text-[10px] text-slate-400 block">Include readable alphanumeric labels below the barcode rows</span>
          </div>
          <button
            type="button"
            onClick={() => setDisplayValue(!displayValue)}
            className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${displayValue ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-xs transform transition-transform duration-200 ease-in-out ${displayValue ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Real-time Preview Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center">
          <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold uppercase px-2.5 py-1 rounded-full mb-4 tracking-wide self-start">
            Live Preview Board
          </span>

          {/* Barcode Output Window */}
          <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-6 min-h-[220px] flex flex-col items-center justify-center transition-all">
            {error ? (
              <div className="flex flex-col items-center text-center max-w-xs space-y-2 p-4">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-red-950">Invalid Payload Structure</h4>
                <p className="text-[11px] text-red-600 font-medium leading-relaxed font-mono">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-w-full flex justify-center items-center py-4 bg-white rounded-xl shadow-xs border border-slate-150 px-6">
                <svg ref={svgRef} className="max-w-full block" />
              </div>
            )}
          </div>

          {/* Code Spec & Stats */}
          {!error && (
            <div className="w-full mt-4 bg-slate-50/60 border border-slate-100 rounded-xl p-3 text-left">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-mono text-slate-500">
                <div>Symbology: <span className="text-slate-800 font-semibold">{format}</span></div>
                <div>Characters: <span className="text-slate-800 font-semibold">{value.length}</span></div>
                <div>Height: <span className="text-slate-800 font-semibold">{height}px</span></div>
                <div>Lines Color: <span className="text-slate-800 font-semibold">{lineColor}</span></div>
              </div>
            </div>
          )}

          {/* Action Download Triggers */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              disabled={!!error}
              onClick={downloadPNG}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              type="button"
              disabled={!!error}
              onClick={downloadSVG}
              className="py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download SVG
            </button>
          </div>
        </div>

        {/* Integration Quick Guide */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
          <h4 className="text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            Developer & POS Integration Tip
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Linear barcodes require high physical print contrast to guarantee fast scans by legacy red-laser POS devices. Maintain high-contrast colors (like black on white) and select high-fidelity vector SVG format for corporate product packaging print works.
          </p>
        </div>
      </div>
    </div>
  );
}
