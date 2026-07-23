import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Sparkles, ChevronDown, Menu, X, Globe, Compass, Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, HelpCircle, BookOpen, Utensils, Cpu, Scale, Bot } from 'lucide-react';
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
  navTranslations: any;
  user?: UserSession | null;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onSignOut?: () => void;
}

export default function Header({ 
  isScrolled, t, locale, currentPath, navigateTo, changeLocale,
  creativeSubItems, presetToolsTranslations, handleInitiateGenerator,
  getPresetIcon, setActiveTab, navTranslations,
  user, onSignInClick, onSignUpClick, onSignOut
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRtl = ['ar', 'ur'].includes(locale);

  const navLinks = [
    { name: t('nav.faqTitle', 'FAQ'), path: '/faq', icon: HelpCircle },
    { name: t('nav.blogTitle', 'Blog'), path: '/blog', icon: BookOpen },
    { name: t('nav.templates', 'Templates'), path: '/templates', icon: LayoutTemplate },
    { name: t('nav.aiGateway', 'AI Gateway'), path: '/ai-gateway', icon: Bot },
    { name: t('nav.solutions', 'Solutions'), path: '/solutions', icon: Sparkles },
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
         <Navigation links={navLinks} currentPath={currentPath} navigateTo={navigateTo} isRtl={isRtl} />
      </div>

      {/* RIGHT: Buttons */}
      <div className="flex items-center gap-2 shrink-0">
         <LanguageSelector currentLocale={locale} onSelect={handleLanguageSelect} />
         
         {/* Desktop/Tablet Auth */}
         <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 max-w-[120px] truncate">
                  {user.name}
                </span>
                <button 
                  onClick={onSignOut} 
                  className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {t('nav.signOut', 'Sign Out')}
                </button>
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
          <div className="flex flex-col gap-4">
             {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigateTo(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 text-lg font-bold text-slate-700 hover:text-indigo-600"
                >
                  <link.icon className="w-6 h-6" />
                  {link.name}
                </button>
             ))}
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
