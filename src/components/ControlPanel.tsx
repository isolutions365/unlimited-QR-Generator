import React, { useState, useRef } from 'react';
import { QRProject } from '../types';
import { Link2, AlignLeft, Wifi, Mail, ScanFace, Sparkles, Check, UploadCloud, Phone, MessageSquare, Share2, Coins, MapPin, Calendar, Folder } from 'lucide-react';
import { motion } from 'motion/react';
import ColorPalette from './ColorPalette';
import AICoPilot from './AICoPilot';
import qrcode from 'qrcode';

interface ControlPanelProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onSave: () => void;
  isSaving: boolean;
  userEmail?: string | null;
  projects?: QRProject[];
}

export default function ControlPanel({
  currentProject,
  onChange,
  onSave,
  isSaving,
  userEmail,
  projects = []
}: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAutoCenterOffsets = () => {
    const errorCorrectionLevel = currentProject.design?.errorCorrectionLevel || 'H';
    const margin = typeof currentProject.design?.margin === 'number' ? currentProject.design?.margin : 20;
    const qrContent = currentProject.content || 'https://google.com';
    const trackingEnabled = currentProject.trackingEnabled || false;
    const trackingId = currentProject.trackingId || '';
    const appUrl = (window as any).location?.origin || '';
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
      setUploadError('Only image files (PNG, JPG, SVG, WebP, etc.) are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size is too large (max 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDesignField('logoUrl', event.target.result as string);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the file.');
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

  const setDesignField = (field: string, value: any) => {
    onChange({
      ...currentProject,
      design: {
        ...(currentProject.design || {
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
    } as Partial<QRProject>);
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
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6"
    >
      {/* Scope Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Customize Your QR Code
        </h2>
        <p className="text-xs text-gray-500 mt-1">Configure type, contents, custom styles, and centerpiece tags.</p>
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
        <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block mb-3">QR Code Type</label>
        <div className="grid grid-cols-5 gap-2">
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
              { id: 'crypto', icon: Coins, label: 'Crypto', color: 'text-amber-500' },
              { id: 'geo', icon: MapPin, label: 'Location', color: 'text-cyan-500' }
            ] as const
          ).map(type => {
            const Icon = type.icon;
            const isSelected = currentProject.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                className={`relative group py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onChange({ ...currentProject, type: type.id })}
              >
                {/* Circular radio/selection indicator */}
                <span 
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full border transition-all ${
                    isSelected 
                      ? 'border-white bg-white scale-110 shadow-xs' 
                      : 'border-slate-350 bg-white group-hover:border-slate-450'
                  }`} 
                />

                <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-white' : type.color}`} />
                <span className="text-[10px] font-medium">{type.label}</span>
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
          <label htmlFor="project-name-input" className="block text-xs font-semibold text-slate-800 mb-1">Project Name</label>
          <input
            id="project-name-input"
            type="text"
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            placeholder="e.g. My Website QR"
            value={currentProject.name || ''}
            onChange={e => onChange({ ...currentProject, name: e.target.value })}
          />
        </div>

        {currentProject.type === 'url' && (
          <div>
            <label htmlFor="target-url-input" className="block text-xs font-semibold text-slate-800 mb-1">Target Website URL</label>
            <input
              id="target-url-input"
              type="url"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              placeholder="https://example.com"
              value={currentProject.content || ''}
              onChange={e => onChange({ ...currentProject, content: e.target.value })}
            />
          </div>
        )}

        {currentProject.type === 'text' && (
          <div>
            <label htmlFor="plain-text-input" className="block text-xs font-semibold text-slate-800 mb-1">Plain Text</label>
            <textarea
              id="plain-text-input"
              className="w-full text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 bg-white text-slate-800"
              placeholder="Add raw text to encode..."
              value={currentProject.content || ''}
              onChange={e => onChange({ ...currentProject, content: e.target.value })}
            />
          </div>
        )}

        {currentProject.type === 'wifi' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">WiFi Integration Setting</h4>
            <p className="text-[11px] text-slate-600">Auto-configured to connect to wifi spots securely.</p>
            <div>
              <label htmlFor="wifi-ssid-input" className="block text-[10px] font-semibold text-slate-800 mb-1">WiFi Network ID / SSID</label>
              <input
                id="wifi-ssid-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="WiFi Network ID / SSID"
                onChange={e => {
                  const parts = (currentProject.content || '').split(';');
                  const pass = parts[2] || '';
                  onChange({ ...currentProject, content: `WIFI:S:${e.target.value};T:WPA;P:${pass};;` });
                }}
              />
            </div>
            <div>
              <label htmlFor="wifi-pass-input" className="block text-[10px] font-semibold text-slate-800 mb-1">WiFi Password</label>
              <input
                id="wifi-pass-input"
                type="password"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="WiFi Password"
                onChange={e => {
                  const parts = (currentProject.content || '').split(';');
                  const ss = parts[0]?.replace('WIFI:S:', '') || '';
                  onChange({ ...currentProject, content: `WIFI:S:${ss};T:WPA;P:${e.target.value};;` });
                }}
              />
            </div>
          </div>
        )}

        {currentProject.type === 'email' && (
          <div className="space-y-2">
            <label htmlFor="email-recipient-input" className="block text-xs font-semibold text-slate-800">Recipient Email Address</label>
            <input
              id="email-recipient-input"
              type="email"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-800"
              placeholder="Recipient Email Address"
              onChange={e => onChange({ ...currentProject, content: `mailto:${e.target.value}` })}
            />
          </div>
        )}

        {currentProject.type === 'card' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850 font-mono">vCard Contact Credentials</h4>
            <div>
              <label htmlFor="vcard-name-input" className="block text-[10px] font-semibold text-slate-800 mb-1">Full Name</label>
              <input
                id="vcard-name-input"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-white text-slate-800"
                placeholder="Full Name"
                value={currentProject.content?.includes('N:') ? currentProject.content.split('N:')[1]?.split('\n')[0] : ''}
                onChange={e => onChange({ ...currentProject, content: `BEGIN:VCARD\nVERSION:3.0\nN:${e.target.value}\nEND:VCARD` })}
              />
            </div>
          </div>
        )}

        {currentProject.type === 'phone' && (
          <div className="space-y-2">
            <label htmlFor="phone-number-input" className="block text-xs font-semibold text-slate-800">Phone Number</label>
            <input
              id="phone-number-input"
              type="tel"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+1 (555) 000-0000"
              value={(() => {
                if (currentProject.content?.startsWith('tel:')) {
                  return currentProject.content.substring(4);
                }
                return '';
              })()}
              onChange={e => onChange({ ...currentProject, content: `tel:${e.target.value.trim()}` })}
            />
            <span className="text-[10px] text-slate-600 block font-sans">Encodes standard cellular dialing protocols automatically.</span>
          </div>
        )}

        {currentProject.type === 'sms' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">Pre-composed SMS Text</h4>
            <div>
              <label htmlFor="sms-phone-input" className="block text-[10px] font-semibold text-slate-800 mb-1">Recipient Phone Number</label>
              <input
                id="sms-phone-input"
                type="tel"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800"
                placeholder="Recipient Phone Number"
                value={(() => {
                  if (currentProject.content?.startsWith('sms:')) {
                    const queryIdx = currentProject.content.indexOf('?');
                    return queryIdx !== -1 ? currentProject.content.substring(4, queryIdx) : currentProject.content.substring(4);
                  } else if (currentProject.content?.startsWith('SMSTO:')) {
                    return currentProject.content.substring(6).split(':')[0] || '';
                  }
                  return '';
                })()}
                onChange={e => {
                  const phone = e.target.value.trim();
                  let existingMsg = '';
                  if (currentProject.content?.startsWith('sms:')) {
                    const queryIdx = currentProject.content.indexOf('?body=');
                    existingMsg = queryIdx !== -1 ? decodeURIComponent(currentProject.content.substring(queryIdx + 6)) : '';
                  } else if (currentProject.content?.startsWith('SMSTO:')) {
                    existingMsg = currentProject.content.substring(6).split(':').slice(1).join(':') || '';
                  }
                  onChange({ ...currentProject, content: `SMSTO:${phone}:${existingMsg}` });
                }}
              />
            </div>
            <div>
              <label htmlFor="sms-msg-textarea" className="block text-[10px] font-semibold text-slate-800 mb-1">Prefilled Message Body</label>
              <textarea
                id="sms-msg-textarea"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white h-16 text-slate-800"
                placeholder="Prefilled message body"
                value={(() => {
                  if (currentProject.content?.startsWith('sms:')) {
                    const queryIdx = currentProject.content.indexOf('?body=');
                    return queryIdx !== -1 ? decodeURIComponent(currentProject.content.substring(queryIdx + 6)) : '';
                  } else if (currentProject.content?.startsWith('SMSTO:')) {
                    return currentProject.content.substring(6).split(':').slice(1).join(':') || '';
                  }
                  return '';
                })()}
                onChange={e => {
                  const msg = e.target.value;
                  let existingPhone = '';
                  if (currentProject.content?.startsWith('sms:')) {
                    const queryIdx = currentProject.content.indexOf('?');
                    existingPhone = queryIdx !== -1 ? currentProject.content.substring(4, queryIdx) : currentProject.content.substring(4);
                  } else if (currentProject.content?.startsWith('SMSTO:')) {
                    existingPhone = currentProject.content.substring(6).split(':')[0] || '';
                  }
                  onChange({ ...currentProject, content: `SMSTO:${existingPhone}:${msg}` });
                }}
              />
            </div>
          </div>
        )}

        {currentProject.type === 'social' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">Social Media Profile</h4>
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
                  const content = currentProject.content || '';
                  return content.includes(plat.prefix);
                })();

                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => {
                      // Preserve the username/handle if possible
                      const currentUsername = (() => {
                        const content = currentProject.content || '';
                        if (content.includes('instagram.com/')) return content.split('instagram.com/')[1] || '';
                        if (content.includes('x.com/')) return content.split('x.com/')[1] || '';
                        if (content.includes('wa.me/')) return content.split('wa.me/')[1] || '';
                        if (content.includes('tiktok.com/@')) return content.split('tiktok.com/@')[1] || '';
                        if (content.includes('youtube.com/@')) return content.split('youtube.com/@')[1] || '';
                        if (content.includes('linkedin.com/in/')) return content.split('linkedin.com/in/')[1] || '';
                        return '';
                      })();
                      onChange({ ...currentProject, content: `${plat.prefix}${currentUsername}` });
                    }}
                    className={`py-1.5 px-2 text-[10px] font-medium border rounded-lg text-center transition-all ${
                      isPlatActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
            
            <div>
              <span className="text-[10px] text-slate-650 font-mono">
                Platform Path: {(() => {
                  const content = currentProject.content || '';
                  if (content.includes('instagram.com/')) return 'https://instagram.com/';
                  if (content.includes('x.com/')) return 'https://x.com/';
                  if (content.includes('wa.me/')) return 'https://wa.me/';
                  if (content.includes('tiktok.com/@')) return 'https://tiktok.com/@';
                  if (content.includes('youtube.com/@')) return 'https://youtube.com/@';
                  if (content.includes('linkedin.com/in/')) return 'https://linkedin.com/in/';
                  return 'https://instagram.com/';
                })()}
              </span>
              <label htmlFor="social-username-input" className="sr-only">Social Username or Contact</label>
              <input
                id="social-username-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white mt-1 font-mono text-slate-800"
                placeholder="username, handle, or contact number"
                value={(() => {
                  const content = currentProject.content || '';
                  if (content.includes('instagram.com/')) return content.split('instagram.com/')[1] || '';
                  if (content.includes('x.com/')) return content.split('x.com/')[1] || '';
                  if (content.includes('wa.me/')) return content.split('wa.me/')[1] || '';
                  if (content.includes('tiktok.com/@')) return content.split('tiktok.com/@')[1] || '';
                  if (content.includes('youtube.com/@')) return content.split('youtube.com/@')[1] || '';
                  if (content.includes('linkedin.com/in/')) return content.split('linkedin.com/in/')[1] || '';
                  return content;
                })()}
                onChange={e => {
                  const handle = e.target.value.trim().replace(/^@/, '');
                  const currentPrefix = (() => {
                    const content = currentProject.content || '';
                    if (content.includes('instagram.com/')) return 'https://instagram.com/';
                    if (content.includes('x.com/')) return 'https://x.com/';
                    if (content.includes('wa.me/')) return 'https://wa.me/';
                    if (content.includes('tiktok.com/@')) return 'https://tiktok.com/@';
                    if (content.includes('youtube.com/@')) return 'https://youtube.com/@';
                    if (content.includes('linkedin.com/in/')) return 'https://linkedin.com/in/';
                    return 'https://instagram.com/';
                  })();
                  onChange({ ...currentProject, content: `${currentPrefix}${handle}` });
                }}
              />
            </div>
          </div>
        )}

        {currentProject.type === 'crypto' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-semibold text-slate-850">Cryptocurrency Address</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'bitcoin', label: 'BTC', prefix: 'bitcoin:' },
                { id: 'ethereum', label: 'ETH', prefix: 'ethereum:' },
                { id: 'solana', label: 'SOL', prefix: 'solana:' },
                { id: 'dogecoin', label: 'DOGE', prefix: 'dogecoin:' }
              ].map(coin => {
                const isCoinActive = (() => {
                  const content = currentProject.content || '';
                  return content.startsWith(coin.prefix);
                })();

                return (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => {
                      const currentAddr = (() => {
                        const content = currentProject.content || '';
                        if (content.startsWith('bitcoin:')) return content.split('bitcoin:')[1] || '';
                        if (content.startsWith('ethereum:')) return content.split('ethereum:')[1] || '';
                        if (content.startsWith('solana:')) return content.split('solana:')[1] || '';
                        if (content.startsWith('dogecoin:')) return content.split('dogecoin:')[1] || '';
                        return '';
                      })();
                      onChange({ ...currentProject, content: `${coin.prefix}${currentAddr}` });
                    }}
                    className={`py-1 px-1.5 text-[9px] font-bold border rounded-lg text-center transition-all ${
                      isCoinActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {coin.label}
                  </button>
                );
              })}
            </div>

            <div>
              <span className="text-[10px] text-slate-650 font-mono">
                Asset Prefix: {(() => {
                  const content = currentProject.content || '';
                  if (content.startsWith('bitcoin:')) return 'bitcoin:';
                  if (content.startsWith('ethereum:')) return 'ethereum:';
                  if (content.startsWith('solana:')) return 'solana:';
                  if (content.startsWith('dogecoin:')) return 'dogecoin:';
                  return 'bitcoin:';
                })()}
              </span>
              <label htmlFor="crypto-address-input" className="sr-only">Cryptocurrency Address</label>
              <input
                id="crypto-address-input"
                type="text"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white mt-1 font-mono text-slate-800"
                placeholder="Wallet destination hash"
                value={(() => {
                  const content = currentProject.content || '';
                  if (content.startsWith('bitcoin:')) return content.split('bitcoin:')[1] || '';
                  if (content.startsWith('ethereum:')) return content.split('ethereum:')[1] || '';
                  if (content.startsWith('solana:')) return content.split('solana:')[1] || '';
                  if (content.startsWith('dogecoin:')) return content.split('dogecoin:')[1] || '';
                  return content;
                })()}
                onChange={e => {
                  const addr = e.target.value.trim();
                  const currentPrefix = (() => {
                    const content = currentProject.content || '';
                    if (content.startsWith('bitcoin:')) return 'bitcoin:';
                    if (content.startsWith('ethereum:')) return 'ethereum:';
                    if (content.startsWith('solana:')) return 'solana:';
                    if (content.startsWith('dogecoin:')) return 'dogecoin:';
                    return 'bitcoin:';
                  })();
                  onChange({ ...currentProject, content: `${currentPrefix}${addr}` });
                }}
              />
            </div>
          </div>
        )}

        {currentProject.type === 'geo' && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-850">Maps Geolocation</h4>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      pos => {
                        const lat = pos.coords.latitude.toFixed(6);
                        const lng = pos.coords.longitude.toFixed(6);
                        onChange({ ...currentProject, content: `geo:${lat},${lng}` });
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
                Locate Me
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="geo-latitude-input" className="text-[10px] text-slate-700 block mb-0.5 font-semibold">Latitude</label>
                <input
                  id="geo-latitude-input"
                  type="text"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-200 bg-white font-mono text-slate-800"
                  placeholder="e.g. 37.7749"
                  value={(() => {
                    if (currentProject.content?.startsWith('geo:')) {
                      return currentProject.content.substring(4).split(',')[0] || '';
                    }
                    return '';
                  })()}
                  onChange={e => {
                    const lat = e.target.value.trim();
                    const existingLng = (() => {
                      if (currentProject.content?.startsWith('geo:')) {
                        return currentProject.content.substring(4).split(',')[1] || '';
                      }
                      return '';
                    })();
                    onChange({ ...currentProject, content: `geo:${lat},${existingLng}` });
                  }}
                />
              </div>

              <div>
                <label htmlFor="geo-longitude-input" className="text-[10px] text-slate-700 block mb-0.5 font-semibold">Longitude</label>
                <input
                  id="geo-longitude-input"
                  type="text"
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-200 bg-white font-mono text-slate-800"
                  placeholder="e.g. -122.4194"
                  value={(() => {
                    if (currentProject.content?.startsWith('geo:')) {
                      return currentProject.content.substring(4).split(',')[1] || '';
                    }
                    return '';
                  })()}
                  onChange={e => {
                    const lng = e.target.value.trim();
                    const existingLat = (() => {
                      if (currentProject.content?.startsWith('geo:')) {
                        return currentProject.content.substring(4).split(',')[0] || '';
                      }
                      return '';
                    })();
                    onChange({ ...currentProject, content: `geo:${existingLat},${lng}` });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Integrated Color Palette and Gradient Manager */}
      <ColorPalette
        currentProject={currentProject}
        onChange={onChange}
      />

      {/* Gemini AI Co-Pilot Intelligent Customizer */}
      <AICoPilot
        currentProject={currentProject}
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
          <label htmlFor="eye-style-select" className="text-xs font-semibold text-slate-800 tracking-wider uppercase block mb-2">Corner Eyes</label>
          <select
            id="eye-style-select"
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={currentProject.design?.eyeStyle || 'square'}
            onChange={e => setDesignField('eyeStyle', e.target.value)}
          >
            <option value="square">Square Frame</option>
            <option value="rounded">Rounded Frame</option>
            <option value="circle">Smooth Circles</option>
            <option value="leaf">Elegant Leaf</option>
          </select>
        </div>

        <div>
          <label htmlFor="dot-style-select" className="text-xs font-semibold text-slate-800 tracking-wider uppercase block mb-2">Internal Dots</label>
          <select
            id="dot-style-select"
            className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={currentProject.design?.dotStyle || 'square'}
            onChange={e => setDesignField('dotStyle', e.target.value)}
          >
            <option value="square">Standard Square</option>
            <option value="rounded">Smooth Rounded</option>
            <option value="dots">Circular Dots</option>
            <option value="classy">Classy Starbursts</option>
          </select>
        </div>
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
            <span className="text-xs font-semibold text-slate-800 tracking-wider uppercase block">Finder Eye Colors</span>
            <span className="text-[10px] text-slate-600 block">Independently color the three main corner eyes.</span>
          </div>
          {(currentProject.design?.eyeColorTopLeft || currentProject.design?.eyeColorTopRight || currentProject.design?.eyeColorBottomLeft) ? (
            <button
              type="button"
              onClick={() => {
                setDesignField('eyeColorTopLeft', '');
                setDesignField('eyeColorTopRight', '');
                setDesignField('eyeColorBottomLeft', '');
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer"
            >
              Reset to Theme
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* Top-Left Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-tl" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">Top-Left</label>
            <div className="relative group">
              <input
                id="eye-color-tl"
                type="color"
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={currentProject.design?.eyeColorTopLeft || currentProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorTopLeft', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {currentProject.design?.eyeColorTopLeft ? currentProject.design.eyeColorTopLeft : 'Inherited'}
            </span>
          </div>

          {/* Top-Right Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-tr" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">Top-Right</label>
            <div className="relative group">
              <input
                id="eye-color-tr"
                type="color"
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={currentProject.design?.eyeColorTopRight || currentProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorTopRight', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {currentProject.design?.eyeColorTopRight ? currentProject.design.eyeColorTopRight : 'Inherited'}
            </span>
          </div>

          {/* Bottom-Left Eye */}
          <div className="flex flex-col items-center p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-all">
            <label htmlFor="eye-color-bl" className="text-[10px] text-slate-700 font-bold mb-1.5 text-center cursor-pointer">Bottom-Left</label>
            <div className="relative group">
              <input
                id="eye-color-bl"
                type="color"
                className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-slate-50 overflow-hidden"
                value={currentProject.design?.eyeColorBottomLeft || currentProject.design?.fgColor || '#0f172a'}
                onChange={e => {
                  setDesignField('eyeColorBottomLeft', e.target.value);
                }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600 mt-1 uppercase block truncate max-w-full">
              {currentProject.design?.eyeColorBottomLeft ? currentProject.design.eyeColorBottomLeft : 'Inherited'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Margin / Quiet Zone Slider */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm"
      >
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="quiet-zone-range" className="text-xs font-semibold text-slate-800 tracking-wider uppercase">Quiet Zone (Margin)</label>
          <span className="text-xs text-indigo-600 font-mono font-medium">{currentProject.design?.margin ?? 20}px</span>
        </div>
        <input
          id="quiet-zone-range"
          type="range"
          min="0"
          max="80"
          step="5"
          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          value={currentProject.design?.margin ?? 20}
          onChange={e => setDesignField('margin', parseInt(e.target.value, 10))}
        />
        <p className="text-[10px] text-slate-600 mt-1">Adjusts the whitespace board surrounding the code to improve scannability.</p>
      </motion.div>

      {/* Error Correction Level Slider */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.015,
          y: -2,
          boxShadow: '0 8px 20px -8px rgba(0, 0, 0, 0.08), 0 2px 6px -4px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-4 bg-gray-50/40 rounded-xl border border-gray-200/40 hover:bg-white hover:border-gray-200/80 transition-all duration-300 shadow-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="error-correction-select" className="text-xs font-semibold text-slate-800 tracking-wider uppercase">Error Correction Level</label>
          <span className="text-xs text-indigo-600 font-mono font-bold">
            {currentProject.design?.errorCorrectionLevel || 'H'}
          </span>
        </div>
        
        <div className="space-y-3">
          <select
            id="error-correction-select"
            className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs font-semibold transition-all duration-200"
            value={currentProject.design?.errorCorrectionLevel || 'H'}
            onChange={e => {
              const val = e.target.value as 'L' | 'M' | 'Q' | 'H';
              setDesignField('errorCorrectionLevel', val);
            }}
          >
            <option value="L">L (7% Recovery) — Low density, simple pattern</option>
            <option value="M">M (15% Recovery) — Medium density, standard balance</option>
            <option value="Q">Q (25% Recovery) — Quartile density, high reliability</option>
            <option value="H">H (30% Recovery) — High density, best for logos & complexity</option>
          </select>
          
          <p className="text-[10px] text-slate-650 leading-relaxed">
            {(() => {
              const ec = currentProject.design?.errorCorrectionLevel || 'H';
              if (ec === 'L') return 'Low recovery budget. Simplest rendering, but vulnerable to slight scratches/smudges.';
              if (ec === 'M') return 'Medium recovery budget. Standard balanced configuration used across normal scanners.';
              if (ec === 'Q') return 'Quartile recovery budget. Retains scannability even when up to 25% of the print surface is dirty or torn.';
              return 'High recovery budget (Highly Recommended). Perfect for complex, custom QR patterns and centerpiece custom brand logo overlays.';
            })()}
          </p>
        </div>
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
          <label htmlFor="emblem-url-input" className="text-xs font-semibold text-slate-800 tracking-wider uppercase">Emblem Center Logo</label>
          {currentProject.design?.logoUrl && (
            <button
              type="button"
              onClick={clearLogo}
              className="text-[10px] text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
            >
              Clear Emblem
            </button>
          )}
        </div>

        {/* Text/Emoji custom word input */}
        <div>
          <input
            id="emblem-url-input"
            type="text"
            className="w-full text-xs px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-850"
            placeholder="e.g. Google, QR, or text/emoji"
            value={currentProject.design?.logoUrl || ''}
            onChange={e => {
              setUploadError(null);
              setDesignField('logoUrl', e.target.value);
            }}
          />
          <p className="text-[10px] text-slate-600 mt-1">Accepts short words, emojis, or external secure image URLs.</p>
        </div>

        {/* Drag and Drop Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/40 scale-[1.01]'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`} />
          <div className="text-center">
            <span className="text-xs font-medium text-gray-700 block">
              Drag & drop logo image, or <span className="text-indigo-600 font-semibold">browse</span>
            </span>
            <span className="text-[9px] text-gray-400 block mt-0.5">Supports PNG, JPG, SVG, WebP up to 2MB</span>
          </div>
        </div>

        {uploadError && (
          <p className="text-[10px] text-red-500 font-medium mt-1 bg-red-50/50 p-2 rounded-lg border border-red-100">{uploadError}</p>
        )}

        {currentProject.design?.logoUrl && (
          <div className="mt-3 space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            {/* Show a small thumbnail preview of the logo */}
            <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                {currentProject.design.logoUrl.startsWith('data:image') || currentProject.design.logoUrl.startsWith('http') ? (
                  <img
                    src={currentProject.design.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-600">{currentProject.design.logoUrl.slice(0, 3).toUpperCase()}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-gray-800 block truncate">
                  {currentProject.design.logoUrl.startsWith('data:image') 
                    ? 'Uploaded Base64 Emblem Image' 
                    : currentProject.design.logoUrl.startsWith('http') 
                      ? 'External Image URL' 
                      : `Text Emblem: "${currentProject.design.logoUrl}"`}
                </span>
                <span className="text-[9px] font-mono text-gray-400 block truncate max-w-[180px]">
                  {currentProject.design.logoUrl}
                </span>
              </div>
            </div>

            {/* Logo Rotation Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="logo-rotation-range" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Logo Rotation</label>
                <span className="text-[11px] text-indigo-600 font-mono font-bold">{currentProject.design?.logoRotation ?? 0}°</span>
              </div>
              <input
                id="logo-rotation-range"
                type="range"
                min="0"
                max="360"
                step="5"
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={currentProject.design?.logoRotation ?? 0}
                onChange={e => setDesignField('logoRotation', parseInt(e.target.value, 10))}
              />
            </div>

            {/* Logo Scale Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="logo-scale-range" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Logo Size / Scale</label>
                <span className="text-[11px] text-indigo-600 font-mono font-bold">{Math.round((currentProject.design?.logoScale ?? 0.18) * 100)}%</span>
              </div>
              <input
                id="logo-scale-range"
                type="range"
                min="0.05"
                max="0.30"
                step="0.01"
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={currentProject.design?.logoScale ?? 0.18}
                onChange={e => setDesignField('logoScale', parseFloat(e.target.value))}
              />
            </div>

            {/* Logo Positioning & Auto-Center Toggle */}
            <div className="pt-3 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <span id="logo-autocenter-label" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Auto-Center Position</span>
                  <p className="text-[9px] text-slate-500 leading-normal mt-0.5 max-w-[190px]">
                    Maintains the correct offset relative to the finder eye frames automatically.
                  </p>
                </div>
                <button
                  type="button"
                  aria-labelledby="logo-autocenter-label"
                  aria-checked={currentProject.design?.logoAutoCenter !== false ? "true" : "false"}
                  onClick={() => setDesignField('logoAutoCenter', currentProject.design?.logoAutoCenter === false)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    currentProject.design?.logoAutoCenter !== false ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      currentProject.design?.logoAutoCenter !== false ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Real-time Visual Alignment Preview Box */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span>Alignment Simulator Preview</span>
                  <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded cursor-default select-none">Live viewport</span>
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
                    {currentProject.design?.logoUrl && (
                      <motion.div
                        className="absolute flex items-center justify-center shadow-md bg-white border border-slate-100 z-10 p-0.5"
                        animate={{
                          x: currentProject.design?.logoAutoCenter !== false 
                            ? calculateAutoCenterOffsets().offsetX * (112 / 450)
                            : (currentProject.design?.logoOffsetX ?? 0) * (112 / 450),
                          y: currentProject.design?.logoAutoCenter !== false 
                            ? calculateAutoCenterOffsets().offsetY * (112 / 450)
                            : (currentProject.design?.logoOffsetY ?? 0) * (112 / 450),
                          rotate: currentProject.design?.logoRotation ?? 0,
                          scale: (currentProject.design?.logoScale ?? 0.18) / 0.18
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        style={{
                          width: `${112 * (currentProject.design?.logoScale ?? 0.18)}px`,
                          height: `${112 * (currentProject.design?.logoScale ?? 0.18)}px`,
                          borderRadius: `${Math.max(2, 112 * (currentProject.design?.logoScale ?? 0.18) * 0.22)}px`
                        }}
                      >
                        {(() => {
                          const logoUrl = currentProject.design?.logoUrl || '';
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
                            return (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[6px] text-white bg-indigo-650 rounded-[1.5px] uppercase select-none">
                                {logoUrl.slice(0, 2)}
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
                      {currentProject.design?.logoAutoCenter !== false ? '✨ Optical Auto-Balanced' : '🔧 Manually Adjusted'}
                    </span>
                    <p className="text-[8.5px] text-slate-500 leading-normal">
                      {currentProject.design?.logoAutoCenter !== false 
                        ? 'Logo shifted slightly top-left to achieve visual symmetry with asymmetric finder pattern count.' 
                        : 'Custom offset coordinates applied over the physical grid coordinate origin.'}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5 text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
                      <span>Hover grid to show alignment guides</span>
                    </div>
                  </div>
                </div>
              </div>

                           {/* Conditionally show Manual Offset controls when Auto-Center is disabled or show dynamic calculation when active */}
              {currentProject.design?.logoAutoCenter !== false ? (
                <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl space-y-2 text-slate-700 animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Automatic Weight Balancing</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/80 p-2 rounded-lg border border-indigo-50/50 flex flex-col justify-center">
                      <span className="text-slate-500 text-[8.5px]">Offset X (Horizontal)</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        +{calculateAutoCenterOffsets().offsetX} px
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-indigo-50/50 flex flex-col justify-center">
                      <span className="text-slate-500 text-[8.5px]">Offset Y (Vertical)</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        +{calculateAutoCenterOffsets().offsetY} px
                      </span>
                    </div>
                  </div>
                  <p className="text-[8.5px] text-slate-500 leading-normal mt-1">
                    Balanced calculated offset accounts for standard QR Code eye pattern asymmetry ({calculateAutoCenterOffsets().modulesCount}x{calculateAutoCenterOffsets().modulesCount} grid), automatically shifting the centerpiece slightly top-left by 4% of eye footprint size to ensure absolute visual/optical balance.
                  </p>
                </div>
              ) : (
                <div className="mt-3.5 p-3 bg-white border border-gray-250/60 rounded-xl space-y-3 shadow-2xs animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Manual Center Fine-Tuning</span>
                  
                  {/* Manual X Offset slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="logo-offset-x" className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Offset X (Horizontal)</label>
                      <span className="text-[10px] text-slate-700 font-mono font-bold">
                        {(currentProject.design?.logoOffsetX ?? 0) > 0 ? `+${currentProject.design?.logoOffsetX ?? 0}` : currentProject.design?.logoOffsetX ?? 0} px
                      </span>
                    </div>
                    <input
                      id="logo-offset-x"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      value={currentProject.design?.logoOffsetX ?? 0}
                      onChange={e => setDesignField('logoOffsetX', parseInt(e.target.value, 10))}
                    />
                  </div>

                  {/* Manual Y Offset slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="logo-offset-y" className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Offset Y (Vertical)</label>
                      <span className="text-[10px] text-slate-700 font-mono font-bold">
                        {(currentProject.design?.logoOffsetY ?? 0) > 0 ? `+${currentProject.design?.logoOffsetY ?? 0}` : currentProject.design?.logoOffsetY ?? 0} px
                      </span>
                    </div>
                    <input
                      id="logo-offset-y"
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                      value={currentProject.design?.logoOffsetY ?? 0}
                      onChange={e => setDesignField('logoOffsetY', parseInt(e.target.value, 10))}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                    <p className="text-[8.5px] leading-relaxed text-slate-500 font-medium">
                      Manually shift logo placement in pixels relative to the physical center.
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
          <span className="text-xs font-semibold text-emerald-950 block">Animate Color Shift</span>
          <span className="text-[10px] text-emerald-700 block">Gradually transitions the QR pattern colors over time using Framer Motion.</span>
        </div>
        <button
          type="button"
          aria-label="Toggle pattern color shift animation"
          aria-checked={currentProject.design?.colorShift ? "true" : "false"}
          onClick={() => setDesignField('colorShift', !currentProject.design?.colorShift)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
            currentProject.design?.colorShift ? 'bg-emerald-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              currentProject.design?.colorShift ? 'translate-x-6' : 'translate-x-1'
            }`}
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
          <span className="text-xs font-semibold text-indigo-950 block">Enable Short URL & Analytics</span>
          <span className="text-[10px] text-indigo-700 block">Collects visitor scan location, hardware, and browser logs.</span>
        </div>
        <button
          type="button"
          aria-label="Toggle short URL and analytics tracking"
          aria-checked={currentProject.trackingEnabled ? "true" : "false"}
          onClick={() => onChange({ ...currentProject, trackingEnabled: !currentProject.trackingEnabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            currentProject.trackingEnabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              currentProject.trackingEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
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
          <span className="text-xs font-semibold text-slate-950">Optional Link Expiration</span>
        </div>

        <p className="text-[10px] text-slate-600 leading-normal">
          Deactivate this QR code on a specific date. Once expired, visitors will see a custom message or be sent to an alternate URL.
        </p>

        {/* Expiry Enabled / Date Customizer */}
        <div className="space-y-1.5">
          <label htmlFor="expiry-date-input" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Expiration Date & Time
          </label>
          <div className="flex gap-2">
            <input
              id="expiry-date-input"
              type="datetime-local"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={currentProject.expiryDate ? currentProject.expiryDate.substring(0, 16) : ''}
              onChange={(e) => {
                const dateVal = e.target.value;
                if (dateVal) {
                  // Ensure tracking is enabled so redirect works
                  onChange({
                    ...currentProject,
                    expiryDate: new Date(dateVal).toISOString(),
                    trackingEnabled: true
                  });
                } else {
                  onChange({
                    ...currentProject,
                    expiryDate: undefined
                  });
                }
              }}
            />
            {currentProject.expiryDate && (
              <button
                type="button"
                onClick={() => onChange({
                  ...currentProject,
                  expiryDate: undefined
                })}
                className="px-2.5 py-2 text-xs font-semibold text-red-600 bg-red-100/35 hover:bg-red-100 rounded-xl transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {currentProject.expiryDate && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Auto-Enable Tracking Warning */}
            {!currentProject.trackingEnabled && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-800 flex items-start gap-2">
                <span className="font-bold">⚠️ Warning:</span>
                <span>
                  Dynamic Link is currently disabled. Link Expiration requires enabling <strong>Short URL & Analytics</strong> to function properly.
                </span>
              </div>
            )}

            {/* Redirect Action Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                Post-Expiration Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...currentProject, expiryRedirectType: 'message' })}
                  className={`py-2 px-3 text-center text-[10px] sm:text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                    (currentProject.expiryRedirectType || 'message') === 'message'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  custom message
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...currentProject, expiryRedirectType: 'url' })}
                  className={`py-2 px-3 text-center text-[10px] sm:text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                    currentProject.expiryRedirectType === 'url'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  different url
                </button>
              </div>
            </div>

            {/* Dynamic input depending on choice */}
            {(currentProject.expiryRedirectType || 'message') === 'message' ? (
              <div className="space-y-1.5">
                <label htmlFor="expiry-message-textarea" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Custom Message text
                </label>
                <textarea
                  id="expiry-message-textarea"
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., This QR code has reached its designated expiration date and is no longer active."
                  value={currentProject.expiryMessage || ''}
                  onChange={(e) => onChange({ ...currentProject, expiryMessage: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="expiry-redirect-url-input" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Fallback Destination URL
                </label>
                <input
                  id="expiry-redirect-url-input"
                  type="url"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g., https://yoursite.com/new-dest"
                  value={currentProject.expiryRedirectUrl || ''}
                  onChange={(e) => onChange({ ...currentProject, expiryRedirectUrl: e.target.value })}
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
          <span className="text-xs font-semibold text-slate-950">Folder / Category</span>
        </div>

        <p className="text-[10px] text-slate-600 leading-normal">
          Organize your QR designs in categories to keep your workspace structured (e.g., <em className="not-italic font-medium text-slate-700">Client A, Marketing, Personal</em>).
        </p>

        <div className="space-y-2">
          {/* Text Input */}
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type or select folders (e.g. Marketing)"
            value={currentProject.category || ''}
            onChange={(e) => onChange({ ...currentProject, category: e.target.value })}
            maxLength={40}
          />

          {/* Preset / Existing Suggestions */}
          {(() => {
            const DEFAULT_SUGGESTIONS = ['Client A', 'Marketing', 'Personal'];
            const existing = (projects || [])
              .map(p => p.category?.trim())
              .filter(Boolean) as string[];
            const suggestions = Array.from(new Set([...DEFAULT_SUGGESTIONS, ...existing])).slice(0, 8);

            return suggestions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((sug) => {
                  const isSelected = currentProject.category?.trim().toLowerCase() === sug.trim().toLowerCase();
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => onChange({ 
                        ...currentProject, 
                        category: isSelected ? '' : sug 
                      })}
                      className={`text-[9px] font-medium px-2.5 py-1 rounded-full transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sug}
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
          disabled={isSaving || !currentProject.name}
          onClick={onSave}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Design to Cloud
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
