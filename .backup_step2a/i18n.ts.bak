import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { SUPPORTED_LOCALES } from './utils/translations';
import * as formatters from './utils/localeFormatter';

import en from './locales/en.json';
import ar from './locales/ar.json';
import ur from './locales/ur.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  ur: { translation: ur },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  pt: { translation: pt },
  it: { translation: it },
  tr: { translation: tr },
  id: { translation: id },
  hi: { translation: hi },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LOCALES as string[],
    detection: {
      order: ['path', 'querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'app-locale',
      lookupCookie: 'i18next',
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already safe against XSS
    },
    react: {
      useSuspense: false,
    },
  });

export { i18n };
export default i18n;

// Formats & Numbers Localization Helpers using Intl APIs
export const formatNumber = (
  value: number | string,
  options?: Intl.NumberFormatOptions,
  locale: string = i18n.language || 'en'
): string => {
  return formatters.formatNumber(value, locale, options);
};

export const formatDimensions = (
  width: number,
  height: number,
  unit: string = 'px',
  locale: string = i18n.language || 'en'
): string => {
  return formatters.formatDimensions(width, height, unit, locale);
};

export const formatFileSize = (
  bytes: number,
  locale: string = i18n.language || 'en'
): string => {
  return formatters.formatFileSize(bytes, locale);
};

export const formatDateLabel = (
  date: Date | string | number,
  style: 'short' | 'medium' | 'full' = 'medium',
  locale: string = i18n.language || 'en'
): string => {
  return formatters.formatDateLabel(date, locale, style);
};
