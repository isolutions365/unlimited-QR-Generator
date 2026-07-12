import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../utils/i18n';

import { QRProject } from '../types';
import { renderStyledQR, generateStyledSVG, getEmblemFontSize } from '../utils/qrRenderer';
import { Download, Copy, ExternalLink, Printer, Smartphone, Camera, Check, FileType, X, Layout, Palette, Grid, AlertTriangle, Share2, Twitter, Linkedin, Facebook, ChevronDown, FileText, Scale, Sliders, Contrast, Eye, Layers, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import qrcode from 'qrcode';
import { MemoizedQRCanvas } from './MemoizedQRCanvas';

interface PreviewPanelProps {
  currentProject: Partial<QRProject>;
  onTestScan?: (text: string) => void;
  onDownloadTrigger?: () => void;
  onChange?: (project: Partial<QRProject>) => void;
  isSaving?: boolean;
}

export default function PreviewPanel({ currentProject, onTestScan, onDownloadTrigger, onChange, isSaving = false }: PreviewPanelProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [simulatedScanResult, setSimulatedScanResult] = useState<string | null>(null);
  const [isScanningSim, setIsScanningSim] = useState(false);

  // Dynamic color-shifting save glow state
  const [showSaveGlow, setShowSaveGlow] = useState(false);
  const prevIsSavingRef = useRef(false);

  useEffect(() => {
    if (prevIsSavingRef.current && !isSaving) {
      setShowSaveGlow(true);
      const timer = setTimeout(() => {
        setShowSaveGlow(false);
      }, 4500); // Extended glow to enjoy the beautiful gradient shifts
      return () => clearTimeout(timer);
    }
    prevIsSavingRef.current = !!isSaving;
  }, [isSaving]);
  const [shareLinkType, setShareLinkType] = useState<'destination' | 'app'>('destination');
  const [selectedFormat, setSelectedFormat] = useState<'PNG' | 'SVG' | 'PDF'>('PNG');
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const successTimeoutRef = useRef<any>(null);

  // Scannability diagnostics state
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Print Studio States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>('business_card_horizontal');
  const [companyName, setCompanyName] = useState<string>('CREATIVE STUDIO');
  const [headingText, setHeadingText] = useState<string>('SCAN TO VISIT');
  const [subText, setSubText] = useState<string>('');
  const [badgeText, setBadgeText] = useState<string>('SCAN ME');
  const [themeColor, setThemeColor] = useState<string>('indigo');
  const [printSheetMode, setPrintSheetMode] = useState<boolean>(true);

  // Print-Ready Layout States
  const [isPrintReadyModalOpen, setIsPrintReadyModalOpen] = useState(false);
  const [printReadyPaperSize, setPrintReadyPaperSize] = useState<'a4' | 'letter'>('a4');
  const [printReadyGrayscale, setPrintReadyGrayscale] = useState<'none' | 'grayscale' | 'pure_bw'>('grayscale');
  const [printReadyQrSize, setPrintReadyQrSize] = useState<number>(65); // default size in mm
  const [printReadyMargin, setPrintReadyMargin] = useState<number>(10); // default quiet zone in mm
  const [printReadyCropMarks, setPrintReadyCropMarks] = useState<boolean>(true);
  const [printReadyShowInfo, setPrintReadyShowInfo] = useState<boolean>(true);
  const [printReadyInfoText, setPrintReadyInfoText] = useState<string>('');
  
  // Advanced Print-Ready customization states
  const [printReadyOrientation, setPrintReadyOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [printReadyCopies, setPrintReadyCopies] = useState<'single' | 'grid_2x2' | 'grid_3x3' | 'grid_4x4'>('single');
  const [printReadyZoom, setPrintReadyZoom] = useState<number>(100);
  const [printReadyPosition, setPrintReadyPosition] = useState<'center' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'custom'>('center');
  const [printReadyCustomX, setPrintReadyCustomX] = useState<number>(0);
  const [printReadyCustomY, setPrintReadyCustomY] = useState<number>(0);
  const [printReadyShowGrid, setPrintReadyShowGrid] = useState<boolean>(false);
  const [printReadyShowRulers, setPrintReadyShowRulers] = useState<boolean>(true);
  
  // Custom paper margins (default standard 15mm margins)
  const [printReadyMarginTop, setPrintReadyMarginTop] = useState<number>(15);
  const [printReadyMarginBottom, setPrintReadyMarginBottom] = useState<number>(15);
  const [printReadyMarginLeft, setPrintReadyMarginLeft] = useState<number>(15);
  const [printReadyMarginRight, setPrintReadyMarginRight] = useState<number>(15);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'layout' | 'margins' | 'prepress'>('layout');

  // Keep track of the last known stable readable design configuration
  const lastReadableDesignRef = useRef<any>(null);

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
  const logoAutoCenter = currentProject.design?.logoAutoCenter !== false;
  const logoOffsetX = currentProject.design?.logoOffsetX || 0;
  const logoOffsetY = currentProject.design?.logoOffsetY || 0;
  const eyeColorTopLeft = currentProject.design?.eyeColorTopLeft || '';
  const eyeColorTopRight = currentProject.design?.eyeColorTopRight || '';
  const eyeColorBottomLeft = currentProject.design?.eyeColorBottomLeft || '';
  const errorCorrectionLevel = currentProject.design?.errorCorrectionLevel || 'H';
  const frameStyle = currentProject.design?.frameStyle || 'none';
  const frameText = currentProject.design?.frameText || '';
  const frameColor = currentProject.design?.frameColor || '';
  const frameTextColor = currentProject.design?.frameTextColor || '';
  const frameFontSize = currentProject.design?.frameFontSize || 20;
  const frameTextPosition = currentProject.design?.frameTextPosition || 'bottom';

  const qrContent = currentProject.content || 'https://google.com';
  const appUrl = (window as any).location?.origin || '';
  const trackingId = currentProject.trackingId || '';
  const trackingEnabled = currentProject.trackingEnabled || false;

  const trackingUrl = trackingId ? `${appUrl}/qr/${trackingId}` : null;
  const textToEncode = trackingEnabled && trackingUrl ? trackingUrl : qrContent;

  // Helper to calculate relative luminance for WCAG contrast checking
  const getLuminance = (hexColor: string): number => {
    const hex = hexColor.replace(/^#/, '');
    if (hex.length !== 3 && hex.length !== 6) return 0;
    
    let r = 0, g = 0, b = 0;
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    }
    
    const [rs, gs, bs] = [r, g, b].map((val) => {
      const s = val / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = (hex1: string, hex2: string): number => {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrastFG = getContrastRatio(fgColor, bgColor);
  const contrastGrad = gradientType !== 'none' ? getContrastRatio(gradientColor, bgColor) : contrastFG;
  const minContrast = Math.min(contrastFG, contrastGrad);

  const isLowContrast = minContrast < 3.0;
  const isSuboptimalContrast = minContrast >= 3.0 && minContrast < 4.5;

  let maxRecommendedScale = 0.15;
  if (errorCorrectionLevel === 'M') maxRecommendedScale = 0.20;
  if (errorCorrectionLevel === 'Q') maxRecommendedScale = 0.25;
  if (errorCorrectionLevel === 'H') maxRecommendedScale = 0.28;

  const isExcessiveLogo = !!logoUrl && logoScale > maxRecommendedScale;
  const isHighLogoRisk = !!logoUrl && logoScale > (maxRecommendedScale * 0.8) && logoScale <= maxRecommendedScale;

  const textLength = textToEncode.length;
  const isDensityHighRisk = textLength > 120 && (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M');
  const isDensityMediumRisk = !isDensityHighRisk && (
    (textLength > 120 && errorCorrectionLevel === 'Q') ||
    (textLength > 60 && errorCorrectionLevel === 'L') ||
    (textLength > 80 && errorCorrectionLevel === 'M')
  );

  let densitySuggestion = '';
  if (isDensityHighRisk) {
    densitySuggestion = `The encoded text/URL is very long (${textLength} characters) for low error correction (${errorCorrectionLevel}). Switch to 'H' (30%) or shorten the data content to avoid scan failures.`;
  } else if (isDensityMediumRisk) {
    densitySuggestion = `High data density (${textLength} characters). Upgrading error correction from '${errorCorrectionLevel}' to 'H' or 'Q' will greatly improve scanning reliability.`;
  }

  const hasUnreadableIssue = isLowContrast || isExcessiveLogo || isDensityHighRisk;
  const hasWarningIssue = isSuboptimalContrast || isHighLogoRisk || isDensityMediumRisk;

  const autoFixContrast = () => {
    if (!onChange) return;
    onChange({
      ...currentProject,
      design: {
        ...(currentProject.design || {}),
        fgColor: '#0f172a',
        bgColor: '#ffffff',
        gradientType: 'none',
      } as any
    });
  };

  const autoFixLogoScale = () => {
    if (!onChange) return;
    onChange({
      ...currentProject,
      design: {
        ...(currentProject.design || {}),
        logoScale: Math.max(0.08, Number((maxRecommendedScale * 0.9).toFixed(2))),
      } as any
    });
  };

  const autoFixErrorCorrection = () => {
    if (!onChange) return;
    onChange({
      ...currentProject,
      design: {
        ...(currentProject.design || {}),
        errorCorrectionLevel: 'H',
      } as any
    });
  };

  const autoFixAll = () => {
    if (!onChange) return;
    const updatedDesign = { ...(currentProject.design || {}) } as any;
    if (isLowContrast || isSuboptimalContrast) {
      updatedDesign.fgColor = '#0f172a';
      updatedDesign.bgColor = '#ffffff';
      updatedDesign.gradientType = 'none';
    }
    if (isExcessiveLogo || isDensityHighRisk || isDensityMediumRisk) {
      updatedDesign.errorCorrectionLevel = 'H';
      if (isExcessiveLogo && logoScale > 0.28) {
        updatedDesign.logoScale = 0.22;
      }
    }
    onChange({
      ...currentProject,
      design: updatedDesign
    });
  };

  // Tracking effect to record the last known stable scannable design configuration
  useEffect(() => {
    if (!hasUnreadableIssue && !hasWarningIssue && currentProject.design) {
      lastReadableDesignRef.current = JSON.parse(JSON.stringify(currentProject.design));
    }
  }, [fgColor, bgColor, gradientType, gradientColor, logoUrl, logoScale, errorCorrectionLevel, hasUnreadableIssue, hasWarningIssue]);

  const revertToLastReadable = () => {
    if (!onChange) return;
    if (lastReadableDesignRef.current) {
      onChange({
        ...currentProject,
        design: {
          ...currentProject.design,
          ...lastReadableDesignRef.current
        } as any
      });
    } else {
      // Fallback if no last known readable design exists yet
      onChange({
        ...currentProject,
        design: {
          ...(currentProject.design || {}),
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          gradientType: 'none',
          logoScale: 0.15,
          errorCorrectionLevel: 'H'
        } as any
      });
    }
  };

  const isTargetAUrl = textToEncode.startsWith('http://') || textToEncode.startsWith('https://');
  const finalShareUrl = shareLinkType === 'destination' && isTargetAUrl ? textToEncode : appUrl;
  
  const dotStyleName = currentProject.design?.dotStyle || 'square';
  const eyeStyleName = currentProject.design?.eyeStyle || 'square';
  const fgColorHex = currentProject.design?.fgColor || '#0f172a';
  const shareText = `Check out my custom QR design 🎨: ${dotStyleName} style dots and ${eyeStyleName} style eyes in ${fgColorHex}. Created on QR Studio!`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(finalShareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalShareUrl)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalShareUrl)}`;

  // Sync print subtext default when content changes
  useEffect(() => {
    if (textToEncode) {
      setSubText(textToEncode);
      setPrintReadyInfoText(textToEncode);
    }
  }, [textToEncode]);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    const needsRedrawForExport = !isPrintModalOpen;

    if (needsRedrawForExport) {
      // Re-draw onto canvas WITH the logo before exporting!
      await renderStyledQR(canvasRef.current, textToEncode, {
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
        frameStyle: frameStyle !== 'none' ? frameStyle as any : undefined,
        frameText,
        frameColor: frameColor || undefined,
        frameTextColor: frameTextColor || undefined,
        frameFontSize,
        frameTextPosition,
        skipLogoImage: false
      });
    }

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
        logoAutoCenter,
        logoOffsetX,
        logoOffsetY,
        eyeColorTopLeft: eyeColorTopLeft || undefined,
        eyeColorTopRight: eyeColorTopRight || undefined,
        eyeColorBottomLeft: eyeColorBottomLeft || undefined,
        errorCorrectionLevel,
        frameStyle: frameStyle !== 'none' ? frameStyle as any : undefined,
        frameText,
        frameColor: frameColor || undefined,
        frameTextColor: frameTextColor || undefined,
        frameFontSize,
        frameTextPosition
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

    if (needsRedrawForExport) {
      // Restore on-screen canvas (no logo image)
      await renderStyledQR(canvasRef.current, textToEncode, {
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
        frameStyle: frameStyle !== 'none' ? frameStyle as any : undefined,
        frameText,
        frameColor: frameColor || undefined,
        frameTextColor: frameTextColor || undefined,
        frameFontSize,
        frameTextPosition,
        skipLogoImage: true
      });
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

  const colorThemes: Record<string, { main: string; border: string; bg: string; text: string; hex: string; lightHex: string }> = {
    indigo: { main: 'bg-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600', hex: '#4f46e5', lightHex: '#eff6ff' },
    slate: { main: 'bg-slate-900', border: 'border-slate-200', bg: 'bg-slate-100', text: 'text-slate-900', hex: '#0f172a', lightHex: '#f1f5f9' },
    emerald: { main: 'bg-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', hex: '#10b981', lightHex: '#ecfdf5' },
    amber: { main: 'bg-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', hex: '#d97706', lightHex: '#fef3c7' },
    rose: { main: 'bg-rose-600', border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-600', hex: '#e11d48', lightHex: '#fff1f2' }
  };

  const getLayoutHtmlForPrinting = (qrCodeUrl: string): string => {
    const theme = colorThemes[themeColor] || colorThemes.indigo;
    
    if (selectedLayout === 'business_card_horizontal') {
      if (printSheetMode) {
        let cardsHtml = '';
        for (let i = 0; i < 8; i++) {
          cardsHtml += `
            <div style="width: 82mm; height: 48mm; margin: 4mm; border: 1px dashed #cbd5e1; border-radius: 8px; box-sizing: border-box; padding: 14px; display: flex; align-items: center; justify-content: space-between; position: relative; background: white; page-break-inside: avoid; float: left;">
              <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; border-top-left-radius: 8px; border-bottom-left-radius: 8px; background-color: ${theme.hex};"></div>
              <div style="flex: 1; padding-left: 12px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="font-family: inherit; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px;">${companyName}</div>
                  <div style="font-size: 14px; font-weight: 800; color: #1e293b; line-height: 1.2;">${headingText}</div>
                </div>
                <div style="font-size: 9px; font-family: monospace; color: #64748b; margin-top: 10px; word-break: break-all; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${subText}</div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; flex-shrink: 0;">
                <div style="padding: 3px 8px; font-size: 8px; font-weight: 800; border-radius: 4px; background-color: ${theme.lightHex}; color: ${theme.hex}; text-transform: uppercase;">
                  ${badgeText}
                </div>
                <div style="padding: 4px; border: 1px solid #f1f5f9; border-radius: 6px; background: white;">
                  <img src="${qrCodeUrl}" style="width: 70px; height: 70px; display: block;" />
                </div>
              </div>
            </div>
          `;
        }
        return `
          <div style="max-width: 190mm; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center;">
            <div style="width: 100%; text-align: center; margin-bottom: 8px; font-family: sans-serif;" class="no-print">
              <p style="font-size: 14px; color: #475569; font-weight: 500;">{t('preview.printCardsDesc', 'Grid Print Mode: 8 Cards formatted for standard paper cutlines')}</p>
              <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-bottom: 20px;">{t('preview.printCards', 'Print Cards')}</button>
            </div>
            ${cardsHtml}
          </div>
        `;
      } else {
        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: sans-serif;">
            <div style="width: 85mm; height: 50mm; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; padding: 18px; display: flex; align-items: center; justify-content: space-between; position: relative; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 8px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; background-color: ${theme.hex};"></div>
              <div style="flex: 1; padding-left: 16px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div>
                  <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">${companyName}</div>
                  <div style="font-size: 18px; font-weight: 850; color: #1e293b; line-height: 1.2;">${headingText}</div>
                </div>
                <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-top: 15px; word-break: break-all; max-width: 180px;">${subText}</div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0;">
                <div style="padding: 4px 10px; font-size: 9px; font-weight: 800; border-radius: 6px; background-color: ${theme.lightHex}; color: ${theme.hex}; text-transform: uppercase;">
                  ${badgeText}
                </div>
                <div style="padding: 6px; border: 1px solid #f1f5f9; border-radius: 8px; background: white;">
                  <img src="${qrCodeUrl}" style="width: 90px; height: 90px; display: block;" />
                </div>
              </div>
            </div>
          </div>
        `;
      }
    }

    if (selectedLayout === 'business_card_vertical') {
      if (printSheetMode) {
        let cardsHtml = '';
        for (let i = 0; i < 8; i++) {
          cardsHtml += `
            <div style="width: 44mm; height: 78mm; margin: 3mm; border: 1px dashed #cbd5e1; border-radius: 8px; box-sizing: border-box; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative; background: white; page-break-inside: avoid; float: left;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; border-top-left-radius: 8px; border-top-right-radius: 8px; background-color: ${theme.hex};"></div>
              <div style="text-align: center; width: 100%; padding-top: 6px;">
                <div style="font-size: 8px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">${companyName}</div>
                <div style="width: 25px; height: 1.5px; background: #e2e8f0; margin: 4px auto;"></div>
                <div style="font-size: 12px; font-weight: 800; color: #1e293b; line-height: 1.2;">${headingText}</div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 4px 0;">
                <div style="padding: 4px; border: 1px solid #f1f5f9; border-radius: 6px; background: white;">
                  <img src="${qrCodeUrl}" style="width: 70px; height: 70px; display: block;" />
                </div>
                <div style="padding: 3px 8px; font-size: 7px; font-weight: 800; border-radius: 4px; background-color: ${theme.lightHex}; color: ${theme.hex}; text-transform: uppercase;">
                  ${badgeText}
                </div>
              </div>
              <div style="text-align: center; width: 100%;">
                <div style="font-size: 8px; font-family: monospace; color: #64748b; word-break: break-all; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${subText}</div>
              </div>
            </div>
          `;
        }
        return `
          <div style="max-width: 190mm; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center;">
            <div style="width: 100%; text-align: center; margin-bottom: 8px; font-family: sans-serif;" class="no-print">
              <p style="font-size: 14px; color: #475569; font-weight: 500;">{t('preview.printCardsVertDesc', 'Grid Print Mode: 8 Vertical Cards formatted for standard paper cutlines')}</p>
              <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-bottom: 20px;">{t('preview.printCards', 'Print Cards')}</button>
            </div>
            ${cardsHtml}
          </div>
        `;
      } else {
        return `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; font-family: sans-serif;">
            <div style="width: 50mm; height: 85mm; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; position: relative; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; border-top-left-radius: 12px; border-top-right-radius: 12px; background-color: ${theme.hex};"></div>
              <div style="text-align: center; width: 100%; padding-top: 12px;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">${companyName}</div>
                <div style="width: 30px; height: 2px; background: #e2e8f0; margin: 8px auto;"></div>
                <div style="font-size: 15px; font-weight: 850; color: #1e293b; line-height: 1.2;">${headingText}</div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 12px 0;">
                <div style="padding: 6px; border: 1px solid #f1f5f9; border-radius: 8px; background: white;">
                  <img src="${qrCodeUrl}" style="width: 90px; height: 90px; display: block;" />
                </div>
                <div style="padding: 4px 10px; font-size: 8px; font-weight: 800; border-radius: 6px; background-color: ${theme.lightHex}; color: ${theme.hex}; text-transform: uppercase;">
                  ${badgeText}
                </div>
              </div>
              <div style="text-align: center; width: 100%;">
                <div style="font-size: 9px; font-family: monospace; color: #64748b; word-break: break-all; max-width: 150px;">${subText}</div>
              </div>
            </div>
          </div>
        `;
      }
    }

    if (selectedLayout === 'flyer_a4') {
      return `
        <div style="max-width: 170mm; margin: 15mm auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 20px; text-align: center; font-family: sans-serif; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <div style="height: 12px; background-color: ${theme.hex}; border-radius: 6px 6px 0 0; margin: -40px -40px 40px -40px;"></div>
          <div style="margin-top: 10px;">
            <span style="display: inline-block; padding: 6px 16px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-radius: 20px; background-color: ${theme.lightHex}; color: ${theme.hex}; margin-bottom: 20px;">
              ${companyName}
            </span>
            <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 25px; letter-spacing: -0.5px; text-transform: uppercase; font-family: inherit;">
              ${headingText}
            </h1>
          </div>
          <div style="display: inline-block; padding: 24px; border: 4px solid #f1f5f9; border-radius: 24px; background: white; margin: 20px 0;">
            <img src="${qrCodeUrl}" style="width: 240px; height: 240px; display: block;" />
          </div>
          <div style="margin-top: 15px;">
            <div style="display: inline-block; padding: 10px 30px; font-size: 14px; font-weight: 800; color: white; background-color: ${theme.hex}; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
              ${badgeText}
            </div>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 25px; margin-top: 25px;">
            <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; word-break: break-all;">${subText}</p>
            <p style="font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px; font-family: monospace;">{t('preview.noAppRequired', 'No App Download Required • Simply Scan with Smartphone Camera')}</p>
          </div>
        </div>
      `;
    }

    if (selectedLayout === 'table_tent') {
      return `
        <div style="max-width: 180mm; margin: 15mm auto; font-family: sans-serif;">
          <div style="text-align: center; margin-bottom: 25px;" class="no-print">
            <p style="font-size: 14px; color: #475569; font-weight: 500;">{t('preview.tableTentDesc', 'Foldable Table Tent Template - Includes fold guides')}</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">{t('preview.printTableTent', 'Print Table Tent')}</button>
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 12px; height: 160mm; display: flex; position: relative; background: #fafafa; box-sizing: border-box;">
            <div style="flex: 1; padding: 25px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; transform: rotate(180deg); box-sizing: border-box; opacity: 0.85;">
              <div style="padding-top: 15px;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">${companyName}</div>
                <div style="width: 25px; height: 1.5px; background: #cbd5e1; margin: 8px auto;"></div>
                <div style="font-size: 15px; font-weight: 800; color: #334155;">{t('preview.thankYouScanning', 'Thank You For scanning!')}</div>
              </div>
              <div style="padding: 6px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;">
                <img src="${qrCodeUrl}" style="width: 80px; height: 80px; display: block;" />
              </div>
              <div style="font-size: 9px; font-weight: 600; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase;">{t('preview.backDisplay', 'BACK DISPLAY')}</div>
            </div>
            
            <div style="position: absolute; top: 0; bottom: 0; left: 50%; border-left: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; transform: translateX(-50%);">
              <span style="background: #334155; color: white; border-radius: 10px; font-size: 8px; font-weight: 700; padding: 3px 12px; letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; transform: rotate(-90deg); z-index: 10;">{t('preview.foldLine', 'FOLD LINE TO STAND')}</span>
            </div>
            
            <div style="flex: 1; padding: 25px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; box-sizing: border-box; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background-color: ${theme.hex};"></div>
              <div style="padding-top: 15px;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">${companyName}</div>
                <h3 style="font-size: 15px; font-weight: 900; color: #1e293b; text-transform: uppercase; margin-top: 6px; line-height: 1.2;">${headingText}</h3>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="padding: 8px; border: 2px solid ${theme.lightHex}; border-radius: 12px; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                  <img src="${qrCodeUrl}" style="width: 100px; height: 100px; display: block;" />
                </div>
                <div style="padding: 3px 10px; font-size: 8px; font-weight: 800; border-radius: 4px; background-color: ${theme.lightHex}; color: ${theme.hex}; text-transform: uppercase;">
                  ${badgeText}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; font-family: monospace; color: #64748b; word-break: break-all; max-width: 160px;">${subText}</div>
                <div style="font-size: 8px; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-family: monospace; margin-top: 6px;">{t('preview.foldAndStand', 'Fold and Stand • Easy to Scan')}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (selectedLayout === 'multi_sticker') {
      let stickersHtml = '';
      for (let i = 0; i < 12; i++) {
        stickersHtml += `
          <div style="width: 54mm; height: 40mm; float: left; border: 1px dashed #cbd5e1; border-radius: 6px; box-sizing: border-box; padding: 10px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; background: white; page-break-inside: avoid; margin: 2mm;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; height: 100%; min-width: 0;">
              <span style="font-size: 8px; letter-spacing: 1px; font-family: monospace; color: #94a3b8; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${companyName}</span>
              <p style="font-size: 11px; font-weight: 800; color: #1e293b; line-height: 1.25; margin: 4px 0; word-break: break-word;">${badgeText}</p>
              <span style="font-size: 8px; color: #64748b; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${subText}</span>
            </div>
            <div style="flex-shrink: 0; padding: 3px; border: 1px solid #f1f5f9; border-radius: 4px; background: white; margin-left: 6px;">
              <img src="${qrCodeUrl}" style="width: 60px; height: 60px; display: block;" />
            </div>
          </div>
        `;
      }
      return `
        <div style="max-width: 190mm; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 25px;" class="no-print" style="font-family: sans-serif;">
            <p style="font-size: 14px; color: #475569; font-weight: 500;">{t('preview.stickerSheetDesc', 'Multi-Sticker Sheet: 12 stickers with clean cutting guides')}</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">{t('preview.printSheet', 'Print Sheet')}</button>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${stickersHtml}
          </div>
        </div>
      `;
    }

    return '';
  };

  const handlePrintTemplate = () => {
    if (!canvasRef.current) return;
    const qrCodeUrl = canvasRef.current.toDataURL('image/png');
    
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) return;
    
    let stylesHtml = '';
    for (const styleSheet of Array.from(document.styleSheets)) {
      try {
        if (styleSheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${styleSheet.href}">`;
        } else {
          const rules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
          stylesHtml += `<style>${rules}</style>`;
        }
      } catch (e) {
        // Fallback for cross-origin styles
      }
    }

    stylesHtml += `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    `;

    const layoutHtml = getLayoutHtmlForPrinting(qrCodeUrl);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Studio</title>
          ${stylesHtml}
          <style>
            @media print {
              body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              font-family: 'Inter', sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%;">
            ${layoutHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getPaperDimensions = () => {
    const isA4 = printReadyPaperSize === 'a4';
    const widthMm = isA4 ? 210 : 215.9;
    const heightMm = isA4 ? 297 : 279.4;
    
    if (printReadyOrientation === 'landscape') {
      return { widthMm: heightMm, heightMm: widthMm };
    }
    return { widthMm, heightMm };
  };

  const getQrBlockCoordinates = (colIdx = 0, rowIdx = 0) => {
    const { widthMm, heightMm } = getPaperDimensions();
    const blockWidth = printReadyQrSize + 2 * printReadyMargin;
    const blockHeight = printReadyQrSize + 2 * printReadyMargin;
    
    const safeLeft = printReadyMarginLeft;
    const safeRight = widthMm - printReadyMarginRight;
    const safeTop = printReadyMarginTop;
    const safeBottom = heightMm - printReadyMarginBottom;
    
    const safeWidth = safeRight - safeLeft;
    const safeHeight = safeBottom - safeTop;
    
    let x = safeLeft;
    let y = safeTop;
    
    if (printReadyCopies === 'single') {
      switch (printReadyPosition) {
        case 'center':
          x = safeLeft + (safeWidth - blockWidth) / 2;
          y = safeTop + (safeHeight - blockHeight) / 2;
          break;
        case 'top_left':
          x = safeLeft;
          y = safeTop;
          break;
        case 'top_right':
          x = safeRight - blockWidth;
          y = safeTop;
          break;
        case 'bottom_left':
          x = safeLeft;
          y = safeBottom - blockHeight;
          break;
        case 'bottom_right':
          x = safeRight - blockWidth;
          y = safeBottom - blockHeight;
          break;
        case 'custom':
          const centerX = safeLeft + (safeWidth - blockWidth) / 2;
          const centerY = safeTop + (safeHeight - blockHeight) / 2;
          x = centerX + printReadyCustomX;
          y = centerY + printReadyCustomY;
          break;
      }
    } else {
      let cols = 2;
      let rows = 2;
      if (printReadyCopies === 'grid_3x3') {
        cols = 3;
        rows = 3;
      } else if (printReadyCopies === 'grid_4x4') {
        cols = 4;
        rows = 4;
      }
      
      const colSpacing = cols > 1 ? (safeWidth - cols * blockWidth) / (cols - 1) : 0;
      const rowSpacing = rows > 1 ? (safeHeight - rows * blockHeight) / (rows - 1) : 0;
      
      const finalColSpacing = colSpacing < 0 ? 2 : colSpacing;
      const finalRowSpacing = rowSpacing < 0 ? 2 : rowSpacing;
      
      const totalGridWidth = cols * blockWidth + (cols - 1) * finalColSpacing;
      const totalGridHeight = rows * blockHeight + (rows - 1) * finalRowSpacing;
      
      const startX = safeLeft + (safeWidth - totalGridWidth) / 2;
      const startY = safeTop + (safeHeight - totalGridHeight) / 2;
      
      x = startX + colIdx * (blockWidth + finalColSpacing);
      y = startY + rowIdx * (rowSpacing < 0 ? blockHeight + 2 : blockHeight + finalRowSpacing);
    }
    
    return {
      x: Math.max(0, Math.min(widthMm - blockWidth, x)),
      y: Math.max(0, Math.min(heightMm - blockHeight, y))
    };
  };

  const handlePrintReadyLayout = () => {
    if (!canvasRef.current) return;
    const qrCodeUrl = canvasRef.current.toDataURL('image/png');
    
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) return;
    
    let stylesHtml = '';
    for (const styleSheet of Array.from(document.styleSheets)) {
      try {
        if (styleSheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${styleSheet.href}">`;
        } else {
          const rules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('\n');
          stylesHtml += `<style>${rules}</style>`;
        }
      } catch (e) {
        // Fallback
      }
    }

    const { widthMm, heightMm } = getPaperDimensions();
    const paperWidth = `${widthMm}mm`;
    const paperHeight = `${heightMm}mm`;

    const qrFilterStyle = printReadyGrayscale === 'grayscale'
      ? 'filter: grayscale(1) contrast(1.2);'
      : printReadyGrayscale === 'pure_bw'
        ? 'filter: grayscale(1) contrast(500) brightness(1.1);'
        : '';

    const textStyle = printReadyGrayscale === 'pure_bw' ? 'color: #000000 !important;' : 'color: #334155;';
    const subTextStyle = printReadyGrayscale === 'pure_bw' ? 'color: #555555 !important;' : 'color: #64748b;';
    const borderStyle = printReadyGrayscale === 'pure_bw' ? 'border: 1.5px solid #000000;' : 'border: 1px dashed #cbd5e1;';
    const cropMarkColor = printReadyGrayscale === 'pure_bw' ? '#000000' : '#94a3b8';

    const cols = printReadyCopies === 'single' ? 1 : (printReadyCopies === 'grid_2x2' ? 2 : (printReadyCopies === 'grid_3x3' ? 3 : 4));
    const rows = printReadyCopies === 'single' ? 1 : (printReadyCopies === 'grid_2x2' ? 2 : (printReadyCopies === 'grid_3x3' ? 3 : 4));

    let blocksHtml = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const coords = getQrBlockCoordinates(c, r);
        blocksHtml += `
          <div style="
            position: absolute;
            left: ${coords.x}mm;
            top: ${coords.y}mm;
            width: ${printReadyQrSize + 2 * printReadyMargin}mm;
            height: ${printReadyQrSize + 2 * printReadyMargin}mm;
            padding: ${printReadyMargin}mm;
            box-sizing: border-box;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            ${borderStyle}
          ">
            ${printReadyCropMarks ? `
              <!-- Crop Marks: Top-Left -->
              <div style="position: absolute; top: -15mm; left: 0; width: 0.3mm; height: 10mm; background: ${cropMarkColor};"></div>
              <div style="position: absolute; top: 0; left: -15mm; width: 10mm; height: 0.3mm; background: ${cropMarkColor};"></div>
              
              <!-- Crop Marks: Top-Right -->
              <div style="position: absolute; top: -15mm; right: 0; width: 0.3mm; height: 10mm; background: ${cropMarkColor};"></div>
              <div style="position: absolute; top: 0; right: -15mm; width: 10mm; height: 0.3mm; background: ${cropMarkColor};"></div>
              
              <!-- Crop Marks: Bottom-Left -->
              <div style="position: absolute; bottom: -15mm; left: 0; width: 0.3mm; height: 10mm; background: ${cropMarkColor};"></div>
              <div style="position: absolute; bottom: 0; left: -15mm; width: 10mm; height: 0.3mm; background: ${cropMarkColor};"></div>
              
              <!-- Crop Marks: Bottom-Right -->
              <div style="position: absolute; bottom: -15mm; right: 0; width: 0.3mm; height: 10mm; background: ${cropMarkColor};"></div>
              <div style="position: absolute; bottom: 0; right: -15mm; width: 10mm; height: 0.3mm; background: ${cropMarkColor};"></div>
            ` : ''}

            <!-- QR code image centered -->
            <img src="${qrCodeUrl}" style="width: ${printReadyQrSize}mm; height: ${printReadyQrSize}mm; display: block; object-fit: contain; ${qrFilterStyle}" />
          </div>
        `;
      }
    }

    const footnoteHtml = printReadyShowInfo && printReadyInfoText ? `
      <div style="
        position: absolute;
        left: ${printReadyMarginLeft}mm;
        bottom: ${printReadyMarginBottom / 2}mm;
        width: ${widthMm - printReadyMarginLeft - printReadyMarginRight}mm;
        text-align: center;
        font-family: inherit;
        box-sizing: border-box;
      ">
        <p style="font-size: 11pt; font-weight: 700; margin: 0 0 1.5mm 0; word-break: break-all; ${textStyle}">${printReadyInfoText}</p>
        <p style="font-size: 8pt; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace; ${subTextStyle}">
          Print-Ready Layout • Centered ${printReadyPaperSize.toUpperCase()} Format (${printReadyOrientation.toUpperCase()}) • Target Size: ${printReadyQrSize}mm (${(printReadyQrSize / 25.4).toFixed(1)}") • ${new Date().toLocaleDateString()}
        </p>
      </div>
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>{t('preview.printReadyQr', 'Print-Ready QR Code')}</title>
          \${stylesHtml}
          <style>
            @media print {
              @page {
                size: \${printReadyPaperSize === 'a4' ? 'A4' : 'letter'} \${printReadyOrientation};
                margin: 0;
              }
              body {
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .no-print {
                display: none !important;
              }
              .print-page {
                width: \${paperWidth} !important;
                height: \${paperHeight} !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
                position: relative !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f1f5f9;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-page {
              background: white;
              width: \${paperWidth};
              height: \${paperHeight};
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
              position: relative;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="print-page">
            \${blocksHtml}
            \${footnoteHtml}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Listen for global keyboard shortcuts triggered in App.tsx
  useEffect(() => {
    const handleDownloadEvent = () => {
      handleExport();
    };
    const handlePrintEvent = () => {
      if (isPrintModalOpen) {
        handlePrintTemplate();
      } else {
        setIsPrintModalOpen(true);
      }
    };

    window.addEventListener('app-trigger-download', handleDownloadEvent);
    window.addEventListener('app-trigger-print', handlePrintEvent);

    return () => {
      window.removeEventListener('app-trigger-download', handleDownloadEvent);
      window.removeEventListener('app-trigger-print', handlePrintEvent);
    };
  }, [handleExport, handlePrintTemplate, isPrintModalOpen]);

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

  // Setup calculated center offset for overlay
  const getScaleFactorAndOffsets = () => {
    const scaleFactor = 264 / 450;
    let offsetX = 0;
    let offsetY = 0;
    
    if (logoAutoCenter !== false) {
      try {
        const qr = qrcode.create(textToEncode, { errorCorrectionLevel });
        const modulesCount = qr.modules.size;
        const qrSize = Math.max(100, 450 - margin * 2);
        const cellSize = qrSize / modulesCount;
        const eyeSize = cellSize * 7;
        offsetX = Math.round(eyeSize * 0.04);
        offsetY = Math.round(eyeSize * 0.04);
      } catch (e) {
        // Fallback
      }
    } else {
      offsetX = logoOffsetX;
      offsetY = logoOffsetY;
    }

    return {
      scaleFactor,
      offsetX: offsetX * scaleFactor,
      offsetY: offsetY * scaleFactor
    };
  };

  const { offsetX: onScreenOffsetX, offsetY: onScreenOffsetY } = getScaleFactorAndOffsets();

  return (
    <div className="flex flex-col gap-6">
      {/* QR Board Canvas */}
      <div 
        id="tour-qr-preview" 
        className={`rounded-2xl border p-6 shadow-xs flex flex-col items-center justify-center gap-4 relative overflow-hidden transition-all duration-1000 ${
          showSaveGlow 
            ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-emerald-50/5' 
            : 'border-gray-200/80 bg-white'
        }`}
      >
        {/* Dynamic color-shifting cloud-save glow indicator */}
        <AnimatePresence>
          {showSaveGlow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0.7, 0] 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4.2, times: [0, 0.08, 0.75, 0.9, 1] }}
              className="absolute inset-0 pointer-events-none z-[1]"
            >
              {/* Outer boundary box-shadow glow */}
              <motion.div 
                animate={{
                  boxShadow: [
                    "inset 0 0 20px rgba(59, 130, 246, 0.5), 0 0 25px rgba(59, 130, 246, 0.35)",
                    "inset 0 0 25px rgba(139, 92, 246, 0.6), 0 0 35px rgba(139, 92, 246, 0.45)",
                    "inset 0 0 30px rgba(16, 185, 129, 0.7), 0 0 45px rgba(16, 185, 129, 0.55)",
                    "inset 0 0 20px rgba(52, 211, 153, 0.4), 0 0 20px rgba(52, 211, 153, 0.2)",
                    "inset 0 0 0px rgba(16, 185, 129, 0), 0 0 0px rgba(16, 185, 129, 0)"
                  ],
                  borderColor: [
                    "rgba(59, 130, 246, 0.6)",
                    "rgba(139, 92, 246, 0.7)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(52, 211, 153, 0.5)",
                    "rgba(16, 185, 129, 0)"
                  ]
                }}
                transition={{ duration: 4.2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
              />
              
              {/* Radial gradient background pulse */}
              <motion.div
                animate={{
                  background: [
                    "radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)",
                    "radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.18) 0%, transparent 65%)",
                    "radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
                    "radial-gradient(circle at 50% 90%, rgba(52, 211, 153, 0.12) 0%, transparent 60%)",
                    "radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0) 0%, transparent 50%)"
                  ]
                }}
                transition={{ duration: 4.2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating cloud success indicator badge */}
        <AnimatePresence>
          {showSaveGlow && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.9 }}
              animate={{ 
                opacity: [0, 1, 1, 0.9, 0],
                y: [0, 10, 10, 5, -15],
                scale: [0.95, 1, 1, 0.98, 0.9]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.8, times: [0, 0.1, 0.75, 0.9, 1] }}
              className="absolute top-3 z-10 flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-emerald-400 pointer-events-none"
            >
              <svg className="w-3.5 h-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('preview.savedToCloud', 'Saved to Secure Cloud')}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-250 shadow-inner flex items-center justify-center relative z-5">
          <div className="relative bg-white p-2 rounded-xl shadow-xs group cursor-pointer overflow-hidden animate-fade-in" style={{ width: '280px', height: '280px' }}>
            <MemoizedQRCanvas
              ref={canvasRef}
              textToEncode={textToEncode}
              fgColor={fgColor}
              bgColor={bgColor}
              gradientType={gradientType}
              gradientColor={gradientColor}
              dotStyle={dotStyle}
              eyeStyle={eyeStyle}
              logoUrl={logoUrl || undefined}
              logoScale={logoScale}
              margin={margin}
              logoRotation={logoRotation}
              logoAutoCenter={logoAutoCenter}
              logoOffsetX={logoOffsetX}
              logoOffsetY={logoOffsetY}
              eyeColorTopLeft={eyeColorTopLeft || undefined}
              eyeColorTopRight={eyeColorTopRight || undefined}
              eyeColorBottomLeft={eyeColorBottomLeft || undefined}
              errorCorrectionLevel={errorCorrectionLevel}
              isPrintModalOpen={isPrintModalOpen}
              frameStyle={frameStyle !== 'none' ? frameStyle as any : undefined}
              frameText={frameText}
              frameColor={frameColor || undefined}
              frameTextColor={frameTextColor || undefined}
              frameFontSize={frameFontSize}
              frameTextPosition={frameTextPosition}
            />

            {/* Elegant overlay logo with smooth scaling on change */}
            {logoUrl && !isPrintModalOpen && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]"
                style={{
                  transform: `translate(${onScreenOffsetX}px, ${onScreenOffsetY}px)`
                }}
              >
                <motion.div
                  key={logoUrl} // Unmount and mount new element to trigger entry spring pop animation!
                  initial={{ scale: 0, opacity: 0, rotate: logoRotation - 30 }}
                  animate={{ scale: 1, opacity: 1, rotate: logoRotation }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                  whileHover={{ scale: 1.15, rotate: logoRotation + 8 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.1)] select-none"
                  style={{
                    width: `${264 * logoScale}px`,
                    height: `${264 * logoScale}px`,
                    backgroundColor: bgColor,
                    borderRadius: `${Math.max(4, 264 * logoScale * 0.22)}px`,
                    padding: '2.5px',
                    pointerEvents: 'auto', // Allow cursor interactions
                  }}
                >
                  {(() => {
                    const isImg = logoUrl.startsWith('http') || logoUrl.startsWith('data:image');
                    const sizePx = 264 * logoScale;
                    const borderRadiusVal = `${Math.max(2, sizePx * 0.16)}px`;
                    
                    if (isImg) {
                      return (
                        <img 
                          src={logoUrl} 
                          alt="QR Centerpiece Logo"
                          className="w-full h-full object-contain"
                          style={{ borderRadius: borderRadiusVal }}
                          referrerPolicy="no-referrer"
                        />
                      );
                    } else {
                      const calculatedFontSize = getEmblemFontSize(logoUrl, sizePx);
                      return (
                        <div 
                          className="w-full h-full flex items-center justify-center font-black text-white bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-inner overflow-hidden whitespace-nowrap text-center px-1"
                          dir="auto"
                          style={{ 
                            fontSize: `${calculatedFontSize}px`,
                            borderRadius: borderRadiusVal,
                            lineHeight: 1
                          }}
                        >
                          {logoUrl}
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              </div>
            )}

             {/* Scannability Warning Tag */}
            {(hasUnreadableIssue || hasWarningIssue) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(true);
                }}
                className={`absolute top-4 right-4 z-20 px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer animate-pulse transition-all ${
                  hasUnreadableIssue 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-amber-500 hover:bg-amber-650 text-white'
                }`}
                title={t('preview.tooltip.diagnostics', 'Click for Scannability Diagnostics')}
              >
                <AlertTriangle className="w-3 h-3 stroke-[3]" />
                <span>Risk: {hasUnreadableIssue ? 'High' : 'Medium'}</span>
              </button>
            )}

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
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-200">{t('preview.readyToScan', 'READY TO SCAN')}</span>
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
                    animate={{ scale: 1, opacity: 1 }}
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

        {/* Real-time Scannability Alert Banner */}
        {(hasUnreadableIssue || hasWarningIssue) && (
          <div className={`w-full p-3.5 rounded-xl border flex gap-3 transition-all ${
            hasUnreadableIssue 
              ? 'bg-rose-50/70 border-rose-150 text-rose-950 shadow-3xs' 
              : 'bg-amber-50/70 border-amber-150 text-amber-950 shadow-3xs'
          }`}>
            <div className={`p-2 rounded-lg shrink-0 h-fit ${hasUnreadableIssue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {hasUnreadableIssue ? '🚨 QR Might Be Unreadable' : '⚠️ Moderate Scan Risk'}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 font-mono">
                  Contrast: {minContrast.toFixed(1)}:1
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-normal mt-1">
                {isLowContrast && "Foreground & background colors are too similar. "}
                {!isLowContrast && isSuboptimalContrast && "Contrast is slightly low; may fail under dim lighting. "}
                {isExcessiveLogo && `Center logo covers too much area (${(logoScale * 100).toFixed(0)}%) for current Error Correction. `}
                {!isExcessiveLogo && isHighLogoRisk && `Center logo is large (${(logoScale * 100).toFixed(0)}%). Consider raising Error Correction level. `}
                {isDensityHighRisk && `Data is too long (${textLength} chars) for current Error Correction level ${errorCorrectionLevel}. `}
                {!isDensityHighRisk && isDensityMediumRisk && `High data density (${textLength} chars) for Error Correction level ${errorCorrectionLevel}. `}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-3xs transition-all"
                >
                  Diagnostics Details
                </button>
                {onChange && (
                  <>
                    <button
                      type="button"
                      onClick={autoFixAll}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg text-white cursor-pointer shadow-2xs transition-all ${
                        hasUnreadableIssue 
                          ? 'bg-rose-600 hover:bg-rose-700' 
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      Auto-Fix Design
                    </button>
                    <button
                      type="button"
                      onClick={revertToLastReadable}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs transition-all"
                      title="Revert logo scale and contrast to the last known readable state"
                    >
                      Quick Fix
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informative metadata text */}
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-800">
            {trackingEnabled ? '🚀 Short Url Tracking Active' : '💾 Direct QR Code'}
          </p>
          <span className="text-[10px] text-slate-600 font-mono select-all truncate max-w-[260px] block mt-0.5">
            {textToEncode}
          </span>
          {currentProject.expiryDate && (() => {
            const isExpired = new Date() > new Date(currentProject.expiryDate);
            return (
              <span className={`inline-flex items-center gap-1 mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isExpired 
                  ? 'bg-red-50 text-red-600 border border-red-100/50' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100/50'
              }`}>
                {isExpired 
                  ? `Expired ⚠️ (${new Date(currentProject.expiryDate).toLocaleDateString()})` 
                  : `Expires ⏳ (${new Date(currentProject.expiryDate).toLocaleDateString()})`
                }
              </span>
            );
          })()}
        </div>

        {/* Printable/Export triggers */}
        <div className="w-full flex flex-col gap-3 mt-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileType className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{t('preview.downloadFormat', 'Download Format')}</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                className="flex items-center justify-between gap-2 px-3 py-1.5 min-w-[100px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-semibold rounded-xl shadow-3xs transition-all duration-200 cursor-pointer focus:outline-none"
                aria-label="Toggle format dropdown"
                aria-haspopup="listbox"
                aria-expanded={isFormatDropdownOpen}
              >
                <span>{selectedFormat}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFormatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFormatDropdownOpen && (
                  <>
                    {/* Invisible backdrop to dismiss dropdown */}
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsFormatDropdownOpen(false)} 
                    />
                    <motion.ul
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-45 focus:outline-none"
                      role="listbox"
                    >
                      {[
                        { value: 'PNG', label: 'PNG Image', desc: 'Standard raster, perfect for web & screen' },
                        { value: 'SVG', label: 'SVG Vector', desc: 'Infinitely scalable vector format for print' },
                        { value: 'PDF', label: 'PDF Document', desc: 'High-resolution print-ready A4 document' }
                      ].map((item) => (
                        <li key={item.value} role="option" aria-selected={selectedFormat === item.value}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFormat(item.value as 'PNG' | 'SVG' | 'PDF');
                              setIsFormatDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex flex-col gap-0.5 cursor-pointer ${
                              selectedFormat === item.value
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold">{item.label}</span>
                              {selectedFormat === item.value && (
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                              )}
                            </div>
                            <span className={`text-[10px] leading-normal font-medium ${selectedFormat === item.value ? 'text-slate-300' : 'text-slate-400'}`}>
                              {item.desc}
                            </span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  </>
                )}
              </AnimatePresence>
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
              <span>Download {selectedFormat}</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded text-[9px] font-mono font-bold ml-1 uppercase">Ctrl+D</kbd>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="py-2.5 px-2 bg-white text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold border border-indigo-100 shadow-3xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Open Print Layout Studio"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded text-[9px] font-mono font-bold uppercase ml-1">Ctrl+P</kbd>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPrintReadyModalOpen(true)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            aria-label="Open Print-Ready Layout Modal"
          >
            <Printer className="w-4 h-4 text-indigo-100" />
            <span>{t('preview.printReadyPage', 'Print-Ready A4/Letter Page')}</span>
          </button>

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

        {/* Social Media Sharing Button Group */}
        <div className="w-full flex flex-col gap-3 mt-1 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{t('preview.shareQrDesign', 'Share QR Design')}</span>
            </div>
            {isTargetAUrl && (
              <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg shadow-3xs">
                <button
                  type="button"
                  onClick={() => setShareLinkType('destination')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                    shareLinkType === 'destination'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                  title={t('preview.tooltip.shareEmbed', 'Share the link embedded inside the QR')}
                >
                  Destination
                </button>
                <button
                  type="button"
                  onClick={() => setShareLinkType('app')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                    shareLinkType === 'app'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                  title={t('preview.tooltip.shareBuilder', 'Share the link to QR Studio builder')}
                >
                  App Link
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/60 p-2.5 rounded-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{t('preview.postPreview', 'Post Preview')}</span>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-2 rounded-lg border border-slate-100 select-all">
              "{shareText}" <span className="text-indigo-600 not-italic font-semibold break-all">{finalShareUrl}</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-1 bg-black text-white hover:bg-zinc-900 rounded-xl text-[10px] sm:text-[11px] font-bold shadow-3xs transition-all flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 cursor-pointer text-center no-underline"
              aria-label="Share on Twitter / X"
            >
              <Twitter className="w-3 h-3 fill-current" />
              Twitter / X
            </a>
            <a
              href={linkedinShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-1 bg-[#0077b5] text-white hover:bg-[#006297] rounded-xl text-[10px] sm:text-[11px] font-bold shadow-3xs transition-all flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 cursor-pointer text-center no-underline"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-3 h-3 fill-current" />
              LinkedIn
            </a>
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-1 bg-[#0b51b7] text-white hover:bg-[#094193] rounded-xl text-[10px] sm:text-[11px] font-bold shadow-3xs transition-all flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-95 cursor-pointer text-center no-underline"
              aria-label="Share on Facebook"
            >
              <Facebook className="w-3 h-3 fill-current" />
              Facebook
            </a>
          </div>
        </div>

        {/* Tracking Details & Copying Option */}
        {trackingEnabled && trackingUrl && (
          <div className="w-full bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3 flex flex-col gap-2 mt-1">
            <span className="text-[10px] text-indigo-950 font-semibold uppercase tracking-wider">{t('preview.trackingShortUrl', 'Tracking Short URL')}</span>
            <div className="flex items-center justify-between gap-2 overflow-hidden bg-white px-3 py-1.5 rounded-lg border border-indigo-100">
              <span className="text-xs font-mono text-indigo-800 truncate select-all">{trackingUrl}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-all"
                  title={t('preview.tooltip.copyLink', 'Copy link')}
                  aria-label="Copy short tracking URL"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:bg-indigo-50 text-indigo-600 rounded-md transition-all"
                  title={t('preview.tooltip.testScan', 'Test scan redirect')}
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
            <span>{t('preview.smartphoneSimulator', 'Smartphone Simulator')}</span>
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
              <span className="text-[10px] text-slate-300 font-mono">{t('preview.decodingModules', 'Decoding modules...')}</span>
            </div>
          ) : simulatedScanResult ? (
            <div className="text-center p-4">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">{t('preview.scanSuccess', '✓ QR Scan Success')}</span>
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
              <p className="text-xs text-slate-300">{t('preview.viewfinderReady', 'Viewfinder ready.')}</p>
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

      {/* Print Layout Studio Modal */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-end sm:items-center justify-center p-4 sm:p-6 overflow-y-auto pt-20"
            onClick={() => setIsPrintModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-5xl shadow-2xl overflow-y-auto sm:overflow-hidden text-slate-800 grid grid-cols-1 lg:grid-cols-12 border border-slate-100 max-h-[70vh] sm:max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Settings Control Side (5 columns) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between max-h-none sm:max-h-[85vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Header title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t('preview.printLayoutStudio', 'Print Layout Studio')}</h2>
                        <span className="text-[10px] text-slate-500 font-medium">{t('preview.mediaFormats', 'Standardized physical media formats')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Category 1: Layout Selection */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{t('preview.stepSelectLayout', '1. Select Layout Template')}</span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'business_card_horizontal', label: 'Horizontal Business Card (3.5" x 2.0")', desc: 'Perfect for standard wallets & boxes' },
                        { id: 'business_card_vertical', label: 'Vertical Business Card (2.0" x 3.5")', desc: 'Contemporary minimalist format' },
                        { id: 'flyer_a4', label: 'Modern Portrait Flyer (A4 / US Letter)', desc: 'Bold message style for walls & tables' },
                        { id: 'table_tent', label: 'Foldable Table Tent (Restaurant/Event)', desc: 'Two-sided self-standing tabletop card' },
                        { id: 'multi_sticker', label: 'Sticker Sheet Grid (12 stickers)', desc: 'Formatted for labels with dashed cutlines' }
                      ].map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedLayout(tmpl.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer w-full ${
                            selectedLayout === tmpl.id
                              ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600/20'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg mt-0.5 ${selectedLayout === tmpl.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                            <Layout className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-none ${selectedLayout === tmpl.id ? 'text-indigo-950' : 'text-slate-800'}`}>{tmpl.label}</p>
                            <p className="text-[10px] text-slate-600 mt-1 leading-normal">{tmpl.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings Category 2: Card customizations */}
                  <div className="space-y-4 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{t('preview.stepBrandText', '2. Brand Text Customization')}</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="comp-name" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">{t('preview.companyBrandName', 'Company / Brand Name')}</label>
                        <input
                          id="comp-name"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder={t('preview.placeholder.creativeStudio', 'CREATIVE STUDIO')}
                        />
                      </div>

                      {selectedLayout !== 'multi_sticker' && (
                        <div>
                          <label htmlFor="head-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">{t('preview.primaryCta', 'Primary Call-to-Action')}</label>
                          <input
                            id="head-text"
                            type="text"
                            value={headingText}
                            onChange={(e) => setHeadingText(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder={t('preview.placeholder.scanToVisit', 'SCAN TO VISIT WEBSITE')}
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="url-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">{t('preview.displayTextUrl', 'Display Text / Web URL')}</label>
                        <input
                          id="url-text"
                          type="text"
                          value={subText}
                          onChange={(e) => setSubText(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="badge-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">{t('preview.miniBadgeLabel', 'Mini Badge Label')}</label>
                        <input
                          id="badge-text"
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder={t('preview.placeholder.scanMe', 'SCAN ME')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings Category 3: Color accent */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{t('preview.stepColorAccent', '3. Layout Color Accent')}</span>
                    <div className="flex items-center gap-2">
                      {Object.keys(colorThemes).map((colorKey) => (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setThemeColor(colorKey)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            themeColor === colorKey
                              ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          aria-label={`Select ${colorKey} theme`}
                        >
                          <span
                            className="w-5 h-5 rounded-md shadow-xs block"
                            style={{ backgroundColor: colorThemes[colorKey].hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings Category 4: Grid Output style toggle for Cards */}
                  {(selectedLayout === 'business_card_horizontal' || selectedLayout === 'business_card_vertical') && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{t('preview.layoutFormatMode', 'Layout Format Mode')}</p>
                          <p className="text-[10px] text-slate-600">{t('preview.layoutFormatModeDesc', 'Print 8 cards on a sheet vs. single layout')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrintSheetMode(!printSheetMode)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            printSheetMode
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {printSheetMode ? '8 Cards Sheet' : 'Single Card'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Print bottom button */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handlePrintTemplate}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs tracking-wide uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-indigo-100" />
                    Send to Print Service
                  </button>
                </div>
              </div>

              {/* Right Paper Live View Canvas Area (7 columns) */}
              <div className="lg:col-span-12 xl:col-span-7 bg-slate-900 p-8 flex flex-col items-center justify-center min-h-[350px] sm:min-h-[450px] lg:min-h-full max-h-none sm:max-h-[85vh] overflow-y-auto relative">
                {/* Paper sheet background wrapper */}
                <div className="text-slate-400 absolute top-4 left-4 text-[10px] font-mono tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL-TIME PRINT WORKSPACE
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-700/50 cursor-pointer"
                  aria-label="Close layout studio"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Render corresponding visual mock templates based on selection */}
                <div className="flex items-center justify-center py-4 scale-90 sm:scale-100 origin-center transition-all transform animate-fade-in">
                  {canvasRef.current && (
                    (() => {
                      const qrImg = canvasRef.current.toDataURL('image/png');
                      
                      if (selectedLayout === 'business_card_horizontal') {
                        return (
                          <div className="w-[360px] h-[200px] bg-white border border-slate-200 p-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 relative overflow-hidden select-none">
                            <div className={`absolute left-0 top-0 bottom-0 w-3 ${colorThemes[themeColor].main}`} />
                            <div className="flex-1 flex flex-col justify-between h-full pl-2">
                              <div>
                                <h4 className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{companyName || 'COMPANY NAME'}</h4>
                                <h3 className="text-sm font-extrabold text-slate-850 tracking-tight leading-snug">{headingText || 'Scan QR Code'}</h3>
                              </div>
                              <span className="text-[9px] font-mono text-slate-500 truncate max-w-[170px] block">{subText}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1.5 shrink-0">
                              <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wide rounded ${colorThemes[themeColor].bg} ${colorThemes[themeColor].text}`}>
                                {badgeText || 'SCAN ME'}
                              </div>
                              <div className="p-1.5 border border-slate-100 rounded-lg bg-white shadow-3xs">
                                <img src={qrImg} className="w-[74px] h-[74px]" alt="Print QR preview" />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (selectedLayout === 'business_card_vertical') {
                        return (
                          <div className="w-[230px] h-[360px] bg-white border border-slate-200 p-5 rounded-2xl shadow-xl flex flex-col justify-between items-center relative overflow-hidden select-none">
                            <div className={`absolute top-0 left-0 right-0 h-3 ${colorThemes[themeColor].main}`} />
                            <div className="text-center w-full pt-1">
                              <h4 className="text-[9px] font-mono font-bold text-slate-450 uppercase tracking-widest">{companyName || 'COMPANY NAME'}</h4>
                              <div className="w-8 h-0.5 mx-auto my-2 bg-slate-200" />
                              <h3 className="text-sm font-extrabold text-slate-850 tracking-tight leading-tight px-1">{headingText || 'Scan QR Code'}</h3>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1.5 my-3">
                              <div className="p-1.5 border border-slate-100 rounded-lg bg-white shadow-3xs">
                                <img src={qrImg} className="w-[84px] h-[84px]" alt="Print QR preview" />
                              </div>
                              <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${colorThemes[themeColor].bg} ${colorThemes[themeColor].text}`}>
                                {badgeText || 'SCAN ME'}
                              </div>
                            </div>
                            <div className="text-center w-full pb-0.5">
                              <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[190px]">{subText}</span>
                            </div>
                          </div>
                        );
                      }

                      if (selectedLayout === 'flyer_a4') {
                        return (
                          <div className="w-[300px] h-[410px] bg-white border border-slate-200 p-6 rounded-2xl shadow-xl flex flex-col justify-between items-center relative overflow-hidden select-none">
                            <div className={`absolute top-0 left-0 right-0 h-3.5 ${colorThemes[themeColor].main}`} />
                            <div className="text-center w-full pt-2">
                              <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full ${colorThemes[themeColor].bg} ${colorThemes[themeColor].text} mb-2.5`}>
                                {companyName || 'OFFICIAL EVENT'}
                              </span>
                              <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-snug px-1">{headingText || 'SCAN TO CONNECT'}</h2>
                            </div>
                            <div className="flex flex-col items-center justify-center my-3 w-full">
                              <div className="p-2.5 border-2 border-slate-100 rounded-xl bg-white shadow-2xs">
                                <img src={qrImg} className="w-[110px] h-[110px]" alt="Print QR preview" />
                              </div>
                              <div className={`mt-2.5 py-1 px-3 text-[8px] font-black uppercase tracking-wider rounded-md text-white ${colorThemes[themeColor].main}`}>
                                {badgeText || 'GET DETAILS'}
                              </div>
                            </div>
                            <div className="text-center w-full pt-1.5 border-t border-slate-100">
                              <p className="text-[9px] font-bold text-slate-800 truncate px-2">{subText}</p>
                              <p className="text-[8px] text-slate-400 mt-0.5 font-medium uppercase font-mono">{t('preview.simplyScanLearn', 'Simply Scan & Learn • No registration')}</p>
                            </div>
                          </div>
                        );
                      }

                      if (selectedLayout === 'table_tent') {
                        return (
                          <div className="w-[360px] h-[330px] bg-white border border-slate-250 p-3 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden select-none bg-slate-50/10">
                            <div className="absolute inset-0 grid grid-cols-2 divide-x divide-dashed divide-slate-300">
                              {/* Left back view turned upside down */}
                              <div className="p-3 flex flex-col items-center justify-between rotate-180 text-center select-none opacity-45">
                                <div className="pt-1">
                                  <h4 className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">{companyName || 'WELCOME'}</h4>
                                  <div className="w-4 h-0.5 mx-auto my-1 bg-slate-200" />
                                  <h3 className="text-[9px] font-bold text-slate-700 leading-tight">{t('preview.thankYou', 'Thank You!')}</h3>
                                </div>
                                <div className="p-1 border border-slate-100 rounded-md bg-white">
                                  <img src={qrImg} className="w-[46px] h-[46px] opacity-70" alt="Print QR preview" />
                                </div>
                                <span className="text-[7px] text-slate-400 uppercase tracking-widest font-mono">{t('preview.backDisplay', 'BACK DISPLAY')}</span>
                              </div>

                              {/* Right display viewport */}
                              <div className="p-3 flex flex-col items-center justify-between text-center select-none relative">
                                <div className={`absolute top-0 right-0 left-0 h-1.5 ${colorThemes[themeColor].main}`} />
                                <div className="pt-2">
                                  <h4 className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{companyName || 'COFFEE & CO.'}</h4>
                                  <h3 className="text-[10px] font-bold text-slate-800 leading-snug tracking-tight mt-1 px-0.5">{headingText || 'SCAN FOR DIgital MENU'}</h3>
                                </div>
                                <div className="my-1.5 flex flex-col items-center gap-1">
                                  <div className="p-1 border-2 border-slate-100 rounded-lg bg-white shadow-3xs">
                                    <img src={qrImg} className="w-[62px] h-[62px]" alt="Print QR preview" />
                                  </div>
                                  <div className={`px-2 py-0.5 text-[7px] font-black uppercase rounded tracking-wider ${colorThemes[themeColor].bg} ${colorThemes[themeColor].text}`}>
                                    {badgeText || 'SCAN NOW'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[8px] font-mono text-slate-500 block truncate max-w-[130px]">{subText}</span>
                                  <span className="text-[6px] text-slate-400 font-bold block uppercase mt-0.5">{t('preview.foldStandDisplay', 'Fold and Stand Display')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 text-white text-[7px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest select-none z-10 shadow-md border border-slate-700 pointer-events-none">
                              ✦ FOLD LINE GUIDE ✦
                            </div>
                          </div>
                        );
                      }

                      if (selectedLayout === 'multi_sticker') {
                        return (
                          <div className="w-[325px] h-[420px] bg-slate-50 border border-slate-350 p-2.5 rounded-2xl shadow-xl grid grid-cols-2 grid-rows-4 gap-2 relative overflow-hidden select-none">
                            {Array.from({ length: 8 }).map((_, idx) => (
                              <div key={idx} className="bg-white border border-dashed border-slate-200 hover:border-slate-300 p-2 rounded-xl flex items-center justify-between gap-1.5 transition-colors">
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                                  <span className="text-[6px] font-mono font-bold text-slate-400 uppercase tracking-widest truncate">{companyName || 'STICKER'}</span>
                                  <p className="text-[8px] font-black text-slate-800 leading-tight line-clamp-2">{badgeText || 'SCAN ME'}</p>
                                  <span className="text-[6px] text-slate-400 truncate max-w-[70px] leading-none block">{subText}</span>
                                </div>
                                <div className="shrink-0 p-1 border border-slate-100 rounded-md bg-white">
                                  <img src={qrImg} className="w-[42px] h-[42px]" alt="Print QR preview" />
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return null;
                    })()
                  )}
                </div>

                {/* Print Hint Card */}
                <div className="bg-slate-800/65 backdrop-blur-xs border border-slate-700/60 p-4 rounded-xl text-center max-w-sm mt-3">
                  <div className="flex items-center justify-center gap-1.5 text-slate-300 text-xs font-semibold">
                    <Grid className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('preview.qualityCheck', 'Quality Aspect Ratio Check')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    This workspace shows accurate physical layout proportions. Select your favorite theme, input copy details, and tap the print button. Cut guidelines are auto-generated!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scannability Diagnostics Inspector Modal */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-800 border border-slate-100 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-5 text-white flex items-center justify-between relative ${
                hasUnreadableIssue 
                  ? 'bg-gradient-to-r from-rose-600 to-red-600' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">{t('preview.scannabilityInspector', 'Scannability Inspector')}</h3>
                    <p className="text-[10px] text-slate-100 opacity-90 font-medium">{t('preview.inspectorDesc', 'Real-time design & color analysis')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all cursor-pointer border-0"
                  aria-label="Close Diagnostics"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
                
                {/* 1. Contrast Diagnostic */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t('preview.colorContrastRatio', '1. Color Contrast Ratio')}</span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                      isLowContrast 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : isSuboptimalContrast 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {minContrast.toFixed(1)}:1 Ratio
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                    {/* Visual Comparison Badges */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                      <div className="p-2 rounded-lg border border-slate-200" style={{ backgroundColor: bgColor, color: fgColor }}>
                        Foreground Color
                      </div>
                      {gradientType !== 'none' && (
                        <div className="p-2 rounded-lg border border-slate-200" style={{ backgroundColor: bgColor, color: gradientColor }}>
                          Gradient Color
                        </div>
                      )}
                    </div>

                    {/* Feedback Rating */}
                    <div className="text-[11px] leading-normal">
                      {isLowContrast && (
                        <p className="text-rose-700 font-semibold">
                          ❌ CRITICAL: Contrast ratio is too low (minimum is 3.0:1). Most standard scanner devices will fail.
                        </p>
                      )}
                      {isSuboptimalContrast && (
                        <p className="text-amber-700 font-semibold">
                          ⚠️ WARNING: Suboptimal contrast (recommended is 4.5:1). QR may fail in low light or on budget cameras.
                        </p>
                      )}
                      {!isLowContrast && !isSuboptimalContrast && (
                        <p className="text-emerald-700 font-semibold">
                          ✅ SAFE: Excellent contrast! Scanners will easily read the code module patterns.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Fix Contrast Action */}
                  {(isLowContrast || isSuboptimalContrast) && onChange && (
                    <button
                      type="button"
                      onClick={() => {
                        autoFixContrast();
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border-0"
                    >
                      <span>{t('preview.fixColorsBtn', 'Fix Colors (Set Slate on White)')}</span>
                    </button>
                  )}
                </div>

                {/* 2. Logo Size Diagnostic */}
                {logoUrl ? (
                  <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t('preview.centerLogoCoverage', '2. Center Logo Coverage')}</span>
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                        isExcessiveLogo 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                          : isHighLogoRisk 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {(logoScale * 100).toFixed(0)}% Width
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-[11px] leading-normal">
                      <div className="flex justify-between text-slate-500 font-medium mb-1">
                        <span>Correction Level:</span>
                        <span className="font-mono font-bold text-slate-700">Level {errorCorrectionLevel} (Max safe limit: {(maxRecommendedScale * 100).toFixed(0)}%)</span>
                      </div>

                      {isExcessiveLogo && (
                        <p className="text-rose-700 font-semibold">
                          ❌ CRITICAL: Logo size is too large for Error Correction Level {errorCorrectionLevel}. Scanners cannot recover obscured data.
                        </p>
                      )}
                      {isHighLogoRisk && (
                        <p className="text-amber-700 font-semibold">
                          ⚠️ WARNING: Logo is close to safe scan threshold limit. Scanners may encounter delay.
                        </p>
                      )}
                      {!isExcessiveLogo && !isHighLogoRisk && (
                        <p className="text-emerald-700 font-semibold">
                          ✅ SAFE: Logo size is perfectly safe within the current error correction boundaries.
                        </p>
                      )}

                      {/* Error Correction Reference Scale */}
                      <div className="pt-2 border-t border-slate-250 grid grid-cols-4 gap-1.5 text-center text-[9px] text-slate-500 font-bold">
                        <div className={`p-1 rounded flex flex-col ${errorCorrectionLevel === 'L' ? 'bg-indigo-50 font-bold text-indigo-600 border border-indigo-100' : 'bg-white'}`}>
                          <span>L (7%)</span>
                          <span className="font-mono opacity-80 mt-0.5">Max: 15%</span>
                        </div>
                        <div className={`p-1 rounded flex flex-col ${errorCorrectionLevel === 'M' ? 'bg-indigo-50 font-bold text-indigo-600 border border-indigo-100' : 'bg-white'}`}>
                          <span>M (15%)</span>
                          <span className="font-mono opacity-80 mt-0.5">Max: 20%</span>
                        </div>
                        <div className={`p-1 rounded flex flex-col ${errorCorrectionLevel === 'Q' ? 'bg-indigo-50 font-bold text-indigo-600 border border-indigo-100' : 'bg-white'}`}>
                          <span>Q (25%)</span>
                          <span className="font-mono opacity-80 mt-0.5">Max: 25%</span>
                        </div>
                        <div className={`p-1 rounded flex flex-col ${errorCorrectionLevel === 'H' ? 'bg-indigo-50 font-bold text-indigo-600 border border-indigo-100' : 'bg-white'}`}>
                          <span>H (30%)</span>
                          <span className="font-mono opacity-80 mt-0.5">Max: 28%</span>
                        </div>
                      </div>
                    </div>

                    {/* Logo Fix Triggers */}
                    {onChange && (
                      <div className="flex gap-2">
                        {errorCorrectionLevel !== 'H' && (
                          <button
                            type="button"
                            onClick={autoFixErrorCorrection}
                            className="flex-1 py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Set Correction H (30%)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={autoFixLogoScale}
                          className="flex-1 py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer border-0"
                        >
                          Scale down logo
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 pt-4 border-t border-slate-100 text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">2. Center Logo</p>
                    <p className="text-[11px] text-slate-500 leading-normal">No logo centerpiece is active. All data modules have 100% full scan exposure.</p>
                  </div>
                )}

                {/* 3. Data Density & Error Correction Level Diagnostic */}
                <div className="space-y-2 pt-4 border-t border-slate-100 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t('preview.dataDensityCorrection', '3. Data Density & Correction')}</span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                      isDensityHighRisk 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : isDensityMediumRisk 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {textLength} Chars • Level {errorCorrectionLevel}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-[11px] leading-normal">
                    {isDensityHighRisk && (
                      <p className="text-rose-700 font-semibold">
                        ❌ CRITICAL: The encoded text/URL is very long ({textLength} characters) for Error Correction Level {errorCorrectionLevel}. The QR modules are highly dense and prone to scanning failures.
                      </p>
                    )}
                    {isDensityMediumRisk && (
                      <p className="text-amber-700 font-semibold">
                        ⚠️ WARNING: Moderate data density risk. Switch error correction to a higher level (e.g. 'H') or reduce data length for maximum scan reliability.
                      </p>
                    )}
                    {!isDensityHighRisk && !isDensityMediumRisk && (
                      <p className="text-emerald-700 font-semibold">
                        ✅ SAFE: Data density is well balanced for Error Correction Level {errorCorrectionLevel}.
                      </p>
                    )}

                    {densitySuggestion && (
                      <p className="text-slate-600 bg-slate-100 p-2 rounded-lg text-[10px] font-medium leading-relaxed">
                        💡 {densitySuggestion}
                      </p>
                    )}
                  </div>

                  {/* Fix Data Density / Correction Trigger */}
                  {onChange && (isDensityHighRisk || isDensityMediumRisk) && (
                    <button
                      type="button"
                      onClick={autoFixErrorCorrection}
                      className="w-full py-2 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer border-0 shadow-3xs"
                    >
                      Boost Error Correction to H (30%)
                    </button>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                {onChange && (hasUnreadableIssue || hasWarningIssue) && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        autoFixAll();
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-xs transition-all cursor-pointer border-0"
                    >
                      Auto-Fix All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        revertToLastReadable();
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-xs transition-all cursor-pointer border-0"
                    >
                      Quick Fix
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer border-0"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print-Ready Layout Modal */}
      <AnimatePresence>
        {isPrintReadyModalOpen && (() => {
          const { widthMm: activeWidthMm, heightMm: activeHeightMm } = getPaperDimensions();
          const activeBaseScale = 260 / (printReadyOrientation === 'portrait' ? (printReadyPaperSize === 'a4' ? 210 : 215.9) : (printReadyPaperSize === 'a4' ? 297 : 279.4));
          const activePxPerMm = activeBaseScale * (printReadyZoom / 100);

          const activeSheetWidthPx = activeWidthMm * activePxPerMm;
          const activeSheetHeightPx = activeHeightMm * activePxPerMm;

          const activeCols = printReadyCopies === 'single' ? 1 : (printReadyCopies === 'grid_2x2' ? 2 : (printReadyCopies === 'grid_3x3' ? 3 : 4));
          const activeRows = printReadyCopies === 'single' ? 1 : (printReadyCopies === 'grid_2x2' ? 2 : (printReadyCopies === 'grid_3x3' ? 3 : 4));
          const activeBlockWidth = printReadyQrSize + 2 * printReadyMargin;
          const activeBlockHeight = printReadyQrSize + 2 * printReadyMargin;

          let activeLayoutOverflow = false;
          for (let r = 0; r < activeRows; r++) {
            for (let c = 0; c < activeCols; c++) {
              const coords = getQrBlockCoordinates(c, r);
              if (coords.x < 0 || coords.y < 0 || coords.x + activeBlockWidth > activeWidthMm || coords.y + activeBlockHeight > activeHeightMm) {
                activeLayoutOverflow = true;
              }
            }
          }

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setIsPrintReadyModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-800 border border-slate-100 flex flex-col md:flex-row h-full max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Panel: Settings Controls */}
                <div className="w-full md:w-5/12 bg-slate-50 border-r border-slate-100 flex flex-col h-full overflow-y-auto">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">{t('preview.printReadyStudio', 'Print-Ready Studio')}</h3>
                        <p className="text-[10px] text-indigo-200 font-medium">{t('preview.prepressDesc', 'Pre-press calibration & layout center')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Tabs Selectors */}
                  <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 select-none">
                    <button
                      type="button"
                      onClick={() => setActiveSettingsTab('layout')}
                      className={`py-3 text-center cursor-pointer border-b-2 transition-all outline-hidden ${
                        activeSettingsTab === 'layout'
                          ? 'border-indigo-600 text-indigo-600 bg-white'
                          : 'border-transparent hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      Layout
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSettingsTab('margins')}
                      className={`py-3 text-center cursor-pointer border-b-2 transition-all outline-hidden ${
                        activeSettingsTab === 'margins'
                          ? 'border-indigo-600 text-indigo-600 bg-white'
                          : 'border-transparent hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      Margins
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSettingsTab('prepress')}
                      className={`py-3 text-center cursor-pointer border-b-2 transition-all outline-hidden ${
                        activeSettingsTab === 'prepress'
                          ? 'border-indigo-600 text-indigo-600 bg-white'
                          : 'border-transparent hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      Options
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-5 space-y-5 text-left flex-1 overflow-y-auto">
                    {/* Warn User of Boundary Overflow */}
                    {activeLayoutOverflow && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[10px] leading-tight font-medium">
                          <p className="font-bold uppercase tracking-wider text-amber-900 mb-0.5">{t('preview.layoutOverflow', 'Layout Overflow Alert')}</p>
                          Some QR copies are exceeding the physical print boundaries. Try shrinking the QR size or narrowing safe zone quiet margins.
                        </div>
                      </div>
                    )}

                    {activeSettingsTab === 'layout' && (
                      <>
                        {/* Paper Size */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-slate-500" />
                            Paper Size Format
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPrintReadyPaperSize('a4')}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                                printReadyPaperSize === 'a4'
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.a4Sheet', 'A4 Sheet')}</span>
                              <span className={`text-[9px] font-normal ${printReadyPaperSize === 'a4' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                210mm x 297mm
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyPaperSize('letter')}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                                printReadyPaperSize === 'letter'
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.usLetter', 'US Letter')}</span>
                              <span className={`text-[9px] font-normal ${printReadyPaperSize === 'letter' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                8.5" x 11" (215.9x279.4mm)
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Orientation */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-slate-500" />
                            Orientation
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPrintReadyOrientation('portrait')}
                              className={`py-1.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                printReadyOrientation === 'portrait'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Portrait
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyOrientation('landscape')}
                              className={`py-1.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                printReadyOrientation === 'landscape'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Landscape
                            </button>
                          </div>
                        </div>

                        {/* Grid copies layout */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Grid className="w-3.5 h-3.5 text-slate-500" />
                            Print Layout & Grid Copies
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPrintReadyCopies('single')}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                                printReadyCopies === 'single'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.singleQr', 'Single QR')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.centeredPrepress', 'Centered pre-press')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyCopies('grid_2x2')}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                                printReadyCopies === 'grid_2x2'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.grid2x2', '2x2 Grid (4 Copies)')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.grid2x2Desc', 'Even paper distribution')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyCopies('grid_3x3')}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                                printReadyCopies === 'grid_3x3'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.grid3x3', '3x3 Grid (9 Copies)')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.grid3x3Desc', 'Maximum paper utilization')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyCopies('grid_4x4')}
                              className={`py-1.5 px-2 rounded-xl border text-xs font-bold cursor-pointer transition-all flex flex-col items-center justify-center ${
                                printReadyCopies === 'grid_4x4'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.grid4x4', '4x4 Grid (16 Copies)')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.grid4x4Desc', 'Small high-density stickers')}</span>
                            </button>
                          </div>
                        </div>

                        {/* QR Printed Size Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Maximize className="w-3.5 h-3.5 text-slate-500" />
                              QR Physical Width
                            </span>
                            <span className="font-mono text-indigo-600 font-bold">{printReadyQrSize}mm ({(printReadyQrSize/25.4).toFixed(1)}")</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="140"
                            step="5"
                            value={printReadyQrSize}
                            onChange={(e) => setPrintReadyQrSize(Number(e.target.value))}
                            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>{t('preview.size15mm', '15mm (Sticker)')}</span>
                            <span>{t('preview.size65mm', '65mm (Recommended)')}</span>
                            <span>{t('preview.size140mm', '140mm (Poster)')}</span>
                          </div>
                        </div>

                        {/* Quiet Zone Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              Safe Quiet Zone
                            </span>
                            <span className="font-mono text-indigo-600 font-bold">{printReadyMargin}mm ({(printReadyMargin/25.4).toFixed(1)}")</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="25"
                            step="1"
                            value={printReadyMargin}
                            onChange={(e) => setPrintReadyMargin(Number(e.target.value))}
                            className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>{t('preview.margin2mm', '2mm (Minimum)')}</span>
                            <span>{t('preview.margin10mm', '10mm (Balanced)')}</span>
                            <span>{t('preview.margin25mm', '25mm (Generous)')}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeSettingsTab === 'margins' && (
                      <>
                        {/* Custom Margin Cross Controls */}
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            Physical Paper Margins (mm)
                          </label>
                          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto text-center border border-slate-100 bg-white p-4 rounded-2xl shadow-xs">
                            <div></div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Top</span>
                              <input 
                                type="number" 
                                value={printReadyMarginTop} 
                                min="0" max="60" 
                                onChange={(e) => setPrintReadyMarginTop(Number(e.target.value))}
                                className="w-14 px-1.5 py-1 text-center border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            <div></div>
                            
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">{t('preview.left', 'Left')}</span>
                              <input 
                                type="number" 
                                value={printReadyMarginLeft} 
                                min="0" max="60" 
                                onChange={(e) => setPrintReadyMarginLeft(Number(e.target.value))}
                                className="w-14 px-1.5 py-1 text-center border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="w-9 h-9 border border-dashed border-indigo-200 bg-indigo-50/20 rounded-lg flex items-center justify-center font-mono text-[8px] text-indigo-400 font-bold">
                                PAGE
                              </div>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">{t('preview.right', 'Right')}</span>
                              <input 
                                type="number" 
                                value={printReadyMarginRight} 
                                min="0" max="60" 
                                onChange={(e) => setPrintReadyMarginRight(Number(e.target.value))}
                                className="w-14 px-1.5 py-1 text-center border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            
                            <div></div>
                            <div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase block mb-1">Bottom</span>
                              <input 
                                type="number" 
                                value={printReadyMarginBottom} 
                                min="0" max="60" 
                                onChange={(e) => setPrintReadyMarginBottom(Number(e.target.value))}
                                className="w-14 px-1.5 py-1 text-center border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            <div></div>
                          </div>
                          <p className="text-[9px] text-slate-400 text-center">
                            Standard paper margins are 15mm. Adjust them to match your custom printer boundaries.
                          </p>
                        </div>

                        {/* Alignment Preset selection (Single only) */}
                        {printReadyCopies === 'single' ? (
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Alignment & Position Preset
                            </label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {(['center', 'top_left', 'top_right', 'bottom_left', 'bottom_right', 'custom'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => setPrintReadyPosition(pos)}
                                  className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer capitalize transition-all ${
                                    printReadyPosition === pos
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {pos.replace('_', ' ')}
                                </button>
                              ))}
                            </div>

                            {/* Custom Alignment Sliders */}
                            {printReadyPosition === 'custom' && (
                              <div className="space-y-3 pt-3 p-3 bg-slate-100 rounded-xl mt-2 animate-fadeIn">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-600 font-mono">
                                    <span>{t('preview.offsetX', 'Offset X (Horizontal)')}</span>
                                    <span>{printReadyCustomX}mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    step="2"
                                    value={printReadyCustomX}
                                    onChange={(e) => setPrintReadyCustomX(Number(e.target.value))}
                                    className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-600 font-mono">
                                    <span>{t('preview.offsetY', 'Offset Y (Vertical)')}</span>
                                    <span>{printReadyCustomY}mm</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    step="2"
                                    value={printReadyCustomY}
                                    onChange={(e) => setPrintReadyCustomY(Number(e.target.value))}
                                    className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
                            Grid layout copies automatically distribute across the printable safe area.
                          </div>
                        )}
                      </>
                    )}

                    {activeSettingsTab === 'prepress' && (
                      <>
                        {/* Color profile (grayscale options) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Contrast className="w-3.5 h-3.5 text-slate-500" />
                            Color & Ink Saver Profile
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPrintReadyGrayscale('none')}
                              className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5 ${
                                printReadyGrayscale === 'none'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.colorOriginal', 'Original')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.colorFullColor', 'Full Color')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyGrayscale('grayscale')}
                              className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5 ${
                                printReadyGrayscale === 'grayscale'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.colorGrayscale', 'Grayscale')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.colorInkSaver', 'Ink Saver')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintReadyGrayscale('pure_bw')}
                              className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all flex flex-col items-center gap-0.5 ${
                                printReadyGrayscale === 'pure_bw'
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{t('preview.colorPureBw', 'Pure B&W')}</span>
                              <span className="text-[8px] font-normal opacity-85">{t('preview.colorLaserMax', 'Laser Max')}</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            {printReadyGrayscale === 'grayscale' && "Converts colors to print-friendly grayscales to save colored ink cartridges."}
                            {printReadyGrayscale === 'pure_bw' && "Renders the QR with 100% black/white thresholds. Ideal for high-speed laser printing."}
                            {printReadyGrayscale === 'none' && "Retains the custom design colors. Best for fine photo-quality printing."}
                          </p>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-100/50 rounded-lg transition-all">
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('preview.showCropMarks', 'Show Crop Marks')}</span>
                              <p className="text-[10px] text-slate-400">{t('preview.cropMarksDesc', 'Pre-press corners for physical guillotine cutting alignment.')}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={printReadyCropMarks}
                              onChange={(e) => setPrintReadyCropMarks(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                          </label>

                          <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-100/50 rounded-lg transition-all">
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('preview.showFootnote', 'Show Footnote / Label')}</span>
                              <p className="text-[10px] text-slate-400">{t('preview.footnoteDesc', 'Adds size, date, and custom string in footer margins.')}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={printReadyShowInfo}
                              onChange={(e) => setPrintReadyShowInfo(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                          </label>
                        </div>

                        {/* Custom Footnote text input */}
                        {printReadyShowInfo && (
                          <div className="space-y-1 text-left animate-fadeIn">
                            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{t('preview.customLabelString', 'Custom Label String')}</label>
                            <input
                              type="text"
                              value={printReadyInfoText}
                              onChange={(e) => setPrintReadyInfoText(e.target.value)}
                              placeholder="Scan this QR code to connect..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Left Panel Footer: Cancel / Print Trigger */}
                  <div className="p-4 bg-slate-100 border-t border-slate-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPrintReadyModalOpen(false)}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer border-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintReadyLayout}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{t('preview.printSheet', 'Print Sheet')}</span>
                    </button>
                  </div>
                </div>

                {/* Right Panel: Interactive Real-Time Sheet Preview with measuring instruments */}
                <div className="w-full md:w-7/12 bg-slate-100 flex flex-col h-full overflow-hidden relative">
                  {/* Interactive Pre-press Sheet Toolbar */}
                  <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium select-none shadow-xs">
                    <div className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-slate-600">
                      <Eye className="w-4 h-4 text-slate-400" />
                      Interactive Pre-press Sheet
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Zoom Controller */}
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
                        <button
                          type="button"
                          title={t('preview.tooltip.zoomOut', 'Zoom Out')}
                          onClick={() => setPrintReadyZoom(Math.max(30, printReadyZoom - 10))}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-[10px] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-600 px-1 w-[38px] text-center">
                          {printReadyZoom}%
                        </span>
                        <button
                          type="button"
                          title={t('preview.tooltip.zoomIn', 'Zoom In')}
                          onClick={() => setPrintReadyZoom(Math.min(150, printReadyZoom + 10))}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded text-[10px] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      {/* Grid & Ruler Quick Toggles */}
                      <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
                        <button
                          type="button"
                          title={t('preview.tooltip.toggleRulers', 'Toggle Rulers')}
                          onClick={() => setPrintReadyShowRulers(!printReadyShowRulers)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            printReadyShowRulers ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          Ruler
                        </button>
                        <button
                          type="button"
                          title={t('preview.tooltip.toggleGrid', 'Toggle Grid Lines')}
                          onClick={() => setPrintReadyShowGrid(!printReadyShowGrid)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            printReadyShowGrid ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          Grid
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview Sheet Area */}
                  <div className="flex-1 overflow-auto p-12 flex items-center justify-center min-h-0 select-none bg-slate-200/50">
                    <div
                      className="bg-white shadow-xl border border-slate-300 rounded-sm relative transition-all overflow-hidden flex flex-col justify-between"
                      style={{
                        width: `${activeSheetWidthPx}px`,
                        height: `${activeSheetHeightPx}px`,
                        minWidth: `${activeSheetWidthPx}px`,
                        minHeight: `${activeSheetHeightPx}px`,
                        backgroundImage: printReadyShowGrid 
                          ? `repeating-linear-gradient(0deg, #f1f5f9 0px, #f1f5f9 1px, transparent 1px, transparent ${10 * activePxPerMm}px), repeating-linear-gradient(90deg, #f1f5f9 0px, #f1f5f9 1px, transparent 1px, transparent ${10 * activePxPerMm}px)` 
                          : 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      {/* Rulers */}
                      {printReadyShowRulers && (
                        <>
                          {/* Top Horizontal Ruler */}
                          <div 
                            className="absolute left-0 top-0 right-0 h-4 bg-slate-50 border-b border-slate-200 overflow-hidden pointer-events-none z-10"
                            style={{ fontSize: '7px' }}
                          >
                            {Array.from({ length: Math.floor(activeWidthMm / 10) + 1 }).map((_, i) => {
                              const mm = i * 10;
                              const leftPx = mm * activePxPerMm;
                              const isMajor = mm % 50 === 0;
                              return (
                                <div key={i} className="absolute top-0 flex flex-col items-start" style={{ left: `${leftPx}px` }}>
                                  <div className={`w-[0.5px] bg-slate-300 ${isMajor ? 'h-3' : 'h-1.5'}`} />
                                  {isMajor && (
                                    <span className="text-[6px] text-slate-400 leading-none absolute top-3 left-0.5 font-mono">
                                      {mm}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Left Vertical Ruler */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-4 bg-slate-50 border-r border-slate-200 overflow-hidden pointer-events-none z-10"
                            style={{ fontSize: '7px' }}
                          >
                            {Array.from({ length: Math.floor(activeHeightMm / 10) + 1 }).map((_, i) => {
                              const mm = i * 10;
                              const topPx = mm * activePxPerMm;
                              const isMajor = mm % 50 === 0;
                              return (
                                <div key={i} className="absolute left-0 flex items-start" style={{ top: `${topPx}px` }}>
                                  <div className={`h-[0.5px] bg-slate-300 ${isMajor ? 'w-3' : 'w-1.5'}`} />
                                  {isMajor && (
                                    <span className="text-[6px] text-slate-400 leading-none absolute left-3 top-0.5 font-mono">
                                      {mm}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* Safe Margin Guidelines */}
                      <div 
                        className="absolute border border-dashed border-indigo-200 pointer-events-none"
                        style={{
                          left: `${printReadyMarginLeft * activePxPerMm}px`,
                          top: `${printReadyMarginTop * activePxPerMm}px`,
                          right: `${printReadyMarginRight * activePxPerMm}px`,
                          bottom: `${printReadyMarginBottom * activePxPerMm}px`,
                        }}
                      />

                      {/* QR Block(s) */}
                      {Array.from({ length: activeRows }).map((_, r) => 
                        Array.from({ length: activeCols }).map((_, c) => {
                          const coords = getQrBlockCoordinates(c, r);
                          return (
                            <div
                              key={`${r}-${c}`}
                              className="absolute border border-dashed border-slate-300 bg-white transition-all shadow-xs flex items-center justify-center"
                              style={{
                                left: `${coords.x * activePxPerMm}px`,
                                top: `${coords.y * activePxPerMm}px`,
                                width: `${activeBlockWidth * activePxPerMm}px`,
                                height: `${activeBlockHeight * activePxPerMm}px`,
                                padding: `${printReadyMargin * activePxPerMm}px`,
                                boxSizing: 'border-box'
                              }}
                            >
                              {/* Interactive Crop Marks */}
                              {printReadyCropMarks && (
                                <>
                                  {/* Top Left */}
                                  <div className="absolute top-[-8px] left-0 w-[0.5px] h-[5px] bg-slate-400"></div>
                                  <div className="absolute top-0 left-[-8px] w-[5px] h-[0.5px] bg-slate-400"></div>
                                  {/* Top Right */}
                                  <div className="absolute top-[-8px] right-0 w-[0.5px] h-[5px] bg-slate-400"></div>
                                  <div className="absolute top-0 right-[-8px] w-[5px] h-[0.5px] bg-slate-400"></div>
                                  {/* Bottom Left */}
                                  <div className="absolute bottom-[-8px] left-0 w-[0.5px] h-[5px] bg-slate-400"></div>
                                  <div className="absolute bottom-0 left-[-8px] w-[5px] h-[0.5px] bg-slate-400"></div>
                                  {/* Bottom Right */}
                                  <div className="absolute bottom-[-8px] right-0 w-[0.5px] h-[5px] bg-slate-400"></div>
                                  <div className="absolute bottom-0 right-[-8px] w-[5px] h-[0.5px] bg-slate-400"></div>
                                </>
                              )}

                              {/* Centered QR Canvas Copy or Placeholder */}
                              <div
                                className="w-full h-full bg-slate-50 rounded flex items-center justify-center overflow-hidden"
                                style={{
                                  filter: 
                                    printReadyGrayscale === 'grayscale' ? 'grayscale(1) contrast(1.2)' :
                                    printReadyGrayscale === 'pure_bw' ? 'grayscale(1) contrast(500) brightness(1.1)' : 'none'
                                }}
                              >
                                {canvasRef.current ? (
                                  <img
                                    src={canvasRef.current.toDataURL('image/png')}
                                    alt="Print Preview"
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-[8px] font-mono">
                                    QR Code
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Footnote Label Text Preview */}
                      {printReadyShowInfo && printReadyInfoText && (
                        <div 
                          className="absolute text-center pointer-events-none z-10"
                          style={{
                            left: `${printReadyMarginLeft * activePxPerMm}px`,
                            bottom: `${(printReadyMarginBottom / 2) * activePxPerMm}px`,
                            width: `${(activeWidthMm - printReadyMarginLeft - printReadyMarginRight) * activePxPerMm}px`
                          }}
                        >
                          <p className="text-[9px] font-bold text-slate-800 line-clamp-1 break-all uppercase tracking-wide">
                            {printReadyInfoText}
                          </p>
                          <p className="text-[7px] text-slate-400 tracking-wider uppercase font-mono mt-0.5">
                            Centered {printReadyPaperSize.toUpperCase()} Format • Output: {printReadyQrSize}mm
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated DPI / Resolution Indicator */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-left text-[10px] text-slate-500 font-mono flex justify-between items-center shadow-inner">
                    <span>{t('preview.estimatedDensity', 'Estimated Pre-press Density:')}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {Math.round(2000 / (printReadyQrSize / 25.4))} DPI (Pin-sharp Vectors)
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
