import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Sparkles, ChevronDown, Menu, X, Globe, Compass, Wand2, Palette, LayoutTemplate, Play, Image, Megaphone, HelpCircle, BookOpen, Utensils, Cpu, Scale } from 'lucide-react';
import Navigation from './Navigation';
import LanguageSelector from './LanguageSelector';
import { Locale } from '../utils/translations';

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
  setActiveTab: (tab: string) => void;
  navTranslations: any;
}

export default function Header({ 
  isScrolled, t, locale, currentPath, navigateTo, changeLocale,
  creativeSubItems, presetToolsTranslations, handleInitiateGenerator,
  getPresetIcon, setActiveTab, navTranslations
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRtl = ['ar', 'ur'].includes(locale);

  const navLinks = [
    { name: t('nav.faqTitle', 'FAQ'), path: '/faq', icon: HelpCircle },
    { name: t('nav.blogTitle', 'Blog'), path: '/blog', icon: BookOpen },
    { name: t('nav.templates', 'Templates'), path: '/templates', icon: LayoutTemplate },
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
      className={`sticky top-0 z-50 px-3 sm:px-6 flex items-center justify-between gap-4 border-b backdrop-blur-xl transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'py-2 sm:py-2.5 border-slate-200/85 shadow-md bg-white/40 shadow-indigo-100/20'
          : 'py-3 sm:py-5 border-slate-200/40 shadow-xs bg-white/50'
      }`}
    >
      {/* LEFT: Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* CENTER: Navigation */}
      <div className="hidden xl:flex flex-1 justify-center min-w-0 px-4">
         <Navigation links={navLinks} currentPath={currentPath} navigateTo={navigateTo} isRtl={isRtl} />
      </div>

      {/* RIGHT: Buttons */}
      <div className="flex items-center gap-2 shrink-0">
         <LanguageSelector currentLocale={locale} onSelect={handleLanguageSelect} />
         
         {/* Desktop/Tablet Auth */}
         <div className="hidden sm:flex items-center gap-2">
            <button className="hidden lg:flex px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg truncate">
                {t('nav.aiLab', 'AI Lab')}
            </button>
            <button className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg truncate">
                {t('nav.signIn', 'Sign In')}
            </button>
            <button className="hidden sm:flex px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold truncate">
                {t('nav.signUp', 'Sign Up')}
            </button>
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
                 <button className="w-full px-4 py-3 text-lg font-bold text-slate-700 hover:bg-slate-100 rounded-lg">Sign In</button>
                 <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-lg font-bold">Sign Up</button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
