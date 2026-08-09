import { EXPECTED_KEYS, generateFullReport } from './src/utils/i18nValidator';
import en from './src/locales/en.json';
import ar from './src/locales/ar.json';
import ur from './src/locales/ur.json';
import de from './src/locales/de.json';
import fr from './src/locales/fr.json';
import es from './src/locales/es.json';
import pt from './src/locales/pt.json';
import it from './src/locales/it.json';
import tr from './src/locales/tr.json';
import id from './src/locales/id.json';
import hi from './src/locales/hi.json';
import zh from './src/locales/zh.json';
import ja from './src/locales/ja.json';
import ko from './src/locales/ko.json';

const translations = {
  en, ar, ur, de, fr, es, pt, it, tr, id, hi, zh, ja, ko
};

const report = generateFullReport(translations as any, 'en');

console.log(JSON.stringify({
  overallCoverage: report.overallCoverage,
  locales: Object.entries(report.reports).map(([loc, r]) => ({
    locale: loc,
    coverage: r.coveragePercentage,
    totalKeys: r.totalKeys,
    translatedKeys: r.translatedKeys,
    missingKeysCount: r.missingKeys.length,
    missingKeys: r.missingKeys.slice(0, 15), // slice to keep output clean but representative
    duplicateValuesCount: r.issues.filter(i => i.type === 'duplicate_value').length,
    mismatchedVariablesCount: r.issues.filter(i => i.type === 'broken_icu').length,
    mismatchedVariables: r.issues.filter(i => i.type === 'broken_icu').slice(0, 10)
  }))
}, null, 2));
