import React, { useState, useEffect, useRef } from 'react';
import { api, UserSession } from './lib/api';
import { QRProject, ScanLog } from './types';
import { landingPages } from './components/landing/SEODatabase';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import AdSenseUnit from './components/AdSenseUnit';

// Code-splitting via React.lazy for non-critical elements (improves LCP, FCP, Speed Index).
//
// After a new deploy, the hashed chunk filenames change. A returning visitor whose
// browser still holds the previous index.html / main bundle will request an old chunk
// URL that no longer exists, the dynamic import() rejects, and the routed sub-page
// renders blank. lazyWithRetry catches that failure and performs a single, guarded
// full reload so the freshest index.html (and chunk manifest) is fetched, then renders
// the page normally. The sessionStorage guard prevents an infinite reload loop if the
// chunk is genuinely unavailable.
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  chunkName: string,
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const reloadKey = `lazy-chunk-reload:${chunkName}`;
    try {
      const component = await factory();
      // Loaded cleanly — clear any prior reload marker for this chunk.
      try { window.sessionStorage.removeItem(reloadKey); } catch { /* storage blocked */ }
      return component;
    } catch (error) {
      let alreadyReloaded = false;
      try { alreadyReloaded = window.sessionStorage.getItem(reloadKey) === '1'; } catch { /* storage blocked */ }

      if (!alreadyReloaded) {
        try { window.sessionStorage.setItem(reloadKey, '1'); } catch { /* storage blocked */ }
        // Force a fresh load of index.html so outdated chunk references are replaced.
        window.location.reload();
        // Halt rendering until the reload takes over (never resolves).
        return new Promise<{ default: T }>(() => { /* intentionally pending */ });
      }

      // Reload already attempted once and it still failed: surface to the ErrorBoundary.
      throw error;
    }
  });
}

const SEOPage = lazyWithRetry(() => import('./components/landing/SEOPage'), 'SEOPage');
const TemplatesTab = lazyWithRetry(() => import('./components/TemplatesTab'), 'TemplatesTab');
const SavedProjects = lazyWithRetry(() => import('./components/SavedProjects'), 'SavedProjects');
const AnalyticsDashboard = lazyWithRetry(() => import('./components/AnalyticsDashboard'), 'AnalyticsDashboard');
const MobileAppMockup = lazyWithRetry(() => import('./components/MobileAppMockup'), 'MobileAppMockup');
const AnimationsShowcase = lazyWithRetry(() => import('./components/AnimationsShowcase'), 'AnimationsShowcase');
const AuthModal = lazyWithRetry(() => import('./components/AuthModal'), 'AuthModal');
const CompanyPages = lazyWithRetry(() => import('./components/CompanyPages'), 'CompanyPages');
const FaqSection = lazyWithRetry(() => import('./components/FaqSection'), 'FaqSection');
const BlogSection = lazyWithRetry(() => import('./components/BlogSection'), 'BlogSection');

// Non-blocking fallback skeleton loader
const LazyLoader = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]" id="lazy-fallback">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading workspace...</span>
    </div>
  </div>
);
import { Locale, navTranslations, creativeSubItems, presetToolsTranslations } from './utils/translations';
import { 
  QrCode, LogIn, LogOut, Sparkles, LayoutGrid, RotateCcw, AlertCircle, ShieldCheck,
  ChevronDown, ChevronUp, Menu, X, ArrowRight, Clock, Star, Compass, Link2,
  Wifi, Mail, Phone, Contact, Globe, Utensils, Facebook, Instagram, Youtube, FileText,
  Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, Smartphone, HelpCircle, BookOpen,
  BarChart3, Info, MessageSquare, Shield, Bell, BellOff, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, STATUS, Step } from 'react-joyride';

const INITIAL_DESIGN: Partial<QRProject> = {
  id: '',
  name: 'My Custom QR Code',
  type: 'url',
  content: 'https://google.com',
  design: {
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    gradientType: 'none',
    gradientColor: '#4f46e5',
    dotStyle: 'square',
    eyeStyle: 'square',
    logoUrl: 'QR',
    margin: 20,
    logoRotation: 0,
    colorShift: false,
    eyeColorTopLeft: '',
    eyeColorTopRight: '',
    eyeColorBottomLeft: '',
    errorCorrectionLevel: 'H'
  },
  scanCount: 0,
  trackingEnabled: true,
  trackingId: ''
};

function RollingNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    if (startValue === endValue && startValue !== 0) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <>{displayValue}</>;
}

function AnimatedHeaderTitle() {
  const letters = Array.from("Free QR Generator");
  
  const containerVariants: any = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.04,
      }
    }
  };
  
  const letterVariants: any = {
    initial: { 
      opacity: 0, 
      y: 8,
      scale: 0.9,
      filter: "blur(2px)" 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 150
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex items-center"
    >
      <h1 className="text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 flex select-none">
        {letters.map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block transition-colors hover:text-indigo-600 duration-150"
            style={{ 
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
            animate={{
              y: [0, -3, 0],
              color: ["#0f172a", "#4338ca", "#0f172a"]
            }}
            transition={{
              y: {
                duration: 2.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.08
              },
              color: {
                duration: 4.4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.08
              }
            }}
          >
            {char}
          </motion.span>
        ))}
      </h1>
    </motion.div>
  );
}

const drawerVariants: any = {
  hidden: { x: '100%', opacity: 0.95 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 220,
      staggerChildren: 0.04,
      delayChildren: 0.1,
    }
  },
  exit: {
    x: '100%',
    opacity: 0.95,
    transition: {
      type: 'spring',
      damping: 28,
      stiffness: 240,
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, x: 25 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 160,
    }
  }
};

const categoryContainerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05
    }
  }
};

const categoryCardVariants: any = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.25,
      ease: 'easeOut'
    }
  }
};

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<QRProject[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Real-time scan alerts toasts lists
  interface LiveToast {
    id: string;
    projectName: string;
    approxLocation: string;
    deviceType: string;
    browser: string;
    timestamp: string;
  }
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [nPermission, setNPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        return Notification.permission;
      } catch (err) {
        console.warn('Notification permission query blocked in sandboxed window:', err);
      }
    }
    return 'default';
  });

  // Request browser Notification API permission
  const handleRequestNPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNPermission(res);
      } catch (err) {
        console.error('[Notification Permission] Request failure:', err);
      }
    }
  };

  // Setup Real-time WebSocket scan notification engine
  useEffect(() => {
    if (!user) {
      setToasts([]);
      return;
    }

    const token = localStorage.getItem('qr_jwt_token');
    if (!token) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let keepAliveInterval: NodeJS.Timeout | null = null;
    let isClosedOnPurpose = false;

    const establishWS = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        const targetUrl = `${protocol}//${wsHost}/ws?token=${token}`;

        console.log('[WS Socket] Initiating real-time endpoint connection:', targetUrl);
        ws = new WebSocket(targetUrl);

        ws.onopen = () => {
          console.log('[WS Socket] Connection established successfully.');
          
          // Send regular tiny pings to keep reverse proxy connection from cutting off
          keepAliveInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'NEW_SCAN') {
              console.log('[WS Socket] Incoming real-time scan metrics:', parsed.data);
              const data = parsed.data;

              // Append toast safely
              const uid = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              setToasts((prev) => [
                ...prev,
                {
                  id: uid,
                  projectName: data.projectName,
                  approxLocation: data.approxLocation,
                  deviceType: data.deviceType,
                  browser: data.browser,
                  timestamp: data.timestamp
                }
              ]);

              // Play subtle synth-synthesized notification tone (chime sound effect)
              try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                  const audio = new AudioCtx();
                  const osc = audio.createOscillator();
                  const gainNode = audio.createGain();
                  
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(523.25, audio.currentTime); // C5 principal
                  osc.frequency.setValueAtTime(783.99, audio.currentTime + 0.08); // G5 chime accent
                  
                  gainNode.gain.setValueAtTime(0.06, audio.currentTime);
                  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.4);
                  
                  osc.connect(gainNode);
                  gainNode.connect(audio.destination);
                  
                  osc.start();
                  osc.stop(audio.currentTime + 0.4);
                }
              } catch (soundErr) {
                console.warn('[WS Socket] Audio tone play blocked:', soundErr);
              }

              // Deliver desktop native notification if granted
              if (typeof window !== 'undefined' && 'Notification' in window && nPermission === 'granted') {
                try {
                  const alertTitle = `New Scan: ${data.projectName}`;
                  new Notification(alertTitle, {
                    body: `📍 Location: ${data.approxLocation}\n📱 Device: ${data.deviceType} (${data.browser})\n🌐 IP: ${data.ip}`,
                    icon: '/favicon.ico',
                    tag: data.id,
                    silent: true // audio manually outputted
                  });
                } catch (desktopNotifyErr) {
                  console.error('[WS Socket] Native notify call failed:', desktopNotifyErr);
                }
              }

              // Refresh Recharts widgets & list logs instantly!
              fetchUserData();
            }
          } catch (msgErr) {
            console.error('[WS Socket] Message decoding failed:', msgErr);
          }
        };

        ws.onclose = (ev) => {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          if (!isClosedOnPurpose) {
            console.warn('[WS Socket] Connection lost. Attempting reconnection in 4 seconds...');
            reconnectTimeout = setTimeout(establishWS, 4000);
          }
        };

        ws.onerror = (wsErr) => {
          console.error('[WS Socket] Client connection error recorded:', wsErr);
        };
      } catch (e) {
        console.error('[WS Socket] Connection build error:', e);
      }
    };

    establishWS();

    return () => {
      isClosedOnPurpose = true;
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }
    };
  }, [user]);

  // Localization State
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('app-locale');
    if (saved === 'es' || saved === 'en') {
      return saved as Locale;
    }
    return 'en';
  });

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('app-locale', newLocale);
  };

  // Active configurations in the drawing board
  const [currentProject, setCurrentProject] = useState<Partial<QRProject>>(() => {
    try {
      const savedPalette = localStorage.getItem('qr-active-palette');
      if (savedPalette && savedPalette !== 'Custom') {
        const presets = [
          { name: 'Slate', main: '#0f172a', grad: '#3b82f6' },
          { name: 'Indigo', main: '#4f46e5', grad: '#ec4899' },
          { name: 'Emerald', main: '#059669', grad: '#10b981' },
          { name: 'Cherry', main: '#b91c1c', grad: '#f43f5e' },
          { name: 'Violet', main: '#6d28d9', grad: '#8b5cf6' },
          { name: 'Amber', main: '#b45309', grad: '#f59e0b' }
        ];
        const match = presets.find(p => p.name === savedPalette);
        if (match) {
          return {
            ...INITIAL_DESIGN,
            design: {
              ...INITIAL_DESIGN.design!,
              fgColor: match.main,
              gradientColor: match.grad,
            }
          };
        }
      }
    } catch (err) {
      console.error('[App] Error reading active palette on startup:', err);
    }
    return INITIAL_DESIGN;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guided Tour State
  const [tourRun, setTourRun] = useState(false);

  useEffect(() => {
    const hasRun = localStorage.getItem('qr-tour-completed');
    if (!hasRun) {
      const timer = setTimeout(() => {
        setTourRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setTourRun(false);
      localStorage.setItem('qr-tour-completed', 'true');
    }
  };

  const tourSteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: '✨ Welcome to Free QR Generator!',
      content: 'Let\'s take a 1-minute guided tour to show you how easy it is to create, brand-customize, and track scannable QR codes for your projects.',
    },
    {
      target: '#tour-qr-type',
      placement: 'right-start',
      title: '🔗 Step 1: Choose QR Type',
      content: 'First, select what content you want to embed. Supports URLs, WiFi credentials, vCard contacts, raw text, social profiles, crypto, or geographic coordinates.',
    },
    {
      target: '#tour-project-details',
      placement: 'right-start',
      title: '📝 Step 2: Set Project Name & Content',
      content: 'Provide a name to keep this QR design organized in your database, then enter the target website link, plain text, or network settings.',
    },
    {
      target: '#tour-color-palette',
      placement: 'right-start',
      title: '🎨 Step 3: Brand Color Customization',
      content: 'Apply beautiful predefined color palettes, or specify exact hex values for solid backgrounds, foregrounds, and dynamic gradient colors!',
    },
    {
      target: '#gemini-ai-co-pilot',
      placement: 'right',
      title: (
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="font-bold text-slate-900">🤖 Meet Your AI Co-Pilot — Powered by Gemini</span>
          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-200 whitespace-nowrap">✨ Exclusive Feature</span>
        </div>
      ),
      content: (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            This isn't just another QR generator. Tell our AI your business name and what you do, and Gemini instantly matches colors, gradients, and styles to your brand identity — no design skills needed. No other free QR tool does this.
          </p>
        </div>
      )
    },
    {
      target: '#tour-qr-styles',
      placement: 'right-start',
      title: '✨ Step 4: Corner Eyes & Dot Styles',
      content: 'Tweak node properties to match your brand style. Change Corner Eyes frames (Square, Circle, Leaf) or choose modern Dot configurations.',
    },
    {
      target: '#logo-settings-section',
      placement: 'right-start',
      title: '🏷️ Step 5: Overlay Logo or Emoji',
      content: 'Upload personal images or write simple custom words and emojis directly in the center of the tracker QR.',
    },
    {
      target: '#tour-analytics-toggle',
      placement: 'top',
      title: '📊 Step 6: Scan Metrics & Analytics',
      content: 'Toggle short URL proxy to securely collect visitor scan geo-locations, hardware models, browser user-agents, and scan timestamp graphs.',
    },
    {
      target: '#tour-link-expiration',
      placement: 'top',
      title: '⏳ Step 7: Optional Link Expiry',
      content: 'Control content availability! Set an expiry date and specify whether to show custom warnings or redirect visitors to backup URLs after expiration.',
    },
    {
      target: '#tour-folder-category',
      placement: 'top',
      title: '📁 Step 8: Organize in folders',
      content: 'Assign custom category folders (e.g. "Marketing", "Client A", "Personal") to easily search, sort, and organize designs in your history workspace.',
    },
    {
      target: '#tour-save-button',
      placement: 'top',
      title: '💾 Step 9: Save Design to Secure Cloud',
      content: 'Ready to download or track? Save your completed layout to your cloud storage safely so you never lose your progress.',
    },
    {
      target: '#tour-qr-preview',
      placement: 'left',
      title: '📱 Step 10: Real-time Live Preview',
      content: 'Behold your design live! Every action instantly redraws high-resolution modules. Print custom stickers, copy redirect links, or test scan this QR code directly with your smartphone device!',
    },
  ];

  // Active Tab
  const [activeTab, setActiveTab ] = useState<'create' | 'templates' | 'analytics' | 'boiler' | 'animations'>('create');

  // Filter for recently used categories
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'wifi' | 'whatsapp' | 'vcard' | 'restaurant' | 'social'>('all');

  // Cookie Consent banner state
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowCookieConsent(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowCookieConsent(false);
  };

  // Client path-routing states for SEO landing pages
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsHovered, setIsToolsHovered] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isCreativeHovered, setIsCreativeHovered] = useState(false);
  const [isCreativeOpen, setIsCreativeOpen] = useState(false);

  const [isMobileCreativeOpen, setIsMobileCreativeOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const creativeMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Close desktop mega menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (creativeMenuRef.current && !creativeMenuRef.current.contains(e.target as Node)) {
        setIsCreativeOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const showCreativeMenu = isCreativeOpen || isCreativeHovered;
  const showToolsMenu = isToolsOpen || isToolsHovered;
  
  // Determine if the currently active route belongs to Free QR Tools presets
  const isFreeQrToolsActive = currentPath !== '/' && currentPath !== '' && 
    !['/faq', '/about', '/privacy', '/contact', '/terms'].includes(currentPath) && 
    !currentPath.startsWith('/blog');

  // Handle escape press & focus trap inside the accessible mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    // Set focus to close button initially for quick accessibility
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 120);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      } else if (e.key === 'Tab') {
        if (!mobileMenuRef.current) return;
        const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent document scrolling on background when modal menu is open
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const getPresetIcon = (slug: string) => {
    switch (slug) {
      case 'wifi-qr-generator': return Wifi;
      case 'whatsapp-qr-generator': return Phone;
      case 'email-qr-generator': return Mail;
      case 'sms-qr-generator': return Phone;
      case 'vcard-qr-generator': return Contact;
      case 'url-qr-generator': return Globe;
      case 'business-card-qr-generator': return Contact;
      case 'restaurant-qr-generator': return Utensils;
      case 'facebook-qr-generator': return Facebook;
      case 'instagram-qr-generator': return Instagram;
      case 'youtube-qr-generator': return Youtube;
      case 'pdf-qr-generator': return FileText;
      default: return QrCode;
    }
  };

  // Set the default homepage browser window metadata dynamically
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      document.title = 'iSolutions QR Code Generator | Design Professional Trackable QR Codes';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', 'Design highly customized, scan-secured QR codes with modern color gradients, dot styles, and brand centerpieces. Complete with dynamic web link shortener tracking and real-time scan analytics.');
    }
  }, [currentPath]);

  const buildHomepageSchema = () => {
    const rootUrl = typeof window !== 'undefined' ? window.location.origin : 'https://qrcodeps.com';
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${rootUrl}/#website`,
          "url": rootUrl,
          "name": "iSolutions QR Code Generator",
          "description": "Design secure, highly custom QR codes with color gradients, custom dot patterns, embedded logos, and real-time short-link scan analytics.",
          "publisher": {
            "@id": `${rootUrl}/#organization`,
            "@type": "Organization",
            "name": "iSolutions QR Codes Inc.",
            "url": rootUrl
          }
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${rootUrl}/#software`,
          "name": "iSolutions QR Generator and Short Link tracker",
          "operatingSystem": "All modern web browsers",
          "applicationCategory": "DesignApplication, BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.95",
            "reviewCount": "5420"
          }
        }
      ]
    };
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiateGenerator = (preset: {
    type: QRProject['type'];
    content: string;
    name: string;
  }) => {
    setCurrentProject({
      ...currentProject,
      type: preset.type,
      content: preset.content,
      name: preset.name
    });
    setActiveTab('create');
    navigateTo('/');
  };

  // Control state for Clerk/Auth0-style Login Dialog
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Detect when user has scrolled down the page to condense the header
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to Authentication updates
  useEffect(() => {
    const initAuth = async () => {
      try {
        const u = await api.me();
        setUser(u);
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Fetch projects & scans when logged in
  const fetchUserData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const [projs, scanLogs] = await Promise.all([
        api.getProjects(),
        api.getScans()
      ]);
      setProjects(projs);
      setScans(scanLogs);
    } catch (err: any) {
      console.error('Error fetching user data dashboard:', err);
      setErrorMessage(err.message || 'Error occurred while loading analytics records.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProjects([]);
      setScans([]);
    }
  }, [user]);

  // SignIn and Authentication dialog activation
  const handleSignInClick = () => {
    setErrorMessage(null);
    setIsAuthModalOpen(true);
  };

  // Sign out session
  const handleSignOut = () => {
    api.logout();
    setUser(null);
    setCurrentProject(INITIAL_DESIGN);
    setProjects([]);
    setScans([]);
    setErrorMessage(null);
  };

  // Create or Update QR Design project
  const handleSaveProject = async () => {
    if (!user) {
      setErrorMessage('Please sign in or create an account to save QR designs to your library.');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const targetId = currentProject.id || '';
      const trackingId = currentProject.trackingId || Math.random().toString(36).substr(2, 6);

      let contentVal = currentProject.content || '';
      if (currentProject.type === 'url') {
        contentVal = contentVal.trim().replace(/\/+$/, '');
        // Update local state so user sees the cleaned content value in UI
        setCurrentProject(prev => ({ ...prev, content: contentVal }));
      }

      const projectData: Partial<QRProject> = {
        id: targetId,
        name: currentProject.name || 'My Styled QR',
        type: currentProject.type || 'url',
        content: contentVal || 'https://google.com',
        design: {
          fgColor: currentProject.design?.fgColor || '#0f172a',
          bgColor: currentProject.design?.bgColor || '#ffffff',
          gradientType: currentProject.design?.gradientType || 'none',
          gradientColor: currentProject.design?.gradientColor || '#4f46e5',
          dotStyle: currentProject.design?.dotStyle || 'square',
          eyeStyle: currentProject.design?.eyeStyle || 'square',
          logoUrl: currentProject.design?.logoUrl || '',
          logoScale: currentProject.design?.logoScale || 0.18,
          margin: typeof currentProject.design?.margin === 'number' ? currentProject.design?.margin : 20,
          logoRotation: currentProject.design?.logoRotation || 0,
          colorShift: currentProject.design?.colorShift || false,
          eyeColorTopLeft: currentProject.design?.eyeColorTopLeft || '',
          eyeColorTopRight: currentProject.design?.eyeColorTopRight || '',
          eyeColorBottomLeft: currentProject.design?.eyeColorBottomLeft || '',
          errorCorrectionLevel: currentProject.design?.errorCorrectionLevel || 'H'
        },
        trackingEnabled: currentProject.trackingEnabled ?? true,
        trackingId: trackingId
      };

      const saved = await api.saveProject(projectData);
      
      // Select newly saved project
      setCurrentProject(saved);
      
      // Refetch user data
      await fetchUserData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while saving configurations.');
    } finally {
      setIsSaving(false);
    }
  };

  // Restore saved config
  const handleSelectProject = (proj: QRProject) => {
    setCurrentProject(proj);
    setErrorMessage(null);
  };

  // Delete project from database ledger
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR preset?')) return;
    try {
      setErrorMessage(null);
      await api.deleteProject(id);
      if (currentProject.id === id) {
        setCurrentProject(INITIAL_DESIGN);
      }
      await fetchUserData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error removing item from the database.');
    }
  };

  // In-app test scan click handler
  const handleSimTestScan = async (text: string) => {
    // If it's a tracking URL, trigger a redirect click or trigger local record logging
    if (currentProject.trackingEnabled && currentProject.id && currentProject.trackingId) {
      await handleSeedScanClick(currentProject.id, currentProject.trackingId);
    }
  };

  // Generate / Seed mock scan analytics logs (for testing Recharts)
  const handleSeedScanClick = async (projectId: string, trackingId: string) => {
    if (!user) {
      setErrorMessage('Please sign in first to simulate scan events on your layout.');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await api.seedScanClick(projectId, trackingId);
      await fetchUserData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Verification Error: Seed writing failed. Make sure user is fully logged in.');
    }
  };

  // Wipe scans logs completely
  const handlePurgeAllScans = async () => {
    if (!confirm('Are you sure you want to clear all scans logs? This is irreversible.')) return;
    try {
      await api.purgeScans();
      await fetchUserData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error clearing logs.');
    }
  };

  // Triggers modern dialog overlay immediately after a file download action completes
  const handleDownloadTrigger = () => {
    if (!user) {
      setTimeout(() => {
        setErrorMessage(
          '🎯 Applet downloaded successfully! To prevent losing this beautifully styled QR template and unlock real-time scan analytics, claim your secure cloud session now.'
        );
        setIsAuthModalOpen(true);
      }, 400);
    }
  };

  const slug = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
  const isLandingPage = !!landingPages[slug];

  return (
    <div className="min-h-screen bg-slate-50/80 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      <Joyride
        {...({
          steps: tourSteps,
          run: tourRun,
          continuous: true,
          showSkipButton: true,
          showProgress: true,
          overlayClickAction: 'close',
          callback: handleJoyrideCallback,
          locale: {
            back: 'Back',
            close: 'Close',
            last: 'Finish',
            next: 'Next',
            skip: (
              <span className="flex flex-col items-start gap-1 text-left select-none">
                <span className="font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider text-[11px]">Skip Tour</span>
                <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal block leading-snug whitespace-nowrap">
                  💡 Click anywhere outside to exit
                </span>
              </span>
            )
          },
          styles: {
            options: {
              arrowColor: '#ffffff',
              backgroundColor: '#ffffff',
              overlayColor: 'rgba(15, 23, 42, 0.45)',
              primaryColor: '#4f46e5',
              textColor: '#1e293b',
              zIndex: 10000,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            buttonNext: {
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '8px 16px',
              cursor: 'pointer',
            },
            buttonBack: {
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '600',
              marginRight: '12px',
              cursor: 'pointer',
            },
            buttonSkip: {
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '4px 0',
            }
          }
        } as any)}
      />
          {/* Dynamic Upper Banner */}
      <motion.header 
        animate={{
          y: isScrolled ? [-10, 0] : 0,
        }}
        transition={{ type: "spring", damping: 18, stiffness: 200 }}
        className={`sticky top-0 z-50 px-6 flex items-center justify-between border-b backdrop-blur-xl transition-all duration-500 ease-in-out ${
          isScrolled 
            ? 'py-2.5 border-slate-200/85 shadow-md bg-white/40 shadow-indigo-100/20' 
            : 'py-5 border-slate-200/40 shadow-xs bg-white/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100/60 hover:scale-105 transition-transform duration-200">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <AnimatedHeaderTitle />
            <p className="text-[10px] sm:text-xs font-mono text-indigo-600 font-medium tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE DATABOX
            </p>
          </div>
        </div>

        {/* Dynamic Center Navigation for Desktop */}
        <nav className="hidden md:flex items-center gap-6 relative">
          
          {/* Creative Station Dropdown */}
          <div 
            ref={creativeMenuRef}
            className="relative"
            onMouseEnter={() => setIsCreativeHovered(true)}
            onMouseLeave={() => setIsCreativeHovered(false)}
          >
            <button 
              onClick={() => setIsCreativeOpen(!isCreativeOpen)}
              className="relative py-2.5 px-4 text-xs font-bold tracking-wide transition-all group/creative flex items-center gap-2 focus:outline-none rounded-xl overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-indigo-50/0 group-hover/creative:bg-indigo-50/50 transition-colors duration-300 rounded-xl" />
              
              <Sparkles className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/creative:scale-110 group-hover/creative:rotate-12 ${currentPath === '/' || currentPath === '' ? 'text-indigo-600' : 'text-slate-400 group-hover/creative:text-indigo-500'}`} />
              
              <span className={`relative z-10 font-bold ${currentPath === '/' || currentPath === '' ? 'text-indigo-600' : 'text-slate-600 group-hover/creative:text-indigo-600'} transition-colors`}>
                {navTranslations[locale].creativeStation}
              </span>
              
              <ChevronDown className={`w-3 h-3 relative z-10 text-slate-400 group-hover/creative:text-indigo-500 transition-transform duration-300 ${showCreativeMenu ? 'rotate-180 text-indigo-600' : ''}`} />

              {(currentPath === '/' || currentPath === '') && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full shadow-xs shadow-indigo-400/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Creative Station Mega Dropdown Menu Panel */}
            <AnimatePresence>
              {showCreativeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ type: "spring", damping: 18, stiffness: 220 }}
                  className="absolute top-full left-0 pt-2.5 z-50 pointer-events-auto"
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/95 shadow-2xl p-5 w-[380px] grid grid-cols-1 gap-1.5 ring-1 ring-black/5 animate-fade-in text-left">
                    <div className="border-b border-slate-100 pb-2 mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-mono">{navTranslations[locale].designStudio}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">{navTranslations[locale].workspaces}</span>
                    </div>

                    {[
                      { name: creativeSubItems[locale][0].name, desc: creativeSubItems[locale][0].desc, action: () => { setActiveTab('create'); navigateTo('/'); }, icon: Wand2 },
                      { name: creativeSubItems[locale][1].name, desc: creativeSubItems[locale][1].desc, action: () => { setActiveTab('create'); navigateTo('/'); }, icon: Palette },
                      { name: creativeSubItems[locale][2].name, desc: creativeSubItems[locale][2].desc, action: () => { setActiveTab('templates'); navigateTo('/'); }, icon: LayoutTemplate },
                      { name: creativeSubItems[locale][3].name, desc: creativeSubItems[locale][3].desc, action: () => { setActiveTab('animations'); navigateTo('/'); }, icon: Play },
                      { name: creativeSubItems[locale][4].name, desc: creativeSubItems[locale][4].desc, action: () => { setActiveTab('create'); navigateTo('/'); setTimeout(() => { const sec = document.getElementById('logo-settings-section'); if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250); }, icon: Image },
                      { name: creativeSubItems[locale][5].name, desc: creativeSubItems[locale][5].desc, action: () => { setActiveTab('boiler'); navigateTo('/'); }, icon: Megaphone }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={idx}
                          href="/"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsCreativeOpen(false);
                            setIsCreativeHovered(false);
                            item.action();
                          }}
                          className="flex items-start gap-3 p-2 rounded-xl transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50/80 group/creative-item"
                        >
                          <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600 group-hover/creative-item:bg-indigo-600 group-hover/creative-item:text-white transition-all">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold text-slate-900 group-hover/creative-item:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</span>
                            <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
                  {/* Free QR Tools Dropdown */}
          <div 
            ref={toolsMenuRef}
            className="relative"
            onMouseEnter={() => setIsToolsHovered(true)}
            onMouseLeave={() => setIsToolsHovered(false)}
          >
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="relative py-2.5 px-4 text-xs font-bold tracking-wide transition-all group/btn flex items-center gap-2 focus:outline-none rounded-xl overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-indigo-50/0 group-hover/btn:bg-indigo-50/50 transition-colors duration-300 rounded-xl" />
              
              <Compass className={`w-3.5 h-3.5 relative z-10 transition-transform duration-500 group-hover/btn:rotate-180 ${isFreeQrToolsActive ? 'text-indigo-600' : 'text-slate-400 group-hover/btn:text-indigo-500'}`} />
              
              <span className={`relative z-10 font-bold ${isFreeQrToolsActive ? 'text-indigo-600' : 'text-slate-600 group-hover/btn:text-indigo-600'} transition-colors`}>
                {navTranslations[locale].freeQrTools}
              </span>
              
              <ChevronDown className={`w-3 h-3 relative z-10 text-slate-400 group-hover/btn:text-indigo-500 transition-transform duration-300 ${showToolsMenu ? 'rotate-180 text-indigo-600' : ''}`} />
              
              {isFreeQrToolsActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full shadow-xs shadow-indigo-400/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            
            {/* Animated Dropdown Menu Panel */}
            <AnimatePresence>
              {showToolsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ type: "spring", damping: 18, stiffness: 220 }}
                  className="absolute top-full left-1/2 pt-2.5 z-50 pointer-events-auto"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl p-5 w-[640px] grid grid-cols-2 gap-2.5 ring-1 ring-black/5 animate-fade-in text-left">
                    <div className="col-span-2 border-b border-slate-100 pb-2 mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-mono">{navTranslations[locale].expertPresets}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">{navTranslations[locale].channelsCount}</span>
                    </div>

                    {presetToolsTranslations[locale].map((toolItem) => {
                      const isPrebuiltSlug = toolItem.slug !== 'text-qr' && toolItem.slug !== 'app-store-qr';
                      const isCurrentActive = isPrebuiltSlug ? currentPath === `/${toolItem.slug}` : false;
                      const IconComponent = getPresetIcon(toolItem.slug);
                      const action = toolItem.slug === 'text-qr' 
                        ? () => handleInitiateGenerator({ type: 'text', content: 'Free QR Tools Text Campaign', name: 'Text QR Campaign' })
                        : toolItem.slug === 'app-store-qr'
                        ? () => handleInitiateGenerator({ type: 'url', content: 'https://apps.apple.com', name: 'App Store Download' })
                        : undefined;

                      return (
                        <a
                          key={toolItem.name}
                          href={isPrebuiltSlug ? `/${toolItem.slug}` : "/"}
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setIsToolsOpen(false);
                            setIsToolsHovered(false); 
                            if (action) {
                              action();
                            } else {
                              navigateTo(`/${toolItem.slug}`); 
                            }
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all relative overflow-hidden group/item ${
                            isCurrentActive 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-100 shadow-3xs' 
                              : 'hover:bg-slate-50/80 border border-transparent hover:border-slate-100'
                          }`}
                        >
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                            isCurrentActive 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                              : 'bg-slate-150/60 text-slate-500 group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:scale-105 group-hover/item:rotate-3'
                          }`}>
                            <IconComponent className="w-4 h-4 transition-transform duration-300 group-hover/item:scale-110" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="block text-xs font-extrabold text-slate-900 group-hover/item:text-indigo-600 transition-colors truncate uppercase tracking-tight">
                                {toolItem.name}
                              </span>
                              {isCurrentActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                              )}
                            </div>
                            <span className="block text-[10px] text-slate-500 truncate mt-0.5 leading-normal">
                              {toolItem.desc}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="/faq"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/faq');
            }}
            className="relative py-2.5 px-4 text-xs font-bold tracking-wide transition-all group/faq flex items-center gap-2 focus:outline-none rounded-xl overflow-hidden cursor-pointer"
          >
            <span className="absolute inset-0 bg-indigo-50/0 group-hover/faq:bg-indigo-50/50 transition-colors duration-300 rounded-xl" />
            <HelpCircle className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/faq:scale-110 ${currentPath === '/faq' ? 'text-indigo-600' : 'text-slate-400 group-hover/faq:text-indigo-500'}`} />
            <span className={`relative z-10 font-bold ${currentPath === '/faq' ? 'text-indigo-600' : 'text-slate-600 group-hover/faq:text-indigo-600'} transition-colors`}>
              {navTranslations[locale].faqTitle}
            </span>
            {currentPath === '/faq' && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full shadow-xs shadow-indigo-400/80"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </a>

          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/blog');
            }}
            className="relative py-2.5 px-4 text-xs font-bold tracking-wide transition-all group/blog flex items-center gap-2 focus:outline-none rounded-xl overflow-hidden cursor-pointer"
          >
            <span className="absolute inset-0 bg-indigo-50/0 group-hover/blog:bg-indigo-50/50 transition-colors duration-300 rounded-xl" />
            <BookOpen className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/blog:scale-110 ${currentPath.startsWith('/blog') ? 'text-indigo-600' : 'text-slate-400 group-hover/blog:text-indigo-500'}`} />
            <span className={`relative z-10 font-bold ${currentPath.startsWith('/blog') ? 'text-indigo-600' : 'text-slate-600 group-hover/blog:text-indigo-600'} transition-colors`}>
              {navTranslations[locale].blogTitle}
            </span>
            {currentPath.startsWith('/blog') && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full shadow-xs shadow-indigo-400/80"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </a>
        </nav>

        {/* Auth controllers & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Guided Tour Trigger Button */}
          <button
            type="button"
            id="tour-trigger-button"
            onClick={() => setTourRun(true)}
            className="flex items-center gap-1.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 hover:text-indigo-800 font-bold text-[10px] sm:text-xs py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer shadow-3xs hover:scale-105 active:scale-[0.98] mr-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Tour</span>
          </button>

          {/* Language Switcher Button */}
          <div className="bg-slate-100/80 backdrop-blur-xs rounded-xl p-0.5 border border-slate-200/60 flex items-center mr-1">
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                locale === 'en'
                  ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('es')}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                locale === 'es'
                  ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              ES
            </button>
          </div>

          {authLoading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Desktop alerts permission bell controller */}
              <button
                type="button"
                onClick={handleRequestNPermission}
                title={
                  nPermission === 'granted'
                    ? 'Real-time Desktop Alerts are active'
                    : nPermission === 'denied'
                    ? 'Alerts are blocked. Check browser address bar settings.'
                    : 'Click to enable real-time Desktop Alerts for new scans'
                }
                className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                  nPermission === 'granted'
                    ? 'bg-emerald-50/70 text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                    : nPermission === 'denied'
                    ? 'bg-slate-100 text-slate-400 border-slate-200/60 cursor-not-allowed'
                    : 'bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                {nPermission === 'granted' && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
                )}
                {nPermission === 'denied' && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-[8px] font-bold">
                    !
                  </span>
                )}
              </button>

              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-gray-800 block">{user.name}</span>
                <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">{user.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-indigo-100 shadow-xs flex items-center justify-center bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="py-1.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1 border border-gray-200 cursor-pointer transition-colors"
               >
                <LogOut className="w-3.5 h-3.5" />
                {navTranslations[locale].signOut}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {navTranslations[locale].signIn}
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white shadow-3xs cursor-pointer text-slate-700 hover:text-indigo-600 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={isMobileMenuOpen ? "Close main navigation menu" : "Open main navigation menu"}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Sliding Navigation Menu with spring-loaded accessibility drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay with Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs md:hidden"
            />

            {/* Slide-In Side Navigation Drawer */}
            <motion.div
              ref={mobileMenuRef}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              id="mobile-navigation-menu"
              className="fixed top-0 right-0 bottom-0 z-55 w-full max-w-[320px] bg-slate-900 text-slate-100 shadow-2xl flex flex-col md:hidden border-l border-slate-800"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              tabIndex={-1}
            >
              {/* Drawer Title & Close Control */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-950/45">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono">
                    PRO-SEO UTILITIES
                  </span>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-800 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Staggered Navigation Items list with Accordions */}
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4 scrollbar-thin">
                
                {/* 1. Creative Station Accordion */}
                <div className="border-b border-slate-800/60 pb-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileCreativeOpen(!isMobileCreativeOpen)}
                    className="w-full flex items-center justify-between px-2 py-2.5 text-xs font-black tracking-wider uppercase text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-mono tracking-widest text-[10px] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {navTranslations[locale].creativeStation}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isMobileCreativeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isMobileCreativeOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden pl-2 flex flex-col gap-1 mt-1"
                      >
                        {creativeSubItems[locale].map((sub, idx) => {
                          const subIcons = [Wand2, Palette, LayoutTemplate, Play, Image, Megaphone];
                          const SubIcon = subIcons[idx] || Wand2;
                          const subActions = [
                            () => { setActiveTab('create'); navigateTo('/'); },
                            () => { setActiveTab('create'); navigateTo('/'); },
                            () => { setActiveTab('templates'); navigateTo('/'); },
                            () => { setActiveTab('animations'); navigateTo('/'); },
                            () => {
                              setActiveTab('create'); navigateTo('/');
                              setTimeout(() => {
                                const logoSec = document.getElementById('logo-settings-section');
                                if (logoSec) logoSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 250);
                            },
                            () => { setActiveTab('boiler'); navigateTo('/'); }
                          ];
                          const subAction = subActions[idx] || (() => {});

                          return (
                            <button
                              key={sub.name}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                subAction();
                              }}
                              className="w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                <SubIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block font-bold truncate">{sub.name}</span>
                                <span className="block text-[9px] text-slate-500 truncate">{sub.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Free QR Tools Accordion */}
                <div className="border-b border-slate-800/60 pb-3">
                  <button
                    type="button"
                    onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                    className="w-full flex items-center justify-between px-2 py-2.5 text-xs font-black tracking-wider uppercase text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-mono tracking-widest text-[10px] flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      {navTranslations[locale].freeQrTools}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isMobileToolsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden pl-2 flex flex-col gap-1 mt-1"
                      >
                        {presetToolsTranslations[locale].map((sub, idx) => {
                          const presetIcons = [Globe, FileText, Wifi, Contact, Mail, Phone, Phone, Instagram, FileText, Smartphone];
                          const SubIcon = presetIcons[idx] || Compass;
                          const isPrebuiltSlug = sub.slug !== 'text-qr' && sub.slug !== 'app-store-qr';
                          const isCurrentActive = isPrebuiltSlug ? currentPath === `/${sub.slug}` : false;
                          
                          const subAction = sub.slug === 'text-qr' 
                            ? () => handleInitiateGenerator({ type: 'text', content: 'Free QR Tools Text Campaign', name: 'Text QR Campaign' })
                            : sub.slug === 'app-store-qr'
                            ? () => handleInitiateGenerator({ type: 'url', content: 'https://apps.apple.com', name: 'App Store Download' })
                            : undefined;

                          return (
                            <button
                              key={sub.name}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (subAction) {
                                  subAction();
                                } else {
                                  navigateTo(`/${sub.slug}`);
                                }
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                                isCurrentActive 
                                  ? 'bg-gradient-to-r from-indigo-950/40 to-purple-950/20 text-indigo-400 border border-indigo-500/20' 
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCurrentActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                                <SubIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold">{sub.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. General Links */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/faq');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].faqTitle}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/blog');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].blogTitle}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab('analytics');
                      navigateTo('/');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">Scan Analytics</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/about');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].aboutUs}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/contact');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].contactSupport}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/privacy');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].privacyPolicy}</span>
                  </button>
                </div>

              </div>

              {/* Sticky bottom summary & Account profile state */}
              <div className="p-4 bg-slate-950/55 border-t border-slate-800/60">
                {user ? (
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-slate-500 block font-mono">CONNECTED</span>
                      <span className="text-xs font-extrabold text-slate-200 block truncate">{user.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="py-1.5 px-3 bg-red-950/30 active:bg-red-950/50 hover:bg-red-950/40 hover:text-red-200 border border-red-900/40 rounded-xl text-[10px] font-black uppercase text-red-400 tracking-wider transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignInClick();
                    }}
                    className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/40 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Connect Account
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Primary Container Grid */}
      {isLandingPage ? (
        <React.Suspense fallback={<LazyLoader />}>
          <SEOPage 
            slug={slug} 
            onSelectRoute={navigateTo} 
            onInitiateGenerator={handleInitiateGenerator} 
          />
        </React.Suspense>
      ) : currentPath === '/faq' ? (
        <React.Suspense fallback={<LazyLoader />}>
          <FaqSection onNavigate={navigateTo} locale={locale} />
        </React.Suspense>
      ) : (currentPath === '/blog' || currentPath.startsWith('/blog/')) ? (
        <React.Suspense fallback={<LazyLoader />}>
          <BlogSection 
            initialSlug={currentPath.startsWith('/blog/') ? currentPath.substring(6) : null} 
            onNavigate={navigateTo} 
            locale={locale}
          />
        </React.Suspense>
      ) : ['/about', '/privacy', '/contact', '/terms'].includes(currentPath) ? (
        <React.Suspense fallback={<LazyLoader />}>
          <CompanyPages 
            view={currentPath.substring(1) as 'about' | 'privacy' | 'contact' | 'terms'} 
            onNavigate={navigateTo} 
          />
        </React.Suspense>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Top Leaderboard Native Ad unit */}
        <AdSenseUnit
          id="top-leaderboard-ad"
          adSlot="1000000001"
          adFormat="horizontal"
          style={{ display: 'block', minHeight: '90px', width: '100%' }}
          className="w-full bg-linear-to-r from-slate-50 to-indigo-50/10 border-indigo-100/40"
        />

        {/* Tab view controller */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-white border border-gray-200/80 p-1.5 rounded-2xl max-w-xl shadow-xs gap-1">
          <button
            type="button"
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'create' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Creative Station
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Scan Analytics
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'boiler' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('boiler')}
          >
            Mobile Packages
          </button>
          <button
            type="button"
            className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'animations'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xs font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('animations')}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'animations' ? 'text-yellow-300 animate-spin-slow' : 'text-purple-500'}`} />
            Animations
          </button>
        </div>

        {/* Interactive errors alerting banner */}
        {errorMessage && (
          <div className="bg-red-55 border border-red-200/65 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-950">System Alert</h4>
              <p className="text-[11px] text-red-800 mt-1 font-mono leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* tab pages routing rendering */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side Workspace Customize controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ControlPanel
                currentProject={currentProject}
                onChange={setCurrentProject}
                onSave={handleSaveProject}
                isSaving={isSaving}
                userEmail={user?.email}
                projects={projects}
              />

              {/* Saved History List Ledger */}
              <React.Suspense fallback={<div className="bg-slate-50 rounded-3xl h-48 animate-pulse border border-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium">Loading saved collection...</div>}>
                <SavedProjects
                  projects={projects}
                  onSelect={handleSelectProject}
                  onDelete={handleDeleteProject}
                  onSeedData={handleSeedScanClick}
                  isLoading={isLoadingData}
                />
              </React.Suspense>
            </div>

            {/* Right side Live Previews boards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <PreviewPanel 
                currentProject={currentProject} 
                onTestScan={handleSimTestScan} 
                onDownloadTrigger={handleDownloadTrigger} 
              />

              {/* Native Sidebar / Display Ad Unit */}
              <AdSenseUnit
                id="sidebar-native-ad"
                adSlot="2000000002"
                adFormat="rectangle"
                style={{ display: 'block', minHeight: '220px' }}
                className="w-full bg-linear-to-b from-slate-50 to-indigo-50/10 border-indigo-100/40"
                label="SPONSORED HIGHLIGHT"
              />
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side Workspace Templates controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <React.Suspense fallback={<LazyLoader />}>
                <TemplatesTab
                  currentProject={currentProject}
                  onChange={setCurrentProject}
                />
              </React.Suspense>
            </div>

            {/* Right side Live Previews boards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <PreviewPanel 
                currentProject={currentProject} 
                onTestScan={handleSimTestScan} 
                onDownloadTrigger={handleDownloadTrigger} 
              />

              {/* Native Sidebar / Display Ad Unit */}
              <AdSenseUnit
                id="sidebar-native-ad"
                adSlot="2000000002"
                adFormat="rectangle"
                style={{ display: 'block', minHeight: '220px' }}
                className="w-full bg-linear-to-b from-slate-50 to-indigo-50/10 border-indigo-100/40"
                label="SPONSORED HIGHLIGHT"
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto w-full">
            {user ? (
              <React.Suspense fallback={<LazyLoader />}>
                <AnalyticsDashboard scans={scans} projects={projects} onPurgeAll={handlePurgeAllScans} />
              </React.Suspense>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Access Restricted</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Please sign in or create a secure account to access real-time visitor logs and Recharts dashboard layouts.
                </p>
                <button
                  type="button"
                  onClick={handleSignInClick}
                  className="mt-6 py-2.5 px-6 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Sign In / Sign Up Card
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'boiler' && (
          <div className="max-w-4xl mx-auto w-full">
            <React.Suspense fallback={<LazyLoader />}>
              <MobileAppMockup />
            </React.Suspense>
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="w-full">
            <React.Suspense fallback={<LazyLoader />}>
              <AnimationsShowcase
                currentProject={currentProject}
                onChange={setCurrentProject}
                onDownloadTrigger={handleDownloadTrigger}
              />
            </React.Suspense>
          </div>
        )}

        {/* Dynamic Homepage SEO & Internal Linking Architecture */}
        {!isLandingPage && (
          <div id="seo-homepage-directory" className="mt-16 border-t border-slate-200/60 pt-16 space-y-16 select-none bg-linear-to-b from-transparent to-slate-50/40 p-6 rounded-3xl">
            {/* JSON-LD Homepage Schema injection */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHomepageSchema()) }} />

            {/* Popular QR Tools Section */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
                  High Performance Directory
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Popular QR Code Tools
                </h2>
                <p className="text-xs text-slate-500 leading-normal">
                  Create customized, pixel-perfect QR presets with absolute local encryption. Select highly optimized categories below to launch specialized templates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* 1. WiFi QR Generator */}
                <div id="tool-wifi-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold">
                      <Wifi className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">WiFi Network Sharing</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Share secure wireless access keys instantly without disclosing the underlying password details to anyone.
                    </p>
                  </div>
                  <a
                    id="tool-wifi-link"
                    href="/wifi-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                  >
                    Launch Custom Generator
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* 2. WhatsApp Channels */}
                <div id="tool-whatsapp-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-910">WhatsApp QR Code</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Scale conversions with standard chat presets. Simply hover and tap to start real conversational chats immediately.
                    </p>
                  </div>
                  <a
                    id="tool-whatsapp-link"
                    href="/whatsapp-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5"
                  >
                    Launch WhatsApp Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* 3. URL Web link */}
                <div id="tool-url-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-pink-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4">
                      <Globe className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">Trackable URL Generator</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Redirect clients to landing pages, social profiles, and premium digital portfolios with inline shortened link trackers.
                    </p>
                  </div>
                  <a
                    id="tool-url-link"
                    href="/url-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/url-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1.5"
                  >
                    Launch URL Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* 4. Restaurant menus */}
                <div id="tool-restaurant-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                      <Utensils className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">Restaurant QR Code</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Upgrade dining rooms to pristine, contactless digital menu boards. Free PDF upload and dynamic redirection.
                    </p>
                  </div>
                  <a
                    id="tool-restaurant-link"
                    href="/restaurant-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1.5"
                  >
                    Launch Restaurant Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* 5. Business card */}
                <div id="tool-vcard-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Contact className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">vCard Digital Business Card</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Embed direct contact records, telephone links, mail headers, and social usernames directly onto one scan-card.
                    </p>
                  </div>
                  <a
                    id="tool-vcard-link"
                    href="/vcard-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5"
                  >
                    Launch vCard Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* 6. Instagram profile */}
                <div id="tool-instagram-card" className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-rose-500/50 hover:shadow-md transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                      <Instagram className="w-5 h-5 text-indigo-650" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">Instagram QR Code</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Build high-social influence with beautiful, fast-loading follow tags optimized for flyers, storefront boards, and business prints.
                    </p>
                  </div>
                  <a
                    id="tool-instagram-link"
                    href="/instagram-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/instagram-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
                  >
                    Launch Instagram Tool
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </section>

            {/* Recently Used QR Categories */}
            <section id="recent-categories" className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
              
              <div className="max-w-2xl space-y-2 relative z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400 font-mono inline-block">
                  Live Usage Statistics and Trends
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Recently Used QR Categories
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Over 14,000 professional campaigns style high-contrast QR visual patterns monthly. See active metrics:
                </p>
              </div>

              {/* Category Filter Controls */}
              <div id="category-filter-bar" className="flex flex-wrap gap-2 mt-6 pb-4 border-b border-slate-800/80 relative z-10">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'wifi', label: 'WiFi Pairing' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'vcard', label: 'vCards' },
                  { id: 'restaurant', label: 'Menus' },
                  { id: 'social', label: 'Social Media' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    id={`filter-btn-${cat.id}`}
                    onClick={() => setSelectedCategoryFilter(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-250 cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.03]'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <motion.div 
                variants={categoryContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="flex overflow-x-auto sm:grid sm:grid-cols-2 gap-4 mt-8 pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10 snap-x snap-mandatory"
              >
                <AnimatePresence mode="popLayout">
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'wifi') && (
                    <motion.div key="wifi-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-wifi-card" 
                        className="h-full p-5 bg-slate-950 rounded-2xl border border-slate-850/50 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-indigo-500 hover:shadow-[inset_0_0_15px_rgba(99,102,241,0.35),0_25px_60px_-15px_rgba(99,102,241,0.45),0_0_40px_rgba(99,102,241,0.3)] group"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">📡 Wireless Tech Integration • 2 min ago</span>
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors">Wireless Wi-Fi SSID Pairing</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Used by 1,480+ local hosts, cafeteria managers, and Airbnb operations. Allows direct, no-type scan router pairing.
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Scan Activity Rate</span>
                            <span className="font-extrabold text-slate-300"><RollingNumber value={Math.min(100, 68 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'wifi'))?.length || 0) * 3)} />%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, 68 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'wifi'))?.length || 0) * 3)}%` }}
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                          </div>
                        </div>

                        <a
                          id="recent-wifi-link"
                          href="/wifi-qr-generator"
                          onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }}
                          className="mt-4 text-xs font-bold text-indigo-400 group-hover:text-white flex items-center gap-1"
                        >
                          Explore Free WiFi lander
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'whatsapp') && (
                    <motion.div key="whatsapp-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-whatsapp-card" 
                        className="h-full p-5 bg-slate-950 rounded-2xl border border-slate-850/50 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[inset_0_0_15px_rgba(16,185,129,0.35),0_25px_60px_-15px_rgba(16,185,129,0.45),0_0_40px_rgba(16,185,129,0.3)] group"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">💬 Chat Integrations • 10 min ago</span>
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors">Direct WhatsApp Customer Support</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Used by retail stores and digital agencies to enable rapid customer service requests. Launches formatted text templates.
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Scan Activity Rate</span>
                            <span className="font-extrabold text-slate-300">{Math.min(100, 75 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me')))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, 75 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me')))?.length || 0) * 3)}%` }}
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            />
                          </div>
                        </div>

                        <a
                          id="recent-whatsapp-link"
                          href="/whatsapp-qr-generator"
                          onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }}
                          className="mt-4 text-xs font-bold text-emerald-400 group-hover:text-white flex items-center gap-1"
                        >
                          Explore WhatsApp lander
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'vcard') && (
                    <motion.div key="vcard-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-vcard-card" 
                        className="h-full p-5 bg-slate-950 rounded-2xl border border-slate-850/50 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-purple-500 hover:shadow-[inset_0_0_15px_rgba(168,85,247,0.35),0_25px_60px_-15px_rgba(168,85,247,0.45),0_0_40px_rgba(168,85,247,0.3)] group"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block">📇 Business Connectivity • 15 min ago</span>
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-purple-400 transition-colors">Interactive Content-Rich vCards</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Designed weekly by real estate brokers and dynamic consulting networks. Instantly saves primary contact cards.
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Scan Activity Rate</span>
                            <span className="font-extrabold text-slate-300">{Math.min(100, 92 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'card'))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, 92 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'card'))?.length || 0) * 3)}%` }}
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                          </div>
                        </div>

                        <a
                          id="recent-vcard-link"
                          href="/vcard-qr-generator"
                          onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }}
                          className="mt-4 text-xs font-bold text-purple-400 group-hover:text-white flex items-center gap-1"
                        >
                          Explore vCard lander
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'restaurant') && (
                    <motion.div key="restaurant-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-restaurant-card" 
                        className="h-full p-5 bg-slate-950 rounded-2xl border border-slate-850/50 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-amber-500 hover:shadow-[inset_0_0_15px_rgba(245,158,11,0.35),0_25px_60px_-15px_rgba(245,158,11,0.45),0_0_40px_rgba(245,158,11,0.3)] group"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">📊 Dynamic Menu Hosting • 1 hr ago</span>
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-amber-400 transition-colors">Restaurant Menus & PDF Hosters</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Leveraged by cafes, visual bistros, and contactless fast-food spots. Keeps dynamic menu files editable and local.
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Scan Activity Rate</span>
                            <span className="font-extrabold text-slate-300">{Math.min(100, 40 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'url' || p.type === 'text') && (p.content.includes('menu') || p.content.includes('pdf'))))?.length || 0) * 4)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, 40 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'url' || p.type === 'text') && (p.content.includes('menu') || p.content.includes('pdf'))))?.length || 0) * 4)}%` }}
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                            />
                          </div>
                        </div>

                        <a
                          id="recent-restaurant-link"
                          href="/restaurant-qr-generator"
                          onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }}
                          className="mt-4 text-xs font-bold text-amber-400 group-hover:text-white flex items-center gap-1"
                        >
                          Explore Restaurant lander
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'social') && (
                    <motion.div key="social-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-social-card" 
                        className="h-full p-5 bg-slate-950 rounded-2xl border border-slate-850/50 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-pink-500 hover:shadow-[inset_0_0_15px_rgba(236,72,153,0.35),0_25px_60px_-15px_rgba(236,72,153,0.45),0_0_40px_rgba(236,72,153,0.3)] group"
                        style={{ transition: 'all 0.3s ease', contentVisibility: 'auto' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-pink-400 font-bold uppercase block">📲 Bio Links & Socials • 2 hrs ago</span>
                          <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-pink-400 transition-colors">Social Multi-Link Hubs</h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            Designed weekly by micro-influencers, content creators, and local artists to map multiple platforms inside a single aesthetic scan.
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>Scan Activity Rate</span>
                            <span className="font-extrabold text-slate-300">{Math.min(100, 83 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && (p.content.includes('instagram') || p.content.includes('youtube') || p.content.includes('facebook') || p.content.includes('twitter'))))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, 83 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && (p.content.includes('instagram') || p.content.includes('youtube') || p.content.includes('facebook') || p.content.includes('twitter'))))?.length || 0) * 3)}%` }}
                              transition={{ type: "spring", stiffness: 80, damping: 15 }}
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                            />
                          </div>
                        </div>

                        <a
                          id="recent-social-link"
                          href="/instagram-qr-generator"
                          onClick={(e) => { e.preventDefault(); navigateTo('/instagram-qr-generator'); }}
                          className="mt-4 text-xs font-bold text-pink-400 group-hover:text-white flex items-center gap-1"
                        >
                          Explore Instagram lander
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Dynamic scroll indicator if there are > 4 active categories */}
              {[
                'wifi',
                'whatsapp',
                'vcard',
                'restaurant',
                'social'
              ].filter(id => selectedCategoryFilter === 'all' || selectedCategoryFilter === id).length > 4 && (
                <div id="scroll-indicator" className="flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-400 sm:hidden">
                  <span>Swipe horizontally to view categories</span>
                  <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
              )}
            </section>

            {/* Complete Internal Linking Related Pages grid */}
            <section id="guide-relations" className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">
                Related Free QR Generation Guides
              </h3>
              <div className="w-full h-[1px] bg-slate-200" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                {Object.keys(landingPages).map((key) => {
                  const item = landingPages[key];
                  return (
                    <a
                      id={`guide-item-${item.slug}`}
                      key={item.slug}
                      href={`/${item.slug}`}
                      onClick={(e) => { e.preventDefault(); navigateTo(`/${item.slug}`); }}
                      className="p-3 bg-white hover:bg-indigo-50/40 rounded-xl border border-slate-200/80 transition-all hover:border-indigo-500/50 flex flex-col justify-between group h-28"
                    >
                      <div className="min-w-0">
                        <span className="block text-[11px] font-extrabold text-slate-900 group-hover:text-indigo-600 truncate">
                          🚀 {item.h1}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1 leading-relaxed truncate-3-lines min-h-[25px]">
                          {item.intro.highlight}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1 mt-1">
                        Read Guide <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        </main>
      )}

      {/* Premium Sticky Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            id="cookie-consent-banner"
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-slate-950 border border-slate-800/80 text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 z-[9999] backdrop-blur-md"
          >
            <div className="flex gap-3">
              <div id="cookie-icon-wrapper" className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0 h-10 w-10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 id="cookie-title" className="text-sm font-bold tracking-tight text-slate-100">Cookie Preference</h4>
                <p id="cookie-description" className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  We use essential cookies to safely persist state, optimize your QR customization workflow, and analyze scan activity rates.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-0.5">
              <button
                id="cookie-decline-button"
                onClick={handleDeclineCookies}
                className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-900/50"
              >
                Decline
              </button>
              <button
                id="cookie-accept-button"
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/15 active:scale-95 transition-all cursor-pointer font-sans"
              >
                Accept All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth0/Clerk style Auth Overlays Dialog Component */}
      <React.Suspense fallback={null}>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={(u) => {
            setUser(u);
            setIsAuthModalOpen(false);
          }}
        />
      </React.Suspense>

      {/* Footer with rich SEO directory links */}
      <footer id="app-footer" className="py-16 border-t border-slate-100 bg-white/50 text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div id="footer-branding" className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <QrCode className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="font-bold text-xs text-slate-900 tracking-wider uppercase font-mono">iSolutions QR Generator</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Design customized, high-redundancy QR codes with modern color gradients, dot styles, and brand centerpieces. Complete with dynamic web link shortener tracking and real-time scan analytics.
            </p>
          </div>
          <div id="footer-directory" className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">Dedicated Free QR Code Solutions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <a href="/wifi-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📡 Free WiFi QR Code Generator
              </a>
              <a href="/whatsapp-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                💬 Free WhatsApp QR Code Generator
              </a>
              <a href="/email-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/email-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                ✉️ Free Email QR Code Generator
              </a>
              <a href="/sms-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/sms-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📱 Free SMS QR Code Generator
              </a>
              <a href="/vcard-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📇 Free vCard QR Code Generator
              </a>
              <a href="/url-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/url-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                🔗 Free URL QR Code Generator
              </a>
              <a href="/business-card-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/business-card-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                💼 Free Business Card QR Code
              </a>
              <a href="/restaurant-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                🍔 Free Restaurant QR Code
              </a>
              <a href="/facebook-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/facebook-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📘 Free Facebook QR Code
              </a>
              <a href="/instagram-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/instagram-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📸 Free Instagram QR Code
              </a>
              <a href="/youtube-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/youtube-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                🎥 Free YouTube QR Code
              </a>
              <a href="/pdf-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/pdf-qr-generator'); }} className="text-left text-xs text-slate-500 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                📄 Free PDF QR Code Generator
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
          <p>© 2026 iSolutions QR Generator. Decoupled and fully verified local-cloud schema.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">About Us</a>
            <span>•</span>
            <a href="/faq" onClick={(e) => { e.preventDefault(); navigateTo('/faq'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">FAQ</a>
            <span>•</span>
            <a href="/blog" onClick={(e) => { e.preventDefault(); navigateTo('/blog'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">Blog</a>
            <span>•</span>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">Terms & Conditions</a>
            <span>•</span>
            <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Floating Real-Time Scan Alerts Toaster Panel (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-100 w-full max-w-sm flex flex-col gap-3 pointer-events-none p-4" id="floating-notification-toaster-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 30 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex gap-3.5 relative overflow-hidden group hover:bg-slate-900 transition-all duration-300"
            >
              {/* Elegant ambient glowing backdrop dot */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

              {/* Pulsing visual element */}
              <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center shrink-0 shadow-md shadow-indigo-950/40 relative">
                <Radio className="w-5 h-5 text-indigo-300 animate-pulse animate-duration-1000" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>

              {/* Toast info panel details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block font-mono">
                    Real-Time Scan Notice
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Just now
                  </span>
                </div>
                
                <h4 className="text-xs font-extrabold text-white truncate max-w-[200px] mt-0.5">
                  {toast.projectName}
                </h4>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5 pt-1.5 border-t border-slate-800/80">
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase">Location</span>
                    <span className="text-[10px] font-bold text-slate-200 block truncate">
                      📍 {toast.approxLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase font-sans">Device</span>
                    <span className="text-[10px] font-bold text-slate-200 block truncate">
                      📱 {toast.deviceType} ({toast.browser})
                    </span>
                  </div>
                </div>
              </div>

              {/* Dismiss X action button */}
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors inline-self-start z-10 cursor-pointer h-7 w-7 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
