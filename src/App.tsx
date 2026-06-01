import React, { useState, useEffect } from 'react';
import { api, UserSession } from './lib/api';
import { QRProject, ScanLog } from './types';
import SEOPage from './components/landing/SEOPage';
import { landingPages } from './components/landing/SEODatabase';
import ControlPanel from './components/ControlPanel';
import TemplatesTab from './components/TemplatesTab';
import PreviewPanel from './components/PreviewPanel';
import SavedProjects from './components/SavedProjects';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MobileAppMockup from './components/MobileAppMockup';
import AnimationsShowcase from './components/AnimationsShowcase';
import AuthModal from './components/AuthModal';
import AdSenseUnit from './components/AdSenseUnit';
import { 
  QrCode, LogIn, LogOut, Sparkles, LayoutGrid, RotateCcw, AlertCircle, ShieldCheck,
  ChevronDown, ChevronUp, Menu, X, ArrowRight, Clock, Star, Compass, Link2,
  Wifi, Mail, Phone, Contact, Globe, Utensils, Facebook, Instagram, Youtube, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

function AnimatedHeaderTitle() {
  const letters = Array.from("Free QR Generator");
  
  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.04,
      }
    }
  };
  
  const letterVariants = {
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

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<QRProject[]>([]);
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Active configurations in the drawing board
  const [currentProject, setCurrentProject] = useState<Partial<QRProject>>(INITIAL_DESIGN);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab ] = useState<'create' | 'templates' | 'analytics' | 'boiler' | 'animations'>('create');

  // Client path-routing states for SEO landing pages
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Set the default homepage browser window metadata dynamically
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      document.title = 'Custom DB QR Code Generator | Design Professional Trackable QR Codes';
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
          "name": "Custom DB QR Code Generator",
          "description": "Design secure, highly custom QR codes with color gradients, custom dot patterns, embedded logos, and real-time short-link scan analytics.",
          "publisher": {
            "@id": `${rootUrl}/#organization`,
            "@type": "Organization",
            "name": "Custom DB QR Codes Inc.",
            "url": rootUrl
          }
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${rootUrl}/#software`,
          "name": "Custom DB QR Generator and Short Link tracker",
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
      if (window.scrollY > 15) {
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

      const projectData: Partial<QRProject> = {
        id: targetId,
        name: currentProject.name || 'My Styled QR',
        type: currentProject.type || 'url',
        content: currentProject.content || 'https://google.com',
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
          {/* Dynamic Upper Banner */}
      <motion.header 
        animate={{
          y: isScrolled ? [-15, 0] : 0,
        }}
        transition={{ type: "spring", damping: 15, stiffness: 180 }}
        className={`sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b px-6 flex items-center justify-between transition-[padding,background-color,border-color] duration-300 ease-in-out ${
          isScrolled 
            ? 'py-2.5 border-gray-200/95 shadow-md scrolled bg-white/70 shadow-indigo-100/30' 
            : 'py-4 border-gray-200/60 shadow-sm'
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
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigateTo('/'); }}
            className={`text-xs font-semibold tracking-wide transition-all ${currentPath === '/' || currentPath === '' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1' : 'text-slate-600 hover:text-indigo-600 pb-1'}`}
          >
            Creative Station
          </a>
          
          {/* QR Tools Mega Dropdown */}
          <div className="relative group/nav">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-2 cursor-pointer focus:outline-none">
              <span>Free QR Tools</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/nav:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Dropdown Menu block */}
            <div className="absolute top-full left-1/2 -track-x-1/2 pt-2 hidden group-hover/nav:block z-50">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-5 w-[620px] grid grid-cols-2 gap-3" style={{ transform: 'translateX(-50%)' }}>
                {Object.keys(landingPages).map((key) => {
                  const item = landingPages[key];
                  return (
                    <a
                      key={item.slug}
                      href={`/${item.slug}`}
                      onClick={(e) => { e.preventDefault(); navigateTo(`/${item.slug}`); }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/50 group/item transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs shrink-0 group-hover/item:bg-indigo-100 group-hover/item:text-indigo-700 transition-colors">
                        🚀
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 group-hover/item:text-indigo-600 truncate">{item.h1}</span>
                        <span className="block text-[10px] text-slate-500 truncate max-w-[210px] font-medium">{item.intro.highlight}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Auth controllers & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {authLoading ? (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
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
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Sign Up
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white shadow-3xs cursor-pointer text-slate-700 hover:text-indigo-600 transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Sliding Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden sticky top-[73px] z-45 bg-white border-b border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3 font-semibold select-none">
              <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 block px-2">Main Menu</span>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  navigateTo('/');
                }}
                className={`flex items-center justify-between p-3 rounded-xl text-xs ${currentPath === '/' || currentPath === '' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>Creative Station</span>
                <span className="text-[9px] font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">ACTIVE</span>
              </a>

              <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 block mt-2 px-2">Free Pro-SEO Tools</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {Object.keys(landingPages).map((key) => {
                  const item = landingPages[key];
                  return (
                    <a
                      key={item.slug}
                      href={`/${item.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        navigateTo(`/${item.slug}`);
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-indigo-50/30 text-slate-700 hover:text-indigo-700 transition-colors text-left font-medium"
                    >
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs shrink-0 font-mono">
                        🚀
                      </div>
                      <span className="text-xs truncate">{item.h1}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Container Grid */}
      {isLandingPage ? (
        <SEOPage 
          slug={slug} 
          onSelectRoute={navigateTo} 
          onInitiateGenerator={handleInitiateGenerator} 
        />
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
              />

              {/* Saved History List Ledger */}
              <SavedProjects
                projects={projects}
                onSelect={handleSelectProject}
                onDelete={handleDeleteProject}
                onSeedData={handleSeedScanClick}
                isLoading={isLoadingData}
              />
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
              <TemplatesTab
                currentProject={currentProject}
                onChange={setCurrentProject}
              />
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
              <AnalyticsDashboard scans={scans} projects={projects} onPurgeAll={handlePurgeAllScans} />
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
            <MobileAppMockup />
          </div>
        )}

        {activeTab === 'animations' && (
          <div className="w-full">
            <AnimationsShowcase
              currentProject={currentProject}
              onChange={setCurrentProject}
              onDownloadTrigger={handleDownloadTrigger}
            />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-10">
                <div id="recent-wifi-card" className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">📡 Wireless Tech Integration • 2 min ago</span>
                    <h4 className="text-sm font-extrabold text-slate-100">Wireless Wi-Fi SSID Pairing</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Used by 1,480+ local hosts, cafeteria managers, and Airbnb operations. Allows direct, no-type scan router pairing.
                    </p>
                  </div>
                  <a
                    id="recent-wifi-link"
                    href="/wifi-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/wifi-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1"
                  >
                    Explore Free WiFi lander
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div id="recent-whatsapp-card" className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">💬 Chat Integrations • 10 min ago</span>
                    <h4 className="text-sm font-extrabold text-slate-100">Direct WhatsApp Customer Support</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Used by retail stores and digital agencies to enable rapid customer service requests. Launches formatted text templates.
                    </p>
                  </div>
                  <a
                    id="recent-whatsapp-link"
                    href="/whatsapp-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/whatsapp-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1"
                  >
                    Explore WhatsApp lander
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div id="recent-vcard-card" className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block">📇 Business Connectivity • 15 min ago</span>
                    <h4 className="text-sm font-extrabold text-slate-100">Interactive Content-Rich vCards</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Designed weekly by real estate brokers and dynamic consulting networks. Instantly saves primary contact cards.
                    </p>
                  </div>
                  <a
                    id="recent-vcard-link"
                    href="/vcard-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/vcard-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1"
                  >
                    Explore vCard lander
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div id="recent-restaurant-card" className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">📊 Dynamic Menu Hosting • 1 hr ago</span>
                    <h4 className="text-sm font-extrabold text-slate-100">Restaurant Menus & PDF Hosters</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Leveraged by cafes, visual bistros, and contactless fast-food spots. Keeps dynamic menu files editable and local.
                    </p>
                  </div>
                  <a
                    id="recent-restaurant-link"
                    href="/restaurant-qr-generator"
                    onClick={(e) => { e.preventDefault(); navigateTo('/restaurant-qr-generator'); }}
                    className="mt-4 text-xs font-bold text-amber-400 hover:text-white flex items-center gap-1"
                  >
                    Explore Restaurant lander
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
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

      {/* Auth0/Clerk style Auth Overlays Dialog Component */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(u) => {
          setUser(u);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Footer with rich SEO directory links */}
      <footer id="app-footer" className="py-16 border-t border-slate-100 bg-white/50 text-slate-600 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div id="footer-branding" className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <QrCode className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="font-bold text-xs text-slate-900 tracking-wider uppercase font-mono">Custom DB QR Generator</span>
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
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 mt-12 pt-6 text-center text-[11px] text-slate-400 font-mono">
          <p>© 2026 Custom DB QR Generator. Decoupled and fully verified local-cloud schema.</p>
        </div>
      </footer>
    </div>
  );
}
