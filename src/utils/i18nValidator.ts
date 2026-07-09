import { Locale, SUPPORTED_LOCALES } from './translations';

// Master registry of keys expected across the application
export const EXPECTED_KEYS = [
  // Authentication Modal
  'auth.nameRequired',
  'auth.failed',
  'auth.secureCloudShield',
  'auth.welcomeBack',
  'auth.createAccount',
  'auth.signInDesc',
  'auth.signUpDesc',
  'auth.signInTab',
  'auth.signUpTab',
  'auth.fullName',
  'auth.emailAddress',
  'auth.securePassword',
  'auth.signInButton',
  'auth.signUpButton',
  'auth.storageInfo',

  // Tour Modal
  'tour.welcomeTitle',
  'tour.welcomeSubtitle',
  'tour.welcomeBody',
  'tour.highlight1Title',
  'tour.highlight1Desc',
  'tour.highlight2Title',
  'tour.highlight2Desc',
  'tour.highlight3Title',
  'tour.highlight3Desc',
  'tour.maybeLater',
  'tour.startTour',

  // Shortcuts Help
  'shortcuts.title',
  'shortcuts.subtitle',
  'shortcuts.save',
  'shortcuts.saveDesc',
  'shortcuts.download',
  'shortcuts.downloadDesc',
  'shortcuts.print',
  'shortcuts.printDesc',
  'shortcuts.openHelp',
  'shortcuts.openHelpDesc',
  'shortcuts.close',
  'shortcuts.closeDesc',
  'shortcuts.disabledNote',

  // Co-Pilot
  'copilot.paletteApplied',
  'copilot.styleApplied',
  'copilot.brandMatchApplied',
  'copilot.layoutOptimized',
  'copilot.optimizerFallback',
  'copilot.title',
  'copilot.subtitle',
  'copilot.modelActive',
  'copilot.tab.audit',
  'copilot.tab.colors',
  'copilot.tab.styles',
  'copilot.tab.brand',
  'copilot.scannabilityTitle',
  'copilot.auditingLive',
  'copilot.optimizeButton',
  'copilot.optReport',
  'copilot.label.industry',
  'copilot.label.vibe',
  'copilot.generateVibe',
  'copilot.recommendation',
  'copilot.applyPalette',
  'copilot.label.aesthetic',
  'copilot.synthesizeAesthetics',
  'copilot.style.corners',
  'copilot.style.dots',
  'copilot.applyLayoutStyles',
  'copilot.label.brandName',
  'copilot.label.brandDesc',
  'copilot.brandAudit',
  'copilot.brandNotes',
  'copilot.applyBrandPackage',

  // Workspace Nav & General UI
  'nav.creativeStation',
  'nav.freeQrTools',
  'nav.designStudio',
  'nav.faqTitle',
  'nav.blogTitle',
  'nav.signIn',
  'nav.signOut',
  'nav.terms',
  'nav.privacy',
  'nav.templatesHub',
  'nav.solutionsDir',
  'nav.industriesDir',
  'nav.useCasesDir',
  'nav.comparisonsDir',
  'nav.scanAnalytics',
  'nav.selectLanguage',
  'nav.connectAccount',
  'nav.templates',
  'nav.solutions',
  'nav.industries',
  'nav.useCases',
  'nav.comparisons',
  'nav.tour',
  'nav.shortcuts',
  'nav.creativeStationTab',
  'nav.templatesTab',
  'nav.analyticsTab',
  'nav.mobilePackagesTab',
  'nav.animationsTab',
  'ui.back',
  'ui.save',
  'ui.cancel',
  'ui.success',
  'ui.loading',
  'ui.systemAlert',
];

export interface ValidationIssue {
  key: string;
  type: 'missing' | 'unused' | 'duplicate_value' | 'broken_bracket' | 'broken_icu';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export interface LocaleReport {
  locale: Locale;
  coveragePercentage: number;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  unusedKeys: string[];
  issues: ValidationIssue[];
}

export interface ValidationReport {
  timestamp: string;
  overallCoverage: number;
  reports: Record<Locale, LocaleReport>;
}

/**
 * Validates a single translation dictionary against the EXPECTED_KEYS list
 */
export function validateLocaleDictionary(
  locale: Locale,
  dictionary: Record<string, string>,
  defaultDictionary: Record<string, string> = {}
): LocaleReport {
  const issues: ValidationIssue[] = [];
  const missingKeys: string[] = [];
  const unusedKeys: string[] = [];
  
  const dictKeys = Object.keys(dictionary);
  
  // 1. Detect Missing Keys
  EXPECTED_KEYS.forEach((key) => {
    if (!dictionary[key]) {
      missingKeys.push(key);
      issues.push({
        key,
        type: 'missing',
        severity: 'error',
        message: `Key "${key}" is missing in [${locale.toUpperCase()}] dictionary.`,
      });
    }
  });

  // 2. Detect Unused Keys
  dictKeys.forEach((key) => {
    if (!EXPECTED_KEYS.includes(key)) {
      unusedKeys.push(key);
      issues.push({
        key,
        type: 'unused',
        severity: 'warning',
        message: `Key "${key}" exists in [${locale.toUpperCase()}] dictionary but is unused by the application.`,
      });
    }
  });

  // 3. Detect Duplicate Values (meaning accidental copy-paste or untranslated content)
  const valueMap = new Map<string, string[]>();
  dictKeys.forEach((key) => {
    const val = dictionary[key];
    if (val && val.length > 2) {
      if (!valueMap.has(val)) {
        valueMap.set(val, []);
      }
      valueMap.get(val)!.push(key);
    }
  });

  valueMap.forEach((keys, value) => {
    if (keys.length > 1) {
      keys.forEach((key) => {
        issues.push({
          key,
          type: 'duplicate_value',
          severity: 'info',
          message: `Key "${key}" has identical translation value "${value}" as keys: ${keys.filter(k => k !== key).join(', ')}.`,
        });
      });
    }
  });

  // 4. Detect Broken ICU & Bracket Mismatches
  dictKeys.forEach((key) => {
    const value = dictionary[key];
    if (typeof value !== 'string') return;

    // Check bracket matching
    const openBraces = (value.match(/\{/g) || []).length;
    const closeBraces = (value.match(/\}/g) || []).length;
    const openTags = (value.match(/</g) || []).length;
    const closeTags = (value.match(/>/g) || []).length;

    if (openBraces !== closeBraces) {
      issues.push({
        key,
        type: 'broken_bracket',
        severity: 'error',
        message: `Mismatched braces in [${locale.toUpperCase()}]: found ${openBraces} '{' and ${closeBraces} '}'.`,
        details: value,
      });
    }

    if (openTags !== closeTags) {
      issues.push({
        key,
        type: 'broken_bracket',
        severity: 'error',
        message: `Mismatched HTML-style tags in [${locale.toUpperCase()}]: found ${openTags} '<' and ${closeTags} '>'.`,
        details: value,
      });
    }

    // Compare ICU variables with Default (English) if provided
    const defaultVal = defaultDictionary[key];
    if (defaultVal) {
      const getVars = (str: string) => {
        const matches = str.match(/\{([a-zA-Z0-9_]+)/g);
        return matches ? matches.map(m => m.slice(1)) : [];
      };

      const defaultVars = getVars(defaultVal);
      const localeVars = getVars(value);

      const missingVars = defaultVars.filter(v => !localeVars.includes(v) && v !== 'plural' && v !== 'select');
      if (missingVars.length > 0) {
        issues.push({
          key,
          type: 'broken_icu',
          severity: 'error',
          message: `ICU variable mismatch in [${locale.toUpperCase()}]: Missing variables {${missingVars.join(', ')}} from source default.`,
          details: `Source: "${defaultVal}" | Translated: "${value}"`,
        });
      }
    }
  });

  const totalKeys = EXPECTED_KEYS.length;
  const translatedKeys = EXPECTED_KEYS.length - missingKeys.length;
  const coveragePercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 100;

  return {
    locale,
    coveragePercentage,
    totalKeys,
    translatedKeys,
    missingKeys,
    unusedKeys,
    issues,
  };
}

/**
 * Generates an overall report for all supported locales
 */
export function generateFullReport(
  dictionaries: Record<Locale, Record<string, string>>,
  defaultLocale: Locale = 'en'
): ValidationReport {
  const reports: Record<Locale, LocaleReport> = {} as any;
  const defaultDict = dictionaries[defaultLocale] || {};
  
  let totalCoverageSum = 0;
  
  SUPPORTED_LOCALES.forEach((locale) => {
    const dict = dictionaries[locale] || {};
    const report = validateLocaleDictionary(locale, dict, defaultDict);
    reports[locale] = report;
    totalCoverageSum += report.coveragePercentage;
  });

  const overallCoverage = Math.round(totalCoverageSum / SUPPORTED_LOCALES.length);

  return {
    timestamp: new Date().toISOString(),
    overallCoverage,
    reports,
  };
}
