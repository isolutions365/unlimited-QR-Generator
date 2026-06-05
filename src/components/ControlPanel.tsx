import React, { useState, useRef } from 'react';
import { QRProject } from '../types';
import { Link2, AlignLeft, Wifi, Mail, ScanFace, Sparkles, Check, UploadCloud, Phone, MessageSquare, Share2, Coins, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface ControlPanelProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onSave: () => void;
  isSaving: boolean;
  userEmail?: string | null;
}

export default function ControlPanel({
  currentProject,
  onChange,
  onSave,
  isSaving,
  userEmail
}: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const presetColors = [
    { name: 'Slate', main: '#0f172a', grad: '#3b82f6' },
    { name: 'Indigo', main: '#4f46e5', grad: '#ec4899' },
    { name: 'Emerald', main: '#059669', grad: '#10b981' },
    { name: 'Cherry', main: '#b91c1c', grad: '#f43f5e' },
    { name: 'Violet', main: '#6d28d9', grad: '#8b5cf6' },
    { name: 'Amber', main: '#b45309', grad: '#f59e0b' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
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
              { id: 'url', icon: Link2, label: 'URL' },
              { id: 'text', icon: AlignLeft, label: 'Text' },
              { id: 'wifi', icon: Wifi, label: 'WiFi' },
              { id: 'email', icon: Mail, label: 'Email' },
              { id: 'card', icon: ScanFace, label: 'Card' },
              { id: 'phone', icon: Phone, label: 'Phone' },
              { id: 'sms', icon: MessageSquare, label: 'SMS' },
              { id: 'social', icon: Share2, label: 'Social' },
              { id: 'crypto', icon: Coins, label: 'Crypto' },
              { id: 'geo', icon: MapPin, label: 'Location' }
            ] as const
          ).map(type => {
            const Icon = type.icon;
            const isSelected = currentProject.type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 scale-105'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onChange({ ...currentProject, type: type.id })}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Input Form Fields based on Type */}
      <motion.div
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

      {/* Styled Corner Colors */}
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
        <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block mb-2">Color Palette</label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {presetColors.map(col => {
              const isActive = currentProject.design?.fgColor === col.main;
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => {
                    setDesignField('fgColor', col.main);
                    setDesignField('gradientColor', col.grad);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    isActive ? 'bg-gray-100 border-gray-400 font-semibold' : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="w-3  h-3 rounded-full shadow-sm" style={{ backgroundColor: col.main }} />
                  {col.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div>
              <span className="text-[10px] text-gray-500 block mb-1">Foreground Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  value={currentProject.design?.fgColor || '#0f172a'}
                  onChange={e => setDesignField('fgColor', e.target.value)}
                />
                <span className="text-[11px] font-mono text-gray-600 uppercase">{currentProject.design?.fgColor}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 block mb-1">Background Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded-lg cursor-pointer border-0"
                  value={currentProject.design?.bgColor || '#ffffff'}
                  onChange={e => setDesignField('bgColor', e.target.value)}
                />
                <span className="text-[11px] font-mono text-gray-600 uppercase">{currentProject.design?.bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gradient Options */}
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
        <label className="text-xs font-semibold text-gray-700 tracking-wider uppercase block mb-2">Gradient Style</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {(['none', 'linear', 'radial'] as const).map(g => (
            <button
              key={g}
              type="button"
              className={`py-1.5 rounded-lg border text-xs capitalize transition-all ${
                currentProject.design?.gradientType === g
                  ? 'bg-gray-900 text-white border-gray-900 font-semibold'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setDesignField('gradientType', g)}
            >
              {g}
            </button>
          ))}
        </div>
        {currentProject.design?.gradientType !== 'none' && (
          <div className="flex items-center gap-2 mt-2 bg-gray-50 p-2 rounded-xl">
            <span className="text-[10px] text-gray-500">Gradient Goal:</span>
            <input
              type="color"
              className="w-6 h-6 rounded cursor-pointer border-0"
              value={currentProject.design?.gradientColor || '#4f46e5'}
              onChange={e => setDesignField('gradientColor', e.target.value)}
            />
            <span className="text-xs font-mono">{currentProject.design?.gradientColor}</span>
          </div>
        )}
      </motion.div>

      {/* Frame Corners and Dots Selection (Eyes Style & Dots Style) */}
      <motion.div
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
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="error-correction-range" className="text-xs font-semibold text-slate-800 tracking-wider uppercase">Error Correction Level</label>
          <span className="text-xs text-indigo-600 font-mono font-bold">
            {currentProject.design?.errorCorrectionLevel || 'H'}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="relative pt-1">
            <input
              id="error-correction-range"
              type="range"
              min="0"
              max="3"
              step="1"
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={(() => {
                const ec = currentProject.design?.errorCorrectionLevel || 'H';
                if (ec === 'L') return 0;
                if (ec === 'M') return 1;
                if (ec === 'Q') return 2;
                return 3;
              })()}
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                const levels: ('L' | 'M' | 'Q' | 'H')[] = ['L', 'M', 'Q', 'H'];
                setDesignField('errorCorrectionLevel', levels[val]);
              }}
            />
            
            {/* Custom Markers / Labels along the range axis */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1 px-1 font-mono">
              <span className={(() => {
                const ec = currentProject.design?.errorCorrectionLevel || 'H';
                return ec === 'L' ? 'text-indigo-600 scale-110 font-black font-sans' : 'font-sans';
              })()}>L (7%)</span>
              <span className={(() => {
                const ec = currentProject.design?.errorCorrectionLevel || 'H';
                return ec === 'M' ? 'text-indigo-600 scale-110 font-black font-sans' : 'font-sans';
              })()}>M (15%)</span>
              <span className={(() => {
                const ec = currentProject.design?.errorCorrectionLevel || 'H';
                return ec === 'Q' ? 'text-indigo-600 scale-110 font-black font-sans' : 'font-sans';
              })()}>Q (25%)</span>
              <span className={(() => {
                const ec = currentProject.design?.errorCorrectionLevel || 'H';
                return ec === 'H' ? 'text-indigo-600 scale-110 font-black font-sans' : 'font-sans';
              })()}>H (30%)</span>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-600">
            {(() => {
              const ec = currentProject.design?.errorCorrectionLevel || 'H';
              if (ec === 'L') return 'Low density. Simplest rendering, but vulnerable to slight scratches/smudges.';
              if (ec === 'M') return 'Medium density. Standard balanced density used across normal codes.';
              if (ec === 'Q') return 'Quartile density. Retains scannability down to 25% print surface damage.';
              return 'High density (Default). Perfect for complex, custom QR patterns and centerpiece overlay graphics.';
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

      {/* Storage persistence Save Button */}
      <motion.div variants={itemVariants}>
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
