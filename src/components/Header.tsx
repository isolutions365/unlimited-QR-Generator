import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Zap, ChevronDown, Menu, X, Globe, Compass, Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, HelpCircle, BookOpen, Utensils, Cpu, Scale, Bot, Sliders, Volume2, VolumeX, FormInput, Contact, FileText, Barcode, FileSpreadsheet, BarChart3, User, LogOut, Sparkles } from 'lucide-react';
import Navigation from './Navigation';
import LanguageSelector from './LanguageSelector';
import { Locale } from '../utils/translations';
import { AppTab } from '../types';
import Logo from './Logo';

import { UserSession } from '../lib/api';

interface HeaderProps {
  isScrolled: boolean;
  t: (key: string, fallback: string) => string;
  locale: Locale;
  currentPath: string;
  navigateTo: (path: string) => void;
  changeLocale: (locale: Locale) => void;
  creativeSubItems: any;
  presetToolsTranslations: any;
  handleInitiateGenerator: any;
  getPresetIcon: (slug: string) => any;
  setActiveTab: (tab: AppTab) => void;
  activeTab?: AppTab;
  navTranslations: any;
  user?: UserSession | null;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
  soundEnabled?: boolean;
}

export default function Header({ 
  isScrolled, t, locale, currentPath, navigateTo, changeLocale,
  creativeSubItems, presetToolsTranslations, handleInitiateGenerator,
  getPresetIcon, setActiveTab, activeTab, navTranslations,
  user, onSignInClick, onSignUpClick, onSignOut,
  onOpenSettings, soundEnabled = true
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const isRtl = ['ar', 'ur'].includes(locale);

  const navLinks = [
    { name: t('nav.faqTitle', 'FAQ'), path: '/faq', icon: HelpCircle },
    { name: t('nav.blogTitle', 'Blog'), path: '/blog', icon: BookOpen },
    { name: t('nav.templates', 'Templates'), path: '/templates', icon: LayoutTemplate },
    { name: t('nav.aiGateway', 'AI Gateway'), path: '/ai-gateway', icon: Bot },
    { name: t('nav.solutions', 'Solutions'), path: '/solutions', icon: Zap },
    { name: t('nav.industries', 'Industries'), path: '/industries', icon: Utensils },
    { name: t('nav.useCases', 'Use Cases'), path: '/use-cases', icon: Cpu },
    { name: t('nav.comparisons', 'Comparisons'), path: '/compare', icon: Scale },
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
      navigateTo('/');
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
        aria-label="Free QR Generator Home"
      >
        <Logo size={48} />
      </button>

      {/* CENTER: Navigation */}
      <div className="hidden xl:flex flex-1 justify-center min-w-0 px-4">
         <Navigation links={navLinks} currentPath={currentPath} activeTab={activeTab} onLinkClick={handleLinkClick} isRtl={isRtl} />
      </div>

      {/* RIGHT: Buttons */}
      <div className="flex items-center gap-2 shrink-0">
         <LanguageSelector currentLocale={locale} onSelect={handleLanguageSelect} />
         
         {/* Audio & Settings Modal Trigger Button */}
         {onOpenSettings && (
           <button
             onClick={onOpenSettings}
             className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
             title={t('settings.headerBtnTooltip', 'Sound & Audio Settings')}
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
                          <span>{t('nav.myProfile', 'My Profile & Settings')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4 text-indigo-500" />
                          <span>{t('nav.savedQRs', 'My Saved QR Codes')}</span>
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
                          <span>{t('nav.signOut', 'Sign Out')}</span>
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
                  {t('nav.signIn', 'Sign In')}
                </button>
                <button 
                  onClick={onSignUpClick} 
                  className="hidden sm:flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all active:scale-98"
                >
                  {t('nav.signUp', 'Sign Up')}
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

    {/* Mobile Sliding Navigation Menu */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: isRtl ? '-100%' : '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRtl ? '-100%' : '100%' }}
          className="fixed inset-0 z-50 bg-white p-6 pt-20 xl:hidden"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
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
                       {t('nav.signedInAs', 'Signed in as:')} <strong className="text-slate-800">{user.name}</strong>
                     </span>
                     <button 
                       onClick={() => {
                         onSignOut?.();
                         setIsMobileMenuOpen(false);
                       }} 
                       className="w-full px-4 py-3 text-lg font-bold text-red-600 hover:bg-red-50 rounded-lg text-left cursor-pointer transition-colors"
                     >
                       {t('nav.signOut', 'Sign Out')}
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
                       {t('nav.signIn', 'Sign In')}
                     </button>
                     <button 
                       onClick={() => {
                         onSignUpClick?.();
                         setIsMobileMenuOpen(false);
                       }} 
                       className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-lg font-bold text-left cursor-pointer transition-colors"
                     >
                       {t('nav.signUp', 'Sign Up')}
                     </button>
                   </>
                 )}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
