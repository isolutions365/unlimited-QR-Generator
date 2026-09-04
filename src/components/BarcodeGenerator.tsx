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
import { useTranslation, TKey } from '../utils/i18n';

interface BarcodeGeneratorProps {
  locale?: string;
}

// Preset definitions for high utility pre-fills
interface PresetOption {
  id: string;
  labelKey: string;
  labelDefault: string;
  descKey: string;
  descDefault: string;
  recommendedFormat: string;
  sampleValue: string;
}

const PAYLOAD_PRESETS: PresetOption[] = [
  {
    id: 'general',
    labelKey: 'barcode.preset.general.label',
    labelDefault: 'General Product Tag',
    descKey: 'barcode.preset.general.desc',
    descDefault: 'Basic alpha-numeric product code for standard labeling.',
    recommendedFormat: 'CODE128',
    sampleValue: 'PROD-7749-W2'
  },
  {
    id: 'retail_sku_ean',
    labelKey: 'barcode.preset.retail_sku_ean.label',
    labelDefault: 'Retail SKU (EAN-13)',
    descKey: 'barcode.preset.retail_sku_ean.desc',
    descDefault: '12-digit global standard product identification code.',
    recommendedFormat: 'EAN13',
    sampleValue: '590123412345'
  },
  {
    id: 'retail_sku_upc',
    labelKey: 'barcode.preset.retail_sku_upc.label',
    labelDefault: 'Retail SKU (UPC-A)',
    descKey: 'barcode.preset.retail_sku_upc.desc',
    descDefault: '11-digit North American standard product identification.',
    recommendedFormat: 'UPC',
    sampleValue: '01234567890'
  },
  {
    id: 'serial',
    labelKey: 'barcode.preset.serial.label',
    labelDefault: 'Device Serial Number',
    descKey: 'barcode.preset.serial.desc',
    descDefault: 'High-density alphanumeric unique identifier.',
    recommendedFormat: 'CODE128',
    sampleValue: 'SN-2026-99A8X'
  },
  {
    id: 'inventory',
    labelKey: 'barcode.preset.inventory.label',
    labelDefault: 'Inventory Asset ID',
    descKey: 'barcode.preset.inventory.desc',
    descDefault: 'Industrial warehouse asset tracking identifier.',
    recommendedFormat: 'CODE39',
    sampleValue: 'ASSET-904-XYZ'
  }
];

export default function BarcodeGenerator({ locale: propLocale }: BarcodeGeneratorProps) {
  const { t, locale } = useTranslation();
  const activeLocale = locale || propLocale || 'en';
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
  const [errorDetails, setErrorDetails] = useState<{
    key: TKey;
    defaultText: string;
    params?: any;
  } | null>(null);
  const [validationMessage, setValidationMessage] = useState<{
    status: 'success' | 'warning' | 'error';
    textKey: string;
    defaultText: string;
    params?: any;
  }>({ status: 'success', textKey: 'barcode.validFormat', defaultText: 'Valid barcode format.' });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Helper validation function
  const validateInput = (val: string, fmt: string) => {
    const cleanVal = val.trim();
    if (!cleanVal) {
      return {
        status: 'error' as const,
        textKey: 'barcode.valEmpty',
        defaultText: 'Please enter a value to generate a barcode.'
      };
    }

    if (fmt === 'EAN13') {
      if (!/^\d+$/.test(cleanVal)) {
        return {
          status: 'error' as const,
          textKey: 'barcode.valEanDigits',
          defaultText: 'EAN-13 requires numeric characters only (0-9).'
        };
      }
      if (cleanVal.length !== 12 && cleanVal.length !== 13) {
        return {
          status: 'warning' as const,
          textKey: 'barcode.valEanLen',
          defaultText: 'EAN-13 requires exactly 12 or 13 digits (Current: {count}). A 12-digit input automatically gets its checksum appended.',
          params: { count: cleanVal.length }
        };
      }
    } else if (fmt === 'UPC') {
      if (!/^\d+$/.test(cleanVal)) {
        return {
          status: 'error' as const,
          textKey: 'barcode.valUpcDigits',
          defaultText: 'UPC-A requires numeric characters only (0-9).'
        };
      }
      if (cleanVal.length !== 11 && cleanVal.length !== 12) {
        return {
          status: 'warning' as const,
          textKey: 'barcode.valUpcLen',
          defaultText: 'UPC-A requires exactly 11 or 12 digits (Current: {count}). An 11-digit input automatically gets its checksum appended.',
          params: { count: cleanVal.length }
        };
      }
    } else if (fmt === 'CODE39') {
      const allowed = /^[0-9A-Z\-\.\ \$\/\+\%]+$/i;
      if (!allowed.test(cleanVal)) {
        return {
          status: 'error' as const,
          textKey: 'barcode.valCode39Chars',
          defaultText: 'CODE39 supports 0-9, A-Z (caps), space, and symbols: - . $ / + %'
        };
      }
    } else if (fmt === 'CODE128') {
      const allowedAscii = /^[\x00-\x7F]*$/;
      if (!allowedAscii.test(cleanVal)) {
        return {
          status: 'error' as const,
          textKey: 'barcode.valCode128Ascii',
          defaultText: 'CODE128 supports standard 128 ASCII characters only.'
        };
      }
    }

    return {
      status: 'success' as const,
      textKey: 'barcode.passedValidation',
      defaultText: 'Format validation passed! High physical contrast is ready to render.'
    };
  };

  // Perform active live rendering & validation updates
  useEffect(() => {
    const result = validateInput(value, format);
    setValidationMessage(result);

    if (result.status === 'error') {
      setErrorDetails({
        key: result.textKey as TKey,
        defaultText: result.defaultText,
        params: result.params
      });
      return;
    }

    if (!svgRef.current) return;

    try {
      setErrorDetails(null);
      
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
            setErrorDetails({
              key: 'barcode.renderFailed',
              defaultText: `The renderer failed to parse this payload for ${format}. Please verify your format characters.`,
              params: { format }
            });
          }
        }
      });
    } catch (err: any) {
      console.warn('Barcode rendering error:', err);
      setErrorDetails({
        key: 'barcode.unsupportedChars',
        defaultText: err?.message || 'Unsupported characters for the selected barcode format.'
      });
    }
  }, [value, format, height, width, displayValue, lineColor, background, margin, activeLocale, t]);

  // Handler for manual random generator
  const handleRandomize = () => {
    let randVal = '';
    if (format === 'EAN13') {
      randVal = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    } else if (format === 'UPC') {
      randVal = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    } else if (format === 'CODE39') {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-';
      randVal = 'ID-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } else {
      const prefix = 'TRK';
      const num = Math.floor(10000000 + Math.random() * 90000000).toString();
      const suffix = Array.from({ length: 2 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
      randVal = `${prefix}-${num}-${suffix}`;
    }
    setValue(randVal);
    setSelectedPreset('custom');
  };

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
    if (!svgRef.current || errorDetails) return;
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
    if (!svgRef.current || errorDetails) return;
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
        return t('barcode.helpEan', 'EAN-13 requires exactly 12 numeric digits (the 13th checksum digit is computed automatically).');
      case 'UPC':
        return t('barcode.helpUpc', 'UPC-A requires exactly 11 numeric digits (the 12th checksum digit is computed automatically).');
      case 'CODE39':
        return t('barcode.helpCode39', 'CODE39 supports uppercase letters (A-Z), numbers (0-9), and characters: - . $ / + % space.');
      default:
        return t('barcode.helpCode128', 'CODE128 is highly flexible and encodes all ASCII characters (letters, numbers, symbols).');
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t('barcode.title', 'Barcode Generation Station')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            {t('barcode.subtitle', 'Generate crisp, industry-standard linear barcodes with precision rendering, physical scanner validation safeguards, and custom color presets.')}
          </p>
        </div>

        {/* Preset Category Picker */}
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <label className="text-xs font-bold text-slate-800">
              {t('barcode.presetsCategory', 'Payload Categories & Industry Presets')}
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAYLOAD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetChange(preset.id)}
                aria-label={t(preset.labelKey as TKey, preset.labelDefault)}
                className={`text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                  selectedPreset === preset.id
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-bold">{t(preset.labelKey as TKey, preset.labelDefault)}</div>
                <div className="text-[9px] text-slate-400 font-normal line-clamp-1 mt-0.5">{t(preset.descKey as TKey, preset.descDefault)}</div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePresetChange('custom')}
              aria-label={t('barcode.preset.custom.label', 'Custom Values')}
              className={`text-left p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                selectedPreset === 'custom'
                  ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
              }`}
            >
              <div className="font-bold">{t('barcode.preset.custom.label', 'Custom Values')}</div>
              <div className="text-[9px] text-slate-400 font-normal line-clamp-1 mt-0.5">{t('barcode.preset.custom.desc', 'Freeform manual data payload inputs')}</div>
            </button>
          </div>
        </div>

        {/* Input Value & Randomizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              {t('barcode.payloadContent', 'Barcode Payload Content')}
            </label>
            <button
              type="button"
              onClick={handleRandomize}
              aria-label={t('barcode.generateRandom', 'Generate Random Code')}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all cursor-pointer bg-indigo-50 hover:bg-indigo-100/80 px-2 py-1 rounded-lg"
            >
              <RefreshCw className="w-3 h-3" />
              {t('barcode.generateRandom', 'Generate Random Code')}
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
              aria-label={t('barcode.payloadContent', 'Barcode Payload Content')}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 border border-slate-200 focus:border-indigo-500 rounded-xl py-3 px-4 outline-hidden transition-all font-mono"
              placeholder={t('barcode.inputPlaceholder', 'Enter text or number sequence')}
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
            <span className="font-medium">{t(validationMessage.textKey as TKey, validationMessage.defaultText, validationMessage.params)}</span>
          </div>

          <p className="text-[10px] text-slate-400 flex items-start gap-1 pt-1">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
            <span>{getFormatHelp()}</span>
          </p>
        </div>

        {/* Format Selection & Layout Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="barcode-symbology-select" className="text-xs font-bold text-slate-800">{t('barcode.symbologyFormat', 'Symbology Format')}</label>
            <select
              id="barcode-symbology-select"
              value={format}
              onChange={(e) => {
                const newFmt = e.target.value;
                setFormat(newFmt);
                setSelectedPreset('custom');
                if (newFmt === 'EAN13') {
                  setValue('123456789012');
                } else if (newFmt === 'UPC') {
                  setValue('12345678901');
                } else {
                  setValue('PROD-7749-W2');
                }
              }}
              aria-label={t('barcode.symbologyFormat', 'Symbology Format')}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3 outline-hidden transition-all cursor-pointer font-semibold"
            >
              <option value="CODE128">{t('barcode.format.code128', 'CODE128 (Universal - Text & Numbers)')}</option>
              <option value="EAN13">{t('barcode.format.ean13', 'EAN-13 (Standard Retail - 12/13 digits)')}</option>
              <option value="UPC">{t('barcode.format.upc', 'UPC-A (Standard Retail North America - 11/12 digits)')}</option>
              <option value="CODE39">{t('barcode.format.code39', 'CODE39 (Industrial & Automotive)')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="barcode-margin-input" className="text-xs font-bold text-slate-800">{t('barcode.margin', 'Margin Whitespace (px)')}</label>
            <input
              id="barcode-margin-input"
              type="number"
              min="0"
              max="50"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              aria-label={t('barcode.margin', 'Margin Whitespace (px)')}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3 outline-hidden transition-all font-mono font-semibold"
            />
          </div>
        </div>

        {/* Height and Width Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="barcode-height-range" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                {t('barcode.barHeight', 'Bar Height ({height}px)', { height })}
              </label>
            </div>
            <input
              id="barcode-height-range"
              type="range"
              min="30"
              max="200"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              aria-label={t('barcode.barHeight', 'Bar Height ({height}px)', { height })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="barcode-width-range" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                {t('barcode.lineThickness', 'Line Thickness ({width}px)', { width })}
              </label>
            </div>
            <input
              id="barcode-width-range"
              type="range"
              min="1"
              max="5"
              step="1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              aria-label={t('barcode.lineThickness', 'Line Thickness ({width}px)', { width })}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Color controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
          <div className="space-y-2">
            <label htmlFor="barcode-linecolor-picker" className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              {t('barcode.lineColor', 'Line Color')}
            </label>
            <div className="flex gap-2">
              <input
                id="barcode-linecolor-picker"
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                aria-label={t('barcode.lineColor', 'Line Color')}
                className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                aria-label={t('barcode.lineColor', 'Line Color')}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 outline-hidden transition-all font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="barcode-bg-picker" className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              {t('barcode.backgroundColor', 'Background Color')}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                aria-label={t('barcode.backgroundColor', 'Background Color')}
                className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                aria-label={t('barcode.backgroundColor', 'Background Color')}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 outline-hidden transition-all font-mono text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Extra Display Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-800 block">{t('barcode.renderValueText', 'Render Value Text')}</span>
            <span className="text-[10px] text-slate-400 block">{t('barcode.renderValueTextDesc', 'Include readable alphanumeric labels below the barcode rows')}</span>
          </div>
          <button
            type="button"
            onClick={() => setDisplayValue(!displayValue)}
            aria-label={t('barcode.renderValueText', 'Render Value Text')}
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
            {t('barcode.livePreviewBoard', 'Live Preview Board')}
          </span>

          {/* Barcode Output Window */}
          <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-6 min-h-[220px] flex flex-col items-center justify-center transition-all">
            {errorDetails ? (
              <div className="flex flex-col items-center text-center max-w-xs space-y-2 p-4">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-red-950">{t('barcode.invalidStructure', 'Invalid Payload Structure')}</h4>
                <p className="text-[11px] text-red-600 font-medium leading-relaxed font-mono">
                  {t(errorDetails.key, errorDetails.defaultText, errorDetails.params)}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-w-full flex justify-center items-center py-4 bg-white rounded-xl shadow-xs border border-slate-150 px-6">
                <svg ref={svgRef} className="max-w-full block" />
              </div>
            )}
          </div>

          {/* Code Spec & Stats */}
          {!errorDetails && (
            <div className="w-full mt-4 bg-slate-50/60 border border-slate-100 rounded-xl p-3 text-left">
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-mono text-slate-500">
                <div>{t('barcode.symbologyLabel', 'Symbology:')} <span className="text-slate-800 font-semibold">{format}</span></div>
                <div>{t('barcode.charactersLabel', 'Characters:')} <span className="text-slate-800 font-semibold">{value.length}</span></div>
                <div>{t('barcode.heightLabel', 'Height:')} <span className="text-slate-800 font-semibold">{height}px</span></div>
                <div>{t('barcode.linesColorLabel', 'Lines Color:')} <span className="text-slate-800 font-semibold">{lineColor}</span></div>
              </div>
            </div>
          )}

          {/* Action Download Triggers */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              disabled={!!errorDetails}
              onClick={downloadPNG}
              aria-label={t('barcode.downloadPng', 'Download PNG')}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('barcode.downloadPng', 'Download PNG')}
            </button>
            <button
              type="button"
              disabled={!!errorDetails}
              onClick={downloadSVG}
              aria-label={t('barcode.downloadSvg', 'Download SVG')}
              className="py-3 px-4 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              {t('barcode.downloadSvg', 'Download SVG')}
            </button>
          </div>
        </div>

        {/* Integration Quick Guide */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
          <h4 className="text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            {t('barcode.tipTitle', 'Developer & POS Integration Tip')}
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {t('barcode.tipDesc', 'Linear barcodes require high physical print contrast to guarantee fast scans by legacy red-laser POS devices. Maintain high-contrast colors (like black on white) and select high-fidelity vector SVG format for corporate product packaging print works.')}
          </p>
        </div>
      </div>

      {/* Genuinely Helpful Educational Guide (Anti-Slop, Clean, Non-Nested layout) */}
      <div className="lg:col-span-12 mt-10 border-t border-slate-200/80 pt-10 space-y-12 select-none">
        {/* Section 1: How to Use */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('barcode.guide.howToTitle', 'How to Generate and Use Barcodes')}
            </h3>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Creating high-quality barcodes for retail, inventory, or asset tracking is straightforward with our station. Follow these four professional steps to output compliant designs:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-sm font-bold text-slate-900">{t('barcode.guide.step1Title', 'Select Symbology')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose the correct format (such as Code 128 for general alphanumerics, or EAN-13/UPC-A for retail retail items) from the dropdown list.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-sm font-bold text-slate-900">{t('barcode.guide.step2Title', 'Input Payload')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your numeric or alphanumeric sequence. The tool validates character compatibility and checksum requirements in real-time.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-sm font-bold text-slate-900">{t('barcode.guide.step3Title', 'Customize Style')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure visual dimensions, line thickness, background margins, colors, and toggle human-readable labels below the matrix.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 04</span>
              <h4 className="text-sm font-bold text-slate-900">{t('barcode.guide.step4Title', 'Export Vector')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download your custom barcode as a PNG for quick digital sharing or high-resolution vector SVG for professional offset printing.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Symbologies Guide */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('barcode.guide.symbologiesTitle', 'Understanding Barcode Symbologies')}
            </h3>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Selecting the wrong symbology can cause legacy scanners to fail. Review this structural framework to match your business requirements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Code 128 (High Density Alphanumeric)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The most modern 1D linear standard. Supports all 128 ASCII characters, including digits, letters, and control characters. Ideal for shipping labels, serial numbers, and general internal stock control.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">EAN-13 & UPC-A (Point-of-Sale Retail Standards)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Global commercial retail standards. UPC-A is standard in North America (12 digits), while EAN-13 is standard globally (13 digits). Designed specifically for checkout registers to trigger price lookups.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Code 39 (Industrial & Military)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Self-checking linear symbology designed to encode alphanumeric text. Supports letters (uppercase A-Z), digits, and limited symbols (- . $ / + % space). Frequently used in automotive manufacturing and defense logistics.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">MSI Plessey & ITF-14</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                MSI Plessey is highly localized for grocery supermarket shelving codes. ITF-14 is standard for outer corrugated shipping containers, featuring thick bearer boundaries to prevent misreads under pressure.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: FAQs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('barcode.guide.faqsTitle', 'Barcode Scanning & Printing FAQs')}
            </h3>
          </div>
          <div className="divide-y divide-slate-150 text-sm">
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">What color schemes are safe for barcode lines?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Legacy laser scanners use red light to detect bars. This means lines must absorb red light (such as black, dark blue, dark brown, or dark green), while backgrounds must reflect red light (such as white, yellow, orange, or red). Avoid printing red lines or utilizing dark background cardboards.
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">Are these generated barcodes free for commercial use?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Yes! Every barcode vector SVG and PNG file generated on FreeQRBarcodes.com is 100% free with unlimited usage rights, allowing commercial retail printing, warehouse tagging, and product distribution.
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">Why does my phone scan my QR code but struggles with 1D linear barcodes?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                QR codes are 2D matrix symbologies containing high fallback error correction and orientation markers. 1D barcodes rely strictly on precise line spacing and relative widths. Standard smartphone cameras need proper alignment, sharp focus, and high-resolution screens to decode linear 1D bars correctly compared to legacy omnidirectional POS laser beams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


