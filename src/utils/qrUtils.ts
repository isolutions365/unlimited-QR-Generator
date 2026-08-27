/**
 * QR & Barcode Generator Utilities
 * Validation, formatting, standard specs (vCard 3.0, Wi-Fi, URL auto-prepend),
 * logo safety validation, high-DPI scaling, and clipboard export helpers.
 */

export type QRType = 'url' | 'wifi' | 'vcard' | 'email' | 'text' | 'sms' | 'whatsapp';

export interface URLData {
  url: string;
}

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface TextData {
  text: string;
}

export interface SMSData {
  phone: string;
  message?: string;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface ValidationResult {
  formattedContent: string;
  isValid: boolean;
  error?: string;
  recommendedECC: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Validates and formats URL input.
 * Auto-prepends 'https://' if missing scheme.
 */
export function formatAndValidateURL(rawUrl: string): { formatted: string; isValid: boolean; error?: string } {
  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return { formatted: '', isValid: false, error: 'URL is required' };
  }

  // Auto-prepend https:// if protocol missing
  if (!/^https?:\/\//i.test(trimmed) && !/^[a-z]+:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Ensure domain has at least one dot or localhost
    if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      return { formatted: trimmed, isValid: false, error: 'Please enter a valid domain name (e.g. example.com)' };
    }
    return { formatted: parsed.href, isValid: true };
  } catch {
    return { formatted: trimmed, isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Formats Wi-Fi credentials into standard MECARD/WIFI format:
 * WIFI:S:<SSID>;T:<TYPE>;P:<PASSWORD>;H:<HIDDEN>;;
 */
export function formatAndValidateWifi(data: WifiData): { formatted: string; isValid: boolean; error?: string } {
  const ssid = (data.ssid || '').trim();
  if (!ssid) {
    return { formatted: '', isValid: false, error: 'Wi-Fi Network Name (SSID) is required' };
  }

  // Escape special characters in SSID and Password
  const escapeWifiStr = (str: string) => str.replace(/([\\;:,"])/g, '\\$1');

  const escapedSsid = escapeWifiStr(ssid);
  const encryption = data.encryption || 'WPA';
  const password = data.password || '';
  const hidden = data.hidden ? 'true' : 'false';

  if (encryption !== 'nopass' && !password) {
    return { formatted: '', isValid: false, error: 'Password is required for encrypted networks' };
  }

  const escapedPass = encryption !== 'nopass' ? escapeWifiStr(password) : '';
  const formatted = `WIFI:S:${escapedSsid};T:${encryption};P:${escapedPass};H:${hidden};;`;

  return { formatted, isValid: true };
}

/**
 * Formats contact details into official vCard 3.0 standard specification.
 */
export function formatAndValidateVCard(data: VCardData): { formatted: string; isValid: boolean; error?: string } {
  const firstName = (data.firstName || '').trim();
  const lastName = (data.lastName || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();

  if (!firstName && !lastName && !data.organization) {
    return { formatted: '', isValid: false, error: 'At least First Name, Last Name, or Organization is required' };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { formatted: '', isValid: false, error: 'Invalid email address in vCard' };
  }

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${[firstName, lastName].filter(Boolean).join(' ')}`
  ];

  if (data.organization) lines.push(`ORG:${data.organization.trim()}`);
  if (data.title) lines.push(`TITLE:${data.title.trim()}`);
  if (phone) lines.push(`TEL;TYPE=CELL,VOICE:${phone}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${email}`);
  if (data.website) {
    const urlRes = formatAndValidateURL(data.website);
    if (urlRes.isValid) lines.push(`URL:${urlRes.formatted}`);
  }
  if (data.address) lines.push(`ADR;TYPE=WORK:;;${data.address.trim()};;;;`);

  lines.push('END:VCARD');
  return { formatted: lines.join('\n'), isValid: true };
}

/**
 * Formats Email into mailto: standard link
 */
export function formatAndValidateEmail(data: EmailData): { formatted: string; isValid: boolean; error?: string } {
  const email = (data.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { formatted: '', isValid: false, error: 'Valid email address is required' };
  }

  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return { formatted: `mailto:${email}${query}`, isValid: true };
}

/**
 * Formats SMS string: smsto:<phone>:<message>
 */
export function formatAndValidateSMS(data: SMSData): { formatted: string; isValid: boolean; error?: string } {
  const phone = (data.phone || '').trim();
  if (!phone) {
    return { formatted: '', isValid: false, error: 'Phone number is required' };
  }
  const message = data.message || '';
  return { formatted: `smsto:${phone}:${message}`, isValid: true };
}

/**
 * Formats WhatsApp direct click link: https://wa.me/<phone>?text=<encoded_message>
 */
export function formatAndValidateWhatsApp(data: WhatsAppData): { formatted: string; isValid: boolean; error?: string } {
  const cleanPhone = (data.phone || '').replace(/[^0-9+]/g, '');
  if (!cleanPhone) {
    return { formatted: '', isValid: false, error: 'WhatsApp phone number is required (with country code)' };
  }
  const text = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
  return { formatted: `https://wa.me/${cleanPhone.replace('+', '')}${text}`, isValid: true };
}

/**
 * Logo validation: Max 2MB, accepts .png, .jpg, .jpeg, .svg
 */
export function validateLogoFile(file: File): { isValid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

  if (file.size > MAX_SIZE_BYTES) {
    return { isValid: false, error: 'Logo image size must be under 2MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Only PNG, JPG, and SVG file formats are supported' };
  }

  return { isValid: true };
}

/**
 * Converts a Blob or File to a Base64 Data URL string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Copies a canvas element's rendered image directly to the system clipboard as PNG
 */
export async function copyCanvasImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard API not supported in this browser environment');
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
    if (!blob) throw new Error('Failed to create image blob from canvas');

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (err) {
    console.warn('Canvas clipboard copy failed:', err);
    return false;
  }
}

/**
 * Copies plain text or data links to clipboard with fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older environments
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.warn('Text clipboard copy failed:', err);
    return false;
  }
}

/**
 * Calculates high-DPI canvas dimensions based on resolution scale factor:
 * 1x = 450px (Standard screen)
 * 2x = 900px (HD Retina)
 * 4x = 1800px (HD Vector Print Quality)
 */
export function getScaledDimensions(baseSize: number = 450, scaleFactor: 1 | 2 | 4 = 1): number {
  return baseSize * scaleFactor;
}
