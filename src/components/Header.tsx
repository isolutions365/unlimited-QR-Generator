import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Zap, ChevronDown, Menu, X, Globe, Compass, Wand2, Palette, 
  LayoutTemplate, Play, Image, Megaphone, HelpCircle, BookOpen, Utensils, 
  Cpu, Scale, Bot, Sliders, Volume2, VolumeX, FormInput, Contact, FileText, 
  Barcode, FileSpreadsheet, BarChart3, User, LogOut, Sparkles, ArrowRight, 
  Wallet, Bitcoin, MapPin, Smartphone, Share2 
} from 'lucide-react';
import Navigation from './Navigation';
import LanguageSelector from './LanguageSelector';
import { Locale } from '../utils/translations';
import { AppTab } from '../types';
import Logo from './Logo';

import { UserSession } from '../lib/api';

interface HeaderProps {
  isScrolled?: boolean;
  t?: (key: string, fallback: string) => string;
  locale?: Locale;
  currentPath?: string;
  navigateTo?: (path: string) => void;
  changeLocale?: (locale: Locale) => void;
  creativeSubItems?: any;
  presetToolsTranslations?: any;
  handleInitiateGenerator?: any;
  getPresetIcon?: (slug: string) => any;
  setActiveTab?: (tab: AppTab) => void;
  activeTab?: AppTab;
  navTranslations?: any;
  user?: UserSession | null;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
  soundEnabled?: boolean;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function Header({ 
  isScrolled = false,
  t,
  locale = 'en',
  currentPath = '/',
  navigateTo = () => {},
  changeLocale = () => {},
  creativeSubItems = {},
  presetToolsTranslations = {},
  handleInitiateGenerator = () => {},
  getPresetIcon = () => Sparkles,
  setActiveTab = () => {},
  activeTab = 'create',
  navTranslations = {},
  user = null,
  onSignInClick = () => {},
  onSignUpClick = () => {},
  onSignOut = () => {},
  onOpenSettings = () => {},
  soundEnabled = true,
  isMobileMenuOpen: controlledIsMobileMenuOpen,
  onToggleMobileMenu
}: HeaderProps) {
  const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] = useState(false);
  const isMobileMenuOpen = controlledIsMobileMenuOpen !== undefined ? controlledIsMobileMenuOpen : internalIsMobileMenuOpen;
  const setIsMobileMenuOpen = (val: boolean) => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalIsMobileMenuOpen(val);
    }
  };
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const isRtl = ['ar', 'ur'].includes(locale);

  const safeT = (key: string, fallback: string) => {
    try {
      if (typeof t === 'function') {
        const translated = t(key, fallback);
        return translated || fallback;
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const navLinks = [
    { name: safeT('nav.generator', 'QR Studio'), path: '/generator', icon: QrCode },
    { name: safeT('nav.faqTitle', 'FAQ'), path: '/faq', icon: HelpCircle },
    { name: safeT('nav.blogTitle', 'Blog'), path: '/blog', icon: BookOpen },
    { name: safeT('nav.templates', 'Templates'), path: '/templates', icon: LayoutTemplate },
    { name: safeT('nav.aiGateway', 'AI Gateway'), path: '/ai-gateway', icon: Bot },
    { name: safeT('nav.solutions', 'Solutions'), path: '/solutions', icon: Zap },
    { name: safeT('nav.industries', 'Industries'), path: '/industries', icon: Utensils },
    { name: safeT('nav.useCases', 'Use Cases'), path: '/use-cases', icon: Cpu },
    { name: safeT('nav.comparisons', 'Comparisons'), path: '/compare', icon: Scale },
  ];

  const handleLanguageSelect = (newLocale: Locale) => {
    // Assuming routing structure: /<locale>/<path>
    // For now, simple redirect
    const pathParts = currentPath.split('/').filter(Boolean);
    const cleanPath = pathParts.length > 0 && pathParts[0] === locale 
      ? `/${pathParts.slice(1).join('/')}` 
      : currentPath;
    
    changeLocale(newLocale);
  };

  const handleLinkClick = (link: any) => {
    if (link.action) {
      const tabName = link.action.replace('tab_', '') as AppTab;
      navigateTo(`/generator?tab=${tabName}`);
      setActiveTab?.(tabName);
    } else if (link.path) {
      navigateTo(link.path);
    }
  };

  return (
    <>
    <header
      dir="ltr"
      className={`sticky top-0 z-50 px-3 sm:px-6 flex items-center justify-between gap-4 border-b backdrop-blur-xl transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'py-2 sm:py-2.5 border-slate-200/85 shadow-md bg-white/40 shadow-indigo-100/20'
          : 'py-3 sm:py-5 border-slate-200/40 shadow-xs bg-white/50'
      }`}
    >
      {/* LEFT: Logo */}
      <button 
        onClick={() => navigateTo('/')} 
        className="flex items-center gap-2 shrink-0 cursor-pointer focus:outline-hidden hover:opacity-95 active:scale-98 transition-all"
        aria-label="FreeQRBarcodes.com Home"
      >
        <Logo size={48} />
      </button>

      {/* CENTER: Navigation with Premium Hover Dropdowns */}
      <nav aria-label="Primary navigation" className="hidden xl:flex items-center justify-center gap-1 px-4" onMouseLeave={() => setActiveDropdown(null)}>
        {/* QR Generators Dropdown */}
        <div 
          className="relative py-2 px-1"
          onMouseEnter={() => setActiveDropdown('generators')}
        >
          <button className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${activeDropdown === 'generators' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}>
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Generators</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'generators' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'generators' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-[780px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-50 grid grid-cols-4 gap-6 text-left"
              >
                {/* Column 1: Popular */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Popular Creators</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'URL QR', path: '/url-qr-generator', desc: 'Convert links to QR', icon: Globe },
                      { name: 'WiFi QR', path: '/wifi-qr-generator', desc: 'Instant lobby onboarding', icon: Compass },
                      { name: 'WhatsApp QR', path: '/whatsapp-qr-generator', desc: 'Pre-typed chat triggers', icon: Smartphone },
                      { name: 'vCard QR', path: '/vcard-qr-generator', desc: 'Rich digital contact cards', icon: Contact },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Business & Dining */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider font-mono">Dining & Business</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Restaurant Menu', path: '/restaurant-menu-qr-generator', desc: 'Digital menus for diners', icon: Utensils },
                      { name: 'Business Card', path: '/business-card-qr-generator', desc: 'Corporate identity nodes', icon: Wand2 },
                      { name: 'Digital Profile', path: '/digital-card-qr-generator', desc: 'Custom personal bio links', icon: LayoutTemplate },
                      { name: 'PDF Sharing QR', path: '/pdf-sharing-qr-generator', desc: 'Distribute documents', icon: FileText },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-amber-50/40 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 3: Social Media */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider font-mono">Social Media</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Instagram Profile', path: '/instagram-qr-generator', desc: 'Grow followers organic', icon: Play },
                      { name: 'Facebook Page', path: '/facebook-qr-generator', desc: 'Boost likes & engagement', icon: Megaphone },
                      { name: 'YouTube Video', path: '/youtube-qr-generator', desc: 'Direct views count boost', icon: Play },
                      { name: 'Location Map', path: '/location-qr-generator', desc: 'Embed coordinates point', icon: MapPin },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-pink-50/40 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 4: Professional & Advanced */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider font-mono">Advanced & Pro</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Animated QR', path: '/animated-qr-generator', desc: 'Creative motion scanning', icon: Palette },
                      { name: 'Payment QR', path: '/payment-qr-generator', desc: 'Receive digital wallet pays', icon: Wallet },
                      { name: 'Crypto QR', path: '/crypto-qr-generator', desc: 'Secure blockchain wallet', icon: Bitcoin },
                      { name: 'App Store QR', path: '/app-store-qr-generator', desc: 'Dual OS smart download', icon: Bot },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                        className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-purple-50/40 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Barcode Studio Link */}
        <button 
          onClick={() => { setActiveDropdown(null); navigateTo('/barcode-generator'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${currentPath === '/barcode-generator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}
        >
          <Barcode className="w-3.5 h-3.5" />
          <span>Barcode Studio</span>
        </button>

        {/* Bulk QR Link */}
        <button 
          onClick={() => { setActiveDropdown(null); navigateTo('/bulk-qr-generator'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${currentPath === '/bulk-qr-generator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Bulk QR</span>
        </button>

        {/* Enterprise Solutions Dropdown */}
        <div 
          className="relative py-2 px-1"
          onMouseEnter={() => setActiveDropdown('solutions')}
        >
          <button className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${activeDropdown === 'solutions' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}>
            <Zap className="w-3.5 h-3.5" />
            <span>Solutions</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'solutions' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 text-left flex flex-col gap-1"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono px-3 py-1.5">Enterprise Solutions</span>
                {[
                  { name: 'Contactless Digital Menu', path: '/solutions/contactless-menu', desc: 'Paperless dining lists for diners', icon: Utensils },
                  { name: 'NFC vCard Networking', path: '/solutions/digital-business-card', desc: 'Seamless high-grade corporate profiles', icon: Contact },
                  { name: 'Google Review Booster', path: '/solutions/google-review-booster', desc: 'Boost organic localized stars count', icon: Sparkles },
                  { name: 'WiFi Guest Onboarding', path: '/solutions/wifi-guest-onboarding', desc: 'No-password lobby network pairing', icon: Compass },
                  { name: 'Event Gate Tickets Pass', path: '/solutions/event-ticketing-checkin', desc: 'Secure barcode/QR checks at door', icon: LayoutTemplate },
                  { name: 'Unified App Marketing', path: '/solutions/app-download-marketing', desc: 'Smart OS download router page', icon: Bot },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                    className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-indigo-50/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                      <span className="block text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.desc}</span>
                    </div>
                  </button>
                ))}
                
                <div className="border-t border-slate-100 mt-2 pt-2 px-1">
                  <button
                    onClick={() => { setActiveDropdown(null); navigateTo('/solutions'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 text-xs font-extrabold transition-colors text-left"
                  >
                    <span>Explore All Industry Solutions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resources Dropdown */}
        <div 
          className="relative py-2 px-1"
          onMouseEnter={() => setActiveDropdown('resources')}
        >
          <button className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${activeDropdown === 'resources' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Resources</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {activeDropdown === 'resources' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-[260px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-3.5 z-50 text-left flex flex-col gap-1"
              >
                {[
                  { name: 'FAQ & Help Center', path: '/faq', desc: 'Answers to common queries', icon: HelpCircle },
                  { name: 'Guides & Blog', path: '/blog', desc: 'Tutorials & news', icon: BookOpen },
                  { name: 'Product Comparisons', path: '/compare', desc: 'Side-by-side matrices', icon: Scale },
                  { name: 'AI QR Generator', path: '/ai-gateway', desc: 'Artistic generative models', icon: Bot },
                ].map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { setActiveDropdown(null); navigateTo(item.path); }}
                    className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-indigo-50/50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* RIGHT: Buttons */}
      <div className="flex items-center gap-2 shrink-0">
         <LanguageSelector currentLocale={locale} onSelect={handleLanguageSelect} />
         
         {/* Audio & Settings Modal Trigger Button */}
         {onOpenSettings && (
           <button
             onClick={onOpenSettings}
             className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
             title={safeT('settings.headerBtnTooltip', 'Sound & Audio Settings')}
             aria-label="Sound Settings"
           >
             {soundEnabled ? (
               <Volume2 className="w-5 h-5 text-indigo-600" />
             ) : (
               <VolumeX className="w-5 h-5 text-slate-400" />
             )}
           </button>
         )}
         
         {/* Desktop/Tablet Auth */}
         <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold font-mono text-xs flex items-center justify-center shadow-xs uppercase">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate">
                    {user.name || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left"
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/profile');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-indigo-500" />
                          <span>{safeT('nav.myProfile', 'My Profile & Settings')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/generator');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-indigo-500" />
                          <span>{safeT('nav.savedQRs', 'My Saved QR Codes')}</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onSignOut?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>{safeT('nav.signOut', 'Sign Out')}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button 
                  onClick={onSignInClick} 
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {safeT('nav.signIn', 'Sign In')}
                </button>
                <button 
                  onClick={onSignUpClick} 
                  className="hidden sm:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all active:scale-98"
                >
                  {safeT('nav.signUp', 'Sign Up')}
                </button>
              </>
            )}
         </div>

         {/* Mobile Menu Button */}
         <button className="xl:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>
    </header>

    {/* Mobile Sliding Navigation Menu (fallback if not controlled by App layout) */}
    <AnimatePresence>
      {isMobileMenuOpen && !onToggleMobileMenu && (
        <motion.div
          initial={{ opacity: 0, x: isRtl ? '-100%' : '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRtl ? '-100%' : '100%' }}
          className="fixed inset-0 z-50 bg-white p-6 pt-20 xl:hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <nav aria-label="Primary navigation - Mobile" className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
             {navLinks.map((link: any) => {
                const active = link.action 
                  ? (currentPath === '/' && activeTab === link.action.replace('tab_', ''))
                  : (currentPath === link.path);
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      handleLinkClick(link);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 text-base font-bold rounded-xl transition-all ${
                      active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <link.icon className="w-5 h-5 shrink-0" />
                    <span>{link.name}</span>
                  </button>
                );
             })}
             {/* Mobile Auth */}
             <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                 {user ? (
                   <div className="flex flex-col gap-2">
                     <span className="px-4 py-2 text-sm font-semibold text-slate-500">
                       {safeT('nav.signedInAs', 'Signed in as:')} <strong className="text-slate-800">{user.name}</strong>
                     </span>
                     <button 
                       onClick={() => {
                         onSignOut?.();
                         setIsMobileMenuOpen(false);
                       }} 
                       className="w-full px-4 py-3 text-lg font-bold text-red-600 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                     >
                       {safeT('nav.signOut', 'Sign Out')}
                     </button>
                   </div>
                 ) : (
                   <>
                     <button 
                       onClick={() => {
                         onSignInClick?.();
                         setIsMobileMenuOpen(false);
                       }} 
                       className="w-full px-4 py-3 text-lg font-bold text-slate-700 hover:bg-slate-100 rounded-lg text-left cursor-pointer transition-colors"
                     >
                       {safeT('nav.signIn', 'Sign In')}
                     </button>
                     <button 
                       onClick={() => {
                         onSignUpClick?.();
                         setIsMobileMenuOpen(false);
                       }} 
                       className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-bold text-left cursor-pointer transition-colors"
                     >
                       {safeT('nav.signUp', 'Sign Up')}
                     </button>
                   </>
                 )}
             </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
