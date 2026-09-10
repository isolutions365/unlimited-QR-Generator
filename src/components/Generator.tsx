import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Link2, Wifi, Contact, Mail, AlignLeft, MessageSquare, Phone, UploadCloud, 
  Paintbrush, ShieldCheck, Sparkles, Check, AlertCircle, RefreshCw, X, Image as ImageIcon,
  Sun, Moon, Globe, QrCode
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { QRProject, FrameStyle } from '../types';
import { 
  formatAndValidateURL, 
  formatAndValidateWifi, 
  formatAndValidateVCard, 
  formatAndValidateEmail, 
  formatAndValidateSMS, 
  formatAndValidateWhatsApp,
  validateLogoFile,
  fileToBase64,
  WifiData,
  VCardData,
  EmailData,
  SMSData,
  WhatsAppData
} from '../utils/qrUtils';
import PreviewCard, { PreviewCardHandle } from './PreviewCard';
import FaqSection from './FaqSection';

export type ActiveTab = 'url' | 'wifi' | 'vcard' | 'email' | 'text' | 'sms' | 'whatsapp';

interface GeneratorProps {
  initialProject?: Partial<QRProject>;
  onProjectChange?: (project: Partial<QRProject>) => void;
  className?: string;
}

export default function Generator({ initialProject, onProjectChange, className = '' }: GeneratorProps) {
  const { t } = useTranslation();
  const previewRef = useRef<PreviewCardHandle | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('url');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Form Inputs
  const [urlInput, setUrlInput] = useState('https://www.freeqrbarcodes.com');
  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [vcardData, setVcardData] = useState<VCardData>({ firstName: '', lastName: '', organization: '', title: '', phone: '', email: '', website: '', address: '' });
  const [emailData, setEmailData] = useState<EmailData>({ email: '', subject: '', body: '' });
  const [textInput, setTextInput] = useState('');
  const [smsData, setSmsData] = useState<SMSData>({ phone: '', message: '' });
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppData>({ phone: '', message: '' });

  // Design Customization State
  const [fgColor, setFgColor] = useState(initialProject?.fgColor || '#0f172a');
  const [bgColor, setBgColor] = useState(initialProject?.bgColor || '#ffffff');
  const [gradientType, setGradientType] = useState<'none' | 'linear' | 'radial'>(initialProject?.gradientType || 'none');
  const [gradientColor, setGradientColor] = useState(initialProject?.gradientColor || '#4f46e5');
  const [dotStyle, setDotStyle] = useState<'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond'>(initialProject?.dotStyle || 'square');
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'circle' | 'leaf'>(initialProject?.eyeStyle || 'square');
  
  // Logo State
  const [logoUrl, setLogoUrl] = useState<string>(initialProject?.logoUrl || '');
  const [logoError, setLogoError] = useState<string | null>(null);

  // Frame State
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(initialProject?.frameStyle || 'none');
  const [frameText, setFrameText] = useState<string>(initialProject?.frameText || 'SCAN ME');

  // Input Validation Error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Derive QR content based on active tab and format using qrUtils
  const { content, isValid, error, errorCorrectionLevel } = useMemo(() => {
    let result = { formattedContent: '', isValid: true, error: undefined as string | undefined, recommendedECC: 'Q' as 'L' | 'M' | 'Q' | 'H' };

    if (activeTab === 'url') {
      const res = formatAndValidateURL(urlInput);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    } else if (activeTab === 'wifi') {
      const res = formatAndValidateWifi(wifiData);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    } else if (activeTab === 'vcard') {
      const res = formatAndValidateVCard(vcardData);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    } else if (activeTab === 'email') {
      const res = formatAndValidateEmail(emailData);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    } else if (activeTab === 'text') {
      result.formattedContent = textInput.trim() || 'Sample Text Payload';
      result.isValid = true;
    } else if (activeTab === 'sms') {
      const res = formatAndValidateSMS(smsData);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    } else if (activeTab === 'whatsapp') {
      const res = formatAndValidateWhatsApp(whatsAppData);
      result.formattedContent = res.formatted;
      result.isValid = res.isValid;
      result.error = res.error;
    }

    // Always use High ECC ('H') if logo attached to guarantee 30% error recovery
    const ecc: 'L' | 'M' | 'Q' | 'H' = logoUrl ? 'H' : 'Q';

    return {
      content: result.formattedContent || 'https://www.freeqrbarcodes.com',
      isValid: result.isValid,
      error: result.error,
      errorCorrectionLevel: ecc
    };
  }, [activeTab, urlInput, wifiData, vcardData, emailData, textInput, smsData, whatsAppData, logoUrl]);

  // Construct current project payload
  const currentProjectPayload: Partial<QRProject> = useMemo(() => {
    return {
      content,
      fgColor,
      bgColor,
      gradientType,
      gradientColor,
      dotStyle,
      eyeStyle,
      logoUrl,
      frameStyle,
      frameText,
      errorCorrectionLevel,
      logoAutoCenter: true
    };
  }, [content, fgColor, bgColor, gradientType, gradientColor, dotStyle, eyeStyle, logoUrl, frameStyle, frameText, errorCorrectionLevel]);

  // Notify parent on project change
  useEffect(() => {
    if (onProjectChange) {
      onProjectChange(currentProjectPayload);
    }
  }, [currentProjectPayload, onProjectChange]);

  // Handle Logo Upload with 2MB validation
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    const val = validateLogoFile(file);
    if (!val.isValid) {
      setLogoError(val.error || 'Invalid logo file');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setLogoUrl(base64);
    } catch (err) {
      console.error('[Generator] Logo reading error:', err);
      setLogoError('Failed to process image file');
    }
  };

  // WebApplication and SoftwareApplication JSON-LD Schemas
  const appSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Free QR & Barcode Generator',
      'url': 'https://www.freeqrbarcodes.com',
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'All',
      'browserRequirements': 'Requires JavaScript and HTML5 Canvas',
      'description': 'Free online enterprise QR code and barcode generator supporting high-DPI vector exports, logo embedding, vCard, Wi-Fi, and custom branding with zero expiration.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      'name': 'FreeQRBarcodes Engine',
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'Web Browser',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      }
    }
  ];

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 ${isDarkMode ? 'dark' : ''} ${className}`}>
      
      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Control Panel & Generator Engine (8 Cols Desktop) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Header & Theme Control */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 mb-1">
                <Sparkles className="w-3 h-3" /> Enterprise Engine 4.0
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Free QR & Barcode Generator
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          {/* Type Selection Tabs */}
          <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1">
              {[
                { id: 'url', label: t('control.type.url', 'URL / Web'), icon: Link2 },
                { id: 'wifi', label: t('control.type.wifi', 'Wi-Fi Network'), icon: Wifi },
                { id: 'vcard', label: t('control.tab.vcard', 'Digital vCard'), icon: Contact },
                { id: 'email', label: t('control.type.email', 'Email'), icon: Mail },
                { id: 'text', label: t('control.plainText', 'Plain Text'), icon: AlignLeft },
                { id: 'sms', label: t('control.type.sms', 'SMS Message'), icon: MessageSquare },
                { id: 'whatsapp', label: t('control.type.social', 'WhatsApp'), icon: Phone }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Form Inputs */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-4">
            
            {/* URL Input Form */}
            {activeTab === 'url' && (
              <div className="space-y-2">
                <label htmlFor="gen-target-url-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  {t('control.targetWebsiteUrl', 'Target Website URL')}
                </label>
                <div className="relative">
                  <Link2 className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="gen-target-url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 ps-10 pe-4 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('control.fixAddHttps', 'Auto-prepends https:// if missing.')}
                </p>
              </div>
            )}

            {/* Wi-Fi Input Form */}
            {activeTab === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gen-ssid-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                      {t('control.label.ssid', 'Network Name (SSID) *')}
                    </label>
                    <input
                      id="gen-ssid-input"
                      type="text"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      placeholder={t('control.placeholder.ssid', 'e.g. MyOffice_5G')}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="gen-encryption-select" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                      {t('control.label.security', 'Encryption Security')}
                    </label>
                    <select
                      id="gen-encryption-select"
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="WPA">{t('generator.wifi_wpa', 'WPA / WPA2 / WPA3 (Recommended)')}</option>
                      <option value="WEP">{t('generator.wifi_wep', 'WEP')}</option>
                      <option value="nopass">{t('generator.wifi_open', 'Unencrypted (Open Network)')}</option>
                    </select>
                  </div>
                </div>

                {wifiData.encryption !== 'nopass' && (
                  <div>
                    <label htmlFor="gen-wifi-password-input" className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
                      {t('control.label.password', 'Wi-Fi Password')}
                    </label>
                    <input
                      id="gen-wifi-password-input"
                      type="password"
                      value={wifiData.password || ''}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                      placeholder={t('control.placeholder.password', 'Enter network password')}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={wifiData.hidden || false}
                    onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('generator.wifi_hidden', 'Hidden Wi-Fi SSID Network')}
                  </span>
                </label>
              </div>
            )}

            {/* vCard Form */}
            {activeTab === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t('generator.vcard_first_name', 'First Name *')}
                    value={vcardData.firstName}
                    onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('generator.vcard_last_name', 'Last Name')}
                    value={vcardData.lastName}
                    onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t('control.label.vcardOrg', 'Organization / Company')}
                    value={vcardData.organization}
                    onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t('generator.vcard_title', 'Job Title / Position')}
                    value={vcardData.title}
                    onChange={(e) => setVcardData({ ...vcardData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder={t('control.label.vcardPhone', 'Phone Number (e.g. +1234567890)')}
                    value={vcardData.phone}
                    onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder={t('control.label.vcardEmail', 'Email Address')}
                    value={vcardData.email}
                    onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Email Form */}
            {activeTab === 'email' && (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder={t('generator.email_recipient', 'Recipient Email *')}
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder={t('generator.email_subject', 'Subject Line')}
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
                <textarea
                  rows={3}
                  placeholder={t('generator.email_body', 'Email Message Body...')}
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Text Form */}
            {activeTab === 'text' && (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder={t('control.placeholder.rawText', 'Type plain text message, note, or code payload...')}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* SMS Form */}
            {activeTab === 'sms' && (
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder={t('control.phoneNumberLabel', 'Phone Number *')}
                  value={smsData.phone}
                  onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
                <textarea
                  rows={2}
                  placeholder={t('control.smsText', 'SMS Message Text')}
                  value={smsData.message}
                  onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* WhatsApp Form */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder={t('generator.whatsapp_phone', 'WhatsApp Number with Country Code (e.g. +14155552671) *')}
                  value={whatsAppData.phone}
                  onChange={(e) => setWhatsAppData({ ...whatsAppData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
                <textarea
                  rows={2}
                  placeholder={t('control.prefilledMessage', 'Pre-filled Message Text')}
                  value={whatsAppData.message}
                  onChange={(e) => setWhatsAppData({ ...whatsAppData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Validation Error Banner */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Design Controls Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <Paintbrush className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('control.customizeTitle', 'Design & Brand Styling')}
              </h3>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="gen-fg-color-picker" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('generator.fg_color', 'Foreground Color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="gen-fg-color-picker"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gen-bg-color-picker" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('generator.bg_color', 'Background Color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="gen-bg-color-picker"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dot & Eye Pattern Styles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="gen-matrix-style-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('control.label.dotStyle', 'Matrix Pattern Style')}
                </label>
                <select
                  id="gen-matrix-style-select"
                  value={dotStyle}
                  onChange={(e) => setDotStyle(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="square">{t('control.standardSquare', 'Standard Square')}</option>
                  <option value="rounded">{t('control.smoothRounded', 'Smooth Rounded')}</option>
                  <option value="dots">{t('control.circularDots', 'Circular Dots')}</option>
                  <option value="leaf">{t('control.elegantLeaf', 'Organic Leaf')}</option>
                  <option value="diamond">{t('control.diamondShape', 'Crisp Diamond')}</option>
                  <option value="classy">{t('control.classyStarbursts', 'Classy Starburst')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="gen-eye-style-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('control.label.eyeStyle', 'Corner Eye Pattern')}
                </label>
                <select
                  id="gen-eye-style-select"
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="square">{t('control.eyeStyleSquare', 'Square Finder')}</option>
                  <option value="rounded">{t('control.eyeStyleRounded', 'Rounded Finder')}</option>
                  <option value="circle">{t('control.eyeStyleCircle', 'Circle Finder')}</option>
                  <option value="leaf">{t('control.eyeStyleLeaf', 'Leaf organic')}</option>
                </select>
              </div>
            </div>

            {/* Logo Upload with 2MB validation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t('control.logoTitle', 'Center Brand Emblem / Logo (Max 2MB)')}
              </label>

              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  <span>{t('control.logoUploadBtn', 'Upload Logo (.png, .jpg, .svg)')}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {logoError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{logoError}</p>
              )}

              {logoUrl && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('control.eccHBudget', 'High Error Correction Level (H) automatically enabled for 100% camera readability.')}
                </p>
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Live Preview (4 Cols Desktop) */}
        <div className="lg:col-span-4">
          <PreviewCard
            ref={previewRef}
            project={currentProjectPayload}
            onRefresh={() => {}}
          />
        </div>

      </div>

      {/* FAQ & Knowledge Base Section */}
      <FaqSection className="mt-12" />

    </div>
  );
}
