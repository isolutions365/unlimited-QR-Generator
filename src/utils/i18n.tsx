import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, SUPPORTED_LOCALES, extractLocaleAndPath, isRtlLocale } from './translations';
import { formatICU, ICUValues } from './icuFormatter';
import * as formatters from './localeFormatter';
import { EXPECTED_KEYS, validateLocaleDictionary, LocaleReport, generateFullReport, ValidationReport } from './i18nValidator';

// Type-safe translation keys derived from expected keys
export type TKey = typeof EXPECTED_KEYS[number] | (string & {});

interface I18nContextType {
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
  t: (key: TKey, defaultText: string, values?: ICUValues) => React.ReactNode;
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
  loadAllDictionariesForAnalysis: () => Promise<Record<Locale, Record<string, string>>>;
  runValidationReport: () => Promise<ValidationReport>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// In-memory cache for loaded translation dictionaries
const dictionaryCache: Record<string, Record<string, string>> = {
  en: {}, // English falls back directly to the in-code default text
};

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
    // 3. Try browser navigator languages
    if (typeof navigator !== 'undefined' && navigator.languages) {
      for (const lang of navigator.languages) {
        const cleanL = lang.split('-')[0] as Locale;
        if ((SUPPORTED_LOCALES as string[]).includes(cleanL)) {
          return cleanL;
        }
      }
    }
    return 'en';
  });

  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [keysTracked, setKeysTracked] = useState<string[]>([]);

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

  // Lazy-load translation dictionary when locale changes with caching
  useEffect(() => {
    if (locale === 'en') {
      setDictionary({});
      return;
    }

    // Try in-memory cache first
    if (dictionaryCache[locale]) {
      setDictionary(dictionaryCache[locale]);
      return;
    }

    // Try Session Storage cache to reduce redundant network transfers
    try {
      const cached = sessionStorage.getItem(`i18n-cache-${locale}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        dictionaryCache[locale] = parsed;
        setDictionary(parsed);
        return;
      }
    } catch (_) {}

    setIsLoading(true);
    // Dynamically load translation JSON file
    import(`../locales/${locale}.json`)
      .then((module) => {
        const dict = module.default || module;
        dictionaryCache[locale] = dict;
        
        // Save to session storage cache
        try {
          sessionStorage.setItem(`i18n-cache-${locale}`, JSON.stringify(dict));
        } catch (_) {}

        setDictionary(dict);
      })
      .catch((err) => {
        console.warn(`Could not load translation file for locale: ${locale}`, err);
        // Fallback to empty dictionary so it resolves to defaultText inline
        dictionaryCache[locale] = {};
        setDictionary({});
      })
      .finally(() => {
        setIsLoading(false);
      });
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
   * Enterprise-grade Translation Function t() with ICU Support and key tracking
   */
  const t = (key: TKey, defaultText: string, values?: ICUValues): React.ReactNode => {
    // Collect keys used during active session
    if (!runtimeKeySet.has(key)) {
      runtimeKeySet.add(key);
      // Defer the state update using setTimeout to prevent updating state during render
      setTimeout(() => {
        setKeysTracked(Array.from(runtimeKeySet));
      }, 0);
    }

    const rawMessage = dictionary[key] || defaultText;
    return formatICU(rawMessage, values, locale);
  };

  // Sync HTML attributes (lang and dir) with current locale for RTL/LTR rendering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      html.setAttribute('lang', locale);
      if (isRtlLocale(locale)) {
        html.setAttribute('dir', 'rtl');
        html.classList.add('rtl-active');
      } else {
        html.setAttribute('dir', 'ltr');
        html.classList.remove('rtl-active');
      }
    }
  }, [locale]);

  // Formatters with current active locale
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
    formatters.formatDate(date, locale, options);

  const formatTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
    formatters.formatTime(date, locale, options);

  const formatNumber = (value: number | string, options?: Intl.NumberFormatOptions) =>
    formatters.formatNumber(value, locale, options);

  const formatPercent = (value: number | string, decimalPlaces?: number) =>
    formatters.formatPercent(value, locale, decimalPlaces);

  const formatCurrency = (value: number | string, currency?: string, options?: Intl.NumberFormatOptions) =>
    formatters.formatCurrency(value, currency, locale, options);

  const formatRelativeTime = (value: number, unit?: Intl.RelativeTimeFormatUnit) =>
    formatters.formatRelativeTime(value, unit, locale);

  const getRelativeTimeString = (date: Date | string | number) =>
    formatters.getRelativeTimeString(date, locale);

  /**
   * Dynamically loads all supported dictionaries.
   * Crucial for background diagnostics and validation auditing without manual user navigation.
   */
  const loadAllDictionariesForAnalysis = async (): Promise<Record<Locale, Record<string, string>>> => {
    const allDicts: Record<Locale, Record<string, string>> = {} as any;
    
    await Promise.all(
      SUPPORTED_LOCALES.map(async (l) => {
        if (l === 'en') {
          allDicts[l] = {};
          return;
        }
        if (dictionaryCache[l]) {
          allDicts[l] = dictionaryCache[l];
          return;
        }
        try {
          const mod = await import(`../locales/${l}.json`);
          const dict = mod.default || mod;
          dictionaryCache[l] = dict;
          allDicts[l] = dict;
        } catch (_) {
          allDicts[l] = {};
        }
      })
    );

    return allDicts;
  };

  /**
   * Generates a fully calculated diagnostic report for the entire translation platform
   */
  const runValidationReport = async (): Promise<ValidationReport> => {
    const allDicts = await loadAllDictionariesForAnalysis();
    return generateFullReport(allDicts, 'en');
  };

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
        requestedKeys: keysTracked,
        loadedDictionaries: dictionaryCache,
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
