import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Eye, Download, MapPin, Mail, Play, ExternalLink, 
  Clock, Check, Send, AlertCircle, X, Navigation, Share2, Phone
} from 'lucide-react';
import { LandingPageConfig, PageComponent, SocialLinkItem, ContactFormField } from './types';

interface LandingPagePreviewProps {
  config: LandingPageConfig;
  previewMode?: boolean; // If true, disables active link clicks so the builder canvas isn't interrupted, or enables testing.
  onFormSubmit?: (formData: Record<string, string>) => Promise<void>;
}

export default function LandingPagePreview({ config, previewMode = false, onFormSubmit }: LandingPagePreviewProps) {
  const { theme, components } = config;
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Apply custom font family mapping
  const getFontClass = (font?: string) => {
    if (font === 'font-serif') return 'font-serif';
    if (font === 'font-mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <div 
      className={`w-full min-h-full flex flex-col items-center py-8 px-4 ${getFontClass(theme.fontFamily)}`}
      style={{ 
        background: theme.bgGradient || theme.bgColor,
        color: theme.textColor
      }}
    >
      <div className="w-full max-w-md space-y-6 pb-20">
        {components.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-white/50 backdrop-blur-md">
            <Smartphone className="w-10 h-10 mx-auto text-slate-400 mb-2 animate-bounce" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Canvas is Empty</p>
            <p className="text-[11px] text-slate-400 mt-1">Drag or click components from the library to populate your landing page.</p>
          </div>
        ) : (
          components.map((comp) => {
            switch (comp.type) {
              case 'hero':
                return (
                  <HeroBlock 
                    key={comp.id} 
                    comp={comp} 
                    themeColor={theme.primaryColor} 
                    previewMode={previewMode} 
                  />
                );
              case 'image':
                return (
                  <ImageBlock 
                    key={comp.id} 
                    comp={comp} 
                    previewMode={previewMode} 
                  />
                );
              case 'video':
                return (
                  <VideoBlock 
                    key={comp.id} 
                    comp={comp} 
                  />
                );
              case 'button':
                return (
                  <ButtonBlock 
                    key={comp.id} 
                    comp={comp} 
                    previewMode={previewMode} 
                  />
                );
              case 'social':
                return (
                  <SocialBlock 
                    key={comp.id} 
                    comp={comp} 
                    previewMode={previewMode} 
                  />
                );
              case 'map':
                return (
                  <MapBlock 
                    key={comp.id} 
                    comp={comp} 
                    previewMode={previewMode} 
                  />
                );
              case 'gallery':
                return (
                  <GalleryBlock 
                    key={comp.id} 
                    comp={comp} 
                    onImageClick={setLightboxImg} 
                  />
                );
              case 'pdf':
                return (
                  <PDFBlock 
                    key={comp.id} 
                    comp={comp} 
                    themeColor={theme.primaryColor} 
                    previewMode={previewMode} 
                  />
                );
              case 'contactForm':
                return (
                  <ContactFormBlock 
                    key={comp.id} 
                    comp={comp} 
                    themeColor={theme.primaryColor} 
                    onFormSubmit={onFormSubmit} 
                  />
                );
              case 'countdown':
                return (
                  <CountdownBlock 
                    key={comp.id} 
                    comp={comp} 
                  />
                );
              default:
                return null;
            }
          })
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImg} 
            alt="Gallery Lightbox" 
            className="max-w-full max-h-screen rounded-lg shadow-2xl object-contain animate-scale-up" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}

// ================= HERO BLOCK =================
function HeroBlock({ comp, themeColor, previewMode }: { comp: any; themeColor: string; previewMode: boolean }) {
  const alignmentClass = 
    comp.align === 'left' ? 'text-left' :
    comp.align === 'right' ? 'text-right' : 'text-center';

  const containerStyle = comp.bgType === 'image' && comp.bgImageUrl
    ? { backgroundImage: `url(${comp.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : comp.bgType === 'gradient' && comp.bgGradient
    ? { background: comp.bgGradient }
    : { backgroundColor: comp.bgColor || '#4f46e5' };

  return (
    <div 
      className={`p-6 rounded-3xl shadow-md overflow-hidden flex flex-col justify-center min-h-[160px] ${alignmentClass}`}
      style={{ ...containerStyle, color: comp.textColor || '#ffffff' }}
    >
      <h2 className="text-xl font-black tracking-tight leading-tight">{comp.title || 'Brand Headline'}</h2>
      <p className="text-xs opacity-90 mt-2 leading-relaxed">{comp.subtitle}</p>
      
      {comp.ctaText && (
        <a
          href={previewMode ? undefined : comp.ctaLink}
          className="mt-4 px-4 py-2 bg-white rounded-xl text-xs font-bold w-fit mx-auto shadow-sm hover:scale-102 transition-all block cursor-pointer"
          style={{ color: comp.bgColor || themeColor }}
          onClick={(e) => previewMode && e.preventDefault()}
        >
          {comp.ctaText}
        </a>
      )}
    </div>
  );
}

// ================= IMAGE BLOCK =================
function ImageBlock({ comp, previewMode }: { comp: any; previewMode: boolean }) {
  const getRadiusClass = () => {
    if (comp.borderRadius === 'none') return 'rounded-none';
    if (comp.borderRadius === 'md') return 'rounded-xl';
    if (comp.borderRadius === 'full') return 'rounded-full';
    return 'rounded-3xl';
  };

  const getAspectClass = () => {
    if (comp.aspectRatio === '1:1') return 'aspect-square';
    if (comp.aspectRatio === '16:9') return 'aspect-video';
    if (comp.aspectRatio === '4:3') return 'aspect-4/3';
    return 'aspect-auto';
  };

  const imgContent = (
    <div className={`overflow-hidden shadow-xs border border-white/10 ${getRadiusClass()}`}>
      <img 
        src={comp.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'} 
        alt={comp.altText || 'Custom Design'} 
        className={`w-full object-cover ${getAspectClass()}`}
        referrerPolicy="no-referrer"
      />
      {comp.caption && (
        <div className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 text-[10px] text-slate-500 font-medium text-center">
          {comp.caption}
        </div>
      )}
    </div>
  );

  if (comp.linkUrl && !previewMode) {
    return (
      <a href={comp.linkUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
        {imgContent}
      </a>
    );
  }

  return imgContent;
}

// ================= VIDEO BLOCK =================
function VideoBlock({ comp }: { comp: any }) {
  const getEmbedUrl = () => {
    const raw = comp.url || '';
    if (comp.platform === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = raw.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } else if (comp.platform === 'vimeo') {
      const regExp = /vimeo\.com\/([0-9]+)/;
      const match = raw.match(regExp);
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="w-full bg-black rounded-3xl overflow-hidden shadow-md aspect-video border border-white/10 relative">
      {embedUrl ? (
        <iframe 
          src={embedUrl} 
          title="Video Embed Player" 
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        />
      ) : comp.url ? (
        <video 
          src={comp.url} 
          controls 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
          <Play className="w-8 h-8 text-indigo-500 mb-2 animate-pulse" />
          <p className="text-[10px] font-bold">No live stream url provided.</p>
        </div>
      )}
    </div>
  );
}

// ================= BUTTON BLOCK =================
function ButtonBlock({ comp, previewMode }: { comp: any; previewMode: boolean }) {
  const getStyle = () => {
    if (comp.style === 'outline') {
      return {
        border: `2px solid ${comp.color || '#4f46e5'}`,
        color: comp.color || '#4f46e5',
        backgroundColor: 'transparent'
      };
    }
    if (comp.style === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${comp.color || '#4f46e5'} 0%, #ec4899 100%)`,
        color: comp.textColor || '#ffffff',
        border: 'none'
      };
    }
    return {
      backgroundColor: comp.color || '#4f46e5',
      color: comp.textColor || '#ffffff',
      border: 'none'
    };
  };

  const getSizeClass = () => {
    if (comp.size === 'sm') return 'py-1.5 px-3.5 text-[11px] rounded-xl';
    if (comp.size === 'lg') return 'py-3.5 px-6 text-sm rounded-2xl';
    return 'py-2.5 px-4 text-xs rounded-xl';
  };

  return (
    <a
      href={previewMode ? undefined : comp.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full text-center font-bold tracking-wide shadow-xs block transform active:scale-98 transition-all hover:opacity-95 cursor-pointer ${getSizeClass()}`}
      style={getStyle()}
      onClick={(e) => previewMode && e.preventDefault()}
    >
      <span className="flex items-center justify-center gap-2">
        {comp.text || 'Action Button'}
        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
      </span>
    </a>
  );
}

// ================= SOCIAL LINKS BLOCK =================
function SocialBlock({ comp, previewMode }: { comp: any; previewMode: boolean }) {
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <span className="text-xs font-bold uppercase">IG</span>;
      case 'twitter':
        return <span className="text-xs font-bold uppercase">X</span>;
      case 'facebook':
        return <span className="text-xs font-bold uppercase">FB</span>;
      case 'linkedin':
        return <span className="text-xs font-bold uppercase">IN</span>;
      case 'youtube':
        return <span className="text-xs font-bold uppercase">YT</span>;
      case 'tiktok':
        return <span className="text-xs font-bold uppercase">TK</span>;
      case 'whatsapp':
        return <span className="text-xs font-bold uppercase">WA</span>;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const items = comp.links || [];
  const activeItems = items.filter((it: SocialLinkItem) => it.active && it.url);

  if (activeItems.length === 0) {
    return (
      <div className="text-center p-3 text-slate-400 bg-white/20 rounded-2xl border border-dashed border-slate-300">
        <p className="text-[10px] font-bold">Configure active social links in properties.</p>
      </div>
    );
  }

  const getStyleClass = () => {
    if (comp.style === 'square') return 'rounded-xl';
    if (comp.style === 'minimal') return 'rounded-none border-b-2 border-transparent hover:border-indigo-500 bg-transparent';
    return 'rounded-full';
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {activeItems.map((it: SocialLinkItem, idx: number) => (
        <a
          key={idx}
          href={previewMode ? undefined : it.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 flex items-center justify-center shadow-xs transition-all hover:scale-105 hover:opacity-90 cursor-pointer text-white font-extrabold ${getStyleClass()}`}
          style={{ backgroundColor: comp.style === 'minimal' ? 'transparent' : comp.color || '#4f46e5', color: comp.style === 'minimal' ? comp.color : '#fff' }}
          onClick={(e) => previewMode && e.preventDefault()}
        >
          {getSocialIcon(it.platform)}
        </a>
      ))}
    </div>
  );
}

// ================= INTERACTIVE MAP BLOCK =================
function MapBlock({ comp, previewMode }: { comp: any; previewMode: boolean }) {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm text-slate-800 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-extrabold text-slate-900">{comp.markerTitle || 'Location Marker'}</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{comp.address || 'New York, NY'}</p>
        </div>
        <a
          href={previewMode ? undefined : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comp.address || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 transition-all cursor-pointer flex items-center justify-center shrink-0"
          onClick={(e) => previewMode && e.preventDefault()}
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>

      {/* Map visual mock canvas */}
      <div className="w-full h-32 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
        {/* Abstract grids representing map lines */}
        <div className="absolute inset-0 opacity-15" style={{ 
          backgroundImage: 'radial-gradient(#334155 1.5px, transparent 1.5px), radial-gradient(#334155 1.5px, #f1f5f9 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px' 
        }} />
        <div className="absolute h-0.5 w-full bg-slate-300 top-1/2 -translate-y-1/2" />
        <div className="absolute w-0.5 h-full bg-slate-300 left-1/3" />
        <div className="absolute w-0.5 h-full bg-slate-300 left-2/3" />

        {/* Central pulsing Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping absolute -top-1" />
          <MapPin className="w-8 h-8 text-red-600 drop-shadow-md animate-bounce" />
        </div>

        {/* Dynamic Zoom Badge */}
        <span className="absolute bottom-2 right-2 text-[8px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 text-white py-0.5 px-1.5 rounded">
          GPS {comp.latitude?.toFixed(4)}, {comp.longitude?.toFixed(4)} | Zoom {comp.zoom}x
        </span>
      </div>
    </div>
  );
}

// ================= GALLERY BLOCK =================
function GalleryBlock({ comp, onImageClick }: { comp: any; onImageClick: (url: string) => void }) {
  const images = comp.images || [];
  const colClass = 
    comp.columns === 2 ? 'grid-cols-2' :
    comp.columns === 4 ? 'grid-cols-4' : 'grid-cols-3';

  const gapClass = 
    comp.gap === 'sm' ? 'gap-1' :
    comp.gap === 'lg' ? 'gap-4' : 'gap-2';

  if (images.length === 0) {
    return (
      <div className="text-center p-6 text-slate-400 bg-white/20 rounded-2xl border border-dashed border-slate-300">
        <p className="text-[10px] font-bold">No images added. Click Edit to add paths.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} ${gapClass}`}>
      {images.map((img: string, idx: number) => (
        <div 
          key={idx} 
          className="aspect-square bg-slate-100 border border-white/10 rounded-2xl overflow-hidden shadow-2xs hover:scale-102 hover:shadow-xs active:scale-98 transition-all cursor-zoom-in"
          onClick={() => onImageClick(img)}
        >
          <img 
            src={img} 
            alt={`Gallery ${idx}`} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      ))}
    </div>
  );
}

// ================= PDF DOWNLOAD BLOCK =================
function PDFBlock({ comp, themeColor, previewMode }: { comp: any; themeColor: string; previewMode: boolean }) {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm text-slate-800 space-y-4">
      <div className="flex items-start gap-3">
        {comp.showIcon && (
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
        )}
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-900 leading-snug">{comp.title || 'Download PDF'}</h4>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{comp.description || 'Access offline brochures, catalogs or documents.'}</p>
        </div>
      </div>

      <a
        href={previewMode ? undefined : comp.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="w-full text-center py-2.5 px-4 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-opacity hover:opacity-95 cursor-pointer"
        style={{ backgroundColor: themeColor }}
        onClick={(e) => previewMode && e.preventDefault()}
      >
        <Download className="w-4 h-4" />
        Download Document (PDF)
      </a>
    </div>
  );
}

// ================= CONTACT FORM BLOCK =================
function ContactFormBlock({ comp, themeColor, onFormSubmit }: { comp: any; themeColor: string; onFormSubmit?: (formData: Record<string, string>) => Promise<void> }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = comp.fields || [];

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (onFormSubmit) {
        await onFormSubmit(formData);
      }
      setSuccess(true);
      setFormData({});
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-150 rounded-3xl p-6 shadow-sm text-center space-y-3 animate-scale-up">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xs">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">Submission Completed!</h4>
          <p className="text-[10px] text-emerald-800 leading-relaxed mt-1">Thank you for submitting your response. Your details have been securely saved!</p>
        </div>
        <button 
          onClick={() => setSuccess(false)}
          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div id="preview-contact-form-block" className="w-full bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm text-slate-800">
      <div className="space-y-1 text-center mb-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">{comp.title || 'Contact Form'}</h4>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{comp.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-800 text-[10px] font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fields.map((f: ContactFormField) => (
          <div key={f.id} className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 flex items-center gap-0.5">
              {f.label}
              {f.required && <span className="text-red-500">*</span>}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                required={f.required}
                placeholder={f.placeholder}
                value={formData[f.name] || ''}
                onChange={(e) => handleInputChange(f.name, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <input
                type={f.type}
                required={f.required}
                placeholder={f.placeholder}
                value={formData[f.name] || ''}
                onChange={(e) => handleInputChange(f.name, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-center py-2.5 px-4 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: themeColor }}
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              {comp.buttonText || 'Submit Details'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ================= COUNTDOWN BLOCK =================
function CountdownBlock({ comp }: { comp: any }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(comp.targetDate || '') - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [comp.targetDate]);

  const digitBox = (val: number, label: string) => {
    const format = val.toString().padStart(2, '0');
    if (comp.style === 'cards') {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-slate-900 text-white rounded-xl shadow-md p-3 min-w-[50px] text-center">
            <span className="text-sm font-black tracking-tight">{format}</span>
          </div>
          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">{label}</span>
        </div>
      );
    }
    return (
      <div className="text-center">
        <p className="text-lg font-black tracking-tight">{format}</p>
        <p className="text-[8px] font-bold uppercase tracking-wider opacity-60 mt-0.5">{label}</p>
      </div>
    );
  };

  return (
    <div 
      className="p-5 rounded-3xl shadow-xs text-center border border-white/10"
      style={{ backgroundColor: comp.bgColor || '#f1f5f9', color: comp.textColor || '#0f172a' }}
    >
      <span className="text-[9px] font-black uppercase tracking-widest block opacity-75 mb-3">{comp.label || 'LAUNCH EVENT KICKOFF'}</span>
      
      {timeLeft.expired ? (
        <div className="py-2 animate-pulse">
          <p className="text-xs font-black tracking-wider uppercase text-emerald-600">Event is Live!</p>
          <p className="text-[10px] opacity-75 mt-0.5">Voucher gates and product channels are now fully accessible.</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4">
          {digitBox(timeLeft.days, 'Days')}
          <span className="text-sm font-black leading-none pb-3 opacity-40">:</span>
          {digitBox(timeLeft.hours, 'Hours')}
          <span className="text-sm font-black leading-none pb-3 opacity-40">:</span>
          {digitBox(timeLeft.minutes, 'Mins')}
          <span className="text-sm font-black leading-none pb-3 opacity-40">:</span>
          {digitBox(timeLeft.seconds, 'Secs')}
        </div>
      )}
    </div>
  );
}
