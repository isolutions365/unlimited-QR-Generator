import React, { useState, useEffect, useRef } from 'react';
import { api, UserSession } from './lib/api';
import { useFirebaseAuth } from './context/FirebaseAuthContext';
import { auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { QRProject, ScanLog, AppTab } from './types';
import { landingPages } from './pages/landing/SEODatabase';
import { getBlogArticles } from './data/blogData';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import TemplatesTab from './components/TemplatesTab';
import SavedProjects from './components/SavedProjects';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AuthModal from './components/AuthModal';
import ShortcutsHelpModal from './components/ShortcutsHelpModal';
import TourWelcomeModal from './components/TourWelcomeModal';
import SettingsModal from './components/SettingsModal';
import AIAssistantWidget from './components/AIAssistantWidget';
import QRRedirector from './components/QRRedirector';
import { SoundSettings, getDefaultSoundSettings, playAudioSound } from './utils/audioFeedback';

// Code-splitting via React.lazy for secondary landing & hub pages
const SEOPage = React.lazy(() => import('./pages/landing/SEOPage'));
const BulkQRGenerator = React.lazy(() => import('./components/BulkQRGenerator'));
const AnimationsShowcase = React.lazy(() => import('./components/AnimationsShowcase'));
const CompanyPages = React.lazy(() => import('./pages/CompanyPages'));
const TrustCenterHub = React.lazy(() => import('./pages/TrustCenterHub'));
const FaqSection = React.lazy(() => import('./pages/FaqSection'));
const BlogSection = React.lazy(() => import('./pages/BlogSection'));
const KnowledgeHub = React.lazy(() => import('./pages/KnowledgeHub'));
import { knowledgeArticles } from './data/knowledgeData';
const TemplatesHub = React.lazy(() => import('./pages/TemplatesHub'));
import { templatePages } from './data/templatePagesData';
const EmbedPage = React.lazy(() => import('./pages/EmbedPage'));
const CompareHub = React.lazy(() => import('./pages/CompareHub'));
import { comparisons } from './data/compareData';
const ProgrammaticHub = React.lazy(() => import('./pages/ProgrammaticHub'));
import { solutionsData, useCasesData, getBespokeProfile } from './data/programmaticSEOData';
const PlatformHub = React.lazy(() => import('./pages/PlatformHub'));
const I18nDashboard = React.lazy(() => import('./pages/I18nDashboard'));
const GrowthSuite = React.lazy(() => import('./pages/GrowthSuite'));
const EnterpriseAIGateway = React.lazy(() => import('./pages/EnterpriseAIGateway'));
const QRMarketingPlatform = React.lazy(() => import('./pages/marketing/QRMarketingPlatform'));
import ErrorBoundary from './components/ErrorBoundary';


// Non-blocking fallback skeleton loader
const LazyLoader = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]" id="lazy-fallback">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading workspace...</span>
    </div>
  </div>
);
import { Locale, navTranslations, creativeSubItems, presetToolsTranslations, isRtlLocale, extractLocaleAndPath, SUPPORTED_LOCALES } from './utils/translations';
import { useTranslation, useDocumentLanguage } from './utils/i18n';
import MobileDrawer from './components/MobileDrawer';
import Header from './components/Header';
import Logo from './components/Logo';
import BarcodeGenerator from './components/BarcodeGenerator';
import DigitalBusinessCard from './components/DigitalBusinessCard';
import RestaurantMenu from './components/RestaurantMenu';
import PdfSharing from './components/PdfSharing';
import FormBuilder from './components/FormBuilder';
import { 
  QrCode, LogIn, LogOut, Sparkles, LayoutGrid, RotateCcw, AlertCircle, ShieldCheck,
  ChevronDown, ChevronUp, Menu, X, ArrowRight, Clock, Star, Compass, Link2,
  Wifi, Mail, Phone, Contact, Globe, Utensils, Facebook, Instagram, Youtube, FileText,
  Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, Smartphone, HelpCircle, BookOpen,
  BarChart3, Info, MessageSquare, Shield, Bell, BellOff, Radio, Sun, Moon, Laptop, Scale, Cpu, Barcode, FileSpreadsheet, Wallet, FormInput
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, STATUS, Step } from 'react-joyride';

const INITIAL_DESIGN: Partial<QRProject> = {
  id: '',
  name: 'My Custom QR Code',
  type: 'url',
  content: 'https://freeqrgen.pro',
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
  trackingId: Math.random().toString(36).substring(2, 8)
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
      <span className="text-sm sm:text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 flex select-none">
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
      </span>
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
  const { user: fbUser, loading: fbLoading, logout: fbLogout } = useFirebaseAuth();
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<QRProject[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sound settings state
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => getDefaultSoundSettings());
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

              // Immediately refresh analytics data on real-time scan event
              fetchUserData();

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
          console.debug('[WS Socket] Connection status update:', wsErr);
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

  // Localization State via Central I18n Context
  const { locale, changeLocale, t } = useTranslation();
  useDocumentLanguage();

  const handleLocaleChange = (newLocale: Locale) => {
    changeLocale(newLocale);
    // Force sync path-router state on language change
    const { cleanPath } = extractLocaleAndPath(window.location.pathname);
    const newPath = newLocale === 'en' ? cleanPath : `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
    setCurrentPath(newPath);
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
  const [tourOpen, setTourOpen] = useState(false);
  const [tourRunning, setTourRunning] = useState(false);

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setTourRunning(false);
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
  const [activeTab, setActiveTab ] = useState<AppTab>('create');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      localStorage.setItem('app-theme', 'light');
    }
  }, []);

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


  // Close desktop mega menus and language menus on click outside
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
  
  // Extract clean path by stripping the locale prefix for unified router state comparisons
  const { cleanPath } = extractLocaleAndPath(currentPath);

  // Determine if the currently active route belongs to Free QR Tools presets
  const isKnowledgeSection = ['/academy', '/guides', '/tutorials', '/resources', '/glossary'].some(p => cleanPath.startsWith(p));
  const isTemplatesSection = cleanPath === '/templates' || cleanPath.startsWith('/templates/');
  const isCompareSection = cleanPath === '/compare' || cleanPath.startsWith('/compare/');
  const isSolutionsSection = cleanPath === '/solutions' || cleanPath.startsWith('/solutions/');
  const isIndustriesSection = cleanPath === '/industries' || cleanPath.startsWith('/industries/');
  const isUseCasesSection = cleanPath === '/use-cases' || cleanPath.startsWith('/use-cases/');
  const isPlatformSection = cleanPath.startsWith('/platform/');
  
  const trustCenterPaths = [
    '/about', '/why-freeqrgen', '/editorial-policy', '/research-methodology', 
    '/privacy', '/security', '/data-processing', '/accessibility', 
    '/contact', '/changelog', '/release-notes', '/system-status', 
    '/careers', '/media-kit', '/brand-assets', '/press'
  ];
  const isTrustCenterSection = trustCenterPaths.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));

  const isFreeQrToolsActive = cleanPath !== '/' && cleanPath !== '' && 
    !['/faq', '/about', '/privacy', '/contact', '/terms', '/solutions', '/industries', '/use-cases', '/signup', '/signin', '/login', '/register', '/auth'].some(p => cleanPath === p || cleanPath.startsWith(p + '/')) && 
    !cleanPath.startsWith('/blog') &&
    !cleanPath.startsWith('/platform') &&
    !isKnowledgeSection &&
    !isTemplatesSection &&
    !isCompareSection &&
    !isTrustCenterSection;


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
      case 'app-store-qr': return Smartphone;
      default: return QrCode;
    }
  };

  // Centralized SEO Metadata, Canonical URLs, and Social graph (OG/Twitter) Synchronization
  useEffect(() => {
    let title = 'Free QR Code Generator - Dynamic QR Codes & Custom Creator';
    let description = 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Custom styled QR generator template for your brand.';
    
    const rootUrl = 'https://www.freeqrgen.pro';
    const canonical = `${rootUrl}${currentPath === '/' ? '' : currentPath}`;

    if (currentPath === '/' || currentPath === '') {
      title = 'Free QR Code Generator - Dynamic QR Codes & Custom Creator';
      description = 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Custom styled QR generator template for your brand.';
    } else if (currentPath === '/faq') {
      title = 'Frequently Asked Questions | Free QR Code Generator FAQs';
      description = 'Find detailed developer and business answers to common questions about custom QR code options, dynamic vs static formats, design options, scan limits, logos, and tracking analytics.';
    } else if (currentPath === '/blog') {
      title = 'QR Code Technology & Marketing Blog | FreeQRGen.pro';
      description = 'Explore modern design tips, tutorials, and advanced marketing strategies for dynamic and static QR codes. Master QR code scanning engagement and conversion.';
    } else if (currentPath.startsWith('/blog/')) {
      const blogSlug = currentPath.substring(6);
      const article = getBlogArticles(locale).find(art => art.slug === blogSlug);
      if (article) {
        title = `${article.metaTitle} | FreeQRGen.pro Blog`;
        description = article.metaDescription;
      } else {
        title = 'Blog Article | FreeQRGen.pro';
        description = 'Read our informative technical blog post about QR Code solutions.';
      }
    } else if (['/academy', '/guides', '/tutorials', '/resources', '/glossary'].includes(currentPath)) {
      const sect = currentPath.substring(1);
      title = `Free QR Code ${sect.charAt(0).toUpperCase() + sect.slice(1)} Hub | FreeQRGen.pro`;
      description = `Access our authoritative FreeQRGen.pro ${sect} platform. Master 2D barcode parameters, printing guidelines, sizing calculators, security rules, and marketing campaigns.`;
    } else if (['/academy/', '/guides/', '/tutorials/', '/resources/', '/glossary/'].some(p => currentPath.startsWith(p))) {
      const segment = currentPath.split('/')[1];
      const artSlug = currentPath.split('/')[2];
      const article = knowledgeArticles.find(art => art.slug === artSlug);
      if (article) {
        title = `${article.seoTitle} | FreeQRGen.pro ${segment.charAt(0).toUpperCase() + segment.slice(1)}`;
        description = article.metaDescription;
      } else {
        title = `${segment.charAt(0).toUpperCase() + segment.slice(1)} Article | FreeQRGen.pro`;
        description = 'Read our informative technical authority guide on FreeQRGen.pro.';
      }
    } else if (currentPath === '/templates') {
      title = 'Free High-Performance QR Code Templates Directory | FreeQRGen.pro';
      description = 'Access our verified, schema-optimized 2D barcode templates designed to capture high-intent physical traffic. Jumpstart campaigns with pristine layouts.';
    } else if (currentPath.startsWith('/templates/')) {
      const tplSlug = currentPath.split('/')[2];
      const template = templatePages.find(t => t.slug === tplSlug);
      if (template) {
        title = `${template.seoTitle} | FreeQRGen.pro Templates`;
        description = template.metaDescription;
      } else {
        title = 'QR Code Preset Template | FreeQRGen.pro';
        description = 'Utilize our high-performance ready-to-print 2D QR Code template layouts.';
      }
    } else if (currentPath === '/compare') {
      title = 'QR Code Technology Comparison Directory | FreeQRGen.pro';
      description = 'High-fidelity, professional analytical comparisons between diverse 2D barcode schemas, formats, error levels, and marketing strategies.';
    } else if (currentPath.startsWith('/compare/')) {
      const compSlug = currentPath.substring(9);
      const comparison = comparisons.find(c => c.slug === compSlug);
      if (comparison) {
        title = comparison.seoTitle;
        description = comparison.metaDescription;
      } else {
        title = 'QR Code Technology Comparison | FreeQRGen.pro';
        description = 'Analyze and compare different QR code formats, configurations, and technology options.';
      }
    } else if (currentPath === '/solutions') {
      title = 'Enterprise QR Code Solutions Directory | FreeQRGen.pro';
      description = 'Explore professional contactless QR solutions custom-made for brands, managers, and designers. Speed up checkouts and scan engagement.';
    } else if (currentPath.startsWith('/solutions/')) {
      const solSlug = currentPath.split('/')[2];
      const sol = solutionsData.find(s => s.slug === solSlug);
      if (sol) {
        title = sol.metaTitle;
        description = sol.metaDesc;
      } else {
        title = 'Professional QR Code Solution | FreeQRGen.pro';
        description = 'Deploy high-performance contactless enterprise QR code solutions.';
      }
    } else if (currentPath === '/industries') {
      title = 'Custom QR Codes for Industries Directory | FreeQRGen.pro';
      description = 'Browse specialized optical barcode solutions, printable guidelines, and checklists for 40 distinct commercial industries.';
    } else if (currentPath.startsWith('/industries/')) {
      const indSlug = currentPath.split('/')[2];
      const ind = getBespokeProfile(indSlug);
      title = ind.metaTitle;
      description = ind.metaDesc;
    } else if (currentPath === '/use-cases') {
      title = 'High-Traffic QR Code Use Cases Hub | FreeQRGen.pro';
      description = 'Review physical placement guidelines, best practices, common mistakes, and printable templates for custom 2D scan configurations.';
    } else if (currentPath.startsWith('/use-cases/')) {
      const ucSlug = currentPath.split('/')[2];
      const uc = useCasesData.find(u => u.slug === ucSlug);
      if (uc) {
        title = uc.metaTitle;
        description = uc.metaDesc;
      } else {
        title = 'High-Traffic QR Code Use Case | FreeQRGen.pro';
        description = 'Explore specialized optical barcode placement frameworks and real case studies.';
      }
    } else if (currentPath === '/about') {
      title = 'About Us | Free QR Code Generator Team';
      description = 'Learn about FreeQRGen.pro and the iSolutions team dedicated to building secure, beautiful, high-performance QR code creator utilities.';
    } else if (currentPath === '/privacy') {
      title = 'Privacy Policy | Secure Databox QR Generator';
      description = 'Our privacy commitment: zero tracking, complete databox security, offline compatibility, and secure transient memory models.';
    } else if (currentPath === '/contact') {
      title = 'Contact Support & Corporate Inquiry | FreeQRGen.pro';
      description = 'Get in touch with the iSolutions technical team for enterprise licenses, custom templates, or support requests.';
    } else if (currentPath === '/terms') {
      title = 'Terms of Service & Usage Limits | FreeQRGen.pro';
      description = 'Review usage agreements, security expectations, dynamic tracking short-link rules, and API policies of FreeQRGen.pro.';
    } else {
      // Dynamic Landing Pages
      const slug = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
      const pageData = landingPages[slug];
      if (pageData) {
        title = pageData.seoTitle;
        description = pageData.metaDescription;
      }
    }

    // Apply document.title
    document.title = title;

    // Apply meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Apply canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    // Apply country targeting and regional metadata dynamically
    let geoRegion = document.querySelector('meta[name="geo.region"]');
    if (!geoRegion) {
      geoRegion = document.createElement('meta');
      geoRegion.setAttribute('name', 'geo.region');
      document.head.appendChild(geoRegion);
    }
    const regionMapping: Record<string, string> = {
      es: 'ES', fr: 'FR', de: 'DE', pt: 'PT', it: 'IT', tr: 'TR', id: 'ID', hi: 'IN', ar: 'AE', ur: 'PK', ja: 'JP', ko: 'KR', zh: 'CN', en: 'US'
    };
    geoRegion.setAttribute('content', regionMapping[locale] || 'US');

    // Sync hreflang tags for all 14 supported languages to achieve ultimate Search Engine crawlers index visibility
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    SUPPORTED_LOCALES.forEach((loc) => {
      const hAlternate = document.createElement('link');
      hAlternate.setAttribute('rel', 'alternate');
      hAlternate.setAttribute('hreflang', loc === 'en' ? 'x-default' : loc);
      
      const locPath = loc === 'en' ? cleanPath : `/${loc}${cleanPath === '/' ? '' : cleanPath}`;
      hAlternate.setAttribute('href', `${rootUrl}${locPath === '/' ? '' : locPath}`);
      document.head.appendChild(hAlternate);

      if (loc === 'en') {
        const xDefault = document.createElement('link');
        xDefault.setAttribute('rel', 'alternate');
        xDefault.setAttribute('hreflang', 'en');
        xDefault.setAttribute('href', `${rootUrl}${cleanPath === '/' ? '' : cleanPath}`);
        document.head.appendChild(xDefault);
      }
    });

    // Apply Open Graph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:image': 'https://www.freeqrgen.pro/og-image.jpg',
      'og:type': 'website'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Apply Twitter Tags
    const twitterTags = {
      'twitter:title': title,
      'twitter:description': description,
      'twitter:url': canonical,
      'twitter:image': 'https://www.freeqrgen.pro/og-image.jpg'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

  }, [currentPath, locale]);

  const buildHomepageSchema = () => {
    const rootUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.freeqrgen.pro';
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${rootUrl}/#organization`,
          "name": "Free QR Code Generator Inc.",
          "url": rootUrl,
          "logo": `${rootUrl}/favicon-32x32.png`,
          "sameAs": [
            "https://www.producthunt.com/posts/free-qr-generator-4"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "technical support",
            "email": "admin@isolutionsico.com",
            "url": `${rootUrl}/contact`
          }
        },
        {
          "@type": "WebSite",
          "@id": `${rootUrl}/#website`,
          "url": rootUrl,
          "name": "FreeQRGen.pro",
          "description": "Design secure, highly custom dynamic QR codes with color gradients, custom dot patterns, embedded logos, and real-time short-link scan analytics.",
          "publisher": {
            "@id": `${rootUrl}/#organization`
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${rootUrl}/?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "WebApplication",
          "@id": `${rootUrl}/#webapplication`,
          "name": "Free QR Code Generator & Analytics Platform",
          "url": rootUrl,
          "operatingSystem": "All Mobile, Tablet, and Desktop web browsers",
          "applicationCategory": "DesignApplication, UtilitiesApplication",
          "browserRequirements": "Requires JavaScript. Supports HTML5 Canvas.",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "featureList": [
            "Dynamic QR Code Generation",
            "WiFi Connection QR Setup",
            "vCard Interactive Business Cards",
            "Scan Count & Real-time Location Analytics",
            "Gradient Fill & Customized QR Eye Designs",
            "Custom Logo branding integration"
          ],
          "creator": {
            "@id": `${rootUrl}/#organization`
          }
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${rootUrl}/#software`,
          "name": "FreeQRGen Creator Engine",
          "operatingSystem": "All modern web browsers",
          "applicationCategory": "DesignApplication, BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.96",
            "reviewCount": "5840"
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${rootUrl}/#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": rootUrl
            }
          ]
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

  // Control state for Clerk/Auth0-style Login Dialog
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Trigger Auth Modal automatically when direct auth routes are accessed via browser URL
  useEffect(() => {
    if (['/signup', '/register'].includes(cleanPath)) {
      setAuthModalTab('signup');
      setIsAuthModalOpen(true);
    } else if (['/signin', '/login', '/auth'].includes(cleanPath)) {
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
    }
  }, [cleanPath]);

  const navigateTo = (path: string) => {
    const { cleanPath: targetClean } = extractLocaleAndPath(path);
    if (['/signup', '/register'].includes(targetClean)) {
      setAuthModalTab('signup');
      setIsAuthModalOpen(true);
      return;
    }
    if (['/signin', '/login', '/auth'].includes(targetClean)) {
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return;
    }

    let targetPath = path;
    // If we have an active non-English locale and the target path is relative and doesn't already have a locale prefix
    if (locale && locale !== 'en') {
      const { locale: existingLocale } = extractLocaleAndPath(path);
      if (!existingLocale) {
        targetPath = `/${locale}${path === '/' ? '' : path}`;
      }
    }
    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
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
    playAudioSound('generate', soundSettings);
    setActiveTab('create');
    navigateTo('/');
  };
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

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
    if (fbLoading) return;

    if (fbUser) {
      setUser({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User'
      });
      setAuthLoading(false);
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, [fbUser, fbLoading]);

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
      setErrorMessage(err.message || t('error.loadAnalyticsFailed', 'Error occurred while loading analytics records.'));
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      const unsubscribeScans = api.subscribeScans((newScans) => {
        setScans(newScans);
      });

      const unsubscribeProjects = api.subscribeProjects((newProjects) => {
        setProjects(newProjects);
      });

      return () => {
        if (unsubscribeScans) unsubscribeScans();
        if (unsubscribeProjects) unsubscribeProjects();
      };
    } else {
      setProjects([]);
      setScans([]);
    }
  }, [user]);

  // SignIn and Authentication dialog activation
  const handleSignInClick = () => {
    setErrorMessage(null);
    setAuthModalTab('signin');
    setIsAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setErrorMessage(null);
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };

  // Sign out session
  const handleSignOut = async () => {
    try {
      await fbLogout();
    } catch (err) {
      console.warn('[Firebase Auth] Signout notice:', err);
    }
    api.logout();
    setUser(null);
    setCurrentProject(INITIAL_DESIGN);
    setProjects([]);
    setScans([]);
    setErrorMessage(null);
  };

  // Create or Update QR Design project
  const handleSaveProject = async () => {
    let activeUser = user;
    if (!activeUser) {
      console.log('[App handleSaveProject] No user logged in. Checking auth.currentUser or performing anonymous sign-in...');
      let uid = auth.currentUser?.uid;
      if (!uid) {
        try {
          const anon = await signInAnonymously(auth);
          uid = anon.user.uid;
          console.log('[App handleSaveProject] Signed in anonymously with UID:', uid);
        } catch (anonErr) {
          console.error('[App handleSaveProject] Anonymous sign-in failed:', anonErr);
        }
      }
      if (uid) {
        activeUser = {
          id: uid,
          email: auth.currentUser?.email || '',
          name: auth.currentUser?.displayName || 'Guest User'
        };
        setUser(activeUser);
      }
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const targetId = currentProject.id || '';
      const trackingId = currentProject.trackingId || Math.random().toString(36).substr(2, 6);

      let contentVal = currentProject.content || '';
      if (currentProject.type === 'url' && typeof contentVal === 'string') {
        contentVal = (((val) => (val || '').trim())(contentVal)).replace(/\/+$/, '');
        // Update local state so user sees the cleaned content value in UI
        setCurrentProject(prev => ({ ...prev, content: contentVal }));
      }

      const projectData: Partial<QRProject> = {
        id: targetId,
        name: currentProject.name || 'My Styled QR',
        type: currentProject.type || 'url',
        content: contentVal || 'https://freeqrgen.pro',
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

      console.log('[App handleSaveProject BEFORE] Calling api.saveProject with projectData:', projectData);
      const saved = await api.saveProject(projectData);
      console.log('[App handleSaveProject AFTER SUCCESS] Saved project:', saved);
      
      // Select newly saved project
      setCurrentProject(saved);
      playAudioSound('generate', soundSettings);
      
      // Refetch user data
      await fetchUserData();
    } catch (err: any) {
      console.error('[App handleSaveProject ERROR]', err);
      const errorMsg = err?.message || t('error.saveFailed', 'Error occurred while saving configurations.');
      setErrorMessage(errorMsg);
      if (typeof window !== 'undefined') {
        alert(`Cloud Save Failed: ${errorMsg}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Restore saved config
  const handleSelectProject = (proj: QRProject) => {
    setCurrentProject({
      ...proj,
      trackingId: proj.trackingId || proj.id || Math.random().toString(36).substring(2, 8)
    });
    setErrorMessage(null);
  };

  // Delete project from database ledger
  const handleDeleteProject = async (id: string) => {
    if (!confirm(t('confirm.deletePreset', 'Are you sure you want to delete this QR preset?'))) return;
    try {
      setErrorMessage(null);
      await api.deleteProject(id);
      if (currentProject.id === id) {
        setCurrentProject(INITIAL_DESIGN);
      }
      await fetchUserData();
    } catch (err: any) {
      setErrorMessage(err.message || t('error.removeFailed', 'Error removing item from the database.'));
    }
  };

  // Update project folder category in database ledger
  const handleUpdateProjectCategory = async (projectId: string, category: string) => {
    try {
      setErrorMessage(null);
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedProject = {
        ...project,
        category: category
      };
      await api.saveProject(updatedProject);
      
      // Update local state currentProject if the active selected design was updated
      if (currentProject.id === projectId) {
        setCurrentProject(prev => ({ ...prev, category: category }));
      }
      
      await fetchUserData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || t('error.updateFolderFailed', 'Error occurred while updating folder category.'));
    }
  };

  // Batch delete projects from database ledger
  const handleBatchDeleteProjects = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    if (!confirm(t('confirm.batchDeletePresets', 'Are you sure you want to delete {count} selected QR presets?', { count: ids.length }))) return;
    try {
      setErrorMessage(null);
      await Promise.all(ids.map(id => api.deleteProject(id)));
      if (currentProject.id && ids.includes(currentProject.id)) {
        setCurrentProject(INITIAL_DESIGN);
      }
      await fetchUserData();
    } catch (err: any) {
      setErrorMessage(err.message || t('error.removeFailed', 'Error removing items from the database.'));
    }
  };

  // Batch update project categories in database ledger
  const handleBatchUpdateCategory = async (ids: string[], category: string) => {
    if (!ids || ids.length === 0) return;
    try {
      setErrorMessage(null);
      await Promise.all(
        ids.map(id => {
          const project = projects.find(p => p.id === id);
          if (!project) return Promise.resolve();
          return api.saveProject({ ...project, category });
        })
      );
      if (currentProject.id && ids.includes(currentProject.id)) {
        setCurrentProject(prev => ({ ...prev, category }));
      }
      await fetchUserData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || t('error.updateFolderFailed', 'Error occurred while updating folder categories.'));
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
      setErrorMessage(t('error.signInToSimulate', 'Please sign in first to simulate scan events on your layout.'));
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await api.seedScanClick(projectId, trackingId);
      await fetchUserData();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(t('error.seedFailed', 'Verification Error: Seed writing failed. Make sure user is fully logged in.'));
    }
  };

  // Wipe scans logs completely
  const handlePurgeAllScans = async () => {
    if (!confirm(t('confirm.clearAllScans', 'Are you sure you want to clear all scans logs? This is irreversible.'))) return;
    try {
      await api.purgeScans();
      await fetchUserData();
    } catch (err: any) {
      setErrorMessage(err.message || t('error.clearLogsFailed', 'Error clearing logs.'));
    }
  };

  // Triggers modern dialog overlay immediately after a file download action completes
  const handleDownloadTrigger = () => {
    if (!user) {
      setTimeout(() => {
        setErrorMessage(
          t('error.downloadSuccessClaimSession', '🎯 Applet downloaded successfully! To prevent losing this beautifully styled QR template and unlock real-time scan analytics, claim your secure cloud session now.')
        );
        setIsAuthModalOpen(true);
      }, 400);
    }
  };

  // Global Keyboard Shortcuts (Ctrl+S to save, Ctrl+P to print, Ctrl+D to download, ? for help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input, textarea, or editable element
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.isContentEditable;

      const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSaveProject();
            break;
          case 'p':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('app-trigger-print'));
            break;
          case 'd':
            // Only trigger download if not focused inside inputs to avoid conflict
            if (!isEditable) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('app-trigger-download'));
            }
            break;
          default:
            break;
        }
      } else {
        if (!isEditable && e.key === '?') {
          e.preventDefault();
          setIsShortcutsModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSaveProject, setIsShortcutsModalOpen]);

  const slug = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  const isLandingPage = !!landingPages[slug];
  const isSubpage = ['/profile', '/community', '/roadmap', '/testimonials', '/case-studies', '/success-stories', '/release-notes', '/feedback'].includes(cleanPath) ||
    cleanPath === '/i18n-dashboard' ||
    cleanPath === '/ai-gateway' ||
    cleanPath === '/marketing-platform' ||
    isLandingPage ||
    cleanPath === '/faq' ||
    cleanPath === '/blog' ||
    cleanPath.startsWith('/blog/') ||
    isKnowledgeSection ||
    isTemplatesSection ||
    isCompareSection ||
    isSolutionsSection ||
    isIndustriesSection ||
    isUseCasesSection ||
    cleanPath === '/embed' ||
    isPlatformSection ||
    isTrustCenterSection ||
    cleanPath === '/terms' ||
    cleanPath.startsWith('/qr/');

  return (
    <div className="min-h-screen bg-slate-50/80 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      <Joyride
        {...({
          steps: tourSteps,
          run: tourRunning,
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
                <span className="font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider text-[11px]">{t('tour.skip', 'Skip Tour')}</span>
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
        <Header 
            isScrolled={isScrolled} 
            t={t}
            locale={locale}
            currentPath={currentPath}
            navigateTo={navigateTo}
            changeLocale={changeLocale}
            creativeSubItems={creativeSubItems}
            presetToolsTranslations={presetToolsTranslations}
            handleInitiateGenerator={handleInitiateGenerator}
            getPresetIcon={getPresetIcon}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            navTranslations={navTranslations}
            user={user}
            onSignInClick={handleSignInClick}
            onSignUpClick={handleSignUpClick}
            onSignOut={handleSignOut}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            soundEnabled={soundSettings.soundEnabled}
        />



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
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs xl:hidden"
            />

            {/* Slide-In Side Navigation Drawer */}
            <motion.div
              ref={mobileMenuRef}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              id="mobile-navigation-menu"
              className="fixed top-0 right-0 bottom-0 z-55 w-full max-w-[320px] bg-slate-900 text-slate-100 shadow-2xl flex flex-col xl:hidden border-l border-slate-800"
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
                            () => {
                              setActiveTab('create'); navigateTo('/');
                              setTimeout(() => {
                                const previewSec = document.getElementById('tour-qr-preview');
                                if (previewSec) previewSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 250);
                            }
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
                            ? () => handleInitiateGenerator({ 
                                type: 'app', 
                                content: JSON.stringify({
                                  ios: 'https://apps.apple.com',
                                  android: 'https://play.google.com',
                                  fallback: 'https://apps.apple.com'
                                }), 
                                name: 'App Store Download' 
                              })
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
                              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${ isCurrentActive ? 'bg-gradient-to-r from-indigo-950/40 to-purple-950/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800/40' }`}
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
                      navigateTo('/templates');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-400">{t('nav.templatesHub', 'Templates Hub')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/solutions');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-400">{t('nav.solutionsDir', 'Solutions Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/industries');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Utensils className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-400">{t('nav.industriesDir', 'Industries Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/use-cases');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-400">{t('nav.useCasesDir', 'Use Cases Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/compare');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="font-bold text-indigo-400">{t('nav.comparisonsDir', 'Comparisons Directory')}</span>
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
                    <span className="font-bold">{t('nav.scanAnalytics', 'Scan Analytics')}</span>
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
                  
                  {/* Language Selector on Mobile */}
                  <div className="mt-4 px-2.5 py-3 border-t border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-2 font-mono">{t('nav.selectLanguage', 'Select Language')}</span>
                    <select
                      value={locale}
                      onChange={(e) => {
                        handleLocaleChange(e.target.value as Locale);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="en">{t("tools.language.en")}</option>
                      <option value="es">{t("tools.language.es")}</option>
                      <option value="fr">{t("tools.language.fr")}</option>
                      <option value="de">{t("tools.language.de")}</option>
                      <option value="pt">{t("tools.language.pt")}</option>
                      <option value="it">{t("tools.language.it")}</option>
                      <option value="tr">{t("tools.language.tr")}</option>
                      <option value="id">{t("tools.language.id")}</option>
                      <option value="hi">{t("tools.language.hi")}</option>
                      <option value="ar">{t("tools.language.ar")}</option>
                      <option value="ur">{t("tools.language.ur")}</option>
                      <option value="ja">{t("tools.language.ja")}</option>
                      <option value="ko">{t("tools.language.ko")}</option>
                      <option value="zh">{t("tools.language.zh")}</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Sticky bottom summary & Account profile state */}
              <div className="p-4 bg-slate-950/55 border-t border-slate-800/60">
                {user ? (
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-slate-500 block font-mono">{t('status.connected', 'CONNECTED')}</span>
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
      {isSubpage ? (
        <ErrorBoundary isInline>
          {['/profile', '/community', '/roadmap', '/testimonials', '/case-studies', '/success-stories', '/release-notes', '/feedback'].includes(cleanPath) ? (
            <React.Suspense fallback={<LazyLoader />}>
              <GrowthSuite 
                view={cleanPath.substring(1)} 
                onNavigate={navigateTo} 
                locale={locale} 
                user={user} 
                onSignInClick={handleSignInClick} 
              />
            </React.Suspense>
          ) : cleanPath === '/i18n-dashboard' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <I18nDashboard onBack={() => navigateTo('/')} />
            </React.Suspense>
          ) : cleanPath === '/ai-gateway' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <EnterpriseAIGateway onBack={() => navigateTo('/')} user={user} onSignInClick={handleSignInClick} />
            </React.Suspense>
          ) : cleanPath === '/marketing-platform' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <QRMarketingPlatform onBack={() => navigateTo('/')} />
            </React.Suspense>
          ) : isLandingPage ? (
            <React.Suspense fallback={<LazyLoader />}>
              <SEOPage 
                slug={slug} 
                onSelectRoute={navigateTo} 
                onInitiateGenerator={handleInitiateGenerator} 
              />
            </React.Suspense>
          ) : cleanPath === '/faq' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <FaqSection onNavigate={navigateTo} locale={locale} />
            </React.Suspense>
          ) : (cleanPath === '/blog' || cleanPath.startsWith('/blog/')) ? (
            <React.Suspense fallback={<LazyLoader />}>
              <BlogSection 
                initialSlug={cleanPath.startsWith('/blog/') ? cleanPath.substring(6) : null} 
                onNavigate={navigateTo} 
                locale={locale}
              />
            </React.Suspense>
          ) : isKnowledgeSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              {(() => {
                const pathParts = cleanPath.split('/');
                const sectName = pathParts[1] as 'academy' | 'blog' | 'guides' | 'tutorials' | 'resources' | 'glossary';
                const artSlug = pathParts[2] || null;
                return (
                  <KnowledgeHub 
                    section={sectName}
                    initialSlug={artSlug}
                    onNavigate={navigateTo}
                    locale={locale}
                  />
                );
              })()}
            </React.Suspense>
          ) : isTemplatesSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              {(() => {
                const pathParts = cleanPath.split('/');
                const artSlug = pathParts[2] || null;
                return (
                  <TemplatesHub 
                    initialSlug={artSlug}
                    onNavigate={navigateTo}
                    onInitiateGenerator={handleInitiateGenerator}
                    locale={locale}
                  />
                );
              })()}
            </React.Suspense>
          ) : isCompareSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              {(() => {
                const pathParts = cleanPath.split('/');
                const compSlug = pathParts[2] || null;
                return (
                  <CompareHub 
                    initialSlug={compSlug}
                    onNavigate={navigateTo}
                    onInitiateGenerator={handleInitiateGenerator}
                    locale={locale}
                  />
                );
              })()}
            </React.Suspense>
          ) : (isSolutionsSection || isIndustriesSection || isUseCasesSection) ? (
            <React.Suspense fallback={<LazyLoader />}>
              {(() => {
                const prefix = isSolutionsSection ? 'solutions' : isIndustriesSection ? 'industries' : 'use-cases';
                const pathParts = cleanPath.split('/');
                const artSlug = pathParts[2] || null;
                return (
                  <ProgrammaticHub 
                    section={prefix}
                    initialSlug={artSlug}
                    onNavigate={navigateTo}
                    onInitiateGenerator={handleInitiateGenerator}
                    locale={locale}
                  />
                );
              })()}
            </React.Suspense>
          ) : cleanPath === '/embed' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <EmbedPage onNavigate={navigateTo} />
            </React.Suspense>
          ) : isPlatformSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              <PlatformHub 
                initialSlug={cleanPath.substring(1)} 
                onNavigate={navigateTo} 
                locale={locale}
              />
            </React.Suspense>
          ) : isTrustCenterSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              <TrustCenterHub 
                initialSlug={cleanPath.substring(1)} 
                onNavigate={navigateTo} 
                locale={locale}
              />
            </React.Suspense>
          ) : cleanPath === '/terms' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <CompanyPages 
                view="terms" 
                onNavigate={navigateTo} 
              />
            </React.Suspense>
          ) : cleanPath.startsWith('/qr/') ? (
            <QRRedirector 
              trackingId={cleanPath.substring(4)} 
              onNavigate={navigateTo} 
            />
          ) : null}
        </ErrorBoundary>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
          <h1 className="sr-only">Free QR Code Generator - Custom Dynamic QR Codes with Analytics</h1>

          {/* Dynamic Sub-Navigation Bar with Responsive Horizontal Scroll & No Clipping */}
          <div className="w-full bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl shadow-2xs select-none relative overflow-hidden">
            <div 
              className="flex flex-row flex-nowrap items-center gap-1.5 overflow-x-auto py-0.5 px-0.5 scrollbar-none" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch' 
              }}
            >
              {[
                { id: 'create', name: t('nav.creativeStationTab', 'Creative Station'), icon: Sparkles, iconColor: 'text-indigo-500' },
                { id: 'form', name: t('nav.formTab', 'Form Builder'), icon: FormInput, iconColor: 'text-indigo-500' },
                { id: 'menu', name: t('nav.restaurantMenuTab', 'Restaurant Menus'), icon: Utensils, iconColor: 'text-amber-500' },
                { id: 'card', name: t('nav.digitalCardTab', 'Digital Cards'), icon: Contact, iconColor: 'text-indigo-500' },
                { id: 'pdf', name: t('nav.pdfTab', 'PDF Sharing'), icon: FileText, iconColor: 'text-indigo-500' },
                { id: 'barcode', name: t('nav.barcodeGeneratorTab', 'Barcode Generator'), icon: Barcode, iconColor: 'text-indigo-500' },
                { id: 'bulk', name: t('nav.bulkGeneratorTab', 'Bulk Generator'), icon: FileSpreadsheet, iconColor: 'text-indigo-500' },
                { id: 'animations', name: t('nav.animationsTab', 'Animations'), icon: Play, iconColor: 'text-purple-500', isSpecial: true },
                { id: 'analytics', name: t('nav.analyticsTab', 'Scan Analytics'), icon: BarChart3, iconColor: 'text-indigo-500' },
                { id: 'templates', name: t('nav.templatesTab', 'Templates'), icon: LayoutTemplate, iconColor: 'text-indigo-500' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                
                let activeClass = 'bg-indigo-600 text-white shadow-sm font-bold';
                if (tab.isSpecial) {
                  activeClass = 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold shadow-xs';
                }

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 select-none ${
                      isActive 
                        ? activeClass 
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-white bg-transparent'
                    }`}
                  >
                    <IconComponent 
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive 
                          ? 'text-white' 
                          : tab.id === 'animations' 
                            ? 'text-purple-500 animate-pulse' 
                            : tab.iconColor
                      }`} 
                    />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        {/* Interactive errors alerting banner */}
        {errorMessage && (
          <div className="bg-red-55 border border-red-200/65 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-950">{t('ui.systemAlert', 'System Alert')}</h4>
              <p className="text-[11px] text-red-800 mt-1 font-mono leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* tab pages routing rendering */}
        {activeTab === 'barcode' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <BarcodeGenerator locale={locale} />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

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
                  onBatchDelete={handleBatchDeleteProjects}
                  onSeedData={handleSeedScanClick}
                  onUpdateCategory={handleUpdateProjectCategory}
                  onBatchUpdateCategory={handleBatchUpdateCategory}
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
                onChange={setCurrentProject}
                isSaving={isSaving}
                soundSettings={soundSettings}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side Workspace Templates controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <ErrorBoundary isInline>
                <React.Suspense fallback={<LazyLoader />}>
                  <TemplatesTab
                    currentProject={currentProject}
                    onChange={setCurrentProject}
                  />
                </React.Suspense>
              </ErrorBoundary>
            </div>

            {/* Right side Live Previews boards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <PreviewPanel 
                currentProject={currentProject} 
                onTestScan={handleSimTestScan} 
                onDownloadTrigger={handleDownloadTrigger} 
                onChange={setCurrentProject}
                isSaving={isSaving}
                soundSettings={soundSettings}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-4xl mx-auto w-full">
            {user ? (
              <ErrorBoundary isInline>
                <React.Suspense fallback={<LazyLoader />}>
                  <AnalyticsDashboard scans={scans} projects={projects} onPurgeAll={handlePurgeAllScans} />
                </React.Suspense>
              </ErrorBoundary>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{t('auth.accessRestricted', 'Access Restricted')}</h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {t('auth.accessRestrictedDesc', 'Please sign in or create a secure account to access real-time visitor logs and Recharts dashboard layouts.')}
                </p>
                <button
                  type="button"
                  onClick={handleSignInClick}
                  className="mt-6 py-2.5 px-6 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  {t('auth.signInSignUpButton', 'Sign In / Sign Up')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <AnimationsShowcase
                  currentProject={currentProject}
                  onChange={setCurrentProject}
                  onDownloadTrigger={handleDownloadTrigger}
                />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <BulkQRGenerator />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <DigitalBusinessCard />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <RestaurantMenu />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <PdfSharing />
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <FormBuilder />
            </ErrorBoundary>
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
                  {t('directory.badge')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {t("home.popularQrTools")}
                </h2>
                <p className="text-xs text-slate-500 leading-normal">
                  {t('directory.desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {/* 1. WiFi QR Generator */}
                <div id="tool-wifi-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold ltr-lock">
                      <Wifi className="w-5 h-5 text-indigo-600 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t("tools.wifi.title")}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.wifi.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-wifi-link"
                    href="/wifi-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.wifi.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 2. WhatsApp Channels */}
                <div id="tool-whatsapp-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-emerald-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center mb-4 ltr-lock">
                      <Phone className="w-5 h-5 text-emerald-800 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-910">{t("tools.whatsapp.title")}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.whatsapp.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-whatsapp-link"
                    href="/whatsapp-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.whatsapp.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 3. URL Web link */}
                <div id="tool-url-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-pink-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 ltr-lock">
                      <Globe className="w-5 h-5 text-pink-600 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t("tools.url.title")}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.url.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-url-link"
                    href="/url-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/url-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.url.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 4. Restaurant menus */}
                <div id="tool-restaurant-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-amber-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center mb-4 ltr-lock">
                      <Utensils className="w-5 h-5 text-amber-800 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t('directory.restaurant.title')}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.restaurant.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-restaurant-link"
                    href="/restaurant-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.restaurant.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 5. Business card */}
                <div id="tool-vcard-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-purple-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 ltr-lock">
                      <Contact className="w-5 h-5 text-purple-600 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t('directory.vcard.title')}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.vcard.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-vcard-link"
                    href="/vcard-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.vcard.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 6. Instagram profile */}
                <div id="tool-instagram-card" className={`bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-rose-500/50 hover:shadow-md transition-all group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 ltr-lock">
                      <Instagram className="w-5 h-5 text-indigo-600 ltr-lock" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t('directory.instagram.title')}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {t('directory.instagram.desc')}
                    </p>
                  </div>
                  <a
                    id="tool-instagram-link"
                    href="/instagram-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/instagram-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('directory.instagram.btn')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>

                {/* 7. Payment & Wallet QR */}
                <div id="tool-payment-card" className={`relative bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs hover:border-emerald-500/50 hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between ${isRtlLocale(locale) ? 'rtl-active' : ''}`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center ltr-lock">
                        <Wallet className="w-5 h-5 text-emerald-600 ltr-lock" />
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Pro Label Badge */}
                        <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-md shadow-2xs uppercase">
                          {t('tools.payment.pro', 'PRO')}
                        </span>

                        {/* Premium Global Pay Tooltip Badge */}
                        <div className="relative group/tooltip">
                          <span className="cursor-help px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors">
                            {t('tools.payment.badge', 'Global Pay')}
                          </span>
                        
                        {/* Tooltip Card */}
                        <div className="absolute right-0 bottom-full mb-2 w-64 max-w-[calc(100vw-3rem)] p-3 bg-slate-950 text-white rounded-xl shadow-xl border border-slate-800 hidden group-hover/tooltip:block group-focus-within/tooltip:block animate-in fade-in slide-in-from-bottom-1 duration-150 z-50 text-left pointer-events-none">
                          <div className="text-[10px] font-bold text-emerald-400 mb-1">
                            {t('tools.payment.tooltip.supported', 'Supported Global Methods')}
                          </div>
                          <p className="text-[9.5px] text-slate-300 leading-normal mb-2 break-words">
                            {t('tools.payment.tooltip.text', 'Receive money directly with secure QR codes supporting major networks.')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded font-semibold text-emerald-400">UPI</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded font-semibold text-sky-400">PayPal</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded font-semibold text-indigo-400">Venmo</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] rounded font-semibold text-slate-300">Cards</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{t('tools.payment.title', 'Payment & Wallet QR')}</h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed break-words">
                      {t('tools.payment.desc', 'Generate payment requests, custom digital wallet links, UPI, and invoice QR codes. Supports global methods like PayPal, Venmo, and more.')}
                    </p>
                  </div>
                  <a
                    id="tool-payment-link"
                    href="/"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      handleInitiateGenerator({ 
                        type: 'payment', 
                        content: 'upi://pay?pa=merchant@upi&pn=Store&am=10.00&cu=INR', 
                        name: 'Payment/Wallet QR' 
                      }); 
                    }}
                    className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('tools.payment.btn', 'Create Payment QR')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>
              </div>
            </section>

            {/* Recently Used QR Categories */}
            <section id="recent-categories" className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
              
              <div className="max-w-2xl space-y-2 relative z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-indigo-600 font-mono inline-block">
                  {t('recent.badge')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {t('recent.title')}
                </h3>
                <p className="text-xs text-slate-600 leading-normal">
                  {t('recent.desc')}
                </p>
              </div>

              {/* Category Filter Controls */}
              <div id="category-filter-bar" className="flex flex-wrap gap-2 mt-6 pb-4 border-b border-slate-200 relative z-10">
                {[
                  { id: 'all', label: t('recent.tab.all') },
                  { id: 'wifi', label: t('recent.tab.wifi') },
                  { id: 'whatsapp', label: t('recent.tab.whatsapp') },
                  { id: 'vcard', label: t('recent.tab.vcard') },
                  { id: 'restaurant', label: t('recent.tab.menus') },
                  { id: 'social', label: t('recent.tab.social') }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    id={`filter-btn-${cat.id}`}
                    onClick={() => setSelectedCategoryFilter(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-250 cursor-pointer ${ selectedCategoryFilter === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.03]' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 ' }`}
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
                className="flex overflow-x-auto sm:grid sm:grid-cols-2 gap-4 mt-8 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent relative z-10 snap-x snap-mandatory"
              >
                <AnimatePresence mode="popLayout">
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'wifi') && (
                    <motion.div key="wifi-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                       <div 
                        id="recent-wifi-card" 
                        className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-indigo-500 hover:shadow-[inset_0_0_15px_rgba(99,102,241,0.35),0_25px_60px_-15px_rgba(99,102,241,0.45),0_0_40px_rgba(99,102,241,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-600 font-bold uppercase block rtl-content">{t('recent.card.wifi.badge')}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{t("tools.wifi.pairing")}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {t('recent.card.wifi.desc')}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="rtl-content">{t("tools.scan.activityRate")}</span>
                            <span className="font-mono font-extrabold text-slate-800 ltr-lock"><RollingNumber value={Math.min(100, 68 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'wifi'))?.length || 0) * 3)} />%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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
                          className="mt-4 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1 ltr-lock"
                        >
                          {t('recent.card.wifi.link')}
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'whatsapp') && (
                    <motion.div key="whatsapp-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-whatsapp-card" 
                        className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[inset_0_0_15px_rgba(16,185,129,0.35),0_25px_60px_-15px_rgba(16,185,129,0.45),0_0_40px_rgba(16,185,129,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-800 font-bold uppercase block rtl-content">{t('recent.card.whatsapp.badge')}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">{t("tools.whatsapp.support")}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {t('recent.card.whatsapp.desc')}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="rtl-content">{t("tools.scan.activityRate")}</span>
                            <span className="font-mono font-extrabold text-slate-800 ltr-lock">{Math.min(100, 75 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me')))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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
                          className="mt-4 text-xs font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-1 ltr-lock"
                        >
                          {t('recent.card.whatsapp.link')}
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'vcard') && (
                    <motion.div key="vcard-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-vcard-card" 
                        className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-purple-500 hover:shadow-[inset_0_0_15px_rgba(168,85,247,0.35),0_25px_60px_-15px_rgba(168,85,247,0.45),0_0_40px_rgba(168,85,247,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-purple-600 font-bold uppercase block rtl-content">{t('recent.card.vcard.badge')}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">{t("tools.vcards.rich")}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {t('recent.card.vcard.desc')}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="rtl-content">{t("tools.scan.activityRate")}</span>
                            <span className="font-mono font-extrabold text-slate-800 ltr-lock">{Math.min(100, 92 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && p.type === 'card'))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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
                          className="mt-4 text-xs font-bold text-purple-600 group-hover:text-purple-800 flex items-center gap-1 ltr-lock"
                        >
                          {t('recent.card.vcard.link')}
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                        </a>
                      </div>
                    </motion.div>
                  )}
   
                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'restaurant') && (
                    <motion.div key="restaurant-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-restaurant-card" 
                        className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-amber-500 hover:shadow-[inset_0_0_15px_rgba(245,158,11,0.35),0_25px_60px_-15px_rgba(245,158,11,0.45),0_0_40px_rgba(245,158,11,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-800 font-bold uppercase block rtl-content">{t('recent.card.restaurant.badge')}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">{t("tools.menus.pdf")}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {t('recent.card.restaurant.desc')}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="rtl-content">{t("tools.scan.activityRate")}</span>
                            <span className="font-mono font-extrabold text-slate-800 ltr-lock">{Math.min(100, 40 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'url' || p.type === 'text') && (p.content.includes('menu') || p.content.includes('pdf'))))?.length || 0) * 4)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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
                          className="mt-4 text-xs font-bold text-amber-800 group-hover:text-amber-955 flex items-center gap-1 ltr-lock"
                        >
                          {t('recent.card.restaurant.link')}
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'social') && (
                    <motion.div key="social-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                      <div 
                        id="recent-social-card" 
                        className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-pink-500 hover:shadow-[inset_0_0_15px_rgba(236,72,153,0.35),0_25px_60px_-15px_rgba(236,72,153,0.45),0_0_40px_rgba(236,72,153,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] text-pink-600 font-bold uppercase block rtl-content">{t('recent.card.social.badge')}</span>
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors">{t("tools.social.hubs")}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {t('recent.card.social.desc')}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-4">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="rtl-content">{t("tools.scan.activityRate")}</span>
                            <span className="font-mono font-extrabold text-slate-800 ltr-lock">{Math.min(100, 83 + (scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && (p.content.includes('instagram') || p.content.includes('youtube') || p.content.includes('facebook') || p.content.includes('twitter'))))?.length || 0) * 3)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
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
                          className="mt-4 text-xs font-bold text-pink-600 group-hover:text-pink-800 flex items-center gap-1 ltr-lock"
                        >
                          {t('recent.card.social.link')}
                          <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
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
                <div id="scroll-indicator" className="flex items-center justify-center gap-2 mt-4 text-[10px] uppercase tracking-wider font-mono font-bold text-indigo-600 sm:hidden">
                  <span>{t('recent.swipe')}</span>
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
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                {t('guides.title', 'Related Free QR Generation Guides')}
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
                          🚀 {t(`guides.item.${item.slug}.title`, item.h1)}
                        </span>
                        <p className="text-[9px] text-slate-600 mt-1 leading-relaxed truncate-3-lines min-h-[25px]">
                          {t(`guides.item.${item.slug}.desc`, item.intro.highlight)}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1 mt-1">
                        {t('guides.readGuide')} <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
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
                <h4 id="cookie-title" className="text-sm font-bold tracking-tight text-slate-100">{navTranslations[locale].cookieConsentTitle || 'Cookie Preference'}</h4>
                <p id="cookie-description" className="text-[11px] text-slate-200 leading-relaxed font-sans">
                  {navTranslations[locale].cookieConsentText || 'We use essential cookies to safely persist state, optimize your QR customization workflow, and analyze scan activity rates.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-0.5">
              <button
                id="cookie-decline-button"
                onClick={handleDeclineCookies}
                className="px-3.5 py-1.5 text-[11px] font-bold text-slate-200 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-slate-900/50"
              >
                {navTranslations[locale].decline || 'Decline'}
              </button>
              <button
                id="cookie-accept-button"
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/15 active:scale-95 transition-all cursor-pointer font-sans"
              >
                {navTranslations[locale].accept || 'Accept All'}
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
          initialTab={authModalTab}
          onSuccess={(u) => {
            setUser(u);
            setIsAuthModalOpen(false);
          }}
        />
        <ShortcutsHelpModal 
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
        />
        <TourWelcomeModal
          isOpen={tourOpen}
          onClose={() => {
            setTourOpen(false);
            setTourRunning(false);
          }}
          onStart={() => {
            setTourOpen(false);
            setTourRunning(true);
          }}
        />
      </React.Suspense>

      {/* Footer with rich SEO directory links */}
      <footer id="app-footer" dir="ltr" className="py-16 border-t border-slate-200 bg-slate-50/50 text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div id="footer-branding" className="md:col-span-2 space-y-3">
            <button 
              onClick={() => navigateTo('/')} 
              className="flex items-center text-left focus:outline-hidden hover:opacity-95 active:scale-98 transition-all cursor-pointer"
              aria-label="Free QR Generator Home"
            >
              <Logo size={42} />
            </button>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              {t('footer.brandDesc', 'Design customized, high-redundancy QR codes with modern color gradients, dot styles, and brand centerpieces. Complete with dynamic web link shortener tracking and real-time scan analytics.')}
            </p>
            <div className="pt-4">
              <a href="https://www.producthunt.com/posts/free-qr-generator-4" target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-102 duration-300">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=free-qr-generator-4&theme=light" alt="Free QR Generator on Product Hunt" width="250" height="54" />
              </a>
            </div>
          </div>
          <div id="footer-directory" className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">{t('footer.directoryTitle', 'Dedicated Free QR Code Solutions')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <a href="/wifi-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionWifi', '📡 Free WiFi QR Code Generator')}
              </a>
              <a href="/whatsapp-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionWhatsapp', '💬 Free WhatsApp QR Code Generator')}
              </a>
              <a href="/email-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/email-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionEmail', '✉️ Free Email QR Code Generator')}
              </a>
              <a href="/sms-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/sms-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionSms', '📱 Free SMS QR Code Generator')}
              </a>
              <a href="/vcard-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionVcard', '📇 Free vCard QR Code Generator')}
              </a>
              <a href="/url-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/url-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionUrl', '🔗 Free URL QR Code Generator')}
              </a>
              <a href="/business-card-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/business-card-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionBusinessCard', '💼 Free Business Card QR Code')}
              </a>
              <a href="/restaurant-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionRestaurant', '🍔 Free Restaurant QR Code')}
              </a>
              <a href="/facebook-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/facebook-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionFacebook', '📘 Free Facebook QR Code')}
              </a>
              <a href="/instagram-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/instagram-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionInstagram', '📸 Free Instagram QR Code')}
              </a>
              <a href="/youtube-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/youtube-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionYoutube', '🎥 Free YouTube QR Code')}
              </a>
              <a href="/pdf-qr-generator" onClick={(e) => { e.preventDefault(); navigateTo('/pdf-qr-generator'); }} className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:font-bold cursor-pointer transition-colors truncate">
                {t('footer.solutionPdf', '📄 Free PDF QR Code Generator')}
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>{t('footer.copyright', '© 2026 iSolutions QR Generator. Decoupled and fully verified local-cloud schema.')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.aboutUs', 'About Us')}</a>
            <span>•</span>
            <a href="/why-freeqrgen" onClick={(e) => { e.preventDefault(); navigateTo('/why-freeqrgen'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.whyUs', 'Why Us')}</a>
            <span>•</span>
            <a href="/editorial-policy" onClick={(e) => { e.preventDefault(); navigateTo('/editorial-policy'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.editorialPolicy', 'Editorial Policy')}</a>
            <span>•</span>
            <a href="/research-methodology" onClick={(e) => { e.preventDefault(); navigateTo('/research-methodology'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.researchMethodology', 'Research Methodology')}</a>
            <span>•</span>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigateTo('/privacy'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.privacyPolicy', 'Privacy Policy')}</a>
            <span>•</span>
            <a href="/security" onClick={(e) => { e.preventDefault(); navigateTo('/security'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.security', 'Security')}</a>
            <span>•</span>
            <a href="/data-processing" onClick={(e) => { e.preventDefault(); navigateTo('/data-processing'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.dataProcessing', 'Data Processing')}</a>
            <span>•</span>
            <a href="/accessibility" onClick={(e) => { e.preventDefault(); navigateTo('/accessibility'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.accessibility', 'Accessibility')}</a>
            <span>•</span>
            <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.contactUs', 'Contact Us')}</a>
            <span>•</span>
            <a href="/changelog" onClick={(e) => { e.preventDefault(); navigateTo('/changelog'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.changelog', 'Changelog')}</a>
            <span>•</span>
            <a href="/release-notes" onClick={(e) => { e.preventDefault(); navigateTo('/release-notes'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.releaseNotes', 'Release Notes')}</a>
            <span>•</span>
            <a href="/system-status" onClick={(e) => { e.preventDefault(); navigateTo('/system-status'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.systemStatus', 'System Status')}</a>
            <span>•</span>
            <a href="/careers" onClick={(e) => { e.preventDefault(); navigateTo('/careers'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.careers', 'Careers')}</a>
            <span>•</span>
            <a href="/media-kit" onClick={(e) => { e.preventDefault(); navigateTo('/media-kit'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.mediaKit', 'Media Kit')}</a>
            <span>•</span>
            <a href="/brand-assets" onClick={(e) => { e.preventDefault(); navigateTo('/brand-assets'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.brandAssets', 'Brand Assets')}</a>
            <span>•</span>
            <a href="/press" onClick={(e) => { e.preventDefault(); navigateTo('/press'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.press', 'Press Center')}</a>
            <span>•</span>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.terms', 'Terms & Conditions')}</a>
            <span>•</span>
            <a href="/faq" onClick={(e) => { e.preventDefault(); navigateTo('/faq'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.faq', 'FAQ')}</a>
            <span>•</span>
            <a href="/blog" onClick={(e) => { e.preventDefault(); navigateTo('/blog'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.blog', 'Blog')}</a>
            <span>•</span>
            <a href="/templates" onClick={(e) => { e.preventDefault(); navigateTo('/templates'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.templates', 'Templates')}</a>
            <span>•</span>
            <a href="/compare" onClick={(e) => { e.preventDefault(); navigateTo('/compare'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.compare', 'Comparisons')}</a>
            <span>•</span>
            <a href="/solutions" onClick={(e) => { e.preventDefault(); navigateTo('/solutions'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.solutions', 'Solutions')}</a>
            <span>•</span>
            <a href="/industries" onClick={(e) => { e.preventDefault(); navigateTo('/industries'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.industries', 'Industries')}</a>
            <span>•</span>
            <a href="/use-cases" onClick={(e) => { e.preventDefault(); navigateTo('/use-cases'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.useCases', 'Use Cases')}</a>
            <span>•</span>
            <a href="/academy" onClick={(e) => { e.preventDefault(); navigateTo('/academy'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.academy', 'Academy')}</a>
            <span>•</span>
            <a href="/guides" onClick={(e) => { e.preventDefault(); navigateTo('/guides'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.guides', 'Guides')}</a>
            <span>•</span>
            <a href="/tutorials" onClick={(e) => { e.preventDefault(); navigateTo('/tutorials'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.tutorials', 'Tutorials')}</a>
            <span>•</span>
            <a href="/resources" onClick={(e) => { e.preventDefault(); navigateTo('/resources'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.resources', 'Resources')}</a>
            <span>•</span>
            <a href="/glossary" onClick={(e) => { e.preventDefault(); navigateTo('/glossary'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.glossary', 'Glossary')}</a>
            <span>•</span>
            <a href="/embed" onClick={(e) => { e.preventDefault(); navigateTo('/embed'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.embed', 'Embed Badge')}</a>
            <span>•</span>
            <a href="/platform/qr-analytics" onClick={(e) => { e.preventDefault(); navigateTo('/platform/qr-analytics'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.platformSuite', 'Platform Suite')}</a>
            <span>•</span>
            <a href="/i18n-dashboard" onClick={(e) => { e.preventDefault(); navigateTo('/i18n-dashboard'); }} className="text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider font-bold">{t('footer.i18nDashboard', 'i18n Developer Dashboard & QA')}</a>
            <span>•</span>
            <a href="/ai-gateway" onClick={(e) => { e.preventDefault(); navigateTo('/ai-gateway'); }} className="text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider font-bold">{t('footer.aiGateway', 'Enterprise AI & Developer Gateway')}</a>
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

      {/* Global Sound & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        soundSettings={soundSettings}
        onUpdateSoundSettings={setSoundSettings}
      />

      {/* Campaign AI Assistant Widget */}
      <AIAssistantWidget
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigateTo}
      />
    </div>
  );
}
