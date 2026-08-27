/**
 * High-performance, lightweight, locale-aware data formatting engine.
 * Wraps browser Intl APIs with fallback mechanisms to ensure perfect rendering.
 */

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {}
export interface NumberFormatOptions extends Intl.NumberFormatOptions {}

/**
 * Format dates beautifully based on locale
 */
export function formatDate(
  date: Date | string | number,
  locale: string = 'en',
  options: DateFormatOptions = { dateStyle: 'medium' }
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch (error) {
    console.warn('formatDate failed', error);
    return String(date);
  }
}

/**
 * Format times beautifully based on locale
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'en',
  options: DateFormatOptions = { timeStyle: 'short' }
): string {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch (error) {
    console.warn('formatTime failed', error);
    return String(date);
  }
}

/**
 * Format general numbers
 */
export function formatNumber(
  value: number | string,
  locale: string = 'en',
  options: NumberFormatOptions = {}
): string {
  try {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(n)) return String(value);
    return new Intl.NumberFormat(locale, options).format(n);
  } catch (error) {
    console.warn('formatNumber failed', error);
    return String(value);
  }
}

/**
 * Format percentages (e.g. 0.85 -> 85%)
 */
export function formatPercent(
  value: number | string,
  locale: string = 'en',
  decimalPlaces: number = 0
): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Format currency amounts properly
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en',
  options: NumberFormatOptions = {}
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
    ...options,
  });
}

/**
 * Format relative timestamps (e.g. "3 hours ago", "in 2 days")
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit = 'day',
  locale: string = 'en',
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' }
): string {
  try {
    return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
  } catch (error) {
    console.warn('formatRelativeTime failed', error);
    return `${value} ${unit}s`;
  }
}

/**
 * Utility to calculate the relative time from a date to now
 */
export function getRelativeTimeString(
  date: Date | string | number,
  locale: string = 'en'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInSecs = Math.round(diffInMs / 1000);
  
  const absSecs = Math.abs(diffInSecs);
  
  if (absSecs < 60) {
    return formatRelativeTime(diffInSecs, 'second', locale);
  }
  
  const diffInMins = Math.round(diffInSecs / 60);
  const absMins = Math.abs(diffInMins);
  if (absMins < 60) {
    return formatRelativeTime(diffInMins, 'minute', locale);
  }
  
  const diffInHours = Math.round(diffInMins / 60);
  const absHours = Math.abs(diffInHours);
  if (absHours < 24) {
    return formatRelativeTime(diffInHours, 'hour', locale);
  }
  
  const diffInDays = Math.round(diffInHours / 24);
  const absDays = Math.abs(diffInDays);
  if (absDays < 30) {
    return formatRelativeTime(diffInDays, 'day', locale);
  }
  
  const diffInMonths = Math.round(diffInDays / 30);
  const absMonths = Math.abs(diffInMonths);
  if (absMonths < 12) {
    return formatRelativeTime(diffInMonths, 'month', locale);
  }
  
  const diffInYears = Math.round(diffInMonths / 12);
  return formatRelativeTime(diffInYears, 'year', locale);
}

/**
 * Format physical or pixel dimensions localized (e.g. "1,000 × 1,000 px" or "100 × 100 mm")
 */
export function formatDimensions(
  width: number,
  height: number,
  unit: string = 'px',
  locale: string = 'en'
): string {
  try {
    const formattedWidth = formatNumber(width, locale);
    const formattedHeight = formatNumber(height, locale);
    return `${formattedWidth} × ${formattedHeight} ${unit}`;
  } catch (error) {
    console.warn('formatDimensions failed', error);
    return `${width} × ${height} ${unit}`;
  }
}

/**
 * Format file size with Intl.NumberFormat according to active locale (e.g. "2.5 MB", "500 KB")
 */
export function formatFileSize(
  bytes: number,
  locale: string = 'en'
): string {
  try {
    if (bytes === 0) return `0 B`;
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    const formattedVal = formatNumber(val, locale, { maximumFractionDigits: 1 });
    return `${formattedVal} ${sizes[i]}`;
  } catch (error) {
    console.warn('formatFileSize failed', error);
    return `${bytes} B`;
  }
}

/**
 * Format date labels into clean localized strings
 */
export function formatDateLabel(
  date: Date | string | number,
  locale: string = 'en',
  style: 'short' | 'medium' | 'full' = 'medium'
): string {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  };
  return formatDate(date, locale, optionsMap[style] || optionsMap.medium);
}

