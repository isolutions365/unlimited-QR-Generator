import React, { useRef, useEffect, useState } from 'react';
import { QRProject } from '../types';
import { renderStyledQR, generateStyledSVG } from '../utils/qrRenderer';
import { Download, Copy, ExternalLink, Printer, Smartphone, Camera, Check, FileType, X, Layout, Palette, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import qrcode from 'qrcode';

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

  // Print Studio States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string>('business_card_horizontal');
  const [companyName, setCompanyName] = useState<string>('CREATIVE STUDIO');
  const [headingText, setHeadingText] = useState<string>('SCAN TO VISIT');
  const [subText, setSubText] = useState<string>('');
  const [badgeText, setBadgeText] = useState<string>('SCAN ME');
  const [themeColor, setThemeColor] = useState<string>('indigo');
  const [printSheetMode, setPrintSheetMode] = useState<boolean>(true);

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

  const qrContent = currentProject.content || 'https://google.com';
  const appUrl = (window as any).location?.origin || '';
  const trackingId = currentProject.trackingId || '';
  const trackingEnabled = currentProject.trackingEnabled || false;

  const trackingUrl = trackingId ? `${appUrl}/qr/${trackingId}` : null;
  const textToEncode = trackingEnabled && trackingUrl ? trackingUrl : qrContent;

  // Sync print subtext default when content changes
  useEffect(() => {
    if (textToEncode) {
      setSubText(textToEncode);
    }
  }, [textToEncode]);

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
        logoAutoCenter,
        logoOffsetX,
        logoOffsetY,
        eyeColorTopLeft: eyeColorTopLeft || undefined,
        eyeColorTopRight: eyeColorTopRight || undefined,
        eyeColorBottomLeft: eyeColorBottomLeft || undefined,
        errorCorrectionLevel,
        skipLogoImage: isPrintModalOpen ? false : true
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
    logoAutoCenter,
    logoOffsetX,
    logoOffsetY,
    eyeColorTopLeft,
    eyeColorTopRight,
    eyeColorBottomLeft,
    errorCorrectionLevel,
    isPrintModalOpen
  ]);

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
              <p style="font-size: 14px; color: #475569; font-weight: 500;">Grid Print Mode: 8 Cards formatted for standard paper cutlines</p>
              <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-bottom: 20px;">Print Cards</button>
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
              <p style="font-size: 14px; color: #475569; font-weight: 500;">Grid Print Mode: 8 Vertical Cards formatted for standard paper cutlines</p>
              <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-bottom: 20px;">Print Cards</button>
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
            <p style="font-size: 11px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px; font-family: monospace;">No App Download Required • Simply Scan with Smartphone Camera</p>
          </div>
        </div>
      `;
    }

    if (selectedLayout === 'table_tent') {
      return `
        <div style="max-width: 180mm; margin: 15mm auto; font-family: sans-serif;">
          <div style="text-align: center; margin-bottom: 25px;" class="no-print">
            <p style="font-size: 14px; color: #475569; font-weight: 500;">Foldable Table Tent Template - Includes fold guides</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Print Table Tent</button>
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 12px; height: 160mm; display: flex; position: relative; background: #fafafa; box-sizing: border-box;">
            <div style="flex: 1; padding: 25px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; transform: rotate(180deg); box-sizing: border-box; opacity: 0.85;">
              <div style="padding-top: 15px;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">${companyName}</div>
                <div style="width: 25px; height: 1.5px; background: #cbd5e1; margin: 8px auto;"></div>
                <div style="font-size: 15px; font-weight: 800; color: #334155;">Thank You For scanning!</div>
              </div>
              <div style="padding: 6px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;">
                <img src="${qrCodeUrl}" style="width: 80px; height: 80px; display: block;" />
              </div>
              <div style="font-size: 9px; font-weight: 600; color: #cbd5e1; letter-spacing: 2px; text-transform: uppercase;">BACK DISPLAY</div>
            </div>
            
            <div style="position: absolute; top: 0; bottom: 0; left: 50%; border-left: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; transform: translateX(-50%);">
              <span style="background: #334155; color: white; border-radius: 10px; font-size: 8px; font-weight: 700; padding: 3px 12px; letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap; transform: rotate(-90deg); z-index: 10;">FOLD LINE TO STAND</span>
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
                <div style="font-size: 8px; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-family: monospace; margin-top: 6px;">Fold and Stand • Easy to Scan</div>
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
            <p style="font-size: 14px; color: #475569; font-weight: 500;">Multi-Sticker Sheet: 12 stickers with clean cutting guides</p>
            <button onclick="window.print()" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Print Sheet</button>
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
      <div id="tour-qr-preview" className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-250 shadow-inner flex items-center justify-center">
          <div className="relative bg-white p-2 rounded-xl shadow-xs group cursor-pointer overflow-hidden animate-fade-in" style={{ width: '280px', height: '280px' }}>
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-lg bg-white transition-transform duration-300 group-hover:scale-[0.98]"
              style={{ width: '264px', height: '264px' }}
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
                      return (
                        <div 
                          className="w-full h-full flex items-center justify-center font-black text-white tracking-wider bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-inner"
                          style={{ 
                            fontSize: `${sizePx * 0.38}px`,
                            borderRadius: borderRadiusVal
                          }}
                        >
                          {logoUrl.slice(0, 3).toUpperCase()}
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              </div>
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
              onClick={() => setIsPrintModalOpen(true)}
              className="py-2.5 px-2 bg-white text-indigo-600 hover:bg-indigo-50/50 rounded-xl text-xs font-semibold border border-indigo-100 shadow-3xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Open Print Layout Studio"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Studio
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

      {/* Print Layout Studio Modal */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsPrintModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-800 grid grid-cols-1 lg:grid-cols-12 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Settings Control Side (5 columns) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Header title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Printer className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Print Layout Studio</h2>
                        <span className="text-[10px] text-slate-500 font-medium">Standardized physical media formats</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Category 1: Layout Selection */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">1. Select Layout Template</span>
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
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">2. Brand Text Customization</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="comp-name" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Company / Brand Name</label>
                        <input
                          id="comp-name"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="CREATIVE STUDIO"
                        />
                      </div>

                      {selectedLayout !== 'multi_sticker' && (
                        <div>
                          <label htmlFor="head-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Primary Call-to-Action</label>
                          <input
                            id="head-text"
                            type="text"
                            value={headingText}
                            onChange={(e) => setHeadingText(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="SCAN TO VISIT WEBSITE"
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="url-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Display Text / Web URL</label>
                        <input
                          id="url-text"
                          type="text"
                          value={subText}
                          onChange={(e) => setSubText(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="badge-text" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Mini Badge Label</label>
                        <input
                          id="badge-text"
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                          className="w-full h-9 px-3 bg-white border border-slate-250 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
                          placeholder="SCAN ME"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings Category 3: Color accent */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">3. Layout Color Accent</span>
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
                          <p className="text-xs font-bold text-slate-800">Layout Format Mode</p>
                          <p className="text-[10px] text-slate-600">Print 8 cards on a sheet vs. single layout</p>
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
              <div className="lg:col-span-12 xl:col-span-7 bg-slate-900 p-8 flex flex-col items-center justify-center min-h-[450px] lg:min-h-full max-h-[85vh] overflow-y-auto relative">
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
                              <p className="text-[8px] text-slate-400 mt-0.5 font-medium uppercase font-mono">Simply Scan & Learn • No registration</p>
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
                                  <h3 className="text-[9px] font-bold text-slate-700 leading-tight">Thank You!</h3>
                                </div>
                                <div className="p-1 border border-slate-100 rounded-md bg-white">
                                  <img src={qrImg} className="w-[46px] h-[46px] opacity-70" alt="Print QR preview" />
                                </div>
                                <span className="text-[7px] text-slate-400 uppercase tracking-widest font-mono">BACK DISPLAY</span>
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
                                  <span className="text-[6px] text-slate-400 font-bold block uppercase mt-0.5">Fold and Stand Display</span>
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
                    <span>Quality Aspect Ratio Check</span>
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
    </div>
  );
}
