import React, { useState, useEffect, useRef } from 'react';
import { getProductionBaseUrl } from './config/siteConfig';
import { api, UserSession } from './lib/api';
import { useFirebaseAuth } from './context/FirebaseAuthContext';
import { useReCaptchaEnterprise } from './hooks/useReCaptchaEnterprise';
import { auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { QRProject, ScanLog, AppTab } from './types';
import { landingPages } from './pages/landing/SEODatabase';
import { getBlogArticles } from './data/blogData';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import AuthModal from './components/AuthModal';
import ShortcutsHelpModal from './components/ShortcutsHelpModal';
import TourWelcomeModal from './components/TourWelcomeModal';
import SettingsModal from './components/SettingsModal';
import AIAssistantWidget from './components/AIAssistantWidget';
import QRRedirector from './components/QRRedirector';
import AppLayoutShell from './components/AppLayoutShell';
import MobileQRWorkspace from './components/MobileQRWorkspace';
import ScrollableTabContainer from './components/ScrollableTabContainer';
import BulkFormatHelpModal from './components/BulkFormatHelpModal';
import { usePlatformLayout } from './hooks/usePlatformLayout';
import { MobileTabType } from './components/MobileBottomNav';
import { SoundSettings, getDefaultSoundSettings, playAudioSound } from './utils/audioFeedback';

// Code-splitting via React.lazy for secondary landing & hub pages
// Resilient lazy loader helper for dynamic imports
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      // Retry once by reloading window session if module fetch failed
      const hasRefreshed = sessionStorage.getItem('lazy_retry_refreshed');
      if (!hasRefreshed) {
        sessionStorage.setItem('lazy_retry_refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

const SEOPage = lazyWithRetry(() => import('./pages/landing/SEOPage'));
const BulkQRGenerator = lazyWithRetry(() => import('./components/BulkQRGenerator'));
const AnimationsShowcase = lazyWithRetry(() => import('./components/AnimationsShowcase'));
const CompanyPages = lazyWithRetry(() => import('./pages/CompanyPages'));

// Organization Schema helper for footer entity graph
export function getFooterOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.freeqrbarcodes.com/#organization",
    "name": "Free QR Code Generator",
    "url": "https://www.freeqrbarcodes.com/",
    "logo": {
      "@type": "ImageObject",
      "@id": "https://www.freeqrbarcodes.com/#logo",
      "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png",
      "caption": "Free QR Code Generator Logo"
    },
    "description": "Provider of 100% free dynamic QR codes, high-density matrix symbology generators, and real-time scan analytics tools.",
    "knowsAbout": [
      "QR Code Symbology",
      "ISO/IEC 18004 Standard",
      "GS1 Digital Link Syntax",
      "Dynamic Short URL Routing",
      "2D Barcode Matrices",
      "Vector Graphics & SVG Generation"
    ],
    "sameAs": [
      "https://www.producthunt.com/posts/free-qr-generator-4",
      "https://www.freeqrbarcodes.com/about",
      "https://www.freeqrbarcodes.com/why-freeqrgen",
      "https://www.freeqrbarcodes.com/faq",
      "https://www.freeqrbarcodes.com/blog",
      "https://www.freeqrbarcodes.com/templates",
      "https://www.freeqrbarcodes.com/compare",
      "https://www.freeqrbarcodes.com/solutions",
      "https://www.freeqrbarcodes.com/system-status"
    ]
  };
}
const TrustCenterHub = lazyWithRetry(() => import('./pages/TrustCenterHub'));
const FaqSection = lazyWithRetry(() => import('./pages/FaqSection'));
const BlogSection = lazyWithRetry(() => import('./pages/BlogSection'));
const KnowledgeHub = lazyWithRetry(() => import('./pages/KnowledgeHub'));
import { knowledgeArticles } from './data/knowledgeData';
const TemplatesHub = lazyWithRetry(() => import('./pages/TemplatesHub'));
import { templatePages } from './data/templatePagesData';
const EmbedPage = lazyWithRetry(() => import('./pages/EmbedPage'));
const CompareHub = lazyWithRetry(() => import('./pages/CompareHub'));
import { comparisons } from './data/compareData';
const ProgrammaticHub = lazyWithRetry(() => import('./pages/ProgrammaticHub'));
import { solutionsData, useCasesData, getBespokeProfile } from './data/programmaticSEOData';
const PlatformHub = lazyWithRetry(() => import('./pages/PlatformHub'));
const I18nDashboard = lazyWithRetry(() => import('./pages/I18nDashboard'));
const GrowthSuite = lazyWithRetry(() => import('./pages/GrowthSuite'));
const EnterpriseAIGateway = lazyWithRetry(() => import('./pages/EnterpriseAIGateway'));
const QRMarketingPlatform = lazyWithRetry(() => import('./pages/marketing/QRMarketingPlatform'));
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import StaticVsDynamicComparison from './components/StaticVsDynamicComparison';


// Non-blocking fallback skeleton loader
const LazyLoader = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]" id="lazy-fallback">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600/20 border-t-indigo-600 animate-spin" />
      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Loading workspace...</span>
    </div>
  </div>
);

// Defined sitemap array as requested
export const SITEMAP_ROUTES = [
  { path: '/', lastmod: '2026-08-07', changefreq: 'daily', priority: 1.0 },
  { path: '/url-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/pdf-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/wifi-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/vcard-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/email-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/sms-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/whatsapp-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/instagram-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/business-card-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/restaurant-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/facebook-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/youtube-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/faq', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.7 },
  { path: '/blog', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.7 },
  { path: '/about', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/privacy-policy', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/contact', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/terms', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/why-freeqrgen', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/editorial-policy', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/research-methodology', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/security', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/data-processing', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/accessibility', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/changelog', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/release-notes', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/system-status', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/careers', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/media-kit', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/brand-assets', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/press', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.5 },
  { path: '/ai-gateway', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.4 },
  { path: '/marketing-platform', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.4 },
  { path: '/embed', lastmod: '2026-08-07', changefreq: 'monthly', priority: 0.4 },
  { path: '/templates', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.6 },
  { path: '/compare', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.6 },
  { path: '/solutions', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.6 },
  { path: '/industries', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.6 },
  { path: '/use-cases', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.6 },
  { path: '/restaurant-menu-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/digital-card-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/pdf-sharing-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/barcode-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/bulk-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/animated-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/payment-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/crypto-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/app-store-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/location-qr-generator', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true },
  { path: '/zatca-invoice', lastmod: '2026-08-07', changefreq: 'weekly', priority: 0.8, isLanding: true }
];

/**
 * Verifies that the sitemap array dynamically reflects every unique route defined in the router,
 * ensuring all paths have a correct and formatted <lastmod> timestamp.
 */
export function validateSitemapRoutes(landingPageSlugs: string[], trustCenterPaths: string[]): {
  success: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const expectedRoutes = new Set<string>();

  // 1. Base route
  expectedRoutes.add('/');

  // 2. Landing pages (e.g. /wifi-qr-generator)
  landingPageSlugs.forEach(slug => {
    expectedRoutes.add(`/${slug}`);
  });

  // 3. Trust center paths
  trustCenterPaths.forEach(path => {
    expectedRoutes.add(path);
  });

  // 4. Static custom routes
  const customStaticRoutes = [
    '/terms',
    '/faq',
    '/blog',
    '/embed',
    '/ai-gateway',
    '/marketing-platform',
    '/templates',
    '/compare',
    '/solutions',
    '/industries',
    '/use-cases',
    '/zatca-invoice'
  ];
  customStaticRoutes.forEach(route => {
    expectedRoutes.add(route);
  });

  // Check each expected route
  expectedRoutes.forEach(route => {
    const sitemapEntry = SITEMAP_ROUTES.find(entry => entry.path === route);
    if (!sitemapEntry) {
      errors.push(`Missing route in sitemap: "${route}"`);
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(sitemapEntry.lastmod)) {
        errors.push(`Invalid lastmod date format for "${route}": "${sitemapEntry.lastmod}" (Expected YYYY-MM-DD)`);
      }
    }
  });

  // Check for any obsolete entries in sitemap
  SITEMAP_ROUTES.forEach(entry => {
    if (!expectedRoutes.has(entry.path)) {
      if (!entry.path.startsWith('/qr/') && !entry.path.startsWith('/blog/')) {
        errors.push(`Obsolete/Extra route in SITEMAP_ROUTES that is not defined in the active router: "${entry.path}"`);
      }
    }
  });

  const success = errors.length === 0;
  if (!success) {
    console.error('Sitemap Validation Failed:', errors);
  } else {
    console.log('Sitemap Validation Succeeded: All active router paths correctly mapped with valid timestamps.');
  }

  return { success, errors };
}

import { Locale, navTranslations, creativeSubItems, presetToolsTranslations, isRtlLocale, extractLocaleAndPath, SUPPORTED_LOCALES } from './utils/translations';
import { useTranslation, useDocumentLanguage } from './utils/i18n';
import MobileDrawer from './components/MobileDrawer';
import Header from './components/Header';
import Logo from './components/Logo';

// Additional dynamic code splitting for secondary tabs and widgets
const TemplatesTab = lazyWithRetry(() => import('./components/TemplatesTab'));
const SavedProjects = lazyWithRetry(() => import('./components/SavedProjects'));
const AnalyticsDashboard = lazyWithRetry(() => import('./components/AnalyticsDashboard'));
const BarcodeGenerator = lazyWithRetry(() => import('./components/BarcodeGenerator'));
const DigitalBusinessCard = lazyWithRetry(() => import('./components/DigitalBusinessCard'));
const RestaurantMenu = lazyWithRetry(() => import('./components/RestaurantMenu'));
const PdfSharing = lazyWithRetry(() => import('./components/PdfSharing'));
const FormBuilder = lazyWithRetry(() => import('./components/FormBuilder'));
const PrintModeLayout = lazyWithRetry(() => import('./components/PrintModeLayout'));
const ZatcaInvoiceGenerator = lazyWithRetry(() => import('./components/ZatcaInvoiceGenerator'));
import { 
  QrCode, LogIn, LogOut, Zap, LayoutGrid, RotateCcw, AlertCircle, ShieldCheck,
  ChevronDown, ChevronUp, Menu, X, ArrowRight, ArrowUp, ArrowDown, Clock, Star, Compass, Link2,
  Wifi, Mail, Phone, Contact, Globe, Utensils, Facebook, Instagram, Youtube, FileText,
  Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, Smartphone, HelpCircle, BookOpen,
  BarChart3, Info, MessageSquare, Shield, Bell, BellOff, Radio, Sun, Moon, Laptop, Scale, Cpu, Barcode, FileSpreadsheet, Wallet, FormInput, Printer, Copy, Check,
  Maximize2, Tablet, Download, Search, ExternalLink, FileCheck2, MapPin, TrendingUp, TrendingDown, Calendar,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Joyride, STATUS, Step } from 'react-joyride';

const INITIAL_DESIGN: Partial<QRProject> = {
  id: '',
  name: '',
  type: 'url',
  content: '',
  design: {
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    gradientType: 'none',
    gradientColor: '#4f46e5',
    dotStyle: 'square',
    eyeStyle: 'square',
    logoUrl: '',
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
  const letters = Array.from("FreeQRBarcodes.com");
  
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
  useReCaptchaEnterprise(); // Safely initialize and execute reCAPTCHA Enterprise on mount

  // Embed reCAPTCHA badge guard (cleanup if any stale badges exist)
  useEffect(() => {
    // Ensure any stray error badges on unauthorized domains are kept safely hidden
    const errorBadge = document.querySelector('.grecaptcha-badge:has(.grecaptcha-error), .grecaptcha-error');
    if (errorBadge && (errorBadge as HTMLElement).style) {
      (errorBadge as HTMLElement).style.display = 'none';
    }
  }, []);
  const platform = usePlatformLayout();
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTabType>('generator');
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
    ip?: string;
  }
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [copiedToastId, setCopiedToastId] = useState<string | null>(null);
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
                  approxLocation: data.approxLocation || 'Unknown Location',
                  deviceType: data.deviceType,
                  browser: data.browser,
                  timestamp: data.timestamp,
                  ip: data.ip || data.ipAddress || ''
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
  const { locale, changeLocale, t, getRelativeTimeString } = useTranslation();
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

  // Sync AI Assistant applied configurations to current generator state
  useEffect(() => {
    const handleApplyAIConfig = (e: CustomEvent) => {
      if (e.detail) {
        setCurrentProject(prev => {
          const incoming = e.detail;
          const merged = {
            ...prev,
            ...incoming,
            design: {
              ...(prev.design || {}),
              ...(incoming.design || {})
            }
          };
          return merged;
        });
      }
    };
    window.addEventListener('apply-qr-ai-config' as any, handleApplyAIConfig);
    return () => window.removeEventListener('apply-qr-ai-config' as any, handleApplyAIConfig);
  }, []);

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
      title: '✨ Welcome to FreeQRBarcodes.com!',
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
  const [isBulkHelpModalOpen, setIsBulkHelpModalOpen] = useState(false);

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
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Cookie Consent banner state
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  // Expandable WhatsApp Card Overlay States & Telemetry Logic
  const [isWhatsappOverlayOpen, setIsWhatsappOverlayOpen] = useState(false);
  const [whatsappOverlaySearch, setWhatsappOverlaySearch] = useState('');
  const [whatsappOverlayDeviceFilter, setWhatsappOverlayDeviceFilter] = useState<'all' | 'mobile' | 'desktop' | 'tablet'>('all');
  const [whatsappOverlayDateRange, setWhatsappOverlayDateRange] = useState<'all' | '7d' | '30d' | '90d' | 'custom'>('all');
  const [whatsappCustomStartDate, setWhatsappCustomStartDate] = useState<string>('');
  const [whatsappCustomEndDate, setWhatsappCustomEndDate] = useState<string>('');
  const [whatsappSelectedScanDetail, setWhatsappSelectedScanDetail] = useState<ScanLog | null>(null);
  const [simulatedWhatsappScans, setSimulatedWhatsappScans] = useState<ScanLog[]>([]);

  // Interactive Map Zoom & Navigation States
  const [whatsappMapZoom, setWhatsappMapZoom] = useState<number>(1);
  const [whatsappMapPan, setWhatsappMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingMap, setIsDraggingMap] = useState<boolean>(false);
  const mapDragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapHasDraggedRef = useRef<boolean>(false);

  // ESC key listener to close overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWhatsappOverlayOpen) {
        setIsWhatsappOverlayOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWhatsappOverlayOpen]);

  // Reset map zoom and pan whenever overlay closes
  useEffect(() => {
    if (!isWhatsappOverlayOpen) {
      setWhatsappMapZoom(1);
      setWhatsappMapPan({ x: 0, y: 0 });
      setIsDraggingMap(false);
      mapHasDraggedRef.current = false;
    }
  }, [isWhatsappOverlayOpen]);

  // Derived dataset combining real, live simulated, and sample telemetry scan records
  const whatsappScanLogs = React.useMemo(() => {
    const realWhatsappScans = scans?.filter(s => 
      projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && (p.content.includes('wa.me') || p.content.includes('whatsapp')))
    ) || [];

    const combined = [...simulatedWhatsappScans, ...realWhatsappScans];

    if (combined.length >= 12) {
      return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    const nowMs = Date.now();
    const sampleItems: ScanLog[] = [
      {
        id: 'wa-demo-1',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-101',
        timestamp: new Date(nowMs - 2 * 60 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Mobile Safari 17.5',
        os: 'iOS 17.5',
        approxLocation: 'London, United Kingdom',
        city: 'London',
        country: 'United Kingdom',
        countryCode: 'GB',
        ip: '203.0.113.42',
        userId: 'user-wa-1',
        destinationUrl: 'https://wa.me/15550192834?text=Hello%20Support',
        referrer: 'WhatsApp Mobile App / Direct Camera'
      },
      {
        id: 'wa-demo-2',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-102',
        timestamp: new Date(nowMs - 12 * 60 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Chrome Mobile 125.0',
        os: 'Android 14',
        approxLocation: 'San Francisco, CA, USA',
        city: 'San Francisco',
        country: 'United States',
        countryCode: 'US',
        ip: '198.51.100.89',
        userId: 'user-wa-2',
        destinationUrl: 'https://wa.me/15550192834?text=Inquiry',
        referrer: 'Camera Scanner'
      },
      {
        id: 'wa-demo-3',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-103',
        timestamp: new Date(nowMs - 45 * 60 * 1000).toISOString(),
        deviceType: 'Desktop',
        browser: 'Chrome 125.0',
        os: 'macOS Sonoma 14.4',
        approxLocation: 'Berlin, Germany',
        city: 'Berlin',
        country: 'Germany',
        countryCode: 'DE',
        ip: '185.220.101.5',
        userId: 'user-wa-3',
        destinationUrl: 'https://wa.me/15550192834?text=Order%20Status',
        referrer: 'Desktop Web Browser'
      },
      {
        id: 'wa-demo-4',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-104',
        timestamp: new Date(nowMs - 2 * 3600 * 1000).toISOString(),
        deviceType: 'Tablet',
        browser: 'Mobile Safari 17.4',
        os: 'iPadOS 17.4',
        approxLocation: 'Tokyo, Japan',
        city: 'Tokyo',
        country: 'Japan',
        countryCode: 'JP',
        ip: '202.214.192.10',
        userId: 'user-wa-4',
        destinationUrl: 'https://wa.me/15550192834?text=Support',
        referrer: 'iPad Camera App'
      },
      {
        id: 'wa-demo-5',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-105',
        timestamp: new Date(nowMs - 4 * 3600 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Samsung Internet 24.0',
        os: 'Android 14',
        approxLocation: 'Toronto, Canada',
        city: 'Toronto',
        country: 'Canada',
        countryCode: 'CA',
        ip: '142.250.190.46',
        userId: 'user-wa-5',
        destinationUrl: 'https://wa.me/15550192834?text=Sales%20Help',
        referrer: 'Galaxy Camera AI'
      },
      {
        id: 'wa-demo-6',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-106',
        timestamp: new Date(nowMs - 8 * 3600 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Mobile Safari 17.2',
        os: 'iOS 17.2',
        approxLocation: 'Paris, France',
        city: 'Paris',
        country: 'France',
        countryCode: 'FR',
        ip: '51.15.22.11',
        userId: 'user-wa-6',
        destinationUrl: 'https://wa.me/15550192834',
        referrer: 'iOS Native Camera'
      },
      {
        id: 'wa-demo-7',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-107',
        timestamp: new Date(nowMs - 14 * 3600 * 1000).toISOString(),
        deviceType: 'Desktop',
        browser: 'Firefox 126.0',
        os: 'Windows 11',
        approxLocation: 'Sydney, Australia',
        city: 'Sydney',
        country: 'Australia',
        countryCode: 'AU',
        ip: '139.130.4.5',
        userId: 'user-wa-7',
        destinationUrl: 'https://wa.me/15550192834?text=VIP%20Access',
        referrer: 'Firefox Desktop'
      },
      {
        id: 'wa-demo-8',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-108',
        timestamp: new Date(nowMs - 22 * 3600 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Chrome Mobile 124.0',
        os: 'Android 13',
        approxLocation: 'Dubai, UAE',
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        ip: '94.200.12.80',
        userId: 'user-wa-8',
        destinationUrl: 'https://wa.me/15550192834',
        referrer: 'Google Lens'
      },
      {
        id: 'wa-demo-9',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-109',
        timestamp: new Date(nowMs - 30 * 3600 * 1000).toISOString(),
        deviceType: 'Mobile',
        browser: 'Mobile Safari 17.5',
        os: 'iOS 17.5',
        approxLocation: 'Singapore',
        city: 'Singapore',
        country: 'Singapore',
        countryCode: 'SG',
        ip: '118.200.5.18',
        userId: 'user-wa-9',
        destinationUrl: 'https://wa.me/15550192834?text=Pricing',
        referrer: 'iOS Native Camera'
      },
      {
        id: 'wa-demo-10',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-110',
        timestamp: new Date(nowMs - 48 * 3600 * 1000).toISOString(),
        deviceType: 'Desktop',
        browser: 'Microsoft Edge 124.0',
        os: 'Windows 11 Pro',
        approxLocation: 'Amsterdam, Netherlands',
        city: 'Amsterdam',
        country: 'Netherlands',
        countryCode: 'NL',
        ip: '145.131.2.99',
        userId: 'user-wa-10',
        destinationUrl: 'https://wa.me/15550192834',
        referrer: 'Edge Browser'
      },
      {
        id: 'wa-demo-11',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-111',
        timestamp: new Date(nowMs - 10 * 24 * 3600 * 1000).toISOString(), // 10 days ago (30d, 90d, all)
        deviceType: 'Mobile',
        browser: 'Chrome Mobile 123.0',
        os: 'Android 13',
        approxLocation: 'Mumbai, India',
        city: 'Mumbai',
        country: 'India',
        countryCode: 'IN',
        ip: '103.21.141.2',
        userId: 'user-wa-11',
        destinationUrl: 'https://wa.me/15550192834',
        referrer: 'Google Lens'
      },
      {
        id: 'wa-demo-12',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-112',
        timestamp: new Date(nowMs - 45 * 24 * 3600 * 1000).toISOString(), // 45 days ago (90d, all)
        deviceType: 'Desktop',
        browser: 'Safari 17.0',
        os: 'macOS Sonoma',
        approxLocation: 'Sydney, Australia',
        city: 'Sydney',
        country: 'Australia',
        countryCode: 'AU',
        ip: '1.1.1.1',
        userId: 'user-wa-12',
        destinationUrl: 'https://wa.me/15550192834?text=Support',
        referrer: 'Direct URL Entry'
      },
      {
        id: 'wa-demo-13',
        projectId: 'whatsapp-proj-1',
        trackingId: 'tr-wa-113',
        timestamp: new Date(nowMs - 120 * 24 * 3600 * 1000).toISOString(), // 120 days ago (all only)
        deviceType: 'Tablet',
        browser: 'Chrome Tablet 124.0',
        os: 'Android 14',
        approxLocation: 'São Paulo, Brazil',
        city: 'São Paulo',
        country: 'Brazil',
        countryCode: 'BR',
        ip: '186.200.10.5',
        userId: 'user-wa-13',
        destinationUrl: 'https://wa.me/15550192834',
        referrer: 'Printed QR Code Scan'
      }
    ];

    return [...combined, ...sampleItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [scans, projects, simulatedWhatsappScans]);

  const filteredWhatsappScans = React.useMemo(() => {
    return whatsappScanLogs.filter(s => {
      // 1. Device filter
      if (whatsappOverlayDeviceFilter !== 'all') {
        if (whatsappOverlayDeviceFilter === 'mobile' && s.deviceType?.toLowerCase() !== 'mobile') return false;
        if (whatsappOverlayDeviceFilter === 'desktop' && s.deviceType?.toLowerCase() !== 'desktop') return false;
        if (whatsappOverlayDeviceFilter === 'tablet' && s.deviceType?.toLowerCase() !== 'tablet') return false;
      }

      // 2. Date-range filter
      const scanDate = new Date(s.timestamp);
      const scanTime = scanDate.getTime();
      const now = new Date();
      const nowTime = now.getTime();

      if (whatsappOverlayDateRange === '7d') {
        const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000;
        if (scanTime < sevenDaysAgo) return false;
      } else if (whatsappOverlayDateRange === '30d') {
        const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;
        if (scanTime < thirtyDaysAgo) return false;
      } else if (whatsappOverlayDateRange === '90d') {
        const ninetyDaysAgo = nowTime - 90 * 24 * 60 * 60 * 1000;
        if (scanTime < ninetyDaysAgo) return false;
      } else if (whatsappOverlayDateRange === 'custom') {
        if (whatsappCustomStartDate) {
          const start = new Date(whatsappCustomStartDate);
          start.setHours(0, 0, 0, 0);
          if (scanTime < start.getTime()) return false;
        }
        if (whatsappCustomEndDate) {
          const end = new Date(whatsappCustomEndDate);
          end.setHours(23, 59, 59, 999);
          if (scanTime > end.getTime()) return false;
        }
      }

      // 3. Search filter
      if (whatsappOverlaySearch.trim()) {
        const q = whatsappOverlaySearch.toLowerCase().trim();
        const matchLoc = s.approxLocation?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q);
        const matchDevice = s.deviceType?.toLowerCase().includes(q) || s.os?.toLowerCase().includes(q) || s.browser?.toLowerCase().includes(q);
        const matchIp = s.ip?.toLowerCase().includes(q);
        const matchUrl = s.destinationUrl?.toLowerCase().includes(q);
        return matchLoc || matchDevice || matchIp || matchUrl;
      }
      return true;
    });
  }, [whatsappScanLogs, whatsappOverlayDeviceFilter, whatsappOverlaySearch, whatsappOverlayDateRange, whatsappCustomStartDate, whatsappCustomEndDate]);

  const whatsappOverlaySparklineData = React.useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();
    let startTime = nowTime - 30 * 24 * 60 * 60 * 1000; // default to 30d
    let endTime = nowTime;

    if (whatsappOverlayDateRange === '7d') {
      startTime = nowTime - 7 * 24 * 60 * 60 * 1000;
    } else if (whatsappOverlayDateRange === '30d') {
      startTime = nowTime - 30 * 24 * 60 * 60 * 1000;
    } else if (whatsappOverlayDateRange === '90d') {
      startTime = nowTime - 90 * 24 * 60 * 60 * 1000;
    } else if (whatsappOverlayDateRange === 'all') {
      const timestamps = whatsappScanLogs.map(s => new Date(s.timestamp).getTime());
      if (timestamps.length > 0) {
        startTime = Math.min(...timestamps);
      } else {
        startTime = nowTime - 120 * 24 * 60 * 60 * 1000;
      }
    } else if (whatsappOverlayDateRange === 'custom') {
      if (whatsappCustomStartDate) {
        const start = new Date(whatsappCustomStartDate);
        start.setHours(0, 0, 0, 0);
        startTime = start.getTime();
      } else {
        startTime = nowTime - 30 * 24 * 60 * 60 * 1000;
      }
      if (whatsappCustomEndDate) {
        const end = new Date(whatsappCustomEndDate);
        end.setHours(23, 59, 59, 999);
        endTime = end.getTime();
      }
    }

    if (startTime >= endTime) {
      startTime = endTime - 24 * 60 * 60 * 1000;
    }

    const numBuckets = 12;
    const bucketDuration = (endTime - startTime) / numBuckets;
    const buckets = Array.from({ length: numBuckets }, (_, i) => ({
      start: startTime + i * bucketDuration,
      end: startTime + (i + 1) * bucketDuration,
      count: 0,
    }));

    whatsappScanLogs.forEach(s => {
      const scanTime = new Date(s.timestamp).getTime();
      
      // Filter out if they don't match device filter
      if (whatsappOverlayDeviceFilter !== 'all') {
        if (whatsappOverlayDeviceFilter === 'mobile' && s.deviceType?.toLowerCase() !== 'mobile') return;
        if (whatsappOverlayDeviceFilter === 'desktop' && s.deviceType?.toLowerCase() !== 'desktop') return;
        if (whatsappOverlayDeviceFilter === 'tablet' && s.deviceType?.toLowerCase() !== 'tablet') return;
      }
      
      // Filter out if they don't match search filter
      if (whatsappOverlaySearch.trim()) {
        const q = whatsappOverlaySearch.toLowerCase().trim();
        const matchLoc = s.approxLocation?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q);
        const matchDevice = s.deviceType?.toLowerCase().includes(q) || s.os?.toLowerCase().includes(q) || s.browser?.toLowerCase().includes(q);
        const matchIp = s.ip?.toLowerCase().includes(q);
        const matchUrl = s.destinationUrl?.toLowerCase().includes(q);
        const matched = matchLoc || matchDevice || matchIp || matchUrl;
        if (!matched) return;
      }

      for (const bucket of buckets) {
        if (scanTime >= bucket.start && scanTime < bucket.end) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets.map((b, idx) => ({
      index: idx,
      count: b.count,
      label: new Date(b.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));
  }, [whatsappScanLogs, whatsappOverlayDateRange, whatsappOverlayDeviceFilter, whatsappOverlaySearch, whatsappCustomStartDate, whatsappCustomEndDate]);

  const countryCoords: Record<string, { x: number; y: number; name: string }> = {
    US: { x: 65, y: 70, name: 'United States' },
    CA: { x: 65, y: 50, name: 'Canada' },
    GB: { x: 145, y: 55, name: 'United Kingdom' },
    NL: { x: 152, y: 54, name: 'Netherlands' },
    DE: { x: 156, y: 57, name: 'Germany' },
    SG: { x: 232, y: 120, name: 'Singapore' },
    IN: { x: 210, y: 92, name: 'India' },
    AU: { x: 265, y: 145, name: 'Australia' },
    BR: { x: 105, y: 118, name: 'Brazil' },
    ZA: { x: 172, y: 132, name: 'South Africa' },
    JP: { x: 258, y: 75, name: 'Japan' },
    AE: { x: 188, y: 88, name: 'United Arab Emirates' },
  };

  const locationStats = React.useMemo(() => {
    const stats: Record<string, { count: number; name: string; countryCode: string; lastScan: string }> = {};
    filteredWhatsappScans.forEach(s => {
      const code = s.countryCode || 'US';
      const name = s.country || 'United States';
      if (!stats[code]) {
        stats[code] = {
          count: 0,
          name,
          countryCode: code,
          lastScan: s.timestamp
        };
      }
      stats[code].count++;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [filteredWhatsappScans]);

  const handleCountryClick = (countryCode: string, countryName: string) => {
    if (mapHasDraggedRef.current) {
      mapHasDraggedRef.current = false;
      return;
    }
    playAudioSound('click');
    if (whatsappOverlaySearch.toLowerCase() === countryName.toLowerCase()) {
      setWhatsappOverlaySearch('');
    } else {
      setWhatsappOverlaySearch(countryName);
    }
  };

  const handleMapZoomIn = () => {
    playAudioSound('click');
    setWhatsappMapZoom(prev => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  };

  const handleMapZoomOut = () => {
    playAudioSound('click');
    setWhatsappMapZoom(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) {
        setWhatsappMapPan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleMapZoomReset = () => {
    playAudioSound('click');
    setWhatsappMapZoom(1);
    setWhatsappMapPan({ x: 0, y: 0 });
  };

  const handleMapPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (whatsappMapZoom <= 1) return;
    setIsDraggingMap(true);
    mapDragStartRef.current = { x: e.clientX - whatsappMapPan.x, y: e.clientY - whatsappMapPan.y };
    mapHasDraggedRef.current = false;
  };

  const handleMapPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDraggingMap) return;
    const newX = e.clientX - mapDragStartRef.current.x;
    const newY = e.clientY - mapDragStartRef.current.y;
    if (Math.abs(newX - (e.clientX - mapDragStartRef.current.x)) > 3 || Math.abs(newY - (e.clientY - mapDragStartRef.current.y)) > 3 || Math.abs(whatsappMapPan.x - newX) > 3 || Math.abs(whatsappMapPan.y - newY) > 3) {
      mapHasDraggedRef.current = true;
    }
    const maxPanX = (160 * (whatsappMapZoom - 1)) * 1.2;
    const maxPanY = (90 * (whatsappMapZoom - 1)) * 1.2;
    setWhatsappMapPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    });
  };

  const handleMapPointerUp = () => {
    setIsDraggingMap(false);
  };

  const handleMapWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (e.deltaY < 0) {
      setWhatsappMapZoom(prev => Math.min(3.5, Number((prev + 0.25).toFixed(2))));
    } else if (e.deltaY > 0) {
      setWhatsappMapZoom(prev => {
        const next = Math.max(1, Number((prev - 0.25).toFixed(2)));
        if (next === 1) {
          setWhatsappMapPan({ x: 0, y: 0 });
        }
        return next;
      });
    }
  };

  const handleSimulateWhatsappScan = () => {
    playAudioSound('click');
    const cities = [
      { city: 'London', country: 'United Kingdom', code: 'GB', ip: '203.0.113.99' },
      { city: 'New York', country: 'United States', code: 'US', ip: '198.51.100.12' },
      { city: 'Tokyo', country: 'Japan', code: 'JP', ip: '202.214.192.88' },
      { city: 'Berlin', country: 'Germany', code: 'DE', ip: '185.220.101.44' },
      { city: 'Sydney', country: 'Australia', code: 'AU', ip: '139.130.4.77' }
    ];
    const devices = [
      { type: 'Mobile', browser: 'Mobile Safari 17.5', os: 'iOS 17.5' },
      { type: 'Mobile', browser: 'Chrome Mobile 125.0', os: 'Android 14' },
      { type: 'Desktop', browser: 'Chrome 125.0', os: 'macOS Sonoma' }
    ];
    const targetCity = cities[Math.floor(Math.random() * cities.length)];
    const targetDev = devices[Math.floor(Math.random() * devices.length)];

    const newScan: ScanLog = {
      id: `wa-sim-${Date.now()}`,
      projectId: 'whatsapp-proj-live',
      trackingId: `tr-sim-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: new Date().toISOString(),
      deviceType: targetDev.type,
      browser: targetDev.browser,
      os: targetDev.os,
      approxLocation: `${targetCity.city}, ${targetCity.country}`,
      city: targetCity.city,
      country: targetCity.country,
      countryCode: targetCity.code,
      ip: targetCity.ip,
      userId: 'user-simulated',
      destinationUrl: 'https://wa.me/15550192834?text=Live%20Test',
      referrer: 'Live QR Code Scan'
    };

    setSimulatedWhatsappScans(prev => [newScan, ...prev]);
  };

  const handleExportWhatsappScansCSV = () => {
    playAudioSound('success');
    const headers = ['Scan ID', 'Timestamp', 'Device Type', 'OS', 'Browser', 'Location', 'IP Address', 'Destination URL'];
    const rows = filteredWhatsappScans.map(s => [
      s.id,
      new Date(s.timestamp).toLocaleString(),
      s.deviceType || 'Mobile',
      s.os || 'Unknown OS',
      s.browser || 'Unknown Browser',
      `"${s.approxLocation || 'Unknown'}"`,
      s.ip || '0.0.0.0',
      `"${s.destinationUrl || 'https://wa.me'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_qr_scans_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  const isPlatformSection = cleanPath === '/platform' || cleanPath.startsWith('/platform/');
  
  const trustCenterPaths = [
    '/about', '/why-freeqrgen', '/editorial-policy', '/research-methodology', 
    '/privacy-policy', '/security', '/data-processing', '/accessibility', 
    '/contact', '/changelog', '/release-notes', '/system-status', 
    '/careers', '/media-kit', '/brand-assets', '/press'
  ];
  const isTrustCenterSection = trustCenterPaths.some(p => cleanPath === p || cleanPath.startsWith(p + '/'));

  const isFreeQrToolsActive = cleanPath !== '/' && cleanPath !== '' && 
    !['/faq', '/about', '/privacy-policy', '/contact', '/terms', '/solutions', '/industries', '/use-cases', '/signup', '/signin', '/login', '/register', '/auth'].some(p => cleanPath === p || cleanPath.startsWith(p + '/')) &&  
    !cleanPath.startsWith('/blog') &&
    !cleanPath.startsWith('/platform') &&
    !isKnowledgeSection &&
    !isTemplatesSection &&
    !isCompareSection &&
    !isTrustCenterSection;

  // Granular Category Detection for desktop navigation and mobile navigation drawer
  const isCreativeCategoryActive = 
    cleanPath === '/generator' || 
    ((cleanPath === '/' || cleanPath === '') && ['create', 'templates', 'animations', 'customization', 'batch', 'style', 'palette', 'shapes', 'frames'].includes(activeTab)) ||
    isTemplatesSection ||
    (typeof window !== 'undefined' && (window.location.search.includes('tab=create') || window.location.search.includes('tab=templates') || window.location.search.includes('tab=animations')));

  const isToolsCategoryActive = 
    isFreeQrToolsActive ||
    ['/barcodes', '/zatca-invoice', '/business-card', '/restaurant-menu', '/bulk-qr'].includes(cleanPath) ||
    ['/url-qr', '/text-qr', '/wifi-qr', '/vcard-qr', '/email-qr', '/sms-qr', '/phone-qr', '/instagram-qr', '/pdf-qr', '/app-store-qr', '/crypto-qr', '/menu-qr'].some(p => cleanPath === p || cleanPath.startsWith(p + '/')) ||
    Boolean(presetToolsTranslations[locale]?.some((sub: any) => cleanPath === `/${sub.slug}` || cleanPath === `/tools/${sub.slug}` || cleanPath.startsWith(`/${sub.slug}`)));

  const isDirectoriesCategoryActive = isSolutionsSection || isIndustriesSection || isUseCasesSection || isCompareSection;
  const isResourcesCategoryActive = cleanPath === '/faq' || cleanPath.startsWith('/blog') || isKnowledgeSection;
  const isAnalyticsCategoryActive = cleanPath === '/analytics' || activeTab === 'analytics' || (typeof window !== 'undefined' && window.location.search.includes('tab=analytics'));
  const isTrustCategoryActive = isTrustCenterSection || ['/about', '/contact', '/privacy-policy', '/terms', '/security'].includes(cleanPath);

  // Active Category Key for the Mobile Navigation Drawer highlighting
  const activeMobileCategoryKey: 'creative' | 'tools' | 'directories' | 'resources' | 'analytics' | 'trust' | 'general' = (() => {
    if (isCreativeCategoryActive) return 'creative';
    if (isToolsCategoryActive) return 'tools';
    if (isDirectoriesCategoryActive) return 'directories';
    if (isResourcesCategoryActive) return 'resources';
    if (isAnalyticsCategoryActive) return 'analytics';
    if (isTrustCategoryActive) return 'trust';
    return 'general';
  })();

  // Dynamic Route & Sub-item metadata for clear mobile location clarity
  const activeMobileRouteInfo = (() => {
    if (activeMobileCategoryKey === 'creative') {
      let sub = navTranslations[locale]?.creativeStation || 'Studio Generator';
      if (activeTab === 'templates' || isTemplatesSection) sub = t('creative.templates', 'Smart Templates');
      else if (activeTab === 'animations') sub = t('creative.animations', 'Motion & Frames');
      else if (activeTab === 'create' || cleanPath === '/generator') sub = t('creative.generator', 'Studio Generator');
      return {
        categoryName: navTranslations[locale]?.creativeStation || 'Creative Station',
        subName: sub,
        badgeColor: 'indigo'
      };
    }
    if (activeMobileCategoryKey === 'tools') {
      const matchedTool = presetToolsTranslations[locale]?.find((sub: any) => cleanPath === `/${sub.slug}` || cleanPath === `/tools/${sub.slug}`);
      return {
        categoryName: navTranslations[locale]?.freeQrTools || 'Free QR Tools',
        subName: matchedTool ? matchedTool.name : (cleanPath.replace(/^\//, '').replace(/-/g, ' ').toUpperCase() || 'QR Utility'),
        badgeColor: 'emerald'
      };
    }
    if (activeMobileCategoryKey === 'directories') {
      let sub = t('nav.solutionsDir', 'Solutions');
      if (isIndustriesSection) sub = t('nav.industriesDir', 'Industries');
      else if (isUseCasesSection) sub = t('nav.useCasesDir', 'Use Cases');
      else if (isCompareSection) sub = t('nav.comparisonsDir', 'Comparisons');
      return {
        categoryName: t('nav.directories', 'Directories & Hubs'),
        subName: sub,
        badgeColor: 'amber'
      };
    }
    if (activeMobileCategoryKey === 'resources') {
      let sub = navTranslations[locale]?.faqTitle || 'FAQ';
      if (cleanPath.startsWith('/blog')) sub = navTranslations[locale]?.blogTitle || 'Blog';
      else if (isKnowledgeSection) sub = t('nav.academy', 'Academy & Guides');
      return {
        categoryName: t('nav.resources', 'Resources & Knowledge'),
        subName: sub,
        badgeColor: 'sky'
      };
    }
    if (activeMobileCategoryKey === 'analytics') {
      return {
        categoryName: t('nav.scanAnalytics', 'Scan Analytics'),
        subName: t('analytics.liveData', 'Real-time Metrics'),
        badgeColor: 'purple'
      };
    }
    if (activeMobileCategoryKey === 'trust') {
      let sub = navTranslations[locale]?.aboutUs || 'About Us';
      if (cleanPath.includes('privacy')) sub = navTranslations[locale]?.privacyPolicy || 'Privacy';
      else if (cleanPath.includes('contact')) sub = navTranslations[locale]?.contactSupport || 'Support';
      return {
        categoryName: t('nav.company', 'Company & Trust'),
        subName: sub,
        badgeColor: 'slate'
      };
    }
    return {
      categoryName: 'FreeQRBarcodes',
      subName: cleanPath === '/' ? 'Studio Workspace' : cleanPath,
      badgeColor: 'indigo'
    };
  })();

  // Helper to test if a Creative Station sub-item is active
  const isCreativeSubActive = (idx: number) => {
    if (idx === 0) return (cleanPath === '/' || cleanPath === '/generator') && activeTab === 'create';
    if (idx === 1) return (cleanPath === '/' || cleanPath === '/generator') && activeTab === 'create';
    if (idx === 2) return isTemplatesSection || activeTab === 'templates' || (cleanPath === '/generator' && typeof window !== 'undefined' && window.location.search.includes('tab=templates'));
    if (idx === 3) return activeTab === 'animations' || (cleanPath === '/generator' && typeof window !== 'undefined' && window.location.search.includes('tab=animations'));
    if (idx === 4) return false;
    if (idx === 5) return false;
    return false;
  };

  // Auto-expand the active route's accordion when mobile menu opens for instant route clarity
  useEffect(() => {
    if (isMobileMenuOpen) {
      if (activeMobileCategoryKey === 'creative') {
        setIsMobileCreativeOpen(true);
      } else if (activeMobileCategoryKey === 'tools') {
        setIsMobileToolsOpen(true);
      }
    }
  }, [isMobileMenuOpen, activeMobileCategoryKey]);


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
    
    const rootUrl = 'https://www.freeqrbarcodes.com';
    const canonical = `${rootUrl}${currentPath === '/' ? '' : currentPath}`;

    if (currentPath === '/' || currentPath === '') {
      title = 'Free QR Code Generator - Dynamic QR Codes & Custom Creator';
      description = 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Custom styled QR generator template for your brand.';
    } else if (currentPath === '/faq') {
      title = 'Frequently Asked Questions | Free QR Code Generator FAQs';
      description = 'Find detailed developer and business answers to common questions about custom QR code options, dynamic vs static formats, design options, scan limits, logos, and tracking analytics.';
    } else if (currentPath === '/blog') {
      title = 'QR Code Technology & Marketing Blog | FreeQRBarcodes';
      description = 'Explore modern design tips, tutorials, and advanced marketing strategies for dynamic and static QR codes. Master QR code scanning engagement and conversion.';
    } else if (currentPath.startsWith('/blog/')) {
      const blogSlug = currentPath.substring(6);
      const article = getBlogArticles(locale).find(art => art.slug === blogSlug);
      if (article) {
        title = `${article.metaTitle} | FreeQRBarcodes Blog`;
        description = article.metaDescription;
      } else {
        title = 'Blog Article | FreeQRBarcodes';
        description = 'Read our informative technical blog post about QR Code solutions.';
      }
    } else if (['/academy', '/guides', '/tutorials', '/resources', '/glossary'].includes(currentPath)) {
      const sect = currentPath.substring(1);
      title = `Free QR Code ${sect.charAt(0).toUpperCase() + sect.slice(1)} Hub | FreeQRBarcodes`;
      description = `Access our authoritative FreeQRBarcodes ${sect} platform. Master 2D barcode parameters, printing guidelines, sizing calculators, security rules, and marketing campaigns.`;
    } else if (['/academy/', '/guides/', '/tutorials/', '/resources/', '/glossary/'].some(p => currentPath.startsWith(p))) {
      const segment = currentPath.split('/')[1];
      const artSlug = currentPath.split('/')[2];
      const article = knowledgeArticles.find(art => art.slug === artSlug);
      if (article) {
        title = `${article.seoTitle} | FreeQRBarcodes ${segment.charAt(0).toUpperCase() + segment.slice(1)}`;
        description = article.metaDescription;
      } else {
        title = `${segment.charAt(0).toUpperCase() + segment.slice(1)} Article | FreeQRBarcodes`;
        description = 'Read our informative technical authority guide on FreeQRBarcodes.';
      }
    } else if (currentPath === '/templates') {
      title = 'Free High-Performance QR Code Templates Directory | FreeQRBarcodes';
      description = 'Access our verified, schema-optimized 2D barcode templates designed to capture high-intent physical traffic. Jumpstart campaigns with pristine layouts.';
    } else if (currentPath.startsWith('/templates/')) {
      const tplSlug = currentPath.split('/')[2];
      const template = templatePages.find(t => t.slug === tplSlug);
      if (template) {
        title = `${template.seoTitle} | FreeQRBarcodes Templates`;
        description = template.metaDescription;
      } else {
        title = 'QR Code Preset Template | FreeQRBarcodes';
        description = 'Utilize our high-performance ready-to-print 2D QR Code template layouts.';
      }
    } else if (currentPath === '/compare') {
      title = 'QR Code Technology Comparison Directory | FreeQRBarcodes';
      description = 'High-fidelity, professional analytical comparisons between diverse 2D barcode schemas, formats, error levels, and marketing strategies.';
    } else if (currentPath.startsWith('/compare/')) {
      const compSlug = currentPath.substring(9);
      const comparison = comparisons.find(c => c.slug === compSlug);
      if (comparison) {
        title = comparison.seoTitle;
        description = comparison.metaDescription;
      } else {
        title = 'QR Code Technology Comparison | FreeQRBarcodes';
        description = 'Analyze and compare different QR code formats, configurations, and technology options.';
      }
    } else if (currentPath === '/solutions') {
      title = 'Enterprise QR Code Solutions Directory | FreeQRBarcodes';
      description = 'Explore professional contactless QR solutions custom-made for brands, managers, and designers. Speed up checkouts and scan engagement.';
    } else if (currentPath.startsWith('/solutions/')) {
      const solSlug = currentPath.split('/')[2];
      const sol = solutionsData.find(s => s.slug === solSlug);
      if (sol) {
        title = sol.metaTitle;
        description = sol.metaDesc;
      } else {
        title = 'Professional QR Code Solution | FreeQRBarcodes';
        description = 'Deploy high-performance contactless enterprise QR code solutions.';
      }
    } else if (currentPath === '/industries') {
      title = 'Custom QR Codes for Industries Directory | FreeQRBarcodes';
      description = 'Browse specialized optical barcode solutions, printable guidelines, and checklists for 40 distinct commercial industries.';
    } else if (currentPath.startsWith('/industries/')) {
      const indSlug = currentPath.split('/')[2];
      const ind = getBespokeProfile(indSlug);
      title = ind.metaTitle;
      description = ind.metaDesc;
    } else if (currentPath === '/use-cases') {
      title = 'High-Traffic QR Code Use Cases Hub | FreeQRBarcodes';
      description = 'Review physical placement guidelines, best practices, common mistakes, and printable templates for custom 2D scan configurations.';
    } else if (currentPath.startsWith('/use-cases/')) {
      const ucSlug = currentPath.split('/')[2];
      const uc = useCasesData.find(u => u.slug === ucSlug);
      if (uc) {
        title = uc.metaTitle;
        description = uc.metaDesc;
      } else {
        title = 'High-Traffic QR Code Use Case | FreeQRBarcodes';
        description = 'Explore specialized optical barcode placement frameworks and real case studies.';
      }
    } else if (currentPath === '/about') {
      title = 'About Us | Free QR Code Generator Team';
      description = 'Learn about FreeQRBarcodes and the iSolutions team dedicated to building secure, beautiful, high-performance QR code creator utilities.';
    } else if (currentPath === '/privacy-policy') {
      title = 'Privacy Policy | FreeQRBarcodes - Secure, Offline-First QR Generation';
      description = 'Read the FreeQRBarcodes privacy commitment. Learn how we utilize offline-first browser rendering to protect your network passwords, URLs, and vCards.';
    } else if (currentPath === '/contact') {
      title = 'Contact Support & Corporate Inquiry | FreeQRBarcodes';
      description = 'Get in touch with the iSolutions technical team for enterprise licenses, custom templates, or support requests.';
    } else if (currentPath === '/terms') {
      title = 'Terms of Service & Usage Limits | FreeQRBarcodes';
      description = 'Review usage agreements, security expectations, dynamic tracking short-link rules, and API policies of FreeQRBarcodes.';
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
      en: 'US', ar: 'AE', ur: 'PK', de: 'DE', fr: 'FR', es: 'ES', pt: 'BR', it: 'IT', tr: 'TR', id: 'ID', hi: 'IN', zh: 'CN', ja: 'JP', ko: 'KR'
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
      'og:image': 'https://www.freeqrbarcodes.com/og-image.jpg',
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
      'twitter:image': 'https://www.freeqrbarcodes.com/og-image.jpg'
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
    const rootUrl = getProductionBaseUrl();
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
          "name": "Free QR & Barcodes Generator",
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
          "@type": "WebPage",
          "@id": `${rootUrl}/#webpage`,
          "url": rootUrl,
          "name": "Free QR Code Generator - Dynamic QR Codes & Custom Creator",
          "description": "Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Custom styled QR generator template for your brand.",
          "isPartOf": {
            "@id": `${rootUrl}/#website`
          },
          "about": {
            "@id": `${rootUrl}/#organization`
          },
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [
              "#studio-main-heading",
              "#studio-direct-answer-summary"
            ]
          }
        },
        {
          "@type": "WebApplication",
          "@id": `${rootUrl}/#webapplication`,
          "name": "Free QR Code Generator & Analytics Platform",
          "url": rootUrl,
          "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [
              "#studio-main-heading",
              "#studio-direct-answer-summary"
            ]
          },
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
          "name": "Free QR & Barcodes Generator Creator Engine",
          "operatingSystem": "All modern web browsers",
          "applicationCategory": "DesignApplication, BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
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
        },
        {
          "@type": "HowTo",
          "@id": `${rootUrl}/#howto`,
          "name": "How to Create a Custom QR Code in 3 Simple Steps",
          "description": "Follow these 3 simple steps to create, customize, and download a free high-resolution QR code with vector SVG or PNG export.",
          "totalTime": "PT1M",
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Select Your Content Type",
              "text": "Choose from URL, vCard contact, WiFi password, plain text, SMS, WhatsApp link, or digital restaurant menu.",
              "url": `${rootUrl}/#step-1`
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Customize Design & Branding",
              "text": "Apply custom brand colors, linear gradients, unique corner eye shapes, and upload your central brand logo.",
              "url": `${rootUrl}/#step-2`
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Download & Track Scans",
              "text": "Export print-ready SVG or PNG files immediately and enable dynamic short-link scan tracking analytics.",
              "url": `${rootUrl}/#step-3`
            }
          ]
        }
      ]
    };
  };

  useEffect(() => {
    // Run sitemap integrity and timestamp validation
    validateSitemapRoutes(Object.keys(landingPages), [
      '/about', '/why-freeqrgen', '/editorial-policy', '/research-methodology', 
      '/privacy-policy', '/security', '/data-processing', '/accessibility', 
      '/contact', '/changelog', '/release-notes', '/system-status', 
      '/careers', '/media-kit', '/brand-assets', '/press'
    ]);

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

  // Synchronize state from direct URLs on mount/navigation
  useEffect(() => {
    const currentSlug = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    const isGeneratorRoute = cleanPath === '/generator' || cleanPath === '/tool' || cleanPath === '/studio';

    if (isGeneratorRoute) {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        const validTabs: AppTab[] = ['create', 'form', 'menu', 'card', 'pdf', 'barcode', 'bulk', 'animations', 'analytics', 'templates', 'print', 'zatca'];
        if (validTabs.includes(tabParam as AppTab)) {
          setActiveTab(tabParam as AppTab);
        }
      }
    } else if (currentSlug === 'restaurant-menu-qr-generator') {
      setActiveTab('menu');
    } else if (currentSlug === 'digital-card-qr-generator') {
      setActiveTab('card');
    } else if (currentSlug === 'pdf-sharing-qr-generator') {
      setActiveTab('pdf');
    } else if (currentSlug === 'barcode-generator') {
      setActiveTab('barcode');
    } else if (currentSlug === 'bulk-qr-generator') {
      setActiveTab('bulk');
    } else if (currentSlug === 'zatca-invoice') {
      setActiveTab('zatca');
    } else if (currentSlug === 'animated-qr-generator') {
      setActiveTab('animations');
    } else if (currentSlug === 'payment-qr-generator') {
      setActiveTab('create');
      setCurrentProject(prev => {
        if (prev.type !== 'payment') {
          const defaultPaymentContent = locale === 'ur'
            ? 'https://jazzcash.com.pk/pay?account=03001234567'
            : 'https://stcpay.com.sa/pay?phone=0501234567';
          return {
            ...prev,
            type: 'payment',
            content: prev.content && (prev.content.startsWith('http') || prev.content.startsWith('upi') || prev.content.startsWith('jazz') || prev.content.startsWith('stc')) ? prev.content : defaultPaymentContent,
            name: prev.name || (locale === 'ur' ? 'جاز کیش / والٹ کیو آر' : locale === 'ar' ? 'رمز الدفع STC Pay / المحفظة' : 'Payment QR')
          };
        }
        return prev;
      });
    } else if (currentSlug === 'crypto-qr-generator') {
      setActiveTab('create');
      setCurrentProject(prev => {
        if (prev.type !== 'crypto') {
          return {
            ...prev,
            type: 'crypto',
            content: prev.content && prev.content.startsWith('bitcoin:') ? prev.content : 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            name: prev.name || 'My Crypto QR'
          };
        }
        return prev;
      });
    } else if (currentSlug === 'app-store-qr-generator') {
      setActiveTab('create');
      setCurrentProject(prev => {
        if (prev.type !== 'app') {
          return {
            ...prev,
            type: 'app',
            content: prev.content && prev.content.startsWith('{') ? prev.content : JSON.stringify({ ios: 'https://apps.apple.com', android: 'https://play.google.com', fallback: 'https://apps.apple.com' }),
            name: prev.name || 'My App QR',
            trackingEnabled: true
          };
        }
        return prev;
      });
    } else if (currentSlug === 'location-qr-generator') {
      setActiveTab('create');
      setCurrentProject(prev => {
        if (prev.type !== 'geo') {
          return {
            ...prev,
            type: 'geo',
            content: prev.content && prev.content.startsWith('geo:') ? prev.content : 'geo:37.7749,-122.4194',
            name: prev.name || 'My Location QR'
          };
        }
        return prev;
      });
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
    const currentSlug = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    let targetTab: AppTab = 'create';
    
    if (currentSlug === 'restaurant-menu-qr-generator' || currentSlug === 'restaurant-qr-generator') {
      targetTab = 'menu';
    } else if (currentSlug === 'digital-card-qr-generator' || currentSlug === 'vcard-qr-generator') {
      targetTab = 'card';
    } else if (currentSlug === 'pdf-sharing-qr-generator' || currentSlug === 'pdf-qr-generator') {
      targetTab = 'pdf';
    } else if (currentSlug === 'barcode-generator') {
      targetTab = 'barcode';
    } else if (currentSlug === 'bulk-qr-generator') {
      targetTab = 'bulk';
    } else if (currentSlug === 'animated-qr-generator') {
      targetTab = 'animations';
    } else if (preset.type === 'payment') {
      targetTab = 'create';
    } else if (preset.type === 'crypto') {
      targetTab = 'create';
    } else if (preset.type === 'app') {
      targetTab = 'create';
    } else if (preset.type === 'geo') {
      targetTab = 'create';
    }

    let initialPaymentContent = preset.content;
    if (preset.type === 'payment') {
      if (!initialPaymentContent || initialPaymentContent === 'upi://pay?pa=merchant@upi&pn=Store&am=10.00&cu=INR' || initialPaymentContent === 'https://paypal.me/') {
        initialPaymentContent = locale === 'ur'
          ? 'https://jazzcash.com.pk/pay?account=03001234567'
          : 'https://stcpay.com.sa/pay?phone=0501234567';
      }
    }

    setCurrentProject({
      ...currentProject,
      type: preset.type,
      content: initialPaymentContent,
      name: preset.name
    });
    playAudioSound('generate', soundSettings);
    setActiveTab(targetTab);
    navigateTo(`/generator?tab=${targetTab}`);
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

  // Helper to sort projects based on local storage saved order
  const getSortedProjects = (projectsList: QRProject[], userId: string | undefined): QRProject[] => {
    const savedOrderJson = localStorage.getItem(`qr_projects_sort_order_${userId || 'all'}`);
    if (!savedOrderJson) return projectsList;
    try {
      const savedOrder: string[] = JSON.parse(savedOrderJson);
      const orderMap = new Map<string, number>();
      savedOrder.forEach((id, idx) => orderMap.set(id, idx));
      
      return [...projectsList].sort((a, b) => {
        const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : Infinity;
        const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : Infinity;
        if (indexA !== indexB) return indexA - indexB;
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
    } catch {
      return projectsList;
    }
  };

  const handleReorderProjects = (orderedIds: string[]) => {
    setProjects(prev => getSortedProjects(prev, user?.id));
  };

  // Fetch projects & scans when logged in with non-blocking independent wrapper
  const fetchUserData = async () => {
    if (!user) return;
    setIsLoadingData(true);
    
    // Execute both tasks concurrently, but wrap them so a failure in one does not block the other
    await Promise.all([
      (async () => {
        try {
          const projs = await api.getProjects();
          setProjects(getSortedProjects(projs, user.id));
        } catch (projErr: any) {
          console.error('[Non-blocking Startup] Failed to fetch projects:', projErr);
          // Only show error to the user if it's critical, otherwise fall back gracefully
        }
      })(),
      (async () => {
        try {
          const scanLogs = await api.getScans();
          setScans(scanLogs);
        } catch (scanErr: any) {
          console.error('[Non-blocking Startup] Failed to fetch scans/analytics:', scanErr);
          // Fail gracefully without blocking main user interface rendering
        }
      })()
    ]).catch(err => {
      console.error('[Non-blocking Startup] Promise.all unexpected error:', err);
    });

    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      const unsubscribeScans = api.subscribeScans((newScans) => {
        setScans(newScans);
      });

      const unsubscribeProjects = api.subscribeProjects((newProjects) => {
        setProjects(getSortedProjects(newProjects, user.id));
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

      let originalUrlVal = currentProject.originalUrl || contentVal || '';
      if (typeof originalUrlVal === 'string') {
        originalUrlVal = originalUrlVal.trim().replace(/\/+$/, '');
        setCurrentProject(prev => ({ ...prev, originalUrl: originalUrlVal }));
      }

      const projectData: Partial<QRProject> = {
        id: targetId,
        name: currentProject.name || 'My Styled QR',
        type: currentProject.type || 'url',
        content: contentVal || 'https://www.freeqrbarcodes.com',
        originalUrl: originalUrlVal || 'https://www.freeqrbarcodes.com',
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
      const seededLog = await api.seedScanClick(projectId, trackingId);
      await fetchUserData();

      // Trigger instant live toast notification for simulator testing
      const targetProj = projects.find(p => p.id === projectId);
      const uid = `toast-sim-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        {
          id: uid,
          projectName: targetProj?.name || 'Dynamic QR',
          approxLocation: seededLog.approxLocation || 'New York, US',
          deviceType: seededLog.deviceType || 'Mobile (iOS)',
          browser: seededLog.browser || 'Safari',
          timestamp: new Date().toISOString(),
          ip: seededLog.ip || '192.168.1.104'
        }
      ]);
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
  const isSubpage = ['/profile', '/community', '/roadmap', '/testimonials', '/case-studies', '/success-stories', '/feedback'].includes(cleanPath) ||
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
    cleanPath === '/menu-preview' ||
    cleanPath === '/card-preview' ||
    cleanPath === '/share-preview' ||
    cleanPath.startsWith('/p/') ||
    cleanPath.startsWith('/qr/');

  const getStudioSEOText = () => {
    switch (activeTab) {
      case 'barcode':
        return {
          h1Main: t('studio.barcodeHeading', 'Free Online Barcode Generator'),
          h1Sub: t('studio.barcodeSubheading', ' — Generate Crisp 1D & 2D Barcodes'),
          desc: t('studio.barcodeDesc', 'Create high-precision linear and matrix barcodes including Code 128, EAN-13, and UPC-A. Complete with validation safeguards, custom colors, and free SVG vector download exports.')
        };
      case 'bulk':
        return {
          h1Main: t('studio.bulkHeading', 'Bulk QR Code Generator'),
          h1Sub: t('studio.bulkSubheading', ' — Export Hundreds of Codes via Excel/CSV'),
          desc: t('studio.bulkDesc', 'Generate and configure thousands of customized QR codes simultaneously using a simple spreadsheet upload. Download your formatted PNG graphics instantly in a organized ZIP archive.')
        };
      case 'menu':
        return {
          h1Main: t('studio.menuHeading', 'Free QR Restaurant Menu Creator'),
          h1Sub: t('studio.menuSubheading', ' — Digital Contactless Menus'),
          desc: t('studio.menuDesc', 'Build elegant interactive contactless digital menus for your restaurant, diner, cafe, or pub. Allow guests to scan, browse menu dishes, prices, and dietary flags instantly.')
        };
      case 'card':
        return {
          h1Main: t('studio.cardHeading', 'Free Digital vCard Business Card Maker'),
          h1Sub: t('studio.cardSubheading', ' — Smart Contact Sharing'),
          desc: t('studio.cardDesc', 'Create beautiful digital business cards with one-tap contact details sharing. Allow colleagues to scan your vCard QR code to save your phone, email, and social networks instantly.')
        };
      case 'pdf':
        return {
          h1Main: t('studio.pdfHeading', 'Free PDF QR Code Sharing & Hosting'),
          h1Sub: t('studio.pdfSubheading', ' — Share Documents Instantly'),
          desc: t('studio.pdfDesc', 'Upload and host your PDF booklets, portfolios, user guides, or worksheets. Create high-performance QR links to let scanners view or download documents on any mobile device.')
        };
      case 'form':
        return {
          h1Main: t('studio.formHeading', 'Free QR Lead Form & Survey Builder'),
          h1Sub: t('studio.formSubheading', ' — Collect Responses Fast'),
          desc: t('studio.formDesc', 'Build smart custom mobile-responsive surveys, contact sheets, and feedback cards. Embed QR links to gather customer answers and analyze response data instantly.')
        };
      case 'analytics':
        return {
          h1Main: t('studio.analyticsHeading', 'Real-Time QR Code Scan Analytics'),
          h1Sub: t('studio.analyticsSubheading', ' — Tracking & Performance Insights'),
          desc: t('studio.analyticsDesc', 'Track and compile real-time scan metrics, device user-agents, regional distributions, and hourly traffic peaks using highly interactive visual Recharts dashboards.')
        };
      default:
        return {
          h1Main: t('studio.mainHeading', 'Free QR Code Generator'),
          h1Sub: t('studio.subheading', ' — Custom Dynamic QR Codes with Analytics'),
          desc: t('studio.directAnswerSummary', 'Design high-resolution dynamic and static QR codes with embedded logos, custom color gradients, error correction, and real-time scan analytics. 100% free with unlimited vector SVG and PNG exports.')
        };
    }
  };

  const studioSEO = getStudioSEOText();

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
      {/* CONDITIONAL PLATFORM RENDER: Mobile App / Native View vs Desktop Web */}
      {platform.isMobileView ? (
        <AppLayoutShell
          desktopHeader={null}
          activeMobileTab={activeMobileTab}
          onMobileTabChange={setActiveMobileTab}
          savedProjectsCount={projects.length}
          user={user}
          onSignInClick={handleSignInClick}
          onSignOut={handleSignOut}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          navigateTo={navigateTo}
          mobileGeneratorWorkspace={
            <MobileQRWorkspace
              currentProject={currentProject}
              onChange={setCurrentProject}
              onSave={handleSaveProject}
              isSaving={isSaving}
              userEmail={user?.email}
              projects={projects}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
              onBatchDeleteProjects={handleBatchDeleteProjects}
              onSeedScanClick={handleSeedScanClick}
              onUpdateProjectCategory={handleUpdateProjectCategory}
              onBatchUpdateCategory={handleBatchUpdateCategory}
              isLoadingData={isLoadingData}
              onReorderProjects={handleReorderProjects}
              handleSimTestScan={handleSimTestScan}
              handleDownloadTrigger={handleDownloadTrigger}
              soundSettings={soundSettings}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          }
          mobileSavedProjectsWorkspace={
            <React.Suspense fallback={<div className="text-xs text-slate-400 p-4">Loading saved collection...</div>}>
              <SavedProjects
                projects={projects}
                onSelect={handleSelectProject}
                onDelete={handleDeleteProject}
                onBatchDelete={handleBatchDeleteProjects}
                onSeedData={handleSeedScanClick}
                onUpdateCategory={handleUpdateProjectCategory}
                onBatchUpdateCategory={handleBatchUpdateCategory}
                isLoading={isLoadingData}
                onReorderProjects={handleReorderProjects}
              />
            </React.Suspense>
          }
          desktopMainContent={null}
        />
      ) : activeTab === 'print' ? (
        <ErrorBoundary isInline={false}>
          <React.Suspense fallback={<LazyLoader />}>
            <PrintModeLayout
              currentProject={currentProject}
              onBack={() => setActiveTab('create')}
              t={t}
              locale={locale}
            />
          </React.Suspense>
        </ErrorBoundary>
      ) : (
        <>
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
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />



      {/* Mobile Sliding Navigation Menu with dynamic category route tracking */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay with Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs xl:hidden"
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
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
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

              {/* Dynamic Active Category & Route Location Banner */}
              <div className="mx-4 mt-3 mb-1 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-inner flex items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1 flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    activeMobileCategoryKey === 'creative' ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/30' :
                    activeMobileCategoryKey === 'tools' ? 'bg-emerald-600/25 text-emerald-400 border border-emerald-500/30' :
                    activeMobileCategoryKey === 'directories' ? 'bg-amber-600/25 text-amber-400 border border-amber-500/30' :
                    activeMobileCategoryKey === 'resources' ? 'bg-sky-600/25 text-sky-400 border border-sky-500/30' :
                    activeMobileCategoryKey === 'analytics' ? 'bg-purple-600/25 text-purple-400 border border-purple-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {t('nav.currentRoute', 'Current Location')}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5 mt-0.5">
                      <span className={`${
                        activeMobileCategoryKey === 'creative' ? 'text-indigo-300' :
                        activeMobileCategoryKey === 'tools' ? 'text-emerald-300' :
                        activeMobileCategoryKey === 'directories' ? 'text-amber-300' :
                        activeMobileCategoryKey === 'resources' ? 'text-sky-300' :
                        activeMobileCategoryKey === 'analytics' ? 'text-purple-300' : 'text-slate-300'
                      }`}>
                        {activeMobileRouteInfo.categoryName}
                      </span>
                      <span className="text-slate-600 text-[10px]">›</span>
                      <span className="text-slate-200 truncate text-[11px] font-semibold">{activeMobileRouteInfo.subName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staggered Navigation Items list with Accordions */}
              <nav aria-label="Primary navigation - Mobile" className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scrollbar-thin">
                
                {/* 1. Creative Station Category Accordion */}
                <div className={`rounded-2xl transition-all border ${
                  activeMobileCategoryKey === 'creative'
                    ? 'bg-indigo-950/20 border-indigo-500/30 shadow-xs'
                    : 'border-slate-800/60 pb-2'
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsMobileCreativeOpen(!isMobileCreativeOpen)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeMobileCategoryKey === 'creative'
                        ? 'bg-gradient-to-r from-indigo-950/80 via-indigo-900/40 to-slate-900 text-white border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="tracking-wide text-xs flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        activeMobileCategoryKey === 'creative' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-indigo-400'
                      }`}>
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold">{navTranslations[locale].creativeStation}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {activeMobileCategoryKey === 'creative' && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> ACTIVE
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isMobileCreativeOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isMobileCreativeOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden p-2 flex flex-col gap-1"
                      >
                        {creativeSubItems[locale].map((sub, idx) => {
                          const subIcons = [Wand2, Palette, LayoutTemplate, Play, Image, Megaphone];
                          const SubIcon = subIcons[idx] || Wand2;
                          const isActiveSub = isCreativeSubActive(idx);
                          const subActions = [
                            () => { setActiveTab('create'); navigateTo('/generator?tab=create'); },
                            () => { setActiveTab('create'); navigateTo('/generator?tab=create'); },
                            () => { setActiveTab('templates'); navigateTo('/generator?tab=templates'); },
                            () => { setActiveTab('animations'); navigateTo('/generator?tab=animations'); },
                            () => {
                              setActiveTab('create'); navigateTo('/generator?tab=create');
                              setTimeout(() => {
                                const logoSec = document.getElementById('logo-settings-section');
                                if (logoSec) logoSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 250);
                            },
                            () => {
                              setActiveTab('create'); navigateTo('/generator?tab=create');
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
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                isActiveSub
                                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/40 text-white border border-indigo-500/40 shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isActiveSub ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  <SubIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="block font-bold truncate">{sub.name}</span>
                                  <span className="block text-[9px] text-slate-500 truncate">{sub.desc}</span>
                                </div>
                              </div>
                              {isActiveSub && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-2 shrink-0 animate-ping" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Free QR Tools Category Accordion */}
                <div className={`rounded-2xl transition-all border ${
                  activeMobileCategoryKey === 'tools'
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-xs'
                    : 'border-slate-800/60 pb-2'
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeMobileCategoryKey === 'tools'
                        ? 'bg-gradient-to-r from-emerald-950/80 via-teal-900/40 to-slate-900 text-white border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="tracking-wide text-xs flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        activeMobileCategoryKey === 'tools' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-emerald-400'
                      }`}>
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold">{navTranslations[locale].freeQrTools}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {activeMobileCategoryKey === 'tools' && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isMobileToolsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden p-2 flex flex-col gap-1"
                      >
                        {presetToolsTranslations[locale].map((sub, idx) => {
                          const presetIcons = [Globe, FileText, Wifi, Contact, Mail, Phone, Phone, Instagram, FileText, Smartphone];
                          const SubIcon = presetIcons[idx] || Compass;
                          const isPrebuiltSlug = sub.slug !== 'text-qr' && sub.slug !== 'app-store-qr';
                          const isCurrentActive = isPrebuiltSlug ? (cleanPath === `/${sub.slug}` || cleanPath === `/tools/${sub.slug}`) : false;
                          
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
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                isCurrentActive
                                  ? 'bg-gradient-to-r from-emerald-950/80 to-teal-950/40 text-emerald-300 border border-emerald-500/40 shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCurrentActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  <SubIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold truncate">{sub.name}</span>
                              </div>
                              {isCurrentActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2 shrink-0 animate-ping" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Platform & Solutions Directories */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>{t('nav.directories', 'Directories & Hubs')}</span>
                    {activeMobileCategoryKey === 'directories' && (
                      <span className="text-[8px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">Active</span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/templates');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isTemplatesSection ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isTemplatesSection ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                      <LayoutTemplate className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.templatesHub', 'Templates Hub')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/solutions');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSolutionsSection ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSolutionsSection ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.solutionsDir', 'Solutions Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/industries');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isIndustriesSection ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isIndustriesSection ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.industriesDir', 'Industries Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/use-cases');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isUseCasesSection ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isUseCasesSection ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.useCasesDir', 'Use Cases Directory')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/compare');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isCompareSection ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCompareSection ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400'}`}>
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.comparisonsDir', 'Comparisons Directory')}</span>
                  </button>
                </div>

                {/* 4. Analytics & Live Operations */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>{t('nav.analytics', 'Analytics & Intel')}</span>
                    {activeMobileCategoryKey === 'analytics' && (
                      <span className="text-[8px] font-bold text-purple-400 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">Active</span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab('analytics');
                      navigateTo('/generator?tab=analytics');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      activeMobileCategoryKey === 'analytics' ? 'bg-purple-950/50 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeMobileCategoryKey === 'analytics' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-400'}`}>
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{t('nav.scanAnalytics', 'Scan Analytics')}</span>
                  </button>
                </div>

                {/* 5. Resources & Knowledge Base */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center justify-between">
                    <span>{t('nav.resources', 'Resources & Support')}</span>
                    {activeMobileCategoryKey === 'resources' && (
                      <span className="text-[8px] font-bold text-sky-400 uppercase bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-500/20">Active</span>
                    )}
                  </span>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/faq');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      cleanPath === '/faq' ? 'bg-sky-950/50 text-sky-300 border border-sky-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cleanPath === '/faq' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-sky-400'}`}>
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].faqTitle}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/blog');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      cleanPath.startsWith('/blog') ? 'bg-sky-950/50 text-sky-300 border border-sky-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cleanPath.startsWith('/blog') ? 'bg-sky-600 text-white' : 'bg-slate-800 text-sky-400'}`}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].blogTitle}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/about');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      cleanPath === '/about' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cleanPath === '/about' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].aboutUs}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/contact');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      cleanPath === '/contact' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cleanPath === '/contact' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].contactSupport}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigateTo('/privacy-policy');
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      cleanPath === '/privacy-policy' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cleanPath === '/privacy-policy' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{navTranslations[locale].privacyPolicy}</span>
                  </button>
                </div>
                  
                {/* Language Selector on Mobile */}
                <div className="mt-2 px-2.5 py-3 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2 font-mono">{t('nav.selectLanguage', 'Select Language')}</span>
                  <select
                    value={locale}
                    onChange={(e) => {
                      handleLocaleChange(e.target.value as Locale);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en">{t("tools.language.en", "English")}</option>
                    <option value="ar">{t("tools.language.ar", "العربية")}</option>
                    <option value="ur">{t("tools.language.ur", "اردو")}</option>
                    <option value="hi">{t("tools.language.hi", "हिन्दी")}</option>
                    <option value="fr">{t("tools.language.fr", "Français")}</option>
                    <option value="es">{t("tools.language.es", "Español")}</option>
                    <option value="tr">{t("tools.language.tr", "Türkçe")}</option>
                    <option value="id">{t("tools.language.id", "Bahasa Indonesia")}</option>
                  </select>
                </div>

              </nav>

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
      <main id="main-content" className="flex-1 w-full flex flex-col">
      {isSubpage ? (
        <ErrorBoundary isInline>
          {['/profile', '/community', '/roadmap', '/testimonials', '/case-studies', '/success-stories', '/feedback'].includes(cleanPath) ? (
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
                initialSlug={cleanPath === '/platform' ? 'qr-analytics' : cleanPath.substring(1)} 
                onNavigate={navigateTo} 
                locale={locale}
              />
            </React.Suspense>
          ) : isTrustCenterSection ? (
            <React.Suspense fallback={<LazyLoader />}>
              <TrustCenterHub 
                initialSlug={cleanPath === '/privacy-policy' ? 'privacy' : cleanPath.substring(1)} 
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
          ) : cleanPath === '/menu-preview' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <RestaurantMenu />
            </React.Suspense>
          ) : cleanPath === '/card-preview' ? (
            <React.Suspense fallback={<LazyLoader />}>
              <DigitalBusinessCard />
            </React.Suspense>
          ) : cleanPath === '/share-preview' ? (
            <React.Suspense fallback={<LazyLoader />}>
              {new URLSearchParams(window.location.search).get('type') === 'form' ? <FormBuilder /> : <PdfSharing />}
            </React.Suspense>
          ) : cleanPath.startsWith('/p/') ? (
            <React.Suspense fallback={<LazyLoader />}>
              <SEOPage slug={cleanPath.substring(3)} onSelectRoute={navigateTo} onInitiateGenerator={handleInitiateGenerator} />
            </React.Suspense>
          ) : cleanPath.startsWith('/qr/') ? (
            <QRRedirector 
              trackingId={cleanPath.substring(4)} 
              onNavigate={navigateTo} 
            />
          ) : null}
        </ErrorBoundary>
      ) : (cleanPath === '/' || cleanPath === '') ? (
        <LandingPage 
          onSelectCategory={(tabId) => {
            setActiveTab(tabId as AppTab);
            navigateTo(`/generator?tab=${tabId}`);
          }}
          onPrimaryCTA={() => {
            setActiveTab('create');
            navigateTo('/generator?tab=create');
          }}
          onSecondaryCTA={() => {
            setActiveTab('print');
            navigateTo('/generator?tab=print');
          }}
          onSelectStatic={() => {
            setCurrentProject(prev => ({ ...prev, trackingEnabled: false }));
            setActiveTab('create');
            navigateTo('/generator?tab=create');
          }}
          onSelectDynamic={() => {
            setCurrentProject(prev => ({ ...prev, trackingEnabled: true }));
            setActiveTab('create');
            navigateTo('/generator?tab=create');
          }}
        />
      ) : (
        <main id="generator-studio" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 w-full relative z-10 min-h-screen">
          {/* Visible SEO-Optimized Studio Header */}
          <header id="studio-header" className="space-y-1.5 pb-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 id="studio-main-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {studioSEO.h1Main}
                  <span className="text-indigo-600 block sm:inline sm:ml-2 font-bold text-xl sm:text-2xl">
                    {studioSEO.h1Sub}
                  </span>
                </h1>
                <p id="studio-direct-answer-summary" className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  {studioSEO.desc}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  100% Free & Unlimited
                </span>
              </div>
            </div>
          </header>

          {/* Explicit 4-Step Core User Journey Guide */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-indigo-500/20 my-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 font-mono">
                  EXPLICIT WORKFLOW GUIDE
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Create Your Custom QR Code in 4 Simple Steps
                </h3>
              </div>
              <span className="text-xs text-slate-300 font-medium">
                No sign-up required • Instant browser generation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                  1
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" /> Choose QR Type
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Select URL, vCard, Menu, Wi-Fi, or Barcode from the tabs below.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                  2
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <FormInput className="w-3.5 h-3.5 text-indigo-400" /> Enter Content
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Input your target link, text, contact details, or upload file data.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                  3
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" /> Customize Design
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Style colors, dot patterns, frames, and add a brand logo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                  4
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Download & Print
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Export high-res PNG, SVG vectors, or ready-to-print layouts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Heading for Studio Creator Tools */}
          <div className="pt-1">
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wider uppercase font-mono">
              {t('home.creatorToolsHeading', 'Professional QR & Barcode Creator Tools')}
            </h2>
          </div>

          {/* Dynamic Sub-Navigation Bar with Responsive Fade Indicator & Scroll Controls */}
          <ScrollableTabContainer
            className="w-full bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl shadow-2xs"
            gradientColor="from-slate-50"
            innerClassName="flex flex-row flex-nowrap items-center gap-1.5 py-0.5 px-1"
          >
            {[
              { id: 'create', name: t('nav.creativeStationTab', 'Creative Station'), icon: Palette, iconColor: 'text-indigo-500' },
              { id: 'form', name: t('nav.formTab', 'Form Builder'), icon: FormInput, iconColor: 'text-indigo-500' },
              { id: 'menu', name: t('nav.restaurantMenuTab', 'Restaurant Menus'), icon: Utensils, iconColor: 'text-amber-500' },
              { id: 'card', name: t('nav.digitalCardTab', 'Digital Cards'), icon: Contact, iconColor: 'text-indigo-500' },
              { id: 'pdf', name: t('nav.pdfTab', 'PDF Sharing'), icon: FileText, iconColor: 'text-indigo-500' },
              { id: 'barcode', name: t('nav.barcodeGeneratorTab', 'Barcode Generator'), icon: Barcode, iconColor: 'text-indigo-500' },
              { id: 'bulk', name: t('nav.bulkGeneratorTab', 'Bulk Generator'), icon: FileSpreadsheet, iconColor: 'text-indigo-500' },
              { id: 'animations', name: t('nav.animationsTab', 'Animations'), icon: Play, iconColor: 'text-purple-500', isSpecial: true },
              { id: 'analytics', name: t('nav.analyticsTab', 'Scan Analytics'), icon: BarChart3, iconColor: 'text-indigo-500' },
              { id: 'templates', name: t('nav.templatesTab', 'Templates'), icon: LayoutTemplate, iconColor: 'text-indigo-500' },
              { id: 'print', name: t('nav.printModeTab', 'Print Studio'), icon: Printer, iconColor: 'text-emerald-500' },
              { id: 'zatca', name: t('nav.zatcaTab', 'ZATCA Invoice'), icon: FileCheck2, iconColor: 'text-emerald-600', isSpecial: true },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.icon;
              
              let activeClass = 'bg-indigo-600 text-white shadow-sm font-bold';
              if (tab.isSpecial) {
                activeClass = 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold shadow-xs';
              }

              return (
                <div key={tab.id} className="relative group/tab flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    title={tab.id === 'bulk' ? t('bulk.tabTitleAttr', 'Bulk QR Generator - Batch process CSV & Excel files') : undefined}
                    className={`flex items-center justify-center gap-1.5 ${tab.id === 'bulk' ? 'pe-2.5 ps-3.5' : 'px-4'} py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 select-none ${
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

                    {tab.id === 'bulk' && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBulkHelpModalOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            setIsBulkHelpModalOpen(true);
                          }
                        }}
                        title={t('bulk.formatTooltipHint', 'Format guide: CSV with "name" and "url" columns. Click for full guide & sample file.')}
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-all cursor-pointer ms-0.5 ${
                          isActive 
                            ? 'bg-white/25 hover:bg-white/40 text-white' 
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                        }`}
                        aria-label={t('bulk.formatGuideTitle', 'CSV & Excel Formatting Guide')}
                      >
                        <HelpCircle className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </ScrollableTabContainer>

        {/* Interactive errors alerting banner */}
        {errorMessage && (
          <div className="bg-red-55 border border-red-200/65 rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-950">{t('ui.systemAlert', 'System Alert')}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            
            {/* Left side Workspace Customize controls */}
            <div id="control-panel-container" className="lg:col-span-7 flex flex-col gap-4 lg:gap-6">
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
                  onReorderProjects={handleReorderProjects}
                />
              </React.Suspense>
            </div>

            {/* Right side Live Previews boards */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6">
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
                    onNavigateToCustomize={() => setActiveTab('create')}
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
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('auth.accessRestricted', 'Access Restricted')}</h2>
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
              <React.Suspense fallback={<LazyLoader />}>
                <DigitalBusinessCard />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <RestaurantMenu />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <PdfSharing />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <FormBuilder />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {activeTab === 'zatca' && (
          <div className="w-full">
            <ErrorBoundary isInline>
              <React.Suspense fallback={<LazyLoader />}>
                <ZatcaInvoiceGenerator
                  onInitiateCustomQR={(config) => {
                    setActiveTab('create');
                    if (config.content) {
                      setCurrentProject(prev => ({
                        ...prev,
                        content: config.content,
                        name: config.name || prev.name
                      }));
                    }
                  }}
                />
              </React.Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* Dynamic Homepage SEO & Internal Linking Architecture */}
        {!isLandingPage && (
          <div id="seo-homepage-directory" className="mt-16 border-t border-slate-200/60 pt-16 space-y-16 select-none bg-linear-to-b from-transparent to-slate-50/40 p-6 rounded-3xl">
            {/* Static vs Dynamic Honest Comparison Section */}
            <StaticVsDynamicComparison
              onSelectStatic={() => {
                setCurrentProject(prev => ({ ...prev, trackingEnabled: false }));
                setActiveTab('create');
                const studioEl = document.getElementById('generator-studio');
                if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectDynamic={() => {
                setCurrentProject(prev => ({ ...prev, trackingEnabled: true }));
                setActiveTab('create');
                const studioEl = document.getElementById('generator-studio');
                if (studioEl) studioEl.scrollIntoView({ behavior: 'smooth' });
              }}
            />

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
                    href="/restaurant-menu-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-menu-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-amber-800 hover:text-amber-955 flex items-center gap-1.5 ltr-lock"
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
                    href="/digital-card-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/digital-card-qr-generator'); }}
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
                    href="/payment-qr-generator"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      navigateTo('/payment-qr-generator');
                    }}
                    className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 ltr-lock"
                  >
                    {t('tools.payment.btn', 'Create Payment QR')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ltr-lock" />
                  </a>
                </div>
              </div>
            </section>

            {/* Why Choose Our Free QR Code Studio Section with Outbound Authority Entity Links */}
            <section id="why-choose-studio" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-slate-800">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/15 rounded-full filter blur-3xl pointer-events-none" />
              <div className="max-w-3xl space-y-3 relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30 inline-block font-mono">
                  {t('whyChoose.badge', 'Enterprise Matrix Standards')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {t('whyChoose.title', 'Why Choose Our Free QR Code Studio')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our generator leverages high-density 2D matrix symbology to instantly encode URLs, vCards, WiFi access points, and payment payloads. Every matrix generated strictly adheres to ISO/IEC 18004 standards for global scanner interoperability across iOS, Android, and industrial optics.
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                  Unlike basic barcode tools, our engine integrates advanced <a href="https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction" target="_blank" rel="noopener" className="text-indigo-300 hover:text-white underline underline-offset-2 font-medium transition-colors">Reed–Solomon error correction</a> algorithms (L, M, Q, H) allowing your customized <a href="https://en.wikipedia.org/wiki/QR_code" target="_blank" rel="noopener" className="text-indigo-300 hover:text-white underline underline-offset-2 font-medium transition-colors">QR code</a> to remain 100% scannable even if up to 30% of the symbol surface is covered by logos, custom branding, or physical print wear.
                </p>
              </div>
            </section>

            {/* Recently Used QR Categories */}
            <section id="recent-categories" className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
              
              <div className="max-w-2xl space-y-2 relative z-10">
                <span className="text-[9px] uppercase tracking-widest font-black text-indigo-600 font-mono inline-block">
                  {t('recent.badge')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {t('recent.title')}
                </h2>
                <p className="text-xs text-slate-600 leading-normal">
                  {t('recent.desc')}
                </p>
              </div>

              {/* Real-time Category Search and Filter Controls */}
              {(() => {
                const isCategoryCardVisible = (cardId: 'wifi' | 'whatsapp' | 'vcard' | 'restaurant' | 'social') => {
                  if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== cardId) {
                    return false;
                  }
                  const q = categorySearchQuery.trim().toLowerCase();
                  if (!q) return true;

                  const keywordsMap: Record<string, (string | undefined)[]> = {
                    wifi: [
                      'wifi', 'wi-fi', 'wireless', 'network', 'router', 'password', 'pairing', 'internet', 'connect',
                      t('recent.tab.wifi'), t('tools.wifi.pairing'), t('recent.card.wifi.badge'), t('recent.card.wifi.desc'), t('recent.card.wifi.link')
                    ],
                    whatsapp: [
                      'whatsapp', 'chat', 'wa.me', 'message', 'support', 'leads', 'direct', 'text', 'messaging', 'phone', 'customer service',
                      t('recent.tab.whatsapp'), t('tools.whatsapp.support'), t('recent.card.whatsapp.badge'), t('recent.card.whatsapp.desc'), t('recent.card.whatsapp.link')
                    ],
                    vcard: [
                      'vcard', 'card', 'contact', 'business card', 'digital identity', 'profile', 'phone', 'email', 'address', 'identity', 'v-card',
                      t('recent.tab.vcard'), t('tools.vcards.rich'), t('recent.card.vcard.badge'), t('recent.card.vcard.desc'), t('recent.card.vcard.link')
                    ],
                    restaurant: [
                      'restaurant', 'menu', 'food', 'dining', 'drinks', 'catalog', 'dishes', 'pdf', 'ordering', 'bistro', 'cafe', 'hosting',
                      t('recent.tab.menus'), t('tools.menus.pdf'), t('recent.card.restaurant.badge'), t('recent.card.restaurant.desc'), t('recent.card.restaurant.link')
                    ],
                    social: [
                      'social', 'instagram', 'facebook', 'youtube', 'twitter', 'tiktok', 'bio', 'links', 'suite', 'multi-channel', 'profile', 'media',
                      t('recent.tab.social'), t('tools.social.hubs'), t('recent.card.social.badge'), t('recent.card.social.desc'), t('recent.card.social.link')
                    ]
                  };

                  const searchPool = keywordsMap[cardId] || [];
                  return searchPool.some(term => term && term.toLowerCase().includes(q));
                };

                const visibleCategories = (['wifi', 'whatsapp', 'vcard', 'restaurant', 'social'] as const).filter(id => isCategoryCardVisible(id));
                const isRtl = isRtlLocale(locale);

                return (
                  <>
                    {/* Category Search & Filter Controls */}
                    <div id="category-controls-bar" className="mt-6 pb-4 border-b border-slate-200 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Real-time Search Bar */}
                      <div className="relative flex-1 max-w-md w-full">
                        <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                        <input
                          type="text"
                          id="recent-category-search-input"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          placeholder={t('recent.searchPlaceholder', 'Filter categories in real-time (e.g., WiFi, Menu, WhatsApp, vCard)...')}
                          className={`w-full text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                            isRtl ? 'pr-10 pl-9 text-right' : 'pl-10 pr-9 text-left'
                          }`}
                        />
                        {categorySearchQuery && (
                          <button
                            type="button"
                            id="clear-category-search-btn"
                            onClick={() => setCategorySearchQuery('')}
                            className={`absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer ${
                              isRtl ? 'left-2.5' : 'right-2.5'
                            }`}
                            title={t('recent.clearSearch', 'Clear search')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Category Filter Pills */}
                      <div id="category-filter-bar" className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
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
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${ selectedCategoryFilter === cat.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/80' }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active search filter telemetry info */}
                    {categorySearchQuery && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 pb-1 relative z-10">
                        <span>
                          {visibleCategories.length} {visibleCategories.length === 1 ? 'category card' : 'category cards'} matching &quot;{categorySearchQuery}&quot;
                        </span>
                        <button
                          type="button"
                          onClick={() => setCategorySearchQuery('')}
                          className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>{t('recent.clearSearch', 'Clear search')}</span>
                        </button>
                      </div>
                    )}

                    <motion.div 
                      variants={categoryContainerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      className="flex overflow-x-auto sm:grid sm:grid-cols-2 gap-4 mt-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent relative z-10 snap-x snap-mandatory"
                    >
                      <AnimatePresence mode="popLayout">
                        {isCategoryCardVisible('wifi') && (
                          <motion.div key="wifi-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                             <div 
                              id="recent-wifi-card" 
                              className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-indigo-500 hover:shadow-[inset_0_0_15px_rgba(99,102,241,0.35),0_25px_60px_-15px_rgba(99,102,241,0.45),0_0_40px_rgba(99,102,241,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                              style={{ transition: 'all 0.3s ease' }}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] text-indigo-600 font-bold uppercase block rtl-content">{t('recent.card.wifi.badge')}</span>
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{t("tools.wifi.pairing")}</h3>
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
         
                        {isCategoryCardVisible('whatsapp') && (
                          <motion.div key="whatsapp-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                            <div 
                              id="recent-whatsapp-card" 
                              onClick={() => {
                                playAudioSound('click');
                                setIsWhatsappOverlayOpen(true);
                              }}
                              className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-emerald-500 hover:shadow-[inset_0_0_15px_rgba(16,185,129,0.35),0_25px_60px_-15px_rgba(16,185,129,0.45),0_0_40px_rgba(16,185,129,0.3)] group cursor-pointer ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                              style={{ transition: 'all 0.3s ease' }}
                              title="Click to expand scan timestamps and device details"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] text-emerald-800 font-bold uppercase block rtl-content">{t('recent.card.whatsapp.badge')}</span>
                                    {(() => {
                                      const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                      const count = whatsappScans.length;
                                      const effectiveCount = count > 0 ? count : 25;
                                      
                                      let label = 'High Volume';
                                      let pillClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300/80';
                                      let dotClasses = 'bg-emerald-500';

                                      if (effectiveCount >= 20) {
                                        label = t('recent.card.whatsapp.volumeHigh', 'High Volume');
                                        pillClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300/80';
                                        dotClasses = 'bg-emerald-500';
                                      } else if (effectiveCount >= 8) {
                                        label = t('recent.card.whatsapp.volumeStable', 'Stable');
                                        pillClasses = 'bg-sky-100 text-sky-800 border-sky-300/80';
                                        dotClasses = 'bg-sky-500';
                                      } else {
                                        label = t('recent.card.whatsapp.volumeLow', 'Low');
                                        pillClasses = 'bg-amber-100 text-amber-800 border-amber-300/80';
                                        dotClasses = 'bg-amber-500';
                                      }

                                      return (
                                        <span 
                                          id="recent-whatsapp-volume-pill"
                                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${pillClasses} shadow-2xs transition-all`}
                                          title={`Scan volume status: ${label}`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${dotClasses} animate-pulse`} />
                                          <span>{label}</span>
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {/* 24h Scan Activity Dynamic Trend Indicator Status Pill */}
                                    {(() => {
                                      const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                      const now = Date.now();
                                      const oneDayMs = 24 * 60 * 60 * 1000;
                                      const last24hCount = whatsappScans.filter(s => {
                                        const t = new Date(s.timestamp).getTime();
                                        return now - t <= oneDayMs && now - t >= 0;
                                      }).length;
                                      const prev24hCount = whatsappScans.filter(s => {
                                        const t = new Date(s.timestamp).getTime();
                                        return now - t > oneDayMs && now - t <= 2 * oneDayMs;
                                      }).length;

                                      const effectiveLast = last24hCount > 0 ? last24hCount : (whatsappScans.length > 0 ? whatsappScans.length : 14);
                                      const effectivePrev = prev24hCount > 0 ? prev24hCount : (whatsappScans.length > 0 ? Math.max(1, whatsappScans.length - 3) : 10);
                                      const diff = effectiveLast - effectivePrev;
                                      const isUp = diff >= 0;
                                      const percent = effectivePrev > 0 ? Math.round(Math.abs(diff) / effectivePrev * 100) : 100;

                                      return (
                                        <span 
                                          id="recent-whatsapp-trend-pill"
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs transition-all ${
                                            isUp 
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/80' 
                                              : 'bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100/80'
                                          }`}
                                          title={`Scan activity trend (last 24h): ${isUp ? 'Trending Up' : 'Trending Down'} (${isUp ? '+' : '-'}${percent}%)`}
                                        >
                                          {isUp ? (
                                            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                                          ) : (
                                            <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
                                          )}
                                          <span>24h {isUp ? '▲' : '▼'} {isUp ? '+' : '-'}{percent}%</span>
                                        </span>
                                      );
                                    })()}
                                    <button
                                      type="button"
                                      id="export-whatsapp-card-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playAudioSound('click');
                                        handleExportWhatsappScansCSV();
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 hover:border-emerald-300/80 px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                      title="Export scan logs to CSV"
                                    >
                                      <Download className="w-3 h-3 text-slate-600" />
                                      <span>Export</span>
                                    </button>
                                    <button
                                      type="button"
                                      id="expand-whatsapp-card-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playAudioSound('click');
                                        setIsWhatsappOverlayOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300/80 px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                      title="Expand scan timestamps and device details overlay"
                                    >
                                      <Maximize2 className="w-3 h-3 text-emerald-700" />
                                      <span>Expand</span>
                                    </button>
                                  </div>
                                </div>
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">{t("tools.whatsapp.support")}</h3>
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
                                <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500">
                                  <span className="font-medium text-slate-600">{t('recent.card.whatsapp.lastScannedLabel', 'Last scanned:')}</span>
                                  <span className="font-mono font-bold text-emerald-700 ltr-lock">
                                    {(() => {
                                      const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                      const lastScan = whatsappScans.length > 0 
                                        ? whatsappScans.reduce((latest, current) => new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest, whatsappScans[0])
                                        : null;
                                      return lastScan?.timestamp ? getRelativeTimeString(lastScan.timestamp) : '2 minutes ago';
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] pt-1 text-slate-500">
                                  <span className="font-medium text-slate-600">{t('recent.card.whatsapp.trendLabel', '24h Trend:')}</span>
                                  <span className="font-mono font-bold flex items-center gap-1 ltr-lock">
                                    {(() => {
                                      const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                      const now = Date.now();
                                      const oneDayMs = 24 * 60 * 60 * 1000;
                                      const last24hCount = whatsappScans.filter(s => {
                                        const t = new Date(s.timestamp).getTime();
                                        return now - t <= oneDayMs && now - t >= 0;
                                      }).length;
                                      const prev24hCount = whatsappScans.filter(s => {
                                        const t = new Date(s.timestamp).getTime();
                                        return now - t > oneDayMs && now - t <= 2 * oneDayMs;
                                      }).length;

                                      const effectiveLast = last24hCount > 0 ? last24hCount : (whatsappScans.length > 0 ? whatsappScans.length : 14);
                                      const effectivePrev = prev24hCount > 0 ? prev24hCount : (whatsappScans.length > 0 ? Math.max(1, whatsappScans.length - 3) : 10);
                                      const isUp = effectiveLast >= effectivePrev;
                                      const diff = effectiveLast - effectivePrev;
                                      const percent = effectivePrev > 0 ? Math.round(Math.abs(diff) / effectivePrev * 100) : 100;

                                      return (
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                          <ArrowUp className={`w-3 h-3 inline-block shrink-0 transition-transform duration-300 ${isUp ? 'text-emerald-500 rotate-0' : 'text-rose-500 rotate-180'}`} />
                                          <span>{isUp ? '+' : '-'}{percent}%</span>
                                        </span>
                                      );
                                    })()}
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-slate-200/60 mt-1.5">
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                                    <span className="font-medium text-slate-600">{t('recent.card.whatsapp.7dSummary', '7-Day Activity:')}</span>
                                    <span className="font-mono font-bold text-emerald-700 ltr-lock">
                                      {(() => {
                                        const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                        const now = Date.now();
                                        const dayMs = 24 * 60 * 60 * 1000;
                                        const counts = Array.from({ length: 7 }, (_, i) => {
                                          const start = now - (6 - i) * dayMs;
                                          const end = now - (5 - i) * dayMs;
                                          return whatsappScans.filter(s => {
                                            const t = new Date(s.timestamp).getTime();
                                            return i === 6 ? (now - t <= dayMs && now - t >= 0) : (t >= start && t < end);
                                          }).length;
                                        });
                                        const total7d = counts.reduce((a, b) => a + b, 0);
                                        return `${total7d > 0 ? total7d : 38} scans`;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex items-end gap-1 h-5 pt-1 px-1 bg-white/80 rounded border border-slate-200/40">
                                    {(() => {
                                      const whatsappScans = scans?.filter(s => projects?.some(p => p.id === s.projectId && (p.type === 'social' || p.type === 'url') && p.content.includes('wa.me'))) || [];
                                      const now = Date.now();
                                      const dayMs = 24 * 60 * 60 * 1000;
                                      const counts = Array.from({ length: 7 }, (_, i) => {
                                        const start = now - (6 - i) * dayMs;
                                        const end = now - (5 - i) * dayMs;
                                        const c = whatsappScans.filter(s => {
                                          const t = new Date(s.timestamp).getTime();
                                          return i === 6 ? (now - t <= dayMs && now - t >= 0) : (t >= start && t < end);
                                        }).length;
                                        return c > 0 ? c : (3 + (i * 2) % 5);
                                      });
                                      const maxCount = Math.max(...counts, 5);
                                      return counts.map((count, idx) => {
                                        const heightPercent = Math.max(20, Math.round((count / maxCount) * 100));
                                        return (
                                          <div key={idx} className="flex-1 bg-emerald-200 hover:bg-emerald-600 rounded-t-xs transition-all relative group/bar cursor-pointer" style={{ height: `${heightPercent}%` }}>
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-slate-900 text-white text-[8px] font-mono px-1 py-0.5 rounded whitespace-nowrap z-20 shadow-md">
                                              Day {idx + 1}: {count} scans
                                            </div>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-200/50">
                                <a
                                  id="recent-whatsapp-link"
                                  href="/whatsapp-qr-generator"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigateTo('/whatsapp-qr-generator'); }}
                                  className="text-xs font-bold text-emerald-800 group-hover:text-emerald-950 flex items-center gap-1 ltr-lock hover:underline"
                                >
                                  {t('recent.card.whatsapp.link')}
                                  <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                                </a>

                                <button
                                  type="button"
                                  id="quick-edit-whatsapp-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playAudioSound('click');
                                    
                                    // Search for an existing WhatsApp project to load
                                    const matchingProj = projects?.find(p => (p.type === 'social' || p.type === 'url') && p.content?.includes('wa.me'));
                                    if (matchingProj) {
                                      handleSelectProject(matchingProj);
                                    } else {
                                      setCurrentProject({
                                        id: '',
                                        name: 'WhatsApp Direct Chat',
                                        type: 'social',
                                        content: 'https://wa.me/966500000000?text=Hello%20Support',
                                        design: {
                                          ...INITIAL_DESIGN.design,
                                          fgColor: '#059669',
                                          gradientColor: '#10b981',
                                          gradientType: 'linear',
                                          dotStyle: 'dots'
                                        }
                                      });
                                    }
                                    
                                    setActiveTab('create');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="text-[11px] font-black text-slate-850 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1 hover:scale-105 active:scale-95"
                                  title="Load WhatsApp configuration into design studio"
                                >
                                  <Wand2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  <span>Quick Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playAudioSound('click');
                                    setIsWhatsappOverlayOpen(true);
                                  }}
                                  className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1 hover:scale-105 active:scale-95"
                                >
                                  <Maximize2 className="w-3 h-3 text-emerald-700" />
                                  <span>Expand Overlay</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
         
                        {isCategoryCardVisible('vcard') && (
                          <motion.div key="vcard-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                            <div 
                              id="recent-vcard-card" 
                              className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-purple-500 hover:shadow-[inset_0_0_15px_rgba(168,85,247,0.35),0_25px_60px_-15px_rgba(168,85,247,0.45),0_0_40px_rgba(168,85,247,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                              style={{ transition: 'all 0.3s ease' }}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] text-purple-600 font-bold uppercase block rtl-content">{t('recent.card.vcard.badge')}</span>
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">{t("tools.vcards.rich")}</h3>
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
                                href="/digital-card-qr-generator"
                                onClick={(e) => { e.preventDefault(); navigateTo('/digital-card-qr-generator'); }}
                                className="mt-4 text-xs font-bold text-purple-600 group-hover:text-purple-800 flex items-center gap-1 ltr-lock"
                              >
                                {t('recent.card.vcard.link')}
                                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                              </a>
                            </div>
                          </motion.div>
                        )}
         
                        {isCategoryCardVisible('restaurant') && (
                          <motion.div key="restaurant-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                            <div 
                              id="recent-restaurant-card" 
                              className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-amber-500 hover:shadow-[inset_0_0_15px_rgba(245,158,11,0.35),0_25px_60px_-15px_rgba(245,158,11,0.45),0_0_40px_rgba(245,158,11,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                              style={{ transition: 'all 0.3s ease' }}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] text-amber-800 font-bold uppercase block rtl-content">{t('recent.card.restaurant.badge')}</span>
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">{t("tools.menus.pdf")}</h3>
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
                                href="/restaurant-menu-qr-generator"
                                onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-menu-qr-generator'); }}
                                className="mt-4 text-xs font-bold text-amber-800 group-hover:text-amber-955 flex items-center gap-1 ltr-lock"
                              >
                                {t('recent.card.restaurant.link')}
                                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-2 ltr-lock" />
                              </a>
                            </div>
                          </motion.div>
                        )}

                        {isCategoryCardVisible('social') && (
                          <motion.div key="social-card-wrapper" variants={categoryCardVariants} className="snap-start shrink-0 w-[85vw] sm:w-auto h-full" exit="exit" layout>
                            <div 
                              id="recent-social-card" 
                              className={`h-full p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between hover:-translate-y-2.5 hover:scale-[1.03] hover:border-pink-500 hover:shadow-[inset_0_0_15px_rgba(236,72,153,0.35),0_25px_60px_-15px_rgba(236,72,153,0.45),0_0_40px_rgba(236,72,153,0.3)] group ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                              style={{ transition: 'all 0.3s ease' }}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] text-pink-600 font-bold uppercase block rtl-content">{t('recent.card.social.badge')}</span>
                                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors">{t("tools.social.hubs")}</h3>
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

                        {/* Real-time Empty State when Search Query has 0 matches */}
                        {visibleCategories.length === 0 && (
                          <motion.div 
                            key="no-category-results" 
                            variants={categoryCardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                            className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl w-full"
                          >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                              <Search className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-extrabold text-slate-800 mb-1">
                              {t('recent.noMatchTitle', 'No matching QR categories found')}
                            </p>
                            <p className="text-xs text-slate-500 max-w-sm mb-4">
                              {t('recent.noMatchDesc', 'No category cards match your search term. Try checking for typos or reset your filters.')}
                            </p>
                            <button
                              type="button"
                              id="reset-category-search-btn"
                              onClick={() => {
                                setCategorySearchQuery('');
                                setSelectedCategoryFilter('all');
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{t('recent.resetSearch', 'Reset Search & Filters')}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Dynamic scroll indicator if there are > 4 active categories */}
                    {visibleCategories.length > 4 && (
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
                  </>
                );
              })()}
            </section>

            {/* Complete Internal Linking Related Pages grid */}
            <section id="guide-relations" className="space-y-4">
              <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider font-mono">
                {t('guides.title', 'Related Free QR Generation Guides')}
              </h2>
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
            className="cookie-consent-container bg-slate-950 border border-slate-800/80 text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 z-[9999] backdrop-blur-md"
          >
            <div className="flex gap-3">
              <div id="cookie-icon-wrapper" className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl flex-shrink-0 h-10 w-10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p id="cookie-title" className="text-sm font-bold tracking-tight text-slate-100">{navTranslations[locale].cookieConsentTitle || 'Cookie Preference'}</p>
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
      </main>

      {/* Footer with rich SEO directory links */}
      <footer id="app-footer" dir="ltr" className="py-16 border-t border-slate-200 bg-slate-50/50 text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Branding & Product Hunt */}
          <div id="footer-branding" className="sm:col-span-2 md:col-span-1 space-y-3 text-left">
            <button 
              onClick={() => navigateTo('/')} 
              className="flex items-center text-left focus:outline-hidden hover:opacity-95 active:scale-98 transition-all cursor-pointer"
              aria-label="FreeQRBarcodes.com Home"
            >
              <Logo size={42} />
            </button>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('footer.brandDesc', 'Design customized, high-redundancy QR codes with modern color gradients, dot styles, and brand centerpieces. Complete with dynamic web link shortener tracking and real-time scan analytics.')}
            </p>
            <div className="pt-2">
              <a href="https://www.producthunt.com/posts/free-qr-generator-4" target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-102 duration-300">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=free-qr-generator-4&theme=light" alt="FreeQRBarcodes.com on Product Hunt" width="180" height="38" />
              </a>
            </div>
          </div>

          {/* Column 2: QR Generators */}
          <div id="footer-qr-generators" className="space-y-4 text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">QR Generators</h2>
            <div className="flex flex-col gap-2">
              {[
                { name: '🔗 URL QR Code', path: '/url-qr-generator' },
                { name: '📡 WiFi QR Code', path: '/wifi-qr-generator' },
                { name: '📇 vCard QR Code', path: '/vcard-qr-generator' },
                { name: '✉️ Email QR Code', path: '/email-qr-generator' },
                { name: '📱 SMS QR Code', path: '/sms-qr-generator' },
                { name: '💬 WhatsApp QR', path: '/whatsapp-qr-generator' },
                { name: '📸 Instagram QR', path: '/instagram-qr-generator' },
                { name: '📘 Facebook QR', path: '/facebook-qr-generator' },
                { name: '🎥 YouTube QR', path: '/youtube-qr-generator' },
                { name: '📍 Location QR', path: '/location-qr-generator' },
              ].map((item) => (
                <a 
                  key={item.path}
                  href={item.path} 
                  onClick={(e) => { e.preventDefault(); navigateTo(item.path); }} 
                  className="text-xs text-slate-600 hover:text-indigo-600 hover:font-bold transition-all cursor-pointer truncate"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Barcode & Specialized */}
          <div id="footer-barcode-specialized" className="space-y-4 text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">Barcode & Specialized</h2>
            <div className="flex flex-col gap-2">
              {[
                { name: '📊 Barcode Generator', path: '/barcode-generator' },
                { name: '🗂️ Bulk QR Generator', path: '/bulk-qr-generator' },
                { name: '🎨 Animated QR', path: '/animated-qr-generator' },
                { name: '💳 Payment QR', path: '/payment-qr-generator' },
                { name: '🪙 Crypto QR', path: '/crypto-qr-generator' },
                { name: '🤖 App Store QR', path: '/app-store-qr-generator' },
                { name: '🍔 Restaurant Menu QR', path: '/restaurant-menu-qr-generator' },
                { name: '🍳 Restaurant QR', path: '/restaurant-qr-generator' },
                { name: '💼 Business Card QR', path: '/business-card-qr-generator' },
                { name: '🏷️ Digital Card QR', path: '/digital-card-qr-generator' },
                { name: '📁 PDF Sharing QR', path: '/pdf-sharing-qr-generator' },
                { name: '📄 PDF QR Code', path: '/pdf-qr-generator' },
                { name: '🧾 ZATCA Invoice QR', path: '/zatca-invoice' },
              ].map((item) => (
                <a 
                  key={item.path}
                  href={item.path} 
                  onClick={(e) => { e.preventDefault(); navigateTo(item.path); }} 
                  className="text-xs text-slate-600 hover:text-indigo-600 hover:font-bold transition-all cursor-pointer truncate"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Solutions */}
          <div id="footer-solutions" className="space-y-4 text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">Solutions</h2>
            <div className="flex flex-col gap-2">
              {[
                { name: '🍔 Contactless Menu', path: '/solutions/contactless-menu' },
                { name: '💼 Digital Business Card', path: '/solutions/digital-business-card' },
                { name: '⭐ Review Booster', path: '/solutions/google-review-booster' },
                { name: '📡 WiFi Guest Onboarding', path: '/solutions/wifi-guest-onboarding' },
                { name: '🎟️ Event Ticketing Check-In', path: '/solutions/event-ticketing-checkin' },
                { name: '🎟️ Event Ticket QR', path: '/solutions/event-ticket-qr-code' },
                { name: '📈 App Download Marketing', path: '/solutions/app-download-marketing' },
                { name: '⚡ All Enterprise Solutions', path: '/solutions' },
              ].map((item) => (
                <a 
                  key={item.path}
                  href={item.path} 
                  onClick={(e) => { e.preventDefault(); navigateTo(item.path); }} 
                  className="text-xs text-slate-600 hover:text-indigo-600 hover:font-bold transition-all cursor-pointer truncate"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Column 5: Company & Resources */}
          <div id="footer-company-resources" className="space-y-4 text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 font-mono">Company</h2>
            <div className="flex flex-col gap-2">
              {[
                { name: '🏢 About Our Platform', path: '/about' },
                { name: '🌟 Why iSolutions', path: '/why-freeqrgen' },
                { name: '❓ Frequently Asked (FAQ)', path: '/faq' },
                { name: '📝 Guides & News Blog', path: '/blog' },
                { name: '📐 QR Templates Hub', path: '/templates' },
                { name: '⚖️ Product Comparisons', path: '/compare' },
                { name: '🟢 Live System Status', path: '/system-status' },
              ].map((item) => (
                <a 
                  key={item.path}
                  href={item.path} 
                  onClick={(e) => { e.preventDefault(); navigateTo(item.path); }} 
                  className="text-xs text-slate-600 hover:text-indigo-600 hover:font-bold transition-all cursor-pointer truncate"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>{t('footer.copyright', '© 2026 iSolutions QR Generator. Decoupled and fully verified local-cloud schema.')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigateTo('/privacy-policy'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.privacyPolicy', 'Privacy Policy')}</a>
            <span>•</span>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigateTo('/terms'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.terms', 'Terms')}</a>
            <span>•</span>
            <a href="/security" onClick={(e) => { e.preventDefault(); navigateTo('/security'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.security', 'Security')}</a>
            <span>•</span>
            <a href="/accessibility" onClick={(e) => { e.preventDefault(); navigateTo('/accessibility'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.accessibility', 'Accessibility')}</a>
            <span>•</span>
            <a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('/contact'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.contactUs', 'Contact')}</a>
            <span>•</span>
            <a href="/system-status" onClick={(e) => { e.preventDefault(); navigateTo('/system-status'); }} className="text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-wider font-bold">{t('footer.systemStatus', 'Status')}</a>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* Floating Real-Time Scan Alerts Toaster Panel (Top Right) */}
      <div className="toast-floating-container w-full max-w-sm flex flex-col gap-3 pointer-events-none p-4" id="floating-notification-toaster-container">
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
                
                <p className="text-xs font-extrabold text-white truncate max-w-[200px] mt-0.5">
                  {toast.projectName}
                </p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5 pt-1.5 border-t border-slate-800/80">
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase">Location</span>
                    <span className="text-[10px] font-bold text-slate-200 block truncate" title={toast.approxLocation}>
                      📍 {toast.approxLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-semibold block uppercase font-sans">Device</span>
                    <span className="text-[10px] font-bold text-slate-200 block truncate" title={`${toast.deviceType} (${toast.browser})`}>
                      📱 {toast.deviceType}
                    </span>
                  </div>
                </div>

                {/* Subtle Copy Action Bar */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-800/60">
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-[170px]" title={toast.ip ? `IP: ${toast.ip}` : toast.approxLocation}>
                    {toast.ip ? `IP: ${toast.ip}` : toast.approxLocation}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const textToCopy = toast.ip ? toast.ip : toast.approxLocation;
                      navigator.clipboard.writeText(textToCopy).catch(() => {});
                      setCopiedToastId(toast.id);
                      setTimeout(() => setCopiedToastId(null), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 rounded-md px-2 py-0.5 transition-all cursor-pointer shrink-0 active:scale-95"
                    title={toast.ip ? "Copy IP address" : "Copy location string"}
                  >
                    {copiedToastId === toast.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 text-[9px] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Copy {toast.ip ? 'IP' : 'Location'}</span>
                      </>
                    )}
                  </button>
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

      {/* WhatsApp Card Detailed Expand Overlay Modal */}
      <AnimatePresence>
        {isWhatsappOverlayOpen && (
          <div 
            id="recent-whatsapp-overlay" 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                playAudioSound('click');
                setIsWhatsappOverlayOpen(false);
              }
            }}
          >
            <motion.div 
              id="recent-whatsapp-card-expanded-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 my-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-3.5 z-10">
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl shrink-0 text-emerald-300 shadow-inner">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                        Live Scan Telemetry
                      </span>
                      <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Real-Time
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                      WhatsApp QR Code Scan Analytics & Device Logs
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Detailed scan log history, exact timestamps, device fingerprints, geolocations, and network details for this WhatsApp QR code.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="close-recent-whatsapp-overlay"
                  onClick={() => {
                    playAudioSound('click');
                    setIsWhatsappOverlayOpen(false);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer shrink-0 z-10"
                  title="Close Overlay (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick KPI Stats Bar */}
              <div className="bg-slate-50 border-b border-slate-200/80 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Total Scan Logs</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {filteredWhatsappScans.length !== whatsappScanLogs.length 
                      ? `${filteredWhatsappScans.length} / ${whatsappScanLogs.length}` 
                      : whatsappScanLogs.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    {filteredWhatsappScans.length !== whatsappScanLogs.length ? 'Filtered Records' : 'All Records Active'}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Last Scanned</span>
                  <span className="text-sm font-extrabold text-emerald-700 block truncate">
                    {whatsappScanLogs.length > 0 ? getRelativeTimeString(whatsappScanLogs[0].timestamp) : 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Most Recent Event</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Top Device Share</span>
                  <span className="text-sm font-extrabold text-slate-800 block truncate">
                    Mobile (iPhone / Android)
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">82% Scan Share</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">Top Location</span>
                  <span className="text-sm font-extrabold text-slate-800 block truncate">
                    {whatsappScanLogs[0]?.approxLocation || 'London, UK'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Global Engagement</span>
                </div>
              </div>

              {/* Search, Filter & Action Toolbar */}
              <div className="p-4 bg-white border-b border-slate-200/80 space-y-3 shrink-0 animate-fade-in">
                {/* Search Bar & Primary Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="whatsapp-scan-search-input"
                      value={whatsappOverlaySearch}
                      onChange={(e) => setWhatsappOverlaySearch(e.target.value)}
                      placeholder="Filter by city, country, OS, browser, IP or URL..."
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder-slate-400"
                    />
                    {whatsappOverlaySearch && (
                      <button
                        type="button"
                        onClick={() => setWhatsappOverlaySearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {/* Test Live Scan Button */}
                    <button
                      type="button"
                      id="simulate-whatsapp-scan-btn"
                      onClick={handleSimulateWhatsappScan}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Simulate a real-time incoming scan"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                      <span>Simulate Scan</span>
                    </button>

                    {/* Export CSV Button */}
                    <button
                      type="button"
                      id="export-whatsapp-scans-csv"
                      onClick={handleExportWhatsappScansCSV}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                      title="Export scan logs to CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-slate-100">
                  {/* Device Filter */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Type</span>
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold self-start">
                      {(['all', 'mobile', 'desktop', 'tablet'] as const).map((filterType) => (
                        <button
                          key={filterType}
                          id={`filter-whatsapp-device-${filterType}`}
                          onClick={() => {
                            playAudioSound('click');
                            setWhatsappOverlayDeviceFilter(filterType);
                          }}
                          className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer text-[11px] ${
                            whatsappOverlayDeviceFilter === filterType
                              ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {filterType}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Picker */}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Period & Volume Trend</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold self-start">
                        {(['all', '7d', '30d', '90d', 'custom'] as const).map((range) => (
                          <button
                            key={range}
                            id={`filter-whatsapp-date-${range}`}
                            onClick={() => {
                              playAudioSound('click');
                              setWhatsappOverlayDateRange(range);
                            }}
                            className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer text-[11px] ${
                              whatsappOverlayDateRange === range
                                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {range === 'all' ? 'All-Time' : range}
                          </button>
                        ))}
                      </div>

                      {/* Custom Date Inputs inline with picker */}
                      <AnimatePresence>
                        {whatsappOverlayDateRange === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <input
                                type="date"
                                value={whatsappCustomStartDate}
                                onChange={(e) => setWhatsappCustomStartDate(e.target.value)}
                                className="bg-transparent border-0 p-0 focus:ring-0 text-[11px] text-slate-700 outline-hidden w-[105px] font-semibold"
                                title="Start Date"
                              />
                              <span className="text-slate-400 font-bold mx-0.5">to</span>
                              <input
                                type="date"
                                value={whatsappCustomEndDate}
                                onChange={(e) => setWhatsappCustomEndDate(e.target.value)}
                                className="bg-transparent border-0 p-0 focus:ring-0 text-[11px] text-slate-700 outline-hidden w-[105px] font-semibold"
                                title="End Date"
                              />
                              {(whatsappCustomStartDate || whatsappCustomEndDate) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWhatsappCustomStartDate('');
                                    setWhatsappCustomEndDate('');
                                  }}
                                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full ml-1"
                                  title="Clear Custom Dates"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Mini Sparkline Chart */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 text-slate-700 h-[30px] shadow-3xs hover:bg-slate-100/50 transition-all">
                        <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">Volume:</span>
                        <div className="w-[80px] h-[18px] flex items-end gap-[2.5px]">
                          {whatsappOverlaySparklineData.map((d) => {
                            const maxVal = Math.max(...whatsappOverlaySparklineData.map((x) => x.count), 1);
                            const percent = (d.count / maxVal) * 100;
                            return (
                              <div
                                key={d.index}
                                className="flex-1 bg-emerald-500/80 rounded-xs transition-all duration-300 hover:bg-emerald-600 cursor-help"
                                style={{ height: `${Math.max(percent, 10)}%` }}
                                title={`${d.count} scans near ${d.label}`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded-sm">
                          {whatsappOverlaySparklineData.reduce((acc, x) => acc + x.count, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body with Map & Scan Log list */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[350px]">
                {/* SVG/d3 Scan Distribution Map Visualizer */}
                <div className="lg:w-[320px] xl:w-[360px] border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 flex flex-col shrink-0 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scan Distribution Map</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      {locationStats.length} Country Hubs
                    </span>
                  </div>

                  {/* World Projection Map Container */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2.5 overflow-hidden shadow-inner h-[210px] flex flex-col justify-between shrink-0">
                    {/* Top Status & Legend */}
                    <div className="absolute top-1.5 left-2 z-10 flex flex-col select-none">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Interactive Live Nodes</span>
                      <span className="text-[9px] font-semibold text-emerald-400">Click node to filter</span>
                    </div>

                    {/* Floating Zoom & Navigation Controls */}
                    <div 
                      id="whatsapp-map-zoom-controls"
                      className="absolute top-1.5 right-2 z-20 flex items-center gap-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 rounded-lg p-0.5 shadow-md select-none"
                    >
                      {/* Zoom Out Button */}
                      <button
                        type="button"
                        onClick={handleMapZoomOut}
                        disabled={whatsappMapZoom <= 1}
                        id="whatsapp-map-zoom-out"
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Zoom out (-)"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>

                      {/* Zoom Level Reset / Indicator */}
                      <button
                        type="button"
                        onClick={handleMapZoomReset}
                        id="whatsapp-map-zoom-reset-btn"
                        className="px-1 h-5 flex items-center justify-center rounded text-[9px] font-mono font-bold text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                        title="Click to reset zoom (100%)"
                        aria-label="Reset zoom"
                      >
                        {Math.round(whatsappMapZoom * 100)}%
                      </button>

                      {/* Zoom In Button */}
                      <button
                        type="button"
                        onClick={handleMapZoomIn}
                        disabled={whatsappMapZoom >= 3.5}
                        id="whatsapp-map-zoom-in"
                        className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Zoom in (+)"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>

                      {/* Reset icon button if zoomed or panned */}
                      {(whatsappMapZoom > 1 || whatsappMapPan.x !== 0 || whatsappMapPan.y !== 0) && (
                        <button
                          type="button"
                          onClick={handleMapZoomReset}
                          id="whatsapp-map-zoom-reset"
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all border-l border-slate-700/80 pl-0.5 ml-0.5"
                          title="Reset view (1.0x)"
                          aria-label="Reset view"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* SVG Map Canvas */}
                    <div className="w-full h-full relative mt-2 overflow-hidden rounded-xl">
                      <svg 
                        viewBox="0 0 320 180" 
                        className={`w-full h-full text-slate-800 select-none touch-none ${
                          whatsappMapZoom > 1 ? (isDraggingMap ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                        }`}
                        onPointerDown={handleMapPointerDown}
                        onPointerMove={handleMapPointerMove}
                        onPointerUp={handleMapPointerUp}
                        onPointerLeave={handleMapPointerUp}
                        onWheel={handleMapWheel}
                      >
                        {/* High-tech grid background lines */}
                        <defs>
                          <pattern id="map-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#map-grid)" />

                        {/* Zoomable & Pannable Group */}
                        <g
                          transform={`translate(${whatsappMapPan.x}, ${whatsappMapPan.y}) scale(${whatsappMapZoom})`}
                          style={{
                            transformOrigin: '160px 90px',
                            transition: isDraggingMap ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          {/* Simplified Continent Grids/Silhouettes for visual perspective */}
                          {/* North America */}
                          <path d="M 25,35 L 75,35 L 90,60 L 70,80 L 45,80 L 30,55 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />
                          {/* South America */}
                          <path d="M 75,85 L 95,85 L 105,110 L 95,145 L 75,115 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />
                          {/* Europe */}
                          <path d="M 125,40 L 165,40 L 160,65 L 130,65 L 120,50 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />
                          {/* Africa */}
                          <path d="M 130,70 L 160,70 L 170,90 L 160,125 L 140,120 L 125,100 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />
                          {/* Asia */}
                          <path d="M 165,45 L 255,45 L 260,90 L 220,110 L 175,85 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />
                          {/* Oceania */}
                          <path d="M 235,120 L 275,120 L 265,145 L 235,140 Z" className="fill-slate-800/60 hover:fill-slate-800 transition-all duration-300" />

                          {/* Connection Lines from central telemetry hub */}
                          {locationStats.map((stat, idx) => {
                            const coords = countryCoords[stat.countryCode] || { x: 160, y: 90 };
                            return (
                              <line
                                key={`line-${idx}`}
                                x1="160"
                                y1="90"
                                x2={coords.x}
                                y2={coords.y}
                                stroke="#10b981"
                                strokeWidth="0.5"
                                strokeDasharray="2,3"
                                strokeOpacity={0.15}
                              />
                            );
                          })}

                          {/* Interactive Scan Nodes */}
                          {locationStats.map((stat) => {
                            const coords = countryCoords[stat.countryCode] || { x: 160, y: 90 };
                            const isCurrentlyFiltered = whatsappOverlaySearch.toLowerCase() === stat.name.toLowerCase();
                            
                            return (
                              <g
                                key={stat.countryCode}
                                className="cursor-pointer group"
                                onClick={() => handleCountryClick(stat.countryCode, stat.name)}
                              >
                                <title>{`${stat.name} (${stat.countryCode}): ${stat.count} scans - Click to filter`}</title>
                                {/* Pulse Effect Rings */}
                                <circle
                                  cx={coords.x}
                                  cy={coords.y}
                                  r={isCurrentlyFiltered ? 10 : 6}
                                  className={`fill-none stroke-emerald-400 stroke-[1.5] transition-all duration-1000 ${
                                    stat.count > 0 ? 'animate-ping' : ''
                                  }`}
                                  opacity={isCurrentlyFiltered ? 0.8 : 0.4}
                                  style={{ transformOrigin: `${coords.x}px ${coords.y}px`, animationDuration: '2.5s' }}
                                />
                                
                                {/* Inner Solid Node */}
                                <circle
                                  cx={coords.x}
                                  cy={coords.y}
                                  r={isCurrentlyFiltered ? 4.5 : 3}
                                  className={`transition-all duration-300 ${
                                    isCurrentlyFiltered 
                                      ? 'fill-emerald-400 stroke-white stroke-2 shadow-md' 
                                      : 'fill-emerald-500 hover:fill-emerald-400 group-hover:scale-125'
                                  }`}
                                />
                              </g>
                            );
                          })}
                        </g>
                      </svg>
                    </div>

                    {/* Footer Status Indicators */}
                    {whatsappMapZoom > 1 ? (
                      <div className="absolute bottom-1.5 left-2 z-10 flex items-center gap-1.5 text-[8px] font-mono text-emerald-300 bg-slate-950/85 backdrop-blur-xs border border-emerald-800/60 px-1.5 py-0.5 rounded-full select-none shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>DRAG TO PAN • {Math.round(whatsappMapZoom * 100)}%</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-1.5 left-2 text-slate-500 font-mono text-[8px] tracking-widest select-none">
                        PROJECTION: EQUIRECTANGULAR
                      </div>
                    )}
                    <div className="absolute bottom-1.5 right-2 text-slate-500 font-mono text-[8px] tracking-widest text-right shrink-0 select-none">
                      SYS STATUS: ONLINE
                    </div>
                  </div>

                  {/* Location Stats List (Sidepanel) */}
                  <div className="mt-4 flex-1 space-y-2 min-h-0 overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Scanned Countries</span>
                    
                    {locationStats.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No locations recorded</p>
                    ) : (
                      <div className="space-y-1.5">
                        {locationStats.map((stat) => {
                          const isCurrentlyFiltered = whatsappOverlaySearch.toLowerCase() === stat.name.toLowerCase();
                          return (
                            <button
                              key={stat.countryCode}
                              type="button"
                              onClick={() => handleCountryClick(stat.countryCode, stat.name)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left text-xs ${
                                isCurrentlyFiltered
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-3xs font-extrabold'
                                  : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-slate-400 font-mono font-bold text-[10px] w-5 text-center bg-slate-100 py-0.5 rounded-sm uppercase shrink-0">
                                  {stat.countryCode}
                                </span>
                                <span className="font-semibold truncate">{stat.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600 font-bold">
                                  {stat.count}x
                                </span>
                                {isCurrentlyFiltered && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Log Items List */}
                <div id="whatsapp-scans-list" className="p-4 overflow-y-auto flex-1 space-y-3 min-h-[280px]">
                {filteredWhatsappScans.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-extrabold text-slate-700">No scan logs matched your filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing your search query, switching device filters, or selecting a broader time period.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setWhatsappOverlaySearch('');
                        setWhatsappOverlayDeviceFilter('all');
                        setWhatsappOverlayDateRange('all');
                        setWhatsappCustomStartDate('');
                        setWhatsappCustomEndDate('');
                      }}
                      className="mt-3 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 rounded-lg cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredWhatsappScans.map((scan, index) => {
                    const isSelected = whatsappSelectedScanDetail?.id === scan.id;
                    const scanDateObj = new Date(scan.timestamp);
                    const formattedDate = !isNaN(scanDateObj.getTime())
                      ? scanDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Aug 16, 2026';
                    const formattedTime = !isNaN(scanDateObj.getTime())
                      ? scanDateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : '12:00:00 PM';
                    const relativeTime = scan.timestamp ? getRelativeTimeString(scan.timestamp) : 'Recently';

                    return (
                      <div
                        key={scan.id}
                        id={`whatsapp-scan-row-${scan.id}`}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/70 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Device Icon + Timestamp info */}
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                              scan.deviceType === 'Desktop'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : scan.deviceType === 'Tablet'
                                ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {scan.deviceType === 'Desktop' ? (
                                <Laptop className="w-4 h-4" />
                              ) : scan.deviceType === 'Tablet' ? (
                                <Tablet className="w-4 h-4" />
                              ) : (
                                <Smartphone className="w-4 h-4" />
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-900 font-mono">
                                  {formattedDate} at {formattedTime}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 rounded-full font-mono">
                                  {relativeTime}
                                </span>
                                {index === 0 && (
                                  <span className="px-2 py-0.5 text-[9px] font-black uppercase text-white bg-emerald-600 rounded-md">
                                    Latest Scan
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                                <span className="font-semibold text-slate-800 flex items-center gap-1">
                                  {scan.os || 'Mobile OS'} • {scan.browser || 'Safari'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1 text-slate-600">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  {scan.approxLocation || 'Unknown Location'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  IP: {scan.ip || '203.0.113.42'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expand Detail Action */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                playAudioSound('click');
                                setWhatsappSelectedScanDetail(isSelected ? null : scan);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-700 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200'
                              }`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'Hide Details' : 'View Details'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Technical Inspector Panel */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 bg-white/90 p-3 rounded-xl"
                          >
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                Target Destination URL
                              </span>
                              <div className="font-mono text-[11px] bg-slate-100 p-2 rounded-lg break-all text-emerald-900 border border-slate-200/80 flex items-center justify-between gap-2">
                                <span>{scan.destinationUrl || 'https://wa.me/15550192834'}</span>
                                <a
                                  href={scan.destinationUrl || 'https://wa.me/15550192834'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                  title="Open Link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                                Referrer & Network Client
                              </span>
                              <div className="font-mono text-[11px] bg-slate-100 p-2 rounded-lg text-slate-700 border border-slate-200/80 space-y-1">
                                <div><strong className="text-slate-500">Referrer:</strong> {scan.referrer || 'Direct Scan / Mobile Camera'}</div>
                                <div><strong className="text-slate-500">Scan ID:</strong> {scan.id}</div>
                                <div><strong className="text-slate-500">Status:</strong> <span className="text-emerald-700 font-bold">200 OK Redirected (~110ms)</span></div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Encrypted Scan Analytics • Privacy-Compliant Log Storage</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playAudioSound('click');
                    setIsWhatsappOverlayOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-extrabold transition-all cursor-pointer"
                >
                  Close Telemetry Overlay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Sound & Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        soundSettings={soundSettings}
        onUpdateSoundSettings={setSoundSettings}
      />

      {/* CSV & Excel File Format Instructions Modal for Bulk QR Generator */}
      <BulkFormatHelpModal
        isOpen={isBulkHelpModalOpen}
        onClose={() => setIsBulkHelpModalOpen(false)}
        onGoToBulkTab={() => setActiveTab('bulk')}
      />

      {/* Campaign AI Assistant Widget */}
      <AIAssistantWidget
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigateTo}
        currentProject={currentProject}
        onUpdateProject={setCurrentProject}
      />
    </div>
  );
}
