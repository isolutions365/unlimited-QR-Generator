import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { getProductionBaseUrl } from '../config/siteConfig';

import { QRProject } from '../types';
import { Link2, AlignLeft, Wifi, Mail, ScanFace, Zap, Paintbrush, Check, UploadCloud, Phone, MessageSquare, Share2, Coins, MapPin, Calendar, Folder, Wand2, SquareDot, AlertTriangle, Info, Layers, Maximize, Smartphone, Wallet, CreditCard, DollarSign, Globe, QrCode, LayoutTemplate, Download, ShoppingBag, Settings, ChevronDown, ChevronUp, UtensilsCrossed, Star, UserCheck, X } from 'lucide-react';
import { motion } from 'motion/react';
import ColorPalette from './ColorPalette';
import AICoPilot from './AICoPilot';
import PaymentWalletPanel from './PaymentWalletPanel';
import { getEmblemFontSize } from '../utils/qrRenderer';
import qrcode from 'qrcode';

interface ControlPanelProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onSave: () => void;
  isSaving: boolean;
  userEmail?: string | null;
  projects?: QRProject[];
}

const quickStyles = [
  {
    name: 'Stealth Slate',
    description: 'Ultra-clean off-black standard design',
    iconColor: 'bg-slate-900',
    design: {
      fgColor: '#0f172a',
      bgColor: '#ffffff',
      gradientType: 'none' as const,
      gradientColor: '#4f46e5',
      dotStyle: 'square' as const,
      eyeStyle: 'square' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  },
  {
    name: 'Neon Eclipse',
    description: 'Sleek violet-pink gradient with rounded frame',
    iconColor: 'bg-gradient-to-tr from-pink-500 to-indigo-600',
    design: {
      fgColor: '#ec4899',
      bgColor: '#ffffff',
      gradientType: 'linear' as const,
      gradientColor: '#4f46e5',
      dotStyle: 'rounded' as const,
      eyeStyle: 'rounded' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  },
  {
    name: 'Forest Leaf',
    description: 'Relaxing emerald theme with elegant leaves',
    iconColor: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    design: {
      fgColor: '#059669',
      bgColor: '#ffffff',
      gradientType: 'linear' as const,
      gradientColor: '#14b8a6',
      dotStyle: 'classy' as const,
      eyeStyle: 'leaf' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  },
  {
    name: 'Oceanic Pulse',
    description: 'Dynamic cyan gradient with classy dots',
    iconColor: 'bg-gradient-to-tr from-cyan-400 to-blue-600',
    design: {
      fgColor: '#06b6d4',
      bgColor: '#ffffff',
      gradientType: 'linear' as const,
      gradientColor: '#2563eb',
      dotStyle: 'classy' as const,
      eyeStyle: 'rounded' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  },
  {
    name: 'Sunset Glow',
    description: 'Vivid orange red with smooth circles',
    iconColor: 'bg-gradient-to-tr from-amber-500 to-rose-600',
    design: {
      fgColor: '#f59e0b',
      bgColor: '#ffffff',
      gradientType: 'linear' as const,
      gradientColor: '#e11d48',
      dotStyle: 'rounded' as const,
      eyeStyle: 'circle' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  },
  {
    name: 'Imperial Plum',
    description: 'Sophisticated violet gradient with circular dots',
    iconColor: 'bg-gradient-to-tr from-purple-700 to-pink-500',
    design: {
      fgColor: '#6d28d9',
      bgColor: '#ffffff',
      gradientType: 'radial' as const,
      gradientColor: '#db2777',
      dotStyle: 'dots' as const,
      eyeStyle: 'circle' as const,
      eyeColorTopLeft: '',
      eyeColorTopRight: '',
      eyeColorBottomLeft: ''
    }
  }
];

const eccDetails = {
  L: {
    title: "Low (7% Recovery)",
    reliability: 1,
    capacity: 4,
    damageLabel: "7% damage tolerance",
    capacityLabel: "Maximum data storage",
    desc: "Simplest QR density. Adds minimal redundant data, keeping the pattern less dense and highly legible with long URLs. However, minor scratches or dust will make scanning difficult.",
    recommendation: "Best for simple, clean static URLs on high-quality flat surfaces with no center logo."
  },
  M: {
    title: "Medium (15% Recovery)",
    reliability: 2,
    capacity: 3,
    damageLabel: "15% damage tolerance",
    capacityLabel: "High data storage",
    desc: "The standard default configuration. Combines a moderate amount of error correction with a relatively simple, clean pattern layout.",
    recommendation: "Recommended for general corporate use, packaging, and digital display environments."
  },
  Q: {
    title: "Quartile (25% Recovery)",
    reliability: 3,
    capacity: 2,
    damageLabel: "25% damage tolerance",
    capacityLabel: "Moderate data storage",
    desc: "Provides enhanced quartile protection. Adds redundant dots so that the code remains scannable even if up to a quarter of its surface is dirty or torn.",
    recommendation: "Ideal for industrial, logistics, or rugged outdoor applications exposed to weather."
  },
  H: {
    title: "High (30% Recovery)",
    reliability: 4,
    capacity: 1,
    damageLabel: "30% damage tolerance",
    capacityLabel: "Lower data storage limit",
    desc: "Maximum error recovery capacity. Dedicates 30% of the QR area to redundant self-healing modules. Mandatory when overlaying custom center logos.",
    recommendation: "Highly recommended for custom branded QR codes with centerpiece logo/emblem overlays."
  }
};

export default function ControlPanel({ currentProject,
  onChange: parentOnChange,
  onSave,
  isSaving,
  userEmail,
  projects = []
}: ControlPanelProps) {
  const { t, locale } = useTranslation();
  const [localProject, setLocalProject] = useState<Partial<QRProject>>(currentProject);
  const [showEccTooltip, setShowEccTooltip] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const lastPropagatedProjectRef = useRef<Partial<QRProject>>(currentProject);
  const isDebouncingRef = useRef<boolean>(false);

  useEffect(() => {
    if (JSON.stringify(currentProject) !== JSON.stringify(lastPropagatedProjectRef.current)) {
      setLocalProject(currentProject);
      lastPropagatedProjectRef.current = currentProject;
      isDebouncingRef.current = false;
    }
  }, [currentProject]);

  useEffect(() => {
    if (!isDebouncingRef.current) return;

    const handler = setTimeout(() => {
      if (JSON.stringify(localProject) !== JSON.stringify(currentProject)) {
        lastPropagatedProjectRef.current = localProject;
        parentOnChange(localProject);
        isDebouncingRef.current = false;
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localProject, parentOnChange, currentProject]);

  const updateProjectState = (updatedProject: Partial<QRProject>, debounce = false) => {
    let design = updatedProject.design || localProject.design;
    if (design && design.smartOptimize) {
      const optimizedDesign = optimizeDesign(design, updatedProject.content || localProject.content || '');
      updatedProject = {
        ...updatedProject,
        design: optimizedDesign
      };
    }

    setLocalProject(updatedProject);

    if (!debounce) {
      lastPropagatedProjectRef.current = updatedProject;
      parentOnChange(updatedProject);
      isDebouncingRef.current = false;
    } else {
      isDebouncingRef.current = true;
    }
  };
  const optimizeDesign = (design: NonNullable<QRProject['design']>, content: string): NonNullable<QRProject['design']> => {
    if (!design.smartOptimize) return design;

    const newDesign = { ...design };

    const hasLogo = !!newDesign.logoUrl && ((val) => (val || '').trim())(newDesign.logoUrl) !== '';
    const logoScale = newDesign.logoScale ?? 0.18;
    const contentLength = content ? content.length : 0;

    // 1. Error Correction Level Optimization
    if (hasLogo) {
      if (logoScale >= 0.18) {
        newDesign.errorCorrectionLevel = 'H';
      } else if (logoScale >= 0.12) {
        newDesign.errorCorrectionLevel = 'Q';
      } else {
        newDesign.errorCorrectionLevel = 'M';
      }
    } else {
      if (contentLength < 35) {
        newDesign.errorCorrectionLevel = 'M';
      } else if (contentLength < 80) {
        newDesign.errorCorrectionLevel = 'Q';
      } else {
        newDesign.errorCorrectionLevel = 'H';
      }
    }

    // 2. QR Module Spacing/Padding Optimization
    if (contentLength < 30) {
      newDesign.modulePadding = 16; // airy modern design
    } else if (contentLength < 60) {
      newDesign.modulePadding = 8;
    } else if (contentLength < 120) {
      newDesign.modulePadding = 4;
    } else {
      newDesign.modulePadding = 0; // high density
    }

    // 3. Margin/Quiet Zone Optimization
    if (typeof newDesign.margin !== 'number') {
      newDesign.margin = 20;
    }

    return newDesign;
  };

  const onChange = (updatedProject: Partial<QRProject>, debounce = false) => {
    updateProjectState(updatedProject, debounce);
  };

  const setDesignField = (field: string, value: any, debounce = false) => {
    onChange({
      ...localProject,
      design: {
        ...(localProject.design || {
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          gradientType: 'none',
          gradientColor: '#4f46e5',
          dotStyle: 'square',
          eyeStyle: 'square',
          margin: 20
        }),
        [field]: value
      }
    } as Partial<QRProject>, debounce);
  };

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUrlError = (url: string): { type: 'error' | 'warning' | 'info'; message: string; action?: () => void } | null => {
    if (!url || !((val) => (val || '').trim())(url)) {
      return { type: 'info', message: t('control.err.enterWebLink', 'Enter the destination web link above. A valid link is required to generate the QR code.') };
    }

    const trimmed = ((val) => (val || '').trim())(url);
    
    // Check for spaces
    if (/\s/.test(trimmed)) {
      return { type: 'error', message: t('control.err.noSpaces', 'URLs cannot contain spaces. Please check for accidental spaces.') };
    }

    // Check if missing protocol
    const hasProtocol = /^(https?:\/\/)/i.test(trimmed);
    if (!hasProtocol) {
      // Suggest adding https://
      return {
        type: 'warning',
        message: t('control.err.missingProtocol', 'Missing required protocol! Smartphone scanners need "http://" or "https://" to recognize this as a web link.'),
        action: () => {
          onChange({ ...localProject, content: `https://${trimmed}` });
        }
      };
    }

    // Try to validate domain structure
    try {
      const urlObj = new URL(trimmed);
      const host = urlObj.hostname;
      if (!host.includes('.') || host.split('.').filter(Boolean).length < 2) {
        return { type: 'error', message: t('control.err.invalidDomain', 'Invalid website domain. Make sure you entered a full address (e.g. domain.com).') };
      }
    } catch (e) {
      return { type: 'error', message: t('control.err.invalidUrlFormat', 'Invalid URL format. Please enter a valid website address (e.g. https://example.com).') };
    }

    return null;
  };

  const urlError = localProject.type === 'url' ? getUrlError(localProject.content || '') : null;
  const isUrlInvalid = urlError && (urlError.type === 'error' || urlError.type === 'warning');

  const calculateAutoCenterOffsets = () => {
    const errorCorrectionLevel = localProject.design?.errorCorrectionLevel || 'H';
    const margin = typeof localProject.design?.margin === 'number' ? localProject.design?.margin : 20;
    const qrContent = localProject.content || 'https://www.freeqrgen.pro';
    const trackingEnabled = localProject.trackingEnabled || false;
    const trackingId = localProject.trackingId || '';
    const appUrl = getProductionBaseUrl();
    const trackingUrl = trackingId ? `${appUrl}/qr/${trackingId}` : null;
    const textToEncode = trackingEnabled && trackingUrl ? trackingUrl : qrContent;

    try {
      const qr = qrcode.create(textToEncode, { errorCorrectionLevel });
      const modulesCount = qr.modules.size;
      const size = 450;
      const qrSize = Math.max(100, size - margin * 2);
      const cellSize = qrSize / modulesCount;
      const eyeSize = cellSize * 7;
      const offsetX = Math.round(eyeSize * 0.04 * 10) / 10;
      const offsetY = Math.round(eyeSize * 0.04 * 10) / 10;
      return { modulesCount, cellSize, eyeSize, offsetX, offsetY };
    } catch (e) {
      return { modulesCount: 29, cellSize: 14.1, eyeSize: 98.7, offsetX: 3.9, offsetY: 3.9 };
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError(t('control.err.onlyImages', 'Only image files (PNG, JPG, SVG, WebP, etc.) are allowed.'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError(t('control.err.imageTooLarge', 'Image size is too large (max 2MB).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDesignField('logoUrl', event.target.result as string);
      }
    };
    reader.onerror = () => {
      setUploadError(t('control.err.failedToReadFile', 'Failed to read the file.'));
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setDesignField('logoUrl', '');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  // Preset colors and gradient handling refactored into ColorPalette component

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 14
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-6"
    >
      {/* Scope Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-indigo-600" />
          {t('control.customizeTitle', 'Customize Your QR Code')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{t('control.desc', 'Configure type, contents, custom styles, and centerpiece tags.')}</p>
      </motion.div>

      {/* Target Content Types */}
      <motion.div
        id="tour-qr-type"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm"
      >
        <label className="text-xs font-semibold text-gray-900 tracking-wider uppercase block mb-3">{t('control.qrCodeType', 'QR Code Type')}</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {(
            [
              { id: 'url', icon: Link2, label: 'URL', color: 'text-blue-500' },
              { id: 'text', icon: AlignLeft, label: 'Text', color: 'text-purple-500' },
              { id: 'wifi', icon: Wifi, label: 'WiFi', color: 'text-emerald-500' },
              { id: 'email', icon: Mail, label: 'Email', color: 'text-red-500' },
              { id: 'card', icon: ScanFace, label: 'Card', color: 'text-pink-500' },
              { id: 'phone', icon: Phone, label: 'Phone', color: 'text-teal-500' },
              { id: 'sms', icon: MessageSquare, label: 'SMS', color: 'text-indigo-500' },
              { id: 'social', icon: Share2, label: 'Social', color: 'text-orange-500' },
              { id: 'app', icon: Smartphone, label: 'App Store', color: 'text-rose-500' },
              { id: 'payment', icon: Wallet, label: 'Payment / Wallet', color: 'text-emerald-600' },
              { id: 'crypto', icon: Coins, label: 'Crypto', color: 'text-amber-500' },
              { id: 'geo', icon: MapPin, label: 'Location', color: 'text-cyan-500' }
            ] as const
          ).map(type => {
            const Icon = type.icon;
            const isSelected = localProject.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                className={`relative group py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${ isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50' }`}
                onClick={() => {
                  if (type.id === 'app') {
                    const hasJson = localProject.content && localProject.content.startsWith('{') && localProject.content.endsWith('}');
                    const initialContent = hasJson ? localProject.content : JSON.stringify({
                      ios: localProject.content && !localProject.content.startsWith('{') ? localProject.content : 'https://apps.apple.com',
                      android: 'https://play.google.com',
                      fallback: 'https://apps.apple.com'
                    });
                    onChange({ ...localProject, type: 'app', content: initialContent, trackingEnabled: true });
                  } else if (type.id === 'payment') {
                    const currentContent = localProject.content || '';
                    const isExistingPayment = currentContent && (currentContent.startsWith('http') || currentContent.startsWith('upi') || currentContent.startsWith('venmo') || currentContent.startsWith('cash') || currentContent.startsWith('wxp') || currentContent.startsWith('pix') || currentContent.startsWith('mpesa') || currentContent.startsWith('jazz') || currentContent.startsWith('easy') || currentContent.startsWith('stc') || currentContent.startsWith('iban') || currentContent.startsWith('sadad'));
                    const defaultPaymentUrl = locale === 'ur'
                      ? 'https://jazzcash.com.pk/pay?account=03001234567'
                      : 'https://stcpay.com.sa/pay?phone=0501234567';
                    const initialContent = isExistingPayment ? currentContent : defaultPaymentUrl;
                    onChange({ ...localProject, type: 'payment', content: initialContent });
                  } else {
                    onChange({ ...localProject, type: type.id });
                  }
                }}
              >
                {/* Circular radio/selection indicator */}
                <span 
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border transition-all ${ isSelected ? 'border-white bg-white scale-110 shadow-xs' : 'border-slate-350 bg-white group-hover:border-slate-450' }`} 
                />

                <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-white' : type.color}`} />
                <span className="text-[10px] font-medium">{t('control.type.' + type.id, type.label)}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Input Form Fields based on Type */}
      <motion.div
        id="tour-project-details"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm space-y-4"
      >
        <div>
          <label htmlFor="project-name-input" className="block text-xs font-semibold text-slate-800 mb-1">{t('control.projectNameLabel', 'Project Name')}</label>
          <input
            id="project-name-input"
            type="text"
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder:text-slate-400"
            placeholder="My Custom QR Code"
            value={localProject.name || ''}
            onChange={e => onChange({ ...localProject, name: e.target.value }, true)}
          />
        </div>

        {localProject.type === 'url' && (
          <div>
            <label htmlFor="target-url-input" className="block text-xs font-semibold text-slate-800 mb-1">{t('control.targetWebsiteUrl', 'Target Website URL')}</label>
            <div className="flex gap-2">
              <input
                id="target-url-input"
                type="url"
                className={`flex-1 text-sm px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 bg-white text-slate-800 placeholder:text-slate-400 transition-all ${ urlError && urlError.type === 'error' ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500' : urlError && urlError.type === 'warning' ? 'border-amber-350 focus:ring-amber-500/20 focus:border-amber-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500' }`}
                placeholder="https://www.freeqrgen.pro"
                value={localProject.content || ''}
                onChange={e => onChange({ ...localProject, content: e.target.value }, true)}
              />
              {urlError && urlError.type === 'warning' && urlError.action && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  type="button"
                  onClick={urlError.action}
                  title={t('control.addHttps', 'Add https://')}
                  className="px-3.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 active:scale-[0.95] text-amber-700 transition-all flex items-center justify-center cursor-pointer relative group"
                >
                  <Link2 className="w-4 h-4" />
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                    {t('control.addHttps', 'Add https://')}
                  </span>
                </motion.button>
              )}
            </div>

            {urlError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 p-3 rounded-xl border text-xs flex gap-2.5 transition-all duration-200 ${ urlError.type === 'error' ? 'bg-rose-50/50 border-rose-200/50 text-rose-800 shadow-xs' : urlError.type === 'warning' ? 'bg-amber-50/50 border-amber-200/50 text-amber-850 shadow-xs' : 'bg-slate-50/70 border-slate-200/40 text-slate-600' }`}
              >
                {urlError.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                {urlError.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                {urlError.type === 'info' && <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
                
                <div className="flex-1 space-y-1.5">
                  <p className="leading-relaxed font-medium">{urlError.message}</p>
                  {urlError.action && (
                    <button
                      type="button"
                      onClick={urlError.action}
                      className="text-[10px] font-bold bg-amber-600 hover:bg-amber-750 text-white px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1 active:scale-[0.97]"
                    >
                      <span>{t('control.fixAddHttps', 'Fix: Add "https://" prefix')}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {localProject.type === 'text' && (
          <div>
            <label htmlFor="plain-text-input" className="block text-xs font-semibold text-slate-800 mb-1">{t('control.plainText', 'Plain Text')}</label>
            <textarea
              id="plain-text-input"
              className="w-full text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 bg-white text-slate-800"
              placeholder={t('control.placeholder.rawText', 'Add raw text to encode...')}
              value={localProject.content || ''}
              onChange={e => onChange({ ...localProject, content: e.target.value }, true)}
            />
          </div>
        )}

        {localProject.type === 'wifi' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">{t('control.wifiIntegrationSetting', 'WiFi Integration Setting')}</h4>
            <p className="text-[11px] text-slate-600">{t('control.wifiDesc', 'Auto-configured to connect to wifi spots securely.')}</p>
            <div>
              <label htmlFor="wifi-ssid-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.wifiSsid', 'WiFi Network ID / SSID')}</label>
              <input
                id="wifi-ssid-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder={t('control.placeholder.ssid', 'WiFi Network ID / SSID')}
                onChange={e => {
                  const parts = (localProject.content || '').split(';');
                  const pass = parts[2] || '';
                  onChange({ ...localProject, content: `WIFI:S:${e.target.value};T:WPA;P:${pass};;` }, true);
                }}
              />
            </div>
            <div>
              <label htmlFor="wifi-pass-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.wifiPasswordLabel', 'WiFi Password')}</label>
              <input
                id="wifi-pass-input"
                type="password"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder={t('control.placeholder.password', 'WiFi Password')}
                onChange={e => {
                  const parts = (localProject.content || '').split(';');
                  const ss = parts[0]?.replace('WIFI:S:', '') || '';
                  onChange({ ...localProject, content: `WIFI:S:${ss};T:WPA;P:${e.target.value};;` }, true);
                }}
              />
            </div>
          </div>
        )}

        {localProject.type === 'email' && (
          <div className="space-y-2">
            <label htmlFor="email-recipient-input" className="block text-xs font-semibold text-slate-800">{t('control.vcardEmailLabel', 'Recipient Email Address')}</label>
            <input
              id="email-recipient-input"
              type="email"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-800"
              placeholder={t('control.placeholder.vcardEmail', 'Recipient Email Address')}
              onChange={e => onChange({ ...localProject, content: `mailto:${e.target.value}` }, true)}
            />
          </div>
        )}

        {localProject.type === 'card' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850 font-mono">{t('control.vcardContactCredentials', 'vCard Contact Credentials')}</h4>
            <div>
              <label htmlFor="vcard-name-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.fullNameLabel', 'Full Name')}</label>
              <input
                id="vcard-name-input"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-white text-slate-800"
                placeholder={t('control.placeholder.fullName', 'Full Name')}
                value={localProject.content?.includes('N:') ? localProject.content.split('N:')[1]?.split('\n')[0] : ''}
                onChange={e => onChange({ ...localProject, content: `BEGIN:VCARD\nVERSION:3.0\nN:${e.target.value}\nEND:VCARD` }, true)}
              />
            </div>
          </div>
        )}

        {localProject.type === 'phone' && (
          <div className="space-y-2">
            <label htmlFor="phone-number-input" className="block text-xs font-semibold text-slate-800">{t('control.phoneNumberLabel', 'Phone Number')}</label>
            <input
              id="phone-number-input"
              type="tel"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('control.placeholder.phoneVal', '+1 (555) 000-0000')}
              value={(() => {
                if (localProject.content?.startsWith('tel:')) {
                  return localProject.content.substring(4);
                }
                return '';
              })()}
              onChange={e => onChange({ ...localProject, content: `tel:${((val) => (val || '').trim())(e.target.value)}` }, true)}
            />
            <span className="text-[10px] text-slate-600 block font-sans">{t('control.phoneDesc', 'Encodes standard cellular dialing protocols automatically.')}</span>
          </div>
        )}

        {localProject.type === 'sms' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">{t('control.smsText', 'Pre-composed SMS Text')}</h4>
            <div>
              <label htmlFor="sms-phone-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.recipientPhone', 'Recipient Phone Number')}</label>
              <input
                id="sms-phone-input"
                type="tel"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder={t('control.placeholder.phone', 'Recipient Phone Number')}
                value={(() => {
                  if (localProject.content?.startsWith('sms:')) {
                    const queryIdx = localProject.content.indexOf('?');
                    return queryIdx !== -1 ? localProject.content.substring(4, queryIdx) : localProject.content.substring(4);
                  } else if (localProject.content?.startsWith('SMSTO:')) {
                    return localProject.content.substring(6).split(':')[0] || '';
                  }
                  return '';
                })()}
                onChange={e => {
                  const phone = ((val) => (val || '').trim())(e.target.value);
                  let existingMsg = '';
                  if (localProject.content?.startsWith('sms:')) {
                    const queryIdx = localProject.content.indexOf('?body=');
                    existingMsg = queryIdx !== -1 ? decodeURIComponent(localProject.content.substring(queryIdx + 6)) : '';
                  } else if (localProject.content?.startsWith('SMSTO:')) {
                    existingMsg = localProject.content.substring(6).split(':').slice(1).join(':') || '';
                  }
                  onChange({ ...localProject, content: `SMSTO:${phone}:${existingMsg}` }, true);
                }}
              />
            </div>
            <div>
              <label htmlFor="sms-msg-textarea" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.prefilledMessage', 'Prefilled Message Body')}</label>
              <textarea
                id="sms-msg-textarea"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white h-16 text-slate-800"
                placeholder={t('control.placeholder.prefilledMessage', 'Prefilled message body')}
                value={(() => {
                  if (localProject.content?.startsWith('sms:')) {
                    const queryIdx = localProject.content.indexOf('?body=');
                    return queryIdx !== -1 ? decodeURIComponent(localProject.content.substring(queryIdx + 6)) : '';
                  } else if (localProject.content?.startsWith('SMSTO:')) {
                    return localProject.content.substring(6).split(':').slice(1).join(':') || '';
                  }
                  return '';
                })()}
                onChange={e => {
                  const msg = e.target.value;
                  let existingPhone = '';
                  if (localProject.content?.startsWith('sms:')) {
                    const queryIdx = localProject.content.indexOf('?');
                    existingPhone = queryIdx !== -1 ? localProject.content.substring(4, queryIdx) : localProject.content.substring(4);
                  } else if (localProject.content?.startsWith('SMSTO:')) {
                    existingPhone = localProject.content.substring(6).split(':')[0] || '';
                  }
                  onChange({ ...localProject, content: `SMSTO:${existingPhone}:${msg}` }, true);
                }}
              />
            </div>
          </div>
        )}

        {localProject.type === 'social' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">{t('control.socialProfile', 'Social Media Profile')}</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
                { id: 'x', label: 'X (Twitter)', prefix: 'https://x.com/' },
                { id: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/' },
                { id: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@' },
                { id: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@' },
                { id: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/' }
              ].map(plat => {
                const isPlatActive = (() => {
                  const content = localProject.content || '';
                  return content.includes(plat.prefix);
                })();

                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      // Preserve the username/handle if possible
                      const currentUsername = (() => {
                        const content = localProject.content || '';
                        if (content.includes('instagram.com/')) return content.split('instagram.com/')[1] || '';
                        if (content.includes('x.com/')) return content.split('x.com/')[1] || '';
                        if (content.includes('wa.me/')) return content.split('wa.me/')[1] || '';
                        if (content.includes('tiktok.com/@')) return content.split('tiktok.com/@')[1] || '';
                        if (content.includes('youtube.com/@')) return content.split('youtube.com/@')[1] || '';
                        if (content.includes('linkedin.com/in/')) return content.split('linkedin.com/in/')[1] || '';
                        return '';
                      })();
                      onChange({ ...localProject, content: `${plat.prefix}${currentUsername}` });
                    }}
                    className={`py-1.5 px-2 text-[10px] font-medium border rounded-lg text-center transition-all ${ isPlatActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-100' }`}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
            
            <div>
              <span className="text-[10px] text-slate-650 font-mono">
                {t('control.platformPath', 'Platform Path:')} {(() => {
                  const content = localProject.content || '';
                  if (content.includes('instagram.com/')) return 'https://instagram.com/';
                  if (content.includes('x.com/')) return 'https://x.com/';
                  if (content.includes('wa.me/')) return 'https://wa.me/';
                  if (content.includes('tiktok.com/@')) return 'https://tiktok.com/@';
                  if (content.includes('youtube.com/@')) return 'https://youtube.com/@';
                  if (content.includes('linkedin.com/in/')) return 'https://linkedin.com/in/';
                  return 'https://instagram.com/';
                })()}
              </span>
              <label htmlFor="social-username-input" className="sr-only">{t('control.socialUsername', 'Social Username or Contact')}</label>
              <input
                id="social-username-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white mt-1 font-mono text-slate-800"
                placeholder={t('control.placeholder.socialUsername', 'username, handle, or contact number')}
                value={(() => {
                  const content = localProject.content || '';
                  if (content.includes('instagram.com/')) return content.split('instagram.com/')[1] || '';
                  if (content.includes('x.com/')) return content.split('x.com/')[1] || '';
                  if (content.includes('wa.me/')) return content.split('wa.me/')[1] || '';
                  if (content.includes('tiktok.com/@')) return content.split('tiktok.com/@')[1] || '';
                  if (content.includes('youtube.com/@')) return content.split('youtube.com/@')[1] || '';
                  if (content.includes('linkedin.com/in/')) return content.split('linkedin.com/in/')[1] || '';
                  return content;
                })()}
                onChange={e => {
                  const handle = (((val) => (val || '').trim())(e.target.value)).replace(/^@/, '');
                  const currentPrefix = (() => {
                    const content = localProject.content || '';
                    if (content.includes('instagram.com/')) return 'https://instagram.com/';
                    if (content.includes('x.com/')) return 'https://x.com/';
                    if (content.includes('wa.me/')) return 'https://wa.me/';
                    if (content.includes('tiktok.com/@')) return 'https://tiktok.com/@';
                    if (content.includes('youtube.com/@')) return 'https://youtube.com/@';
                    if (content.includes('linkedin.com/in/')) return 'https://linkedin.com/in/';
                    return 'https://instagram.com/';
                  })();
                  onChange({ ...localProject, content: `${currentPrefix}${handle}` }, true);
                }}
              />
            </div>
          </div>
        )}

        {localProject.type === 'crypto' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">{t('control.cryptoAddress', 'Cryptocurrency Address')}</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'bitcoin', label: 'BTC', prefix: 'bitcoin:' },
                { id: 'ethereum', label: 'ETH', prefix: 'ethereum:' },
                { id: 'solana', label: 'SOL', prefix: 'solana:' },
                { id: 'dogecoin', label: 'DOGE', prefix: 'dogecoin:' }
              ].map(coin => {
                const isCoinActive = (() => {
                  const content = localProject.content || '';
                  return content.startsWith(coin.prefix);
                })();

                return (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => {
                      const currentAddr = (() => {
                        const content = localProject.content || '';
                        if (content.startsWith('bitcoin:')) return content.split('bitcoin:')[1] || '';
                        if (content.startsWith('ethereum:')) return content.split('ethereum:')[1] || '';
                        if (content.startsWith('solana:')) return content.split('solana:')[1] || '';
                        if (content.startsWith('dogecoin:')) return content.split('dogecoin:')[1] || '';
                        return '';
                      })();
                      onChange({ ...localProject, content: `${coin.prefix}${currentAddr}` });
                    }}
                    className={`py-1 px-1.5 text-[9px] font-bold border rounded-lg text-center transition-all ${ isCoinActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-100' }`}
                  >
                    {coin.label}
                  </button>
                );
              })}
            </div>

            <div>
              <span className="text-[10px] text-slate-650 font-mono">
                {t('control.assetPrefix', 'Asset Prefix:')} {(() => {
                  const content = localProject.content || '';
                  if (content.startsWith('bitcoin:')) return 'bitcoin:';
                  if (content.startsWith('ethereum:')) return 'ethereum:';
                  if (content.startsWith('solana:')) return 'solana:';
                  if (content.startsWith('dogecoin:')) return 'dogecoin:';
                  return 'bitcoin:';
                })()}
              </span>
              <label htmlFor="crypto-address-input" className="sr-only">{t('control.cryptoAddress', 'Cryptocurrency Address')}</label>
              <input
                id="crypto-address-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white mt-1 font-mono text-slate-800"
                placeholder={t('control.placeholder.cryptoAddress', 'Wallet destination hash')}
                value={(() => {
                  const content = localProject.content || '';
                  if (content.startsWith('bitcoin:')) return content.split('bitcoin:')[1] || '';
                  if (content.startsWith('ethereum:')) return content.split('ethereum:')[1] || '';
                  if (content.startsWith('solana:')) return content.split('solana:')[1] || '';
                  if (content.startsWith('dogecoin:')) return content.split('dogecoin:')[1] || '';
                  return content;
                })()}
                onChange={e => {
                  const addr = ((val) => (val || '').trim())(e.target.value);
                  const currentPrefix = (() => {
                    const content = localProject.content || '';
                    if (content.startsWith('bitcoin:')) return 'bitcoin:';
                    if (content.startsWith('ethereum:')) return 'ethereum:';
                    if (content.startsWith('solana:')) return 'solana:';
                    if (content.startsWith('dogecoin:')) return 'dogecoin:';
                    return 'bitcoin:';
                  })();
                  onChange({ ...localProject, content: `${currentPrefix}${addr}` }, true);
                }}
              />
            </div>
          </div>
        )}

        {localProject.type === 'geo' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-850">{t('control.mapsGeolocation', 'Maps Geolocation')}</h4>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        const lat = pos.coords.latitude.toFixed(6);
                        const lng = pos.coords.longitude.toFixed(6);
                        onChange({ ...localProject, content: `geo:${lat},${lng}` });
                      },
                      err => {
                        console.error("Geolocation request failed:", err);
                      }
                    );
                  }
                }}
                className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold bg-white px-2 py-1 rounded border border-gray-200 shadow-3xs cursor-pointer inline-flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-indigo-500" />
                {t('control.locateMe', 'Locate Me')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="geo-latitude-input" className="text-[10px] text-slate-700 block mb-0.5 font-semibold">{t('control.latitude', 'Latitude')}</label>
                <input
                  id="geo-latitude-input"
                  type="text"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-200 bg-white font-mono text-slate-800"
                  placeholder={t('control.placeholder.latitude', 'e.g. 37.7749')}
                  value={(() => {
                    if (localProject.content?.startsWith('geo:')) {
                      return localProject.content.substring(4).split(',')[0] || '';
                    }
                    return '';
                  })()}
                  onChange={e => {
                    const lat = ((val) => (val || '').trim())(e.target.value);
                    const existingLng = (() => {
                      if (localProject.content?.startsWith('geo:')) {
                        return localProject.content.substring(4).split(',')[1] || '';
                      }
                      return '';
                    })();
                    onChange({ ...localProject, content: `geo:${lat},${existingLng}` }, true);
                  }}
                />
              </div>

              <div>
                <label htmlFor="geo-longitude-input" className="text-[10px] text-slate-700 block mb-0.5 font-semibold">{t('control.longitude', 'Longitude')}</label>
                <input
                  id="geo-longitude-input"
                  type="text"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-200 bg-white font-mono text-slate-800"
                  placeholder={t('control.placeholder.longitude', 'e.g. -122.4194')}
                  value={(() => {
                    if (localProject.content?.startsWith('geo:')) {
                      return localProject.content.substring(4).split(',')[1] || '';
                    }
                    return '';
                  })()}
                  onChange={e => {
                    const lng = ((val) => (val || '').trim())(e.target.value);
                    const existingLat = (() => {
                      if (localProject.content?.startsWith('geo:')) {
                        return localProject.content.substring(4).split(',')[0] || '';
                      }
                      return '';
                    })();
                    onChange({ ...localProject, content: `geo:${existingLat},${lng}` }, true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {localProject.type === 'app' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">{t('control.smartAppSetup', 'Smart App Store Setup')}</h4>
            <p className="text-[11px] text-slate-600 font-medium">
              {t('control.appSetupDesc', 'Users scanning this QR code will be dynamically redirected to the appropriate store based on their device.')}
            </p>
            
            {/* Warning if tracking is disabled */}
            {!localProject.trackingEnabled && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-relaxed">
                <strong>{t('control.note', 'Note:')}</strong> {t('control.appTrackingNotice', 'Device detection requires tracking to be enabled. We have automatically enabled tracking for this QR code.')}
              </div>
            )}

            <div>
              <label htmlFor="app-ios-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.iosAppStoreLink', 'iOS App Store Link')}</label>
              <input
                id="app-ios-input"
                type="url"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="https://apps.apple.com/app/..."
                value={(() => {
                  try {
                    const parsed = JSON.parse(localProject.content || '{}');
                    return parsed.ios || '';
                  } catch (e) {
                    return localProject.content && !localProject.content.startsWith('{') ? localProject.content : '';
                  }
                })()}
                onChange={e => {
                  let currentObj = { ios: '', android: '', fallback: '' };
                  try {
                    currentObj = { ...currentObj, ...JSON.parse(localProject.content || '{}') };
                  } catch (err) {
                    if (localProject.content && !localProject.content.startsWith('{')) {
                      currentObj.ios = localProject.content;
                    }
                  }
                  currentObj.ios = e.target.value;
                  onChange({ ...localProject, content: JSON.stringify(currentObj), trackingEnabled: true }, true);
                }}
              />
            </div>

            <div>
              <label htmlFor="app-android-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.googlePlayStoreLink', 'Google Play Store Link')}</label>
              <input
                id="app-android-input"
                type="url"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={(() => {
                  try {
                    const parsed = JSON.parse(localProject.content || '{}');
                    return parsed.android || '';
                  } catch (e) {
                    return '';
                  }
                })()}
                onChange={e => {
                  let currentObj = { ios: '', android: '', fallback: '' };
                  try {
                    currentObj = { ...currentObj, ...JSON.parse(localProject.content || '{}') };
                  } catch (err) {
                    if (localProject.content && !localProject.content.startsWith('{')) {
                      currentObj.ios = localProject.content;
                    }
                  }
                  currentObj.android = e.target.value;
                  onChange({ ...localProject, content: JSON.stringify(currentObj), trackingEnabled: true }, true);
                }}
              />
            </div>

            <div>
              <label htmlFor="app-fallback-input" className="block text-[10px] font-semibold text-slate-800 mb-1">{t('control.fallbackLink', 'Fallback Website / Desktop Link (Optional)')}</label>
              <input
                id="app-fallback-input"
                type="url"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="https://mywebsite.com"
                value={(() => {
                  try {
                    const parsed = JSON.parse(localProject.content || '{}');
                    return parsed.fallback || '';
                  } catch (e) {
                    return '';
                  }
                })()}
                onChange={e => {
                  let currentObj = { ios: '', android: '', fallback: '' };
                  try {
                    currentObj = { ...currentObj, ...JSON.parse(localProject.content || '{}') };
                  } catch (err) {
                    if (localProject.content && !localProject.content.startsWith('{')) {
                      currentObj.ios = localProject.content;
                    }
                  }
                  currentObj.fallback = e.target.value;
                  onChange({ ...localProject, content: JSON.stringify(currentObj), trackingEnabled: true }, true);
                }}
              />
            </div>
          </div>
        )}

        {localProject.type === 'payment' && (
          <PaymentWalletPanel
            content={localProject.content || ''}
            onChangeContent={(newContent) => onChange({ ...localProject, content: newContent }, true)}
          />
        )}
      </motion.div>

      {/* Integrated Color Palette and Gradient Manager */}
      <ColorPalette
        currentProject={localProject}
        onChange={onChange}
      />

      {/* Quick Style Presets Section */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm flex flex-col gap-3"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-semibold text-gray-900 tracking-wider uppercase flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              {t('control.quickStylePresets', 'Quick Style Presets')}
            </h3>
            <span className="text-[10px] text-gray-600 block">{t('control.quickStylesDesc', 'Apply curated style combinations instantly.')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quickStyles.map((preset) => {
            const isSelected = (() => {
              const design = localProject.design;
              if (!design) return false;
              return (
                design.fgColor === preset.design.fgColor &&
                design.gradientType === preset.design.gradientType &&
                design.gradientColor === preset.design.gradientColor &&
                design.dotStyle === preset.design.dotStyle &&
                design.eyeStyle === preset.design.eyeStyle
              );
            })();

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChange({
                    ...localProject,
                    design: {
                      ...(localProject.design || {}),
                      ...preset.design,
                    },
                  });
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${ isSelected ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50' }`}
              >
                {/* Visual Swatch Mini Badge */}
                <div className={`w-5 h-5 rounded-md ${preset.iconColor} shrink-0 shadow-sm border border-white flex items-center justify-center`}>
                  {isSelected && (
                    <Check className="w-3 h-3 text-white stroke-[3.5]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                    {t('control.preset.' + preset.name.replace(/\s+/g, ''), preset.name)}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {t('control.presetDesc.' + preset.name.replace(/\s+/g, ''), preset.description)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Gemini AI Co-Pilot Intelligent Customizer */}
      <AICoPilot
        currentProject={localProject}
        onChange={onChange}
      />

      {/* Frame Corners and Dots Selection (Eyes Style & Dots Style) */}
      <motion.div
        id="tour-qr-styles"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm grid grid-cols-2 gap-4"
      >
       <div>
          <label htmlFor="eye-style-select" className="text-xs font-semibold text-slate-800 tracking-wider uppercase block mb-2">{t('control.cornerEyes', 'Corner Eyes')}</label>
          <select
            id="eye-style-select"
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={localProject.design?.eyeStyle || 'square'}
            onChange={e => setDesignField('eyeStyle', e.target.value)}
          >
            <option value="square">{t('control.squareFrame', 'Square Frame')}</option>
            <option value="rounded">{t('control.roundedFrame', 'Rounded Frame')}</option>
            <option value="circle">{t('control.smoothCircles', 'Smooth Circles')}</option>
            <option value="leaf">{t('control.elegantLeaf', 'Elegant Leaf')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="dot-style-select" className="text-xs font-semibold text-gray-900 tracking-wider uppercase block mb-2">{t('control.internalDots', 'Internal Dots')}</label>
          <select
            id="dot-style-select"
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={localProject.design?.dotStyle || 'square'}
            onChange={e => setDesignField('dotStyle', e.target.value)}
          >
            <option value="square">{t('control.standardSquare', 'Standard Square')}</option>
            <option value="rounded">{t('control.smoothRounded', 'Smooth Rounded')}</option>
            <option value="dots">{t('control.circularDots', 'Circular Dots')}</option>
            <option value="classy">{t('control.classyStarbursts', 'Classy Starbursts')}</option>
          </select>
        </div>
      </motion.div>

      {/* Frame & Call-To-Action (CTA) Badge Templates Section */}
      <motion.div
        id="tour-frame-selection"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm space-y-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-semibold text-gray-900 tracking-wider uppercase flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4 text-indigo-500 shrink-0" />
              {t('control.frameSelectionTitle', 'Frame & Call-To-Action Templates')}
            </h3>
            <span className="text-[10px] text-gray-600 block mt-0.5">
              {t('control.frameSelectionDesc', 'Wrap your QR code in pre-designed templates with call-to-action text like "Scan Me" or "Visit Website".')}
            </span>
          </div>
          {localProject.design?.frameStyle && localProject.design?.frameStyle !== 'none' ? (
            <button
              type="button"
              onClick={() => {
                setDesignField('frameStyle', 'none');
              }}
              className="text-[10px] text-red-500 hover:text-red-700 font-semibold cursor-pointer shrink-0 transition-colors"
            >
              {t('control.removeOuterFrame', 'Remove Frame')}
            </button>
          ) : null}
        </div>

        {/* Frame Template Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'none', label: 'No Frame', desc: 'Sleek & clean matrix', icon: SquareDot, defaultText: '' },
            { id: 'scan-me', label: 'Scan Me', desc: 'Universal CTA badge', icon: QrCode, defaultText: 'SCAN ME' },
            { id: 'menu', label: 'Menu', desc: 'Restaurant & food menus', icon: UtensilsCrossed, defaultText: 'VIEW MENU' },
            { id: 'website', label: 'Website', desc: 'Web portal & landing links', icon: Globe, defaultText: 'VISIT WEBSITE' },
            { id: 'wifi', label: 'Connect WiFi', desc: 'Instant guest connection', icon: Wifi, defaultText: 'CONNECT WIFI' },
            { id: 'download-app', label: 'Download App', desc: 'App store & Play store', icon: Download, defaultText: 'DOWNLOAD APP' },
            { id: 'order-now', label: 'Order Now', desc: 'Menus & storefronts', icon: ShoppingBag, defaultText: 'ORDER NOW' },
            { id: 'pay-here', label: 'Pay Here', desc: 'Mobile wallets & payments', icon: CreditCard, defaultText: 'PAY HERE' },
            { id: 'follow-us', label: 'Follow Us', desc: 'Social media channels', icon: Share2, defaultText: 'FOLLOW US' },
            { id: 'save-contact', label: 'Save Contact', desc: 'Digital vCard & contacts', icon: UserCheck, defaultText: 'SAVE CONTACT' },
            { id: 'rate-us', label: 'Rate & Review', desc: 'Customer reviews & feedback', icon: Star, defaultText: 'RATE & REVIEW' },
            { id: 'custom', label: 'Custom Text', desc: 'Fully personalized wording', icon: Zap, defaultText: 'SCAN TO REGISTER' },
          ].map(preset => {
            const isSelected = (localProject.design?.frameStyle || 'none') === preset.id;
            const IconComp = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDesignField('frameStyle', preset.id);
                  if (preset.id !== 'none') {
                    if (!localProject.design?.frameColor) {
                      setDesignField('frameColor', localProject.design?.fgColor || '#4f46e5');
                    }
                    if (!localProject.design?.frameTextColor) {
                      setDesignField('frameTextColor', '#ffffff');
                    }
                  }
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-[64px] cursor-pointer relative group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-[10.5px] font-bold text-gray-900 truncate">
                      {t('control.framePreset.' + preset.id, preset.label)}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3] shrink-0" />}
                </div>
                <div className="text-[9px] text-gray-500 truncate w-full pl-5">
                  {t('control.framePresetDesc.' + preset.id, preset.desc)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Configurable Frame Text & Quick Suggestions */}
        {localProject.design?.frameStyle && localProject.design?.frameStyle !== 'none' && (
          <div className="space-y-3 pt-2.5 border-t border-gray-100/80">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="custom-frame-text" className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block">
                  {localProject.design?.frameStyle === 'custom'
                    ? t('control.customFrameLabelText', 'Call-To-Action (CTA) Banner Text')
                    : t('control.overridePresetLabelText', 'Customize Call-To-Action (CTA) Text')}
                </label>
                <div className="flex items-center gap-2">
                  {localProject.design?.frameText && (
                    <button
                      type="button"
                      onClick={() => setDesignField('frameText', '', true)}
                      className="text-[9.5px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5 transition-colors font-medium"
                    >
                      <X className="w-3 h-3" />
                      Reset to Default
                    </button>
                  )}
                  <span className="text-[9px] font-mono text-slate-400">
                    {(localProject.design?.frameText || '').length}/30 {t('control.chars', 'chars')}
                  </span>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  id="custom-frame-text"
                  type="text"
                  maxLength={30}
                  className="w-full text-xs px-3 py-2 pr-8 rounded-xl bg-white border border-gray-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder={(() => {
                    const style = localProject.design?.frameStyle;
                    if (style === 'scan-me') return 'SCAN ME';
                    if (style === 'menu') return 'VIEW MENU';
                    if (style === 'website' || style === 'visit-website') return 'VISIT WEBSITE';
                    if (style === 'wifi' || style === 'wifi-password' || style === 'join-wifi') return 'CONNECT WIFI';
                    if (style === 'download-app') return 'DOWNLOAD APP';
                    if (style === 'follow-us') return 'FOLLOW US';
                    if (style === 'order-now') return 'ORDER NOW';
                    if (style === 'pay-here') return 'PAY HERE';
                    if (style === 'save-contact') return 'SAVE CONTACT';
                    if (style === 'rate-us') return 'RATE & REVIEW';
                    return 'e.g. SCAN FOR SPECIAL OFFER';
                  })()}
                  value={localProject.design?.frameText || ''}
                  onChange={e => setDesignField('frameText', e.target.value, true)}
                />
                {localProject.design?.frameText && (
                  <button
                    type="button"
                    onClick={() => setDesignField('frameText', '', true)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick CTA Suggestion Chips */}
            <div>
              <span className="text-[9.5px] text-gray-500 block mb-1.5 font-medium">
                {t('control.quickCtaSuggestions', 'Quick CTA Suggestions:')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'SCAN ME',
                  'VIEW MENU',
                  'VISIT WEBSITE',
                  'CONNECT WIFI',
                  'DOWNLOAD APP',
                  'ORDER NOW',
                  'PAY HERE',
                  'FOLLOW US',
                  'SAVE CONTACT',
                  'RATE US',
                  'EXPLORE MORE'
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setDesignField('frameText', suggestion, true)}
                    className="text-[9.5px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-semibold transition-colors border border-slate-200/60 cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance Customization (Colors, Font Size, Position) */}
            <div className="space-y-3 pt-2.5 border-t border-gray-100/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1.5">
                    {t('control.frameShapeColor', 'Frame Color')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id="frame-color-picker"
                      type="color"
                      aria-label="Frame Color"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl cursor-pointer border border-gray-200 p-0.5"
                      value={localProject.design?.frameColor || localProject.design?.fgColor || '#4f46e5'}
                      onChange={e => setDesignField('frameColor', e.target.value)}
                    />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {localProject.design?.frameColor || localProject.design?.fgColor || '#4f46e5'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1.5">
                    {t('control.labelTextColor', 'CTA Text Color')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      id="frame-text-color-picker"
                      type="color"
                      aria-label="CTA Text Color"
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl cursor-pointer border border-gray-200 p-0.5"
                      value={localProject.design?.frameTextColor || '#ffffff'}
                      onChange={e => setDesignField('frameTextColor', e.target.value)}
                    />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {localProject.design?.frameTextColor || '#ffffff'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Palette Colors for Frame */}
              <div>
                <span className="text-[9.5px] text-gray-500 block mb-1 font-medium">Quick Frame Color Themes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Indigo', color: '#4f46e5', textColor: '#ffffff' },
                    { name: 'Obsidian', color: '#0f172a', textColor: '#ffffff' },
                    { name: 'Emerald', color: '#059669', textColor: '#ffffff' },
                    { name: 'Rose', color: '#e11d48', textColor: '#ffffff' },
                    { name: 'Amber', color: '#d97706', textColor: '#ffffff' },
                    { name: 'Violet', color: '#7c3aed', textColor: '#ffffff' },
                    { name: 'Ocean', color: '#0284c7', textColor: '#ffffff' },
                    { name: 'Slate', color: '#475569', textColor: '#ffffff' },
                  ].map(theme => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => {
                        setDesignField('frameColor', theme.color);
                        setDesignField('frameTextColor', theme.textColor);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-[9.5px] font-medium text-slate-700 transition-all shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs" style={{ backgroundColor: theme.color }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Position */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100/40">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="frame-font-size-range" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                      {t('control.fontSize', 'Text Font Size')}
                    </label>
                    <span className="text-[11px] text-indigo-600 font-mono font-bold">
                      {localProject.design?.frameFontSize ?? 20}px
                    </span>
                  </div>
                  <input
                    id="frame-font-size-range"
                    type="range"
                    min="12"
                    max="32"
                    step="1"
                    className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                    value={localProject.design?.frameFontSize ?? 20}
                    onChange={e => setDesignField('frameFontSize', parseInt(e.target.value), true)}
                  />
                </div>

                <div>
                  <label htmlFor="frame-text-position-select" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1.5">
                    {t('control.textPosition', 'Banner Position')}
                  </label>
                  <select
                    id="frame-text-position-select"
                    className="w-full text-xs px-2.5 py-2 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={localProject.design?.frameTextPosition || 'bottom'}
                    onChange={e => setDesignField('frameTextPosition', e.target.value)}
                  >
                    <option value="bottom">{t('control.bottomBanner', 'Bottom Banner')}</option>
                    <option value="top">{t('control.topBanner', 'Top Banner')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Independent Finder Corner Eyes Styling */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm space-y-3"
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-gray-900 tracking-wider uppercase block">{t('control.finderEyeColors', 'Finder Eye Colors')}</span>
            <span className="text-[10px] text-gray-600 block">{t('control.finderEyeDesc', 'Independently color the three main corner eyes.')}</span>
          </div>
          {(localProject.design?.eyeColorTopLeft || localProject.design?.eyeColorTopRight || localProject.design?.eyeColorBottomLeft) ? (
            <button
              type="button"
              onClick={() => {
                setDesignField('eyeColorTopLeft', '');
                setDesignField('eyeColorTopRight', '');
                setDesignField('eyeColorBottomLeft', '');
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer"
            >
              {t('control.resetToTheme', 'Reset to Theme')}
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* Top-Left Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-tl" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">{t('control.topLeft', 'Top-Left')}</label>
            <div className="relative group">
              <input
                id="eye-color-tl"
                type="color"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={localProject.design?.eyeColorTopLeft || localProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorTopLeft', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {localProject.design?.eyeColorTopLeft ? localProject.design.eyeColorTopLeft : t('control.inherited', 'Inherited')}
            </span>
          </div>

          {/* Top-Right Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-tr" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">{t('control.topRight', 'Top-Right')}</label>
            <div className="relative group">
              <input
                id="eye-color-tr"
                type="color"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={localProject.design?.eyeColorTopRight || localProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorTopRight', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {localProject.design?.eyeColorTopRight ? localProject.design.eyeColorTopRight : t('control.inherited', 'Inherited')}
            </span>
          </div>

          {/* Bottom-Left Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-bl" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">{t('control.bottomLeft', 'Bottom-Left')}</label>
            <div className="relative group">
              <input
                id="eye-color-bl"
                type="color"
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={localProject.design?.eyeColorBottomLeft || localProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorBottomLeft', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {localProject.design?.eyeColorBottomLeft ? localProject.design.eyeColorBottomLeft : t('control.inherited', 'Inherited')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Advanced Settings Collapsible Accordion */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4.5 h-4.5 text-indigo-600 animate-spin-slow" />
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-wider uppercase block">
                {t('control.advancedSettings', 'Advanced QR Engine Settings')}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                {t('control.advancedSettingsDesc', 'Configure error correction level, quiet zone, and density spacing.')}
              </span>
            </div>
          </div>
          {isAdvancedOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/15 space-y-5 animate-in slide-in-from-top-2 duration-200">
            {/* Smart Optimization Engine */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">{t('control.smartOptimization', 'Smart Optimization')}</span>
                    <span className="text-[10px] text-slate-500 block">{t('control.smartOptDesc', 'Auto-balances error correction & module spacing.')}</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle Smart Optimization"
                  aria-checked={localProject.design?.smartOptimize ? "true" : "false"}
                  onClick={() => {
                    const isEnabling = !localProject.design?.smartOptimize;
                    onChange({
                      ...localProject,
                      design: {
                        ...(localProject.design || {
                          fgColor: '#0f172a',
                          bgColor: '#ffffff',
                          gradientType: 'none',
                          gradientColor: '#4f46e5',
                          dotStyle: 'square',
                          eyeStyle: 'square',
                          margin: 20
                        }),
                        smartOptimize: isEnabling,
                        ...(isEnabling ? {
                          margin: Math.max(20, localProject.design?.margin ?? 20),
                        } : {})
                      }
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${ localProject.design?.smartOptimize ? 'bg-indigo-600' : 'bg-gray-200' }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ localProject.design?.smartOptimize ? 'translate-x-6' : 'translate-x-1' }`}
                  />
                </button>
              </div>

              {localProject.design?.smartOptimize ? (
                <div className="bg-white/60 p-3 rounded-lg border border-indigo-100/50 space-y-2.5 text-slate-700 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{t('control.readabilityActive', 'Readability Engine Active')}</span>
                  </div>
                  
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                      <div>
                        <strong className="text-slate-800">{t('control.errorCorrectionLabel', 'Error Correction:')} </strong>
                        <span className="text-slate-600">
                          {t('control.errorCorrectionLevelDescStart', 'Set to ')}<span className="font-mono font-bold text-indigo-600 bg-indigo-50/50 px-1 rounded">{(localProject.design?.errorCorrectionLevel || 'H')}</span>{t('control.errorCorrectionLevelDescEnd', ' based on centerpiece logo scale & URL complexity.')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                      <div>
                        <strong className="text-slate-800">{t('control.moduleSpacingLabel', 'Module Spacing:')} </strong>
                        <span className="text-slate-600">
                          {t('control.moduleSpacingDescStart', 'Optimized to ')}<span className="font-mono font-bold text-indigo-600 bg-indigo-50/50 px-1 rounded">{(localProject.design?.modulePadding ?? 0)}% padding</span>{t('control.moduleSpacingDescEnd', ' to guarantee camera scanning readability.')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                      <div>
                        <strong className="text-slate-800">{t('control.quietZoneMarginLabel', 'Quiet Zone Margin:')} </strong>
                        <span className="text-slate-600">
                          {t('control.quietZoneMarginDescStart', 'Locked at a safe minimum of ')}<span className="font-mono font-bold text-indigo-600 bg-indigo-50/50 px-1 rounded">{(localProject.design?.margin ?? 20)}px</span>{t('control.quietZoneMarginDescEnd', ' to prevent edge-crop issues.')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 font-medium">
                    {t('control.designParamsNotice', '* Design parameter sliders below are auto-managed. Disable Smart Optimization to adjust them manually.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 pt-1.5 border-t border-slate-100/50">
                  {/* Manual QR Module Spacing slider (visible when smartOptimize is false) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="manual-padding-range" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{t('control.moduleSpacingPadding', 'Module Spacing (Padding)')}</label>
                      <span className="text-[11px] text-indigo-600 font-mono font-bold">{localProject.design?.modulePadding ?? 0}%</span>
                    </div>
                    <input
                      id="manual-padding-range"
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      className="w-full min-h-[44px] h-11 bg-gray-250 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                      value={localProject.design?.modulePadding ?? 0}
                      onChange={e => setDesignField('modulePadding', parseInt(e.target.value, 10), true)}
                    />
                    <span className="text-[9.5px] text-gray-600 block mt-1">
                      {t('control.adjustPhysicalSpace', 'Adjusts the physical space between individual modules to customize dot density.')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/65 pt-4" />

            {/* Margin / Quiet Zone Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-indigo-500" />
                  <label htmlFor="quiet-zone-range" className="text-xs font-semibold text-gray-900 tracking-wider uppercase">{t('control.quietZoneMargin', 'Quiet Zone (Margin)')}</label>
                </div>
                <span className="text-xs text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                  {localProject.design?.margin ?? 20}px
                </span>
              </div>
              <input
                id="quiet-zone-range"
                type="range"
                min="0"
                max="80"
                step="5"
                className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                value={localProject.design?.margin ?? 20}
                onChange={e => setDesignField('margin', parseInt(e.target.value, 10), true)}
              />

              {/* Material Presets Selector */}
              <div className="mt-3.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> {t('control.recommendedMarginByPrint', 'Recommended Margin by Print Material')}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'paperScreens', name: 'Paper & Screens', size: 20, desc: 'Digital or smooth paper' },
                    { id: 'texturedPaper', name: 'Textured Paper', size: 35, desc: 'Kraft, cardboard, textured' },
                    { id: 'glossyMetal', name: 'Glossy & Metal', size: 30, desc: 'Reflective, metallic prints' },
                    { id: 'fabricApparel', name: 'Fabric & Apparel', size: 50, desc: 'Folds, stretchable surfaces' }
                  ].map(preset => {
                    const isActive = (localProject.design?.margin ?? 20) === preset.size;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        id={`quiet-zone-preset-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setDesignField('margin', preset.size, true)}
                        className={`p-1.5 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 shadow-3xs'
                            : 'border-slate-200/60 bg-white/50 text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold truncate pr-1">{t('control.material.' + preset.id, preset.name)}</span>
                          <span className="text-[9px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-1 rounded shrink-0">{preset.size}px</span>
                        </div>
                        <span className="text-[8px] text-slate-400 block truncate leading-tight mt-0.5">{t('control.materialDesc.' + preset.id, preset.desc)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                {t('control.quietZoneDescLong', 'The quiet zone surrounds your code with clean breathing room so scanners can instantly identify pattern edges, especially on textured, glossy, or stretchable physical materials.')}
              </p>
            </div>

            <div className="border-t border-slate-200/65 pt-4" />

            {/* Error Correction Level Dropdown */}
            <div className={`space-y-3 ${ localProject.design?.smartOptimize ? 'opacity-60' : '' }`}>
              <div className="flex justify-between items-center mb-2 relative">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="error-correction-select" className="text-xs font-semibold text-gray-900 tracking-wider uppercase">{t('control.errorCorrectionLevel', 'Error Correction Level')}</label>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onMouseEnter={() => setShowEccTooltip(true)}
                      onMouseLeave={() => setShowEccTooltip(false)}
                      onClick={() => setShowEccTooltip(!showEccTooltip)}
                      onFocus={() => setShowEccTooltip(true)}
                      onBlur={() => setShowEccTooltip(false)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500/50 flex items-center justify-center cursor-pointer"
                      aria-label="Error Correction Level Tradeoffs Info"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    
                    {showEccTooltip && (
                      <div 
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mb-2 w-72 bg-slate-900 text-white text-xs rounded-xl p-4 shadow-xl border border-slate-800 transition-all duration-200"
                      >
                        {(() => {
                          const ec = (localProject.design?.errorCorrectionLevel || 'H') as 'L' | 'M' | 'Q' | 'H';
                          const detail = eccDetails[ec] || eccDetails.H;
                          return (
                            <div className="space-y-3 pointer-events-none">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                <span className="font-bold text-[11px] text-indigo-400 uppercase tracking-wider">
                                  Level {ec}: {detail.title}
                                </span>
                                {localProject.design?.smartOptimize && (
                                  <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    Auto
                                  </span>
                                )}
                              </div>

                              {/* Tradeoff Gauges */}
                              <div className="space-y-2.5">
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                    <span>Scan Reliability</span>
                                    <span className="font-semibold text-slate-200">{detail.damageLabel}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((step) => (
                                      <div
                                        key={step}
                                        className={`h-1.5 flex-1 rounded-sm ${
                                          step <= detail.reliability
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                    <span>Data Capacity</span>
                                    <span className="font-semibold text-slate-205">{detail.capacityLabel}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((step) => (
                                      <div
                                        key={step}
                                        className={`h-1.5 flex-1 rounded-sm ${
                                          step <= detail.capacity
                                            ? 'bg-indigo-500'
                                            : 'bg-slate-800'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
                                {detail.desc}
                              </p>

                              {/* Practical recommendation */}
                              <div className="border-t border-slate-800/80 pt-2 text-[9px] text-slate-400 leading-relaxed">
                                <strong className="text-indigo-300">Recommendation:</strong> {detail.recommendation}
                              </div>
                            </div>
                          );
                        })()}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-3 md:translate-x-0 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-indigo-600 font-mono font-bold">
                  {localProject.design?.errorCorrectionLevel || 'H'}
                  {localProject.design?.smartOptimize && " (Auto)"}
                </span>
              </div>
              
              <div className="space-y-3">
                <select
                  id="error-correction-select"
                  disabled={localProject.design?.smartOptimize}
                  className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:text-slate-400"
                  value={localProject.design?.errorCorrectionLevel || 'H'}
                  onChange={e => {
                    const val = e.target.value as 'L' | 'M' | 'Q' | 'H';
                    setDesignField('errorCorrectionLevel', val);
                  }}
                >
                  <option value="L">{t('control.eccLDesc', 'L (7% Recovery) — Low density, simple pattern')}</option>
                  <option value="M">{t('control.eccMDesc', 'M (15% Recovery) — Medium density, standard balance')}</option>
                  <option value="Q">{t('control.eccQDesc', 'Q (25% Recovery) — Quartile density, high reliability')}</option>
                  <option value="H">{t('control.eccHDesc', 'H (30% Recovery) — High density, best for logos & complexity')}</option>
                </select>
                
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {localProject.design?.smartOptimize 
                    ? t('control.smartOptimizeEccDesc', 'Managed automatically by Smart Optimization to secure optimal recovery budget based on content depth and brand logo.')
                    : (() => {
                        const ec = localProject.design?.errorCorrectionLevel || 'H';
                        if (ec === 'L') return t('control.eccLBudget', 'Low recovery budget. Simplest rendering, but vulnerable to slight scratches/smudges.');
                        if (ec === 'M') return t('control.eccMBudget', 'Medium recovery budget. Standard balanced configuration used across normal scanners.');
                        if (ec === 'Q') return t('control.eccQBudget', 'Quartile recovery budget. Retains scannability even when up to 25% of the print surface is dirty or torn.');
                        return t('control.eccHBudget', 'High recovery budget (Highly Recommended). Perfect for complex, custom QR patterns and centerpiece custom brand logo overlays.');
                      })()}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Brand Logos Custom center overlay */}
      <motion.div
        id="logo-settings-section"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm space-y-3"
      >
        <div className="flex justify-between items-center">
          <label htmlFor="emblem-url-input" className="text-xs font-semibold text-gray-900 tracking-wider uppercase">{t('control.emblemCenterLogo', 'Emblem Center Logo')}</label>
          {localProject.design?.logoUrl && (
            <button
              type="button"
              onClick={clearLogo}
              className="text-[10px] text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
            >
              {t('control.clearEmblem', 'Clear Emblem')}
            </button>
          )}
        </div>

        {/* Text/Emoji custom word input */}
        <div>
          <input
            id="emblem-url-input"
            type="text"
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800 placeholder:text-slate-400"
            placeholder={t('control.placeholder.logoText', 'e.g. Google, QR, or text/emoji')}
            value={localProject.design?.logoUrl || ''}
            onChange={e => {
              setUploadError(null);
              setDesignField('logoUrl', e.target.value, true);
            }}
          />
          <p className="text-[10px] text-gray-600 mt-1">{t('control.logoUrlDesc', 'Accepts short words, emojis, or external secure image URLs.')}</p>
        </div>

        {/* Drag and Drop Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${ isDragging ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white' }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            aria-label="Upload custom center emblem image file"
            className="hidden"
          />
          
          <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`} />
          <div className="text-center">
            <span className="text-xs font-medium text-gray-700 block">
              {t('control.dragDropLogo', 'Drag & drop logo image, or')} <span className="text-indigo-600 font-semibold">{t('control.browse', 'browse')}</span>
            </span>
            <span className="text-[9px] text-gray-400 block mt-0.5">{t('control.logoUploadLimits', 'Supports PNG, JPG, SVG, WebP up to 2MB')}</span>
          </div>
        </div>

        {uploadError && (
          <p className="text-[10px] text-red-500 font-medium mt-1 bg-red-50/50 p-2 rounded-lg border border-red-100">{uploadError}</p>
        )}

        {localProject.design?.logoUrl && (
          <div className="mt-3 space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            {/* Show a small thumbnail preview of the logo */}
            <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                {localProject.design.logoUrl.startsWith('data:image') || localProject.design.logoUrl.startsWith('http') ? (
                  <img
                    src={localProject.design.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span 
                    className="font-bold text-indigo-600 text-center overflow-hidden whitespace-nowrap px-0.5 select-none"
                    dir="auto"
                    style={{ fontSize: `${getEmblemFontSize(localProject.design.logoUrl, 40)}px` }}
                  >
                    {localProject.design.logoUrl}
                  </span>
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-gray-800 block truncate">
                  {localProject.design.logoUrl.startsWith('data:image') 
                    ? t('control.uploadedBase64Emblem', 'Uploaded Base64 Emblem Image') 
                    : localProject.design.logoUrl.startsWith('http') 
                      ? t('control.externalImageUrl', 'External Image URL') 
                      : t('control.textEmblemLabel', 'Text Emblem: "{logoUrl}"', { logoUrl: localProject.design.logoUrl })}
                </span>
                <span className="text-[9px] font-mono text-gray-400 block truncate max-w-[180px]">
                  {localProject.design.logoUrl}
                </span>
              </div>
            </div>

            {/* Logo Rotation Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="logo-rotation-range" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{t('control.logoRotationLabel', 'Logo Rotation')}</label>
                <span className="text-[11px] text-indigo-600 font-mono font-bold">{localProject.design?.logoRotation ?? 0}°</span>
              </div>
              <input
                id="logo-rotation-range"
                type="range"
                min="0"
                max="360"
                step="5"
                className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                value={localProject.design?.logoRotation ?? 0}
                onChange={e => setDesignField('logoRotation', parseInt(e.target.value, 10), true)}
              />
            </div>

            {/* Logo Scale Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="logo-scale-range" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{t('control.logoScaleLabel', 'Logo Size / Scale')}</label>
                <span className="text-[11px] text-indigo-600 font-mono font-bold">{Math.round((localProject.design?.logoScale ?? 0.18) * 100)}%</span>
              </div>
              <input
                id="logo-scale-range"
                type="range"
                min="0.05"
                max="0.30"
                step="0.01"
                className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-manipulation"
                value={localProject.design?.logoScale ?? 0.18}
                onChange={e => setDesignField('logoScale', parseFloat(e.target.value), true)}
              />
            </div>

            {/* Logo Positioning & Auto-Center Toggle */}
            <div className="pt-3 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <span id="logo-autocenter-label" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block">{t('control.logoAutoCenterLabel', 'Auto-Center Position')}</span>
                  <p className="text-[9px] text-gray-600 leading-normal mt-0.5 max-w-[190px]">
                    {t('control.autoCenterDesc', 'Maintains the correct offset relative to the finder eye frames automatically.')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-labelledby="logo-autocenter-label"
                  aria-checked={localProject.design?.logoAutoCenter !== false ? "true" : "false"}
                  onClick={() => setDesignField('logoAutoCenter', localProject.design?.logoAutoCenter === false)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${ localProject.design?.logoAutoCenter !== false ? 'bg-indigo-600' : 'bg-gray-300' }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ localProject.design?.logoAutoCenter !== false ? 'translate-x-4.5' : 'translate-x-1' }`}
                  />
                </button>
              </div>

              {/* Real-time Visual Alignment Preview Box */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-900 uppercase tracking-wider">
                  <span>{t('control.alignmentTitle', 'Alignment Simulator Preview')}</span>
                  <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded cursor-default select-none">{t('control.liveViewport', 'Live viewport')}</span>
                </div>
                
                <div className="flex items-center gap-3.5">
                  {/* Miniature QR mock representation */}
                  <div className="relative w-28 h-28 bg-white border border-slate-200/80 rounded-lg p-2 flex items-center justify-center overflow-hidden shadow-inner group cursor-help shrink-0">
                    {/* Grid of background dots to visually simulate QR bits */}
                    <div className="absolute inset-2 grid grid-cols-7 grid-rows-7 gap-1 opacity-[0.05] select-none pointer-events-none">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} className="bg-slate-900 rounded-xs" />
                      ))}
                    </div>

                    {/* Left & Right Crosshair Axis lines for clear visualization on hover */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 group-hover:opacity-70 transition-opacity duration-200">
                      <div className="w-full h-[0.5px] border-b border-dashed border-indigo-400" />
                      <div className="absolute h-full w-[0.5px] border-l border-dashed border-indigo-400" />
                    </div>

                    {/* Corner Finder Eyes */}
                    {/* Top-Left */}
                    <div className="absolute top-1.5 left-1.5 w-6 h-6 border-2 border-slate-800 rounded-[5px] p-0.5 flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-[1.5px]" />
                    </div>
                    {/* Top-Right */}
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 border-2 border-slate-800 rounded-[5px] p-0.5 flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-[1.5px]" />
                    </div>
                    {/* Bottom-Left */}
                    <div className="absolute bottom-1.5 left-1.5 w-6 h-6 border-2 border-slate-800 rounded-[5px] p-0.5 flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 bg-slate-800 rounded-[1.5px]" />
                    </div>

                    {/* Logo Representative Marker */}
                    {localProject.design?.logoUrl && (
                      <motion.div
                        className="absolute flex items-center justify-center shadow-md bg-white border border-slate-100 z-10 p-0.5"
                        animate={{
                          x: localProject.design?.logoAutoCenter !== false 
                            ? calculateAutoCenterOffsets().offsetX * (112 / 450)
                            : (localProject.design?.logoOffsetX ?? 0) * (112 / 450),
                          y: localProject.design?.logoAutoCenter !== false 
                            ? calculateAutoCenterOffsets().offsetY * (112 / 450)
                            : (localProject.design?.logoOffsetY ?? 0) * (112 / 450),
                          rotate: localProject.design?.logoRotation ?? 0,
                          scale: (localProject.design?.logoScale ?? 0.18) / 0.18
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        style={{
                          width: `${112 * (localProject.design?.logoScale ?? 0.18)}px`,
                          height: `${112 * (localProject.design?.logoScale ?? 0.18)}px`,
                          borderRadius: `${Math.max(2, 112 * (localProject.design?.logoScale ?? 0.18) * 0.22)}px`
                        }}
                      >
                        {(() => {
                          const logoUrl = localProject.design?.logoUrl || '';
                          const isImg = logoUrl.startsWith('http') || logoUrl.startsWith('data:image');
                          if (isImg) {
                            return (
                              <img 
                                src={logoUrl} 
                                alt="Logo mini preview" 
                                className="w-full h-full object-contain"
                                style={{ borderRadius: '1.5px' }}
                                referrerPolicy="no-referrer"
                              />
                            );
                          } else {
                            const miniSizePx = 112 * (localProject.design?.logoScale ?? 0.18);
                            const calculatedFontSize = getEmblemFontSize(logoUrl, miniSizePx);
                            return (
                              <div 
                                className="w-full h-full flex items-center justify-center font-bold text-white bg-indigo-650 rounded-[1.5px] overflow-hidden whitespace-nowrap text-center px-0.5 select-none"
                                dir="auto"
                                style={{ fontSize: `${calculatedFontSize}px`, lineHeight: 1 }}
                              >
                                {logoUrl}
                              </div>
                            );
                          }
                        })()}
                      </motion.div>
                    )}
                  </div>

                  {/* Alignment description or status helper */}
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-slate-800 block">
                      {localProject.design?.logoAutoCenter !== false ? t('control.opticalAutoBalanced', '✨ Optical Auto-Balanced') : t('control.manuallyAdjusted', '🔧 Manually Adjusted')}
                    </span>
                    <p className="text-[8.5px] text-slate-500 leading-normal">
                      {localProject.design?.logoAutoCenter !== false 
                        ? t('control.logoAutoCenterDescription', 'Logo shifted slightly top-left to achieve visual symmetry with asymmetric finder pattern count.') 
                        : t('control.logoManualOffsetDescription', 'Custom offset coordinates applied over the physical grid coordinate origin.')}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
                      <span>{t('control.alignmentHover', 'Hover grid to show alignment guides')}</span>
                    </div>
                  </div>
                </div>
              </div>

                           {/* Conditionally show Manual Offset controls when Auto-Center is disabled or show dynamic calculation when active */}
              {localProject.design?.logoAutoCenter !== false ? (
                <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl space-y-2 text-slate-700 animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">{t('control.weightBalancing', 'Automatic Weight Balancing')}</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-indigo-50/50 flex flex-col justify-center">
                      <span className="text-slate-500 text-[8.5px]">{t('control.offsetX', 'Offset X (Horizontal)')}</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        +{calculateAutoCenterOffsets().offsetX} px
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-indigo-50/50 flex flex-col justify-center">
                      <span className="text-slate-500 text-[8.5px]">{t('control.offsetY', 'Offset Y (Vertical)')}</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        +{calculateAutoCenterOffsets().offsetY} px
                      </span>
                    </div>
                  </div>
                  <p className="text-[8.5px] text-slate-500 leading-normal mt-1">
                    {t('control.autoCenterOffsetFormulaDesc', 'Balanced calculated offset accounts for standard QR Code eye pattern asymmetry ({modulesCount}x{modulesCount} grid), automatically shifting the centerpiece slightly top-left by 4% of eye footprint size to ensure absolute visual/optical balance.', { modulesCount: calculateAutoCenterOffsets().modulesCount })}
                  </p>
                </div>
              ) : (
                <div className="mt-3.5 p-3 bg-white border border-gray-250/60 rounded-xl space-y-3 shadow-2xs animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">{t('control.manualFineTuning', 'Manual Center Fine-Tuning')}</span>
                  
                  {/* Manual X Offset slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="logo-offset-x" className="text-[9px] font-semibold text-gray-950 uppercase tracking-wider">{t('control.offsetX', 'Offset X (Horizontal)')}</label>
                      <span className="text-[10px] text-slate-700 font-mono font-bold">
                        {(localProject.design?.logoOffsetX ?? 0) > 0 ? `+${localProject.design?.logoOffsetX ?? 0}` : localProject.design?.logoOffsetX ?? 0} px
                      </span>
                    </div>
                    <input
                      id="logo-offset-x"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-700 touch-manipulation"
                      value={localProject.design?.logoOffsetX ?? 0}
                      onChange={e => setDesignField('logoOffsetX', parseInt(e.target.value, 10), true)}
                    />
                  </div>

                  {/* Manual Y Offset slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="logo-offset-y" className="text-[9px] font-semibold text-gray-950 uppercase tracking-wider">{t('control.offsetY', 'Offset Y (Vertical)')}</label>
                      <span className="text-[10px] text-slate-700 font-mono font-bold">
                        {(localProject.design?.logoOffsetY ?? 0) > 0 ? `+${localProject.design?.logoOffsetY ?? 0}` : localProject.design?.logoOffsetY ?? 0} px
                      </span>
                    </div>
                    <input
                      id="logo-offset-y"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      className="w-full min-h-[44px] h-11 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-700 touch-manipulation"
                      value={localProject.design?.logoOffsetY ?? 0}
                      onChange={e => setDesignField('logoOffsetY', parseInt(e.target.value, 10), true)}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                    <p className="text-[8.5px] leading-relaxed text-slate-500 font-medium">
                      {t('control.manualShiftLogoDesc', 'Manually shift logo placement in pixels relative to the physical center.')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Subtle Color-Shift Animation Selector */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(16, 185, 129, 0.06), 0 2px 6px -4px rgba(16, 185, 129, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex items-center justify-between bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/30 transition-all duration-300"
      >
        <div>
          <span className="text-xs font-semibold text-emerald-950 block">{t('control.animateColorShift', 'Animate Color Shift')}</span>
          <span className="text-[10px] text-emerald-700 block">{t('control.colorShiftDesc', 'Gradually transitions the QR pattern colors over time using Framer Motion.')}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-label="Toggle pattern color shift animation"
          aria-checked={localProject.design?.colorShift ? "true" : "false"}
          onClick={() => setDesignField('colorShift', !localProject.design?.colorShift)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${ localProject.design?.colorShift ? 'bg-emerald-600' : 'bg-gray-200 ' }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ localProject.design?.colorShift ? 'translate-x-6' : 'translate-x-1' }`}
          />
        </button>
      </motion.div>

      {/* Analytics Tracking Flag toggle */}
      <motion.div
        id="tour-analytics-toggle"
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(79, 70, 229, 0.06), 0 2px 6px -4px rgba(79, 70, 229, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 transition-all duration-300"
      >
        <div>
          <span className="text-xs font-semibold text-indigo-950 block">{t('control.enableShortUrl', 'Enable Short URL & Analytics')}</span>
          <span className="text-[10px] text-indigo-700 block">{t('control.shortUrlDesc', 'Collects visitor scan location, hardware, and browser logs.')}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-label="Toggle short URL and analytics tracking"
          aria-checked={localProject.trackingEnabled ? "true" : "false"}
          onClick={() => onChange({ ...localProject, trackingEnabled: !localProject.trackingEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${ localProject.trackingEnabled ? 'bg-indigo-600' : 'bg-gray-200 ' }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ localProject.trackingEnabled ? 'translate-x-6' : 'translate-x-1' }`}
          />
        </button>
      </motion.div>

      {/* Dynamic Expiry Date & Redirection Settings */}
      <motion.div
        id="tour-link-expiration"
        variants={itemVariants}
        className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-semibold text-gray-900">{t('control.linkExpiration', 'Optional Link Expiration')}</span>
        </div>

        <p className="text-[10px] text-gray-600 leading-normal">
          {t('control.linkExpirationDescLong', 'Deactivate this QR code on a specific date. Once expired, visitors will see a custom message or be sent to an alternate URL.')}
        </p>

        {/* Expiry Enabled / Date Customizer */}
        <div className="space-y-1.5">
          <label htmlFor="expiry-date-input" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block">
            {t('control.expirationDateTime', 'Expiration Date & Time')}
          </label>
          <div className="flex gap-2">
            <input
              id="expiry-date-input"
              type="datetime-local"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={localProject.expiryDate ? localProject.expiryDate.substring(0, 16) : ''}
              onChange={(e) => {
                const dateVal = e.target.value;
                if (dateVal) {
                  // Ensure tracking is enabled so redirect works
                  onChange({
                    ...localProject,
                    expiryDate: new Date(dateVal).toISOString(),
                    trackingEnabled: true
                  });
                } else {
                  onChange({
                    ...localProject,
                    expiryDate: undefined
                  });
                }
              }}
            />
            {localProject.expiryDate && (
              <button
                type="button"
                onClick={() => onChange({
                  ...localProject,
                  expiryDate: undefined
                })}
                className="px-2.5 py-2 text-xs font-semibold text-red-600 bg-red-100/35 hover:bg-red-100 rounded-xl transition cursor-pointer"
              >
                {t('control.clear', 'Clear')}
              </button>
            )}
          </div>
        </div>

        {localProject.expiryDate && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Auto-Enable Tracking Warning */}
            {!localProject.trackingEnabled && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 flex items-start gap-2">
                <span className="font-bold">{t('control.warning', '⚠️ Warning:')}</span>
                <span>
                  {t('control.expiryTrackingWarningStart', 'Dynamic Link is currently disabled. Link Expiration requires enabling ')}<strong>{t('control.shortUrlAnalyticsLabel', 'Short URL & Analytics')}</strong>{t('control.expiryTrackingWarningEnd', ' to function properly.')}
                </span>
              </div>
            )}

            {/* Redirect Action Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block">
                {t('control.postExpirationAction', 'Post-Expiration Action')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...localProject, expiryRedirectType: 'message' })}
                  className={`py-2 px-3 text-center text-[10px] sm:text-xs font-medium rounded-xl border transition-all cursor-pointer ${ (localProject.expiryRedirectType || 'message') === 'message' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' }`}
                >
                  {t('control.customMessage', 'custom message')}
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...localProject, expiryRedirectType: 'url' })}
                  className={`py-2 px-3 text-center text-[10px] sm:text-xs font-medium rounded-xl border transition-all cursor-pointer ${ localProject.expiryRedirectType === 'url' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' }`}
                >
                  {t('control.differentUrl', 'different url')}
                </button>
              </div>
            </div>

            {/* Dynamic input depending on choice */}
            {(localProject.expiryRedirectType || 'message') === 'message' ? (
              <div className="space-y-1.5">
                <label htmlFor="expiry-message-textarea" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block">
                  {t('control.customMessageText', 'Custom Message text')}
                </label>
                <textarea
                  id="expiry-message-textarea"
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={t('control.placeholder.expiryMessage', 'e.g., This QR code has reached its designated expiration date and is no longer active.')}
                  value={localProject.expiryMessage || ''}
                  onChange={(e) => onChange({ ...localProject, expiryMessage: e.target.value }, true)}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="expiry-redirect-url-input" className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block">
                  {t('control.fallbackDestinationUrl', 'Fallback Destination URL')}
                </label>
                <input
                  id="expiry-redirect-url-input"
                  type="url"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={t('control.placeholder.expiryUrl', 'e.g., https://yoursite.com/new-dest')}
                  value={localProject.expiryRedirectUrl || ''}
                  onChange={(e) => onChange({ ...localProject, expiryRedirectUrl: e.target.value }, true)}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Folder / Category Selection */}
      <motion.div
        id="tour-folder-category"
        variants={itemVariants}
        className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-950">{t('control.folderCategory', 'Folder / Category')}</span>
        </div>

        <p className="text-[10px] text-slate-600 leading-normal">
          {t('control.organizeCategoryDescStart', 'Organize your QR designs in categories to keep your workspace structured (e.g., ')}<em className="not-italic font-medium text-slate-700">{t('control.organizeCategoryDescSample', 'Client A, Marketing, Personal')}</em>{t('control.organizeCategoryDescEnd', ').')}
        </p>

        <div className="space-y-2">
          {/* Text Input */}
          <input
            type="text"
            aria-label="Folder or Category"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('control.placeholder.folder', 'Type or select folders (e.g. Marketing)')}
            value={localProject.category || ''}
            onChange={(e) => onChange({ ...localProject, category: e.target.value }, true)}
            maxLength={40}
          />

          {/* Preset / Existing Suggestions */}
          {(() => {
            const DEFAULT_SUGGESTIONS = ['Client A', 'Marketing', 'Personal'];
            const existing = (projects || [])
              .map(p => ((val) => (val || '').trim())(p.category))
              .filter(Boolean) as string[];
            const suggestions = Array.from(new Set([...DEFAULT_SUGGESTIONS, ...existing])).slice(0, 8);

            return suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((sug) => {
                  const isSelected = (((val) => (val || '').trim())(localProject.category ?? "")).toLowerCase() === (((val) => (val || '').trim())(sug ?? "")).toLowerCase();
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => onChange({ 
                        ...localProject, 
                        category: isSelected ? '' : sug 
                      })}
                      className={`text-[9px] font-medium px-2.5 py-1 rounded-full transition cursor-pointer select-none ${ isSelected ? 'bg-indigo-600 text-white font-semibold' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }`}
                    >
                      {sug === 'Client A' ? t('control.category.clientA', 'Client A') : sug === 'Marketing' ? t('control.category.marketing', 'Marketing') : sug === 'Personal' ? t('control.category.personal', 'Personal') : sug}
                    </button>
                  );
                })}
              </div>
            ) : null;
          })()}
        </div>
      </motion.div>

      {/* Storage persistence Save Button */}
      <motion.div id="tour-save-button" variants={itemVariants}>
        <button
          type="button"
          disabled={isSaving || !localProject.name || isUrlInvalid}
          onClick={onSave}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{t('control.saveDesign', 'Save Design to Cloud')}</span>
              <kbd className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-indigo-950 text-indigo-100 border border-indigo-500/30 rounded font-mono font-bold select-none tracking-normal uppercase">Ctrl+S</kbd>
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
