import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Locale, SUPPORTED_LOCALES, extractLocaleAndPath, isRtlLocale } from './translations';
import { formatICU, ICUValues } from './icuFormatter';
import * as formatters from './localeFormatter';
import { EXPECTED_KEYS, validateLocaleDictionary, LocaleReport, generateFullReport, ValidationReport } from './i18nValidator';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import ur from '../locales/ur.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';
import tr from '../locales/tr.json';
import id from '../locales/id.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';

const translations: Record<string, Record<string, string>> = {
  en,
  ar,
  ur,
  de,
  fr,
  es,
  pt,
  it,
  tr,
  id,
  hi,
  zh,
  ja,
  ko
};

const enDictionary = en;

// Type-safe translation keys derived from expected keys
export type TKey = typeof EXPECTED_KEYS[number] | (string & {});

/**
 * Robust localized getter function that retrieves a string value for a given key
 * from a dictionary. It guarantees a string return value, entirely avoiding
 * runtime 'undefined' errors when calling .trim() on the result.
 */
export function getLocalizedText(
  dictionary: Record<string, string>,
  key: string,
  defaultValue: string = ''
): string {
  if (!dictionary || typeof key !== 'string') {
    return defaultValue;
  }
  const value = dictionary[key];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return String(value);
}

/**
 * Validates whether the text is a brand name, URL, or technical value that must never be translated.
 */
export function shouldSkipTranslation(text: any): boolean {
  if (text === undefined || text === null) return true;
  const textStr = String(text);
  const trimmed = ((val) => (val || '').trim())(textStr);
  if (trimmed.length <= 1) return true;

  // 1. Only numbers, symbols, percentage, punctuation or math operations
  if (/^[0-9\s%\+\-\*\/\\.,:;?!@#\$%\^&\*\(\)\_\[\]\{\}'"<>|=~`•\d]+$/.test(trimmed)) {
    return true;
  }

  // 2. Brand names (case insensitive checks)
  const lower = trimmed.toLowerCase();
  if (
    lower === 'free qr generator' ||
    lower === 'freeqrgen' ||
    lower === 'freeqrgen.pro' ||
    lower === 'isolutions' ||
    lower === 'isolutions ico' ||
    lower === 'reed-solomon' ||
    lower === 'pro' ||
    lower === 'utc'
  ) {
    return true;
  }

  // 3. URLs, domains, api routes, or query strings
  if (
    trimmed.includes('https://') ||
    trimmed.includes('http://') ||
    trimmed.includes('www.') ||
    lower.endsWith('.com') ||
    lower.endsWith('.pro') ||
    lower.includes('/api/') ||
    trimmed.startsWith('?') ||
    trimmed.startsWith('&')
  ) {
    return true;
  }

  // 4. File names and file extensions
  if (/\.(json|png|svg|pdf|zip|js|ts|css|html|jpg|jpeg|gif)$/i.test(trimmed)) {
    return true;
  }

  // 5. Tech parameters, hashes, hex codes, or code-like structures
  if (
    trimmed.startsWith('#') && trimmed.length <= 9 && /^[#a-fA-F0-9]+$/.test(trimmed)
  ) {
    return true;
  }

  return false;
}

// Construct a map of English text (lowercase & trimmed) to translation key for hybrid JSON matching
const englishToKeyMap: Record<string, string> = {};
Object.entries(enDictionary).forEach(([key, value]) => {
  if (typeof value === 'string') {
    englishToKeyMap[(((val) => (val || '').trim())(value)).toLowerCase()] = key;
  }
});

interface I18nContextType {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
  t: (key: TKey, defaultText?: string, values?: ICUValues) => any;
  isLoading: boolean;
  
  // Localized Formatters
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number | string, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (value: number | string, decimalPlaces?: number) => string;
  formatCurrency: (value: number | string, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: number, unit?: Intl.RelativeTimeFormatUnit) => string;
  getRelativeTimeString: (date: Date | string | number) => string;

  // Developer & Diagnostic Tooling
  requestedKeys: string[];
  loadedDictionaries: Record<string, Record<string, string>>;
  dictionary: Record<string, string>;
  loadAllDictionariesForAnalysis: () => Promise<Record<Locale, Record<string, string>>>;
  runValidationReport: () => Promise<ValidationReport>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// In-memory cache for loaded translation dictionaries
const dictionaryCache: Record<string, Record<string, string>> = translations;

// Tracks keys invoked by components during runtime
const runtimeKeySet = new Set<string>();

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // 1. Try URL path first (Highest priority for SEO!)
    if (typeof window !== 'undefined') {
      const { locale: urlLocale } = extractLocaleAndPath(window.location.pathname);
      if (urlLocale && urlLocale !== 'en') {
        return urlLocale;
      }
    }
    // 2. Try LocalStorage next
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-locale');
      if (saved && (SUPPORTED_LOCALES as string[]).includes(saved)) {
        return saved as Locale;
      }
    }
    // Do NOT automatically detect browser navigator language. The website must remain 100% English by default.
    // Translation must ONLY happen when the user manually switches the language.
    return 'en';
  });

  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with popstate (e.g. browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const { locale: urlLocale } = extractLocaleAndPath(window.location.pathname);
      if (urlLocale && urlLocale !== locale) {
        setLocaleState(urlLocale);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [locale]);

  // Synchronously load translation dictionary when locale changes
  useEffect(() => {
    setIsLoading(true);
    const dict = translations[locale] || {};
    setDictionary(dict);
    setIsLoading(false);
  }, [locale]);

  const changeLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);

    // Update the URL path prefix dynamically to support /locale/...
    const { cleanPath } = extractLocaleAndPath(window.location.pathname);
    const newPath = newLocale === 'en' ? cleanPath : `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
    
    window.history.pushState({}, '', newPath);
    // Dispatch popstate so router syncs path immediately
    window.dispatchEvent(new Event('popstate'));
  };

  /**
   * Enterprise-grade Translation Function t() with ICU Support, key tracking
   */
  const t = (key: TKey, defaultText?: string, values?: ICUValues): React.ReactNode => {
    // Collect keys used during active session without triggering state re-renders
    if (!runtimeKeySet.has(key)) {
      runtimeKeySet.add(key);
    }
    
    try {
      // Try to get message from current active locale dictionary
      let message = dictionary[key];

      // If not found, and active locale is not English, look up in English dictionary as fallback
      if (message === undefined || message === null) {
        message = enDictionary[key];
      }

      // Determine fallback text to use
      const textToUse = message !== undefined && message !== null ? String(message) : (defaultText || key);

      if (shouldSkipTranslation(textToUse)) {
        return formatICU(textToUse, values, locale);
      }

      return formatICU(textToUse, values, locale);
    } catch (err) {
      console.warn(`[i18n] Error translating or formatting key "${key}":`, err);
      return defaultText || key;
    }
  };

  // Formatters with current active locale
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    try {
      return formatters.formatDate(date, locale, options);
    } catch (e) {
      console.warn('[i18n] formatDate fallback:', e);
      return String(date);
    }
  };

  const formatTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    try {
      return formatters.formatTime(date, locale, options);
    } catch (e) {
      console.warn('[i18n] formatTime fallback:', e);
      return String(date);
    }
  };

  const formatNumber = (value: number | string, options?: Intl.NumberFormatOptions) => {
    try {
      return formatters.formatNumber(value, locale, options);
    } catch (e) {
      console.warn('[i18n] formatNumber fallback:', e);
      return String(value);
    }
  };

  const formatPercent = (value: number | string, decimalPlaces?: number) => {
    try {
      return formatters.formatPercent(value, locale, decimalPlaces);
    } catch (e) {
      console.warn('[i18n] formatPercent fallback:', e);
      return String(value);
    }
  };

  const formatCurrency = (value: number | string, currency?: string, options?: Intl.NumberFormatOptions) => {
    try {
      return formatters.formatCurrency(value, currency, locale, options);
    } catch (e) {
      console.warn('[i18n] formatCurrency fallback:', e);
      return String(value);
    }
  };

  const formatRelativeTime = (value: number, unit?: Intl.RelativeTimeFormatUnit) => {
    try {
      return formatters.formatRelativeTime(value, unit, locale);
    } catch (e) {
      console.warn('[i18n] formatRelativeTime fallback:', e);
      return String(value);
    }
  };

  const getRelativeTimeString = (date: Date | string | number) => {
    try {
      return formatters.getRelativeTimeString(date, locale);
    } catch (e) {
      console.warn('[i18n] getRelativeTimeString fallback:', e);
      return String(date);
    }
  };

  /**
   * Loads all supported dictionaries directly from individual imports.
   */
  const loadAllDictionariesForAnalysis = async (): Promise<Record<Locale, Record<string, string>>> => {
    return translations as Record<Locale, Record<string, string>>;
  };

  /**
   * Generates a fully calculated diagnostic report for the entire translation platform
   */
  const runValidationReport = async (): Promise<ValidationReport> => {
    const allDicts = await loadAllDictionariesForAnalysis();
    return generateFullReport(allDicts, 'en');
  };

  // Generate and log a beautiful translation coverage report on startup
  useEffect(() => {
    const logCoverageReport = async () => {
      try {
        const report = await runValidationReport();
        console.group('%c📊 FREE QR GENERATOR - I18N COVERAGE REPORT', 'color: #6366f1; font-weight: bold; font-size: 13px; padding: 4px;');
        console.log(`%cTimestamp: %c${report.timestamp}`, 'color: #94a3b8; font-weight: bold;', 'color: #0f172a;');
        console.log(`%cGlobal Coverage Percentage: %c${report.overallCoverage}%`, 'color: #94a3b8; font-weight: bold;', 'color: #10b981; font-weight: bold;');
        
        Object.entries(report.reports).forEach(([loc, r]) => {
          const rep = r as LocaleReport;
          const missingCount = rep.missingKeys.length;
          const duplicateCount = rep.issues.filter(i => i.type === 'duplicate_value').length;
          const pctColor = rep.coveragePercentage === 100 ? 'color: #10b981; font-weight: bold;' : 'color: #6366f1; font-weight: bold;';
          
          console.groupCollapsed(`%cLocale: %c${loc.toUpperCase()} %c(${rep.coveragePercentage}%)`, 'color: #475569; font-weight: bold;', 'color: #0f172a; font-weight: bold;', pctColor);
          console.log(`%cTotal Keys Expected: %c${rep.totalKeys}`, 'color: #64748b;', 'color: #334155; font-weight: bold;');
          console.log(`%cTranslated Keys: %c${rep.translatedKeys}`, 'color: #64748b;', 'color: #10b981; font-weight: bold;');
          console.log(`%cMissing Keys count: %c${missingCount}`, 'color: #64748b;', missingCount > 0 ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;');
          if (missingCount > 0) {
            console.log('%cMissing Keys List:', 'color: #ef4444; font-weight: bold;', rep.missingKeys);
          }
          console.log(`%cDuplicate Values/Keys count: %c${duplicateCount}`, 'color: #64748b;', duplicateCount > 0 ? 'color: #f59e0b; font-weight: bold;' : 'color: #10b981;');
          console.groupEnd();
        });
        console.groupEnd();
      } catch (err) {
        console.warn('Could not generate automatic startup i18n report:', err);
      }
    };
    // Let the provider fully load before running analysis to avoid stalling initial render
    const timer = setTimeout(logCoverageReport, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <I18nContext.Provider
      value={{
        locale,
        changeLocale,
        t,
        isLoading,
        formatDate,
        formatTime,
        formatNumber,
        formatPercent,
        formatCurrency,
        formatRelativeTime,
        getRelativeTimeString,
        requestedKeys: Array.from(runtimeKeySet),
        loadedDictionaries: dictionaryCache,
        dictionary,
        loadAllDictionariesForAnalysis,
        runValidationReport,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export function useDocumentLanguage() {
  const { locale } = useTranslation();

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      
      // Directly and synchronously update the HTML language to match exactly the user selected locale.
      html.setAttribute('lang', locale);
      
      // Keep the overall document structure and layouts strictly in LTR direction to prevent breaking headers,
      // footers, branding, navigation, icons, logos, and QR code widgets.
      html.setAttribute('dir', 'ltr');
      
      if (isRtlLocale(locale)) {
        html.classList.add('rtl-active');
      } else {
        html.classList.remove('rtl-active');
      }
    }
  }, [locale]);
}
