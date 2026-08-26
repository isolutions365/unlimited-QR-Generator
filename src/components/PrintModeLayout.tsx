import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Printer, 
  ArrowLeft, 
  Sliders, 
  Grid, 
  FileText, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Scissors, 
  Zap,
  Smartphone,
  BookOpen
} from 'lucide-react';
import { QRProject } from '../types';
import { MemoizedQRCanvas } from './MemoizedQRCanvas';
import Logo from './Logo';
import { isRtlLocale, Locale } from '../utils/translations';

interface PrintModeLayoutProps {
  currentProject: Partial<QRProject> | null;
  onBack: () => void;
  t: (key: string, defaultValue: string) => string;
  locale?: Locale;
}

type LabelPresetId = 'avery_5160' | 'avery_5161' | 'avery_5163' | 'business_card_h' | 'business_card_v' | 'table_tent' | 'single_label';

interface LabelPreset {
  id: LabelPresetId;
  name: string;
  description: string;
  cols: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  marginTopMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  marginRightMm: number;
  colGapMm: number;
  rowGapMm: number;
  category: 'label' | 'card' | 'other';
}

export default function PrintModeLayout({ currentProject, onBack, t, locale = 'en' }: PrintModeLayoutProps) {
  const isRtl = isRtlLocale(locale);

  // Label presets with official technical specifications in mm
  const PRESETS: LabelPreset[] = [
    {
      id: 'avery_5160',
      name: t('print.preset.avery_5160.name', 'Avery 5160 (30 Labels/Sheet)'),
      description: t('print.preset.avery_5160.desc', 'Standard 3x10 address & general identifier labels. Perfect for small products.'),
      cols: 3,
      rows: 10,
      labelWidthMm: 66.675,
      labelHeightMm: 25.4,
      marginTopMm: 12.7,
      marginBottomMm: 12.7,
      marginLeftMm: 4.76,
      marginRightMm: 4.76,
      colGapMm: 3.175,
      rowGapMm: 0,
      category: 'label'
    },
    {
      id: 'avery_5161',
      name: t('print.preset.avery_5161.name', 'Avery 5161 (20 Labels/Sheet)'),
      description: t('print.preset.avery_5161.desc', 'Medium 2x10 shipping & asset tag labels. Excellent size for QR codes.'),
      cols: 2,
      rows: 10,
      labelWidthMm: 101.6,
      labelHeightMm: 25.4,
      marginTopMm: 12.7,
      marginBottomMm: 12.7,
      marginLeftMm: 4.127,
      marginRightMm: 4.127,
      colGapMm: 3.968,
      rowGapMm: 0,
      category: 'label'
    },
    {
      id: 'avery_5163',
      name: t('print.preset.avery_5163.name', 'Avery 5163 (10 Labels/Sheet)'),
      description: t('print.preset.avery_5163.desc', 'Large 2x5 shipping & retail tags. Highly visible display layout.'),
      cols: 2,
      rows: 5,
      labelWidthMm: 101.6,
      labelHeightMm: 50.8,
      marginTopMm: 12.7,
      marginBottomMm: 12.7,
      marginLeftMm: 4.127,
      marginRightMm: 4.127,
      colGapMm: 3.968,
      rowGapMm: 0,
      category: 'label'
    },
    {
      id: 'business_card_h',
      name: t('print.preset.business_card_h.name', 'Business Cards - Horizontal (10/Sheet)'),
      description: t('print.preset.business_card_h.desc', 'Standard horizontal business card template (3.5" x 2.0") with cutlines.'),
      cols: 2,
      rows: 5,
      labelWidthMm: 88.9,
      labelHeightMm: 50.8,
      marginTopMm: 12.7,
      marginBottomMm: 12.7,
      marginLeftMm: 19.1,
      marginRightMm: 19.1,
      colGapMm: 0,
      rowGapMm: 0,
      category: 'card'
    },
    {
      id: 'business_card_v',
      name: t('print.preset.business_card_v.name', 'Business Cards - Vertical (10/Sheet)'),
      description: t('print.preset.business_card_v.desc', 'Modern vertical business card template (2.0" x 3.5") with alignment guides.'),
      cols: 2,
      rows: 5,
      labelWidthMm: 50.8,
      labelHeightMm: 88.9,
      marginTopMm: 12.7,
      marginBottomMm: 12.7,
      marginLeftMm: 19.1,
      marginRightMm: 19.1,
      colGapMm: 0,
      rowGapMm: 0,
      category: 'card'
    },
    {
      id: 'table_tent',
      name: t('print.preset.table_tent.name', 'Foldable Table Tent Card (2/Sheet)'),
      description: t('print.preset.table_tent.desc', 'Tabletop double-sided fold-over stand displays with center alignment guides.'),
      cols: 1,
      rows: 2,
      labelWidthMm: 148.0,
      labelHeightMm: 105.0,
      marginTopMm: 20.0,
      marginBottomMm: 20.0,
      marginLeftMm: 31.0,
      marginRightMm: 31.0,
      colGapMm: 0,
      rowGapMm: 15.0,
      category: 'other'
    },
    {
      id: 'single_label',
      name: t('print.preset.single_label.name', 'Single Large Display (1/Sheet)'),
      description: t('print.preset.single_label.desc', 'Single high-resolution print optimized for flyer templates or posters.'),
      cols: 1,
      rows: 1,
      labelWidthMm: 160.0,
      labelHeightMm: 220.0,
      marginTopMm: 20.0,
      marginBottomMm: 20.0,
      marginLeftMm: 20.0,
      marginRightMm: 20.0,
      colGapMm: 0,
      rowGapMm: 0,
      category: 'other'
    }
  ];

  // UI state variables
  const [selectedPresetId, setSelectedPresetId] = useState<LabelPresetId>('avery_5160');
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const [showGuides, setShowGuides] = useState(true);
  const [qrScale, setQrScale] = useState(70); // percentage size of QR code within individual cell
  const [qrImg, setQrImg] = useState<string>('');
  const [isRendered, setIsRendered] = useState(false);

  // Editable label details (initialized from current project frame or fallback default values)
  const [companyName, setCompanyName] = useState(currentProject?.name || t('print.defaultBrand', 'FREEQRGEN CORP'));
  const [headingText, setHeadingText] = useState(currentProject?.design?.frameText || t('print.defaultHeading', 'SCAN TO LEARN MORE'));
  const [subText, setSubText] = useState(t('print.defaultSubtext', 'Simply scan with your camera'));
  const [badgeText, setBadgeText] = useState(t('print.defaultBadge', 'WEBSITE'));
  const [themeColor, setThemeColor] = useState<string>('#4f46e5'); // indigo

  // Fine-tuning states derived from selected preset (allowing fine adjustment)
  const [marginTop, setMarginTop] = useState(12.7);
  const [marginLeft, setMarginLeft] = useState(4.8);
  const [colGap, setColGap] = useState(3.1);
  const [rowGap, setRowGap] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePreset = PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0];

  // Sync settings whenever preset or paper changes
  useEffect(() => {
    setMarginTop(activePreset.marginTopMm);
    setMarginLeft(activePreset.marginLeftMm);
    setColGap(activePreset.colGapMm);
    setRowGap(activePreset.rowGapMm);
  }, [selectedPresetId]);

  // Handle generation capture
  const handleQrDrawComplete = () => {
    if (canvasRef.current) {
      // Capture the rendered canvas to a high-resolution data URI
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setQrImg(dataUrl);
      setIsRendered(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 ${isRtl ? 'rtl-active' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Settings control panel sidebar: Hidden during print */}
      <div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-screen md:sticky md:top-0 no-print shadow-xl z-20 overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-150 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white transition-all font-semibold uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              <span>{t('print.backToStation', 'Back to Station')}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="Free QR Generator Home"
            >
              <Logo size={28} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Printer className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider leading-none">{t('print.studioTitle', 'Print Layout Studio')}</h1>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{t('print.studioSubtitle', 'Physical label & cardstock calibration')}</p>
            </div>
          </div>
        </div>

        {/* Configuration settings scroll area */}
        <div className="p-5 space-y-6 flex-1">
          {/* Preset Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>{t('print.selectLayoutPreset', 'Select Layout Preset')}</span>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{t('print.standardDimensions', 'Standard Dimensions')}</span>
            </label>
            <div className="relative">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value as LabelPresetId)}
                className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden appearance-none cursor-pointer transition-all shadow-3xs"
              >
                {PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-4 h-4 text-slate-500 absolute ${isRtl ? 'left-3.5' : 'right-3.5'} top-3.5 pointer-events-none`} />
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
              {activePreset.description}
            </p>
          </div>

          {/* Quick Paper Format & Guides */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('print.paperFormat', 'Paper Size')}</span>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaperSize('letter')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    paperSize === 'letter' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('print.paperLetter', 'US Letter')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('a4')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    paperSize === 'a4' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('print.paperA4', 'A4 Page')}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('print.cutlines', 'Crop Guidelines')}</span>
              <button
                type="button"
                onClick={() => setShowGuides(!showGuides)}
                className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  showGuides 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showGuides ? t('print.guidesOn', 'Guides Active') : t('print.guidesOff', 'Guides Hidden')}</span>
              </button>
            </div>
          </div>

          {/* Design Tuning Sliders */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('print.calibrationSettings', 'Fine Calibration Settings')}</span>
            </div>

            {/* QR Scale Inside Cell */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{t('print.qrCodeSizeScale', 'QR Code Scale')}</span>
                <span>{qrScale}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={qrScale}
                onChange={(e) => setQrScale(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Top Margin */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{t('print.topMarginMm', 'Top Margin')}</span>
                <span>{marginTop.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={marginTop}
                onChange={(e) => setMarginTop(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Left Margin */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>{t('print.leftMarginMm', 'Left Margin')}</span>
                <span>{marginLeft.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={marginLeft}
                onChange={(e) => setMarginLeft(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Grid Spacings (Gaps) */}
            {activePreset.cols > 1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{t('print.columnGapMm', 'Column Gap')}</span>
                  <span>{colGap.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={colGap}
                  onChange={(e) => setColGap(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {activePreset.rows > 1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>{t('print.rowGapMm', 'Row Gap')}</span>
                  <span>{rowGap.toFixed(1)} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={rowGap}
                  onChange={(e) => setRowGap(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Editable Label Information Fields */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{t('print.labelContent', 'Label Copy Content')}</span>
            
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">{t('print.companyNameLabel', 'Brand / Company Name')}</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={40}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">{t('print.headingLabel', 'Main Heading')}</span>
              <input
                type="text"
                value={headingText}
                onChange={(e) => setHeadingText(e.target.value)}
                maxLength={50}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">{t('print.badgeLabel', 'Badge Label')}</span>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                maxLength={20}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">{t('print.subtextLabel', 'Secondary Subtext')}</span>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                maxLength={60}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-600 block">{t('print.colorLabel', 'Theme Color Accent')}</span>
              <div className="flex gap-2">
                {['#4f46e5', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setThemeColor(c)}
                    className="w-6 h-6 rounded-full border border-slate-200 cursor-pointer flex items-center justify-center transition-all hover:scale-110 shrink-0"
                    style={{ backgroundColor: c }}
                  >
                    {themeColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-6 h-6 rounded-full border border-slate-200 cursor-pointer overflow-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Offscreen Generator Engine container */}
        <div className="hidden">
          <MemoizedQRCanvas
            ref={canvasRef}
            textToEncode={currentProject?.content || 'https://freeqrgen.pro'}
            fgColor={currentProject?.design?.fgColor || '#000000'}
            bgColor={currentProject?.design?.bgColor || '#ffffff'}
            gradientType={currentProject?.design?.gradientType || 'none'}
            gradientColor={currentProject?.design?.gradientColor || '#4f46e5'}
            dotStyle={currentProject?.design?.dotStyle || 'square'}
            eyeStyle={currentProject?.design?.eyeStyle || 'square'}
            logoUrl={currentProject?.design?.logoUrl}
            logoScale={currentProject?.design?.logoScale || 0.15}
            margin={currentProject?.design?.margin || 2}
            logoRotation={currentProject?.design?.logoRotation || 0}
            logoAutoCenter={currentProject?.design?.logoAutoCenter !== false}
            logoOffsetX={currentProject?.design?.logoOffsetX || 0}
            logoOffsetY={currentProject?.design?.logoOffsetY || 0}
            eyeColorTopLeft={currentProject?.design?.eyeColorTopLeft}
            eyeColorTopRight={currentProject?.design?.eyeColorTopRight}
            eyeColorBottomLeft={currentProject?.design?.eyeColorBottomLeft}
            errorCorrectionLevel={currentProject?.design?.errorCorrectionLevel || 'H'}
            isPrintModalOpen={true}
            onDrawComplete={handleQrDrawComplete}
          />
        </div>

        {/* Static Trigger Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 shrink-0 select-none">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!isRendered}
            className={`w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
              !isRendered ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            <span>{t('print.triggerPrintNow', 'PRINT SHEET NOW')}</span>
          </button>
          <div className="mt-2 text-[9px] text-slate-400 font-semibold text-center flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>{t('print.dialogTip', 'Set margins to "None" in your system print dialog for pixel accuracy.')}</span>
          </div>
        </div>
      </div>

      {/* Main Print Preview Page: Stylized and rendered directly inside the DOM */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-x-auto min-w-[340px] max-h-screen md:overflow-y-auto bg-slate-100/90">
        {/* Helper Tip Callout (No-Print) */}
        <div className="w-full max-w-4xl bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-start gap-3 no-print shadow-2xs">
          <Scissors className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-left text-xs leading-normal">
            <h4 className="font-bold text-indigo-900">{t('print.interactiveCalibrationTitle', 'Physical Label & Cardstock Blueprint calibrator')}</h4>
            <p className="text-indigo-700 mt-1">
              {t('print.calibrationDesc', 'Configure parameters on the left. The live paper layout below updates instantly with exact physical margins and sizes. Use the Print Sheet Now button or press Ctrl+P to trigger printer layout output.')}
            </p>
          </div>
        </div>

        {/* Paper Container: Simulates a physical A4/Letter page sheet with shadow */}
        <div 
          className="print-sheet-container bg-white shadow-2xl relative select-none shrink-0"
          style={{
            width: paperSize === 'letter' ? '215.9mm' : '210mm',
            height: paperSize === 'letter' ? '279.4mm' : '297mm',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Alignment guide labels (screen only) */}
          {showGuides && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider no-print z-30 shadow-xs flex items-center gap-1">
              <Scissors className="w-2.5 h-2.5" />
              <span>{t('print.activeAlignmentMarks', 'Crop Guides Active — Hidden on Printing')}</span>
            </div>
          )}

          {/* Actual grid content calibrated to margins */}
          <div
            className="w-full h-full relative"
            style={{
              paddingTop: `${marginTop}mm`,
              paddingLeft: `${marginLeft}mm`,
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${activePreset.cols}, ${activePreset.labelWidthMm}mm)`,
                gridTemplateRows: `repeat(${activePreset.rows}, ${activePreset.labelHeightMm}mm)`,
                columnGap: `${colGap}mm`,
                rowGap: `${rowGap}mm`,
                alignContent: 'start',
                justifyContent: 'start',
              }}
            >
              {Array.from({ length: activePreset.cols * activePreset.rows }).map((_, index) => {
                const isFoldGuide = selectedPresetId === 'table_tent';

                return (
                  <div
                    key={index}
                    className="label-cell relative flex items-center justify-center bg-white"
                    style={{
                      width: `${activePreset.labelWidthMm}mm`,
                      height: `${activePreset.labelHeightMm}mm`,
                      boxSizing: 'border-box',
                      border: showGuides ? '1px dashed #cbd5e1' : 'none',
                    }}
                  >
                    {/* Render different styles of labels depending on selection */}
                    {qrImg ? (
                      (() => {
                        // Standard Table Tent Folding display
                        if (selectedPresetId === 'table_tent') {
                          return (
                            <div className="w-full h-full flex divide-x divide-dashed divide-slate-200 relative">
                              {/* Left side (Back View - Rotated 180 degrees) */}
                              <div className="w-1/2 h-full p-4 flex flex-col items-center justify-between rotate-180 text-center select-none opacity-80">
                                <div>
                                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block font-mono">{companyName}</span>
                                  <h4 className="text-[10px] font-black text-slate-800 leading-tight mt-1 uppercase">{t('preview.thankYou', 'Thank You!')}</h4>
                                </div>
                                <div className="p-1 border border-slate-100 rounded-md bg-white">
                                  <img src={qrImg} className="w-[32mm] h-[32mm] opacity-90" alt="Print QR Table Tent" />
                                </div>
                                <span className="text-[6px] text-slate-400 font-black uppercase tracking-wider block font-mono">{t('preview.backDisplay', 'Back Display')}</span>
                              </div>

                              {/* Right side (Front display viewport) */}
                              <div className="w-1/2 h-full p-4 flex flex-col items-center justify-between text-center select-none relative">
                                <div 
                                  className="absolute top-0 right-0 left-0 h-1" 
                                  style={{ backgroundColor: themeColor }}
                                />
                                <div>
                                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block font-mono">{companyName}</span>
                                  <h3 className="text-[10px] font-black text-slate-900 leading-snug tracking-tight mt-1 uppercase">{headingText}</h3>
                                </div>
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="p-1 border border-slate-100 rounded-md bg-white shadow-3xs">
                                    <img src={qrImg} className="w-[38mm] h-[38mm]" alt="Print QR Table Tent" />
                                  </div>
                                  <div 
                                    className="px-2 py-0.5 text-[6px] font-black uppercase rounded text-white tracking-widest"
                                    style={{ backgroundColor: themeColor }}
                                  >
                                    {badgeText}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[7px] font-bold text-slate-600 block truncate max-w-[55mm] font-mono leading-none">{subText}</span>
                                  <span className="text-[5px] text-slate-400 font-bold block uppercase mt-0.5 font-mono">{t('preview.foldStandDisplay', 'Fold and Stand display')}</span>
                                </div>
                              </div>

                              {/* Fold Line overlay helper (screen only) */}
                              {showGuides && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white text-[5px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest no-print z-10 shadow-xs border border-slate-700 pointer-events-none">
                                  ✦ {t('print.foldGuide', 'Fold Guide')} ✦
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Business Card Formats
                        if (selectedPresetId === 'business_card_h' || selectedPresetId === 'business_card_v') {
                          const isHoriz = selectedPresetId === 'business_card_h';
                          return (
                            <div 
                              className={`w-full h-full flex relative text-left bg-white overflow-hidden p-3.5 justify-between items-center ${
                                isHoriz ? 'flex-row' : 'flex-col text-center'
                              }`}
                            >
                              {/* Left Accent Bar */}
                              <div 
                                className="absolute bg-slate-900"
                                style={{ 
                                  backgroundColor: themeColor,
                                  left: 0, 
                                  top: 0, 
                                  bottom: isHoriz ? 0 : 'auto', 
                                  right: isHoriz ? 'auto' : 0,
                                  width: isHoriz ? '1.5mm' : '100%', 
                                  height: isHoriz ? '100%' : '1.5mm' 
                                }}
                              />

                              {/* Card Text Content */}
                              <div className={`flex-1 flex flex-col justify-between h-full ${isHoriz ? 'pl-2 text-left' : 'pt-2 items-center'}`}>
                                <div>
                                  <div className="text-[7px] font-bold text-slate-400 tracking-wider uppercase font-mono">{companyName}</div>
                                  <div className="text-[11px] font-black text-slate-800 leading-tight mt-0.5 uppercase tracking-tight">{headingText}</div>
                                </div>
                                <div className="text-[7px] text-slate-500 font-semibold font-mono truncate max-w-[45mm]">{subText}</div>
                              </div>

                              {/* QR Core with badge */}
                              <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                                <div 
                                  className="text-[6px] font-black uppercase px-2 py-0.5 rounded tracking-wider text-white"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  {badgeText}
                                </div>
                                <div className="p-1 border border-slate-100 rounded-md bg-white shadow-3xs">
                                  <img 
                                    src={qrImg} 
                                    style={{
                                      width: isHoriz ? '22mm' : '26mm',
                                      height: isHoriz ? '22mm' : '26mm',
                                    }}
                                    alt="Print QR Card" 
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Single Large Poster View
                        if (selectedPresetId === 'single_label') {
                          return (
                            <div className="w-full h-full flex flex-col justify-between items-center p-8 text-center bg-white">
                              <div>
                                <span className="inline-block px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-full text-indigo-700 bg-indigo-50 font-mono mb-4">
                                  {companyName}
                                </span>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-snug px-2">{headingText}</h1>
                              </div>

                              <div className="flex flex-col items-center justify-center my-6">
                                <div className="p-4 border-4 border-slate-100 rounded-3xl bg-white shadow-lg">
                                  <img src={qrImg} className="w-[85mm] h-[85mm]" alt="Print QR large display" />
                                </div>
                                <div 
                                  className="mt-4 py-1.5 px-4 text-[9px] font-black uppercase tracking-widest rounded-lg text-white shadow-xs"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  {badgeText}
                                </div>
                              </div>

                              <div className="text-center w-full pt-4 border-t border-slate-100">
                                <p className="text-xs font-black text-slate-800 tracking-wide font-mono uppercase">{subText}</p>
                                <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider font-mono">{t('print.scanConnectNotice', 'Simply Scan & Connect • No Special App Required')}</p>
                              </div>
                            </div>
                          );
                        }

                        // Standard Avery label grid cell items
                        return (
                          <div className="w-full h-full p-2 flex items-center justify-between gap-2 overflow-hidden">
                            {/* Text side */}
                            <div className="flex-1 flex flex-col justify-between h-full py-0.5 text-left min-w-0">
                              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest font-mono truncate">{companyName}</span>
                              <p className="text-[8px] font-black text-slate-800 leading-tight tracking-tight uppercase line-clamp-2">{headingText}</p>
                              <span className="text-[6px] text-slate-500 font-semibold font-mono truncate max-w-[40mm]">{subText}</span>
                            </div>

                            {/* Badge & QR Code side */}
                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                              <div 
                                className="px-1.5 py-0.2 text-[5px] font-black uppercase rounded tracking-wider text-white"
                                style={{ backgroundColor: themeColor }}
                              >
                                {badgeText}
                              </div>
                              <div className="p-0.5 border border-slate-100 rounded-md bg-white shadow-3xs">
                                <img 
                                  src={qrImg} 
                                  style={{
                                    width: `${(activePreset.labelHeightMm - 8) * (qrScale / 100)}mm`,
                                    height: `${(activePreset.labelHeightMm - 8) * (qrScale / 100)}mm`,
                                    maxHeight: '18mm',
                                    maxWidth: '18mm'
                                  }}
                                  alt="Print QR" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-[8px] text-slate-400 font-semibold animate-pulse font-mono uppercase">
                        {t('print.generatingRaster', 'Generating QR raster...')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Styled css media injection to handle physical print rules perfectly */}
      <style>{`
        @media print {
          /* Force physical printing parameters on layout */
          @page {
            size: ${paperSize === 'letter' ? '8.5in 11in' : '210mm 297mm'} portrait;
            margin: 0 !important;
          }
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet-container {
            width: ${paperSize === 'letter' ? '215.9mm' : '210mm'} !important;
            height: ${paperSize === 'letter' ? '279.4mm' : '297mm'} !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
            border: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          .print-sheet-container .label-cell {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
