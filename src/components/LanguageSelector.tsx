import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Search, Check } from 'lucide-react';
import { Locale, SUPPORTED_LOCALES, isRtlLocale } from '../utils/translations';

const LANGUAGES: { code: Locale; native: string; english: string }[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'ar', native: 'العربية', english: 'Arabic' },
  { code: 'ur', native: 'اردو', english: 'Urdu' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'pt', native: 'Português', english: 'Portuguese' },
  { code: 'it', native: 'Italiano', english: 'Italian' },
  { code: 'tr', native: 'Türkçe', english: 'Turkish' },
  { code: 'id', native: 'Bahasa Indonesia', english: 'Indonesian' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ja', native: '日本語', english: 'Japanese' },
  { code: 'ko', native: '한국어', english: 'Korean' },
  { code: 'zh', native: '中文', english: 'Chinese' },
];

interface LanguageSelectorProps {
  currentLocale: Locale;
  onSelect: (locale: Locale) => void;
}

export default function LanguageSelector({ currentLocale, onSelect }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = isRtlLocale(currentLocale);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef} dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{currentLocale}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden`}
          >
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onSelect(lang.code); setIsOpen(false); }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg ${
                    currentLocale === lang.code ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{lang.native}</span>
                    <span className="text-xs text-slate-500">{lang.english} ({lang.code.toUpperCase()})</span>
                  </div>
                  {currentLocale === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
