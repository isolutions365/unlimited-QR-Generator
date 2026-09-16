export interface ScanNotificationSettings {
  /** Master toggle for real-time scan toasts */
  enabled: boolean;
  /** Whether Do Not Disturb is active */
  dndEnabled: boolean;
  /** Start time of DND in HH:mm (24-hour format), e.g. "22:00" */
  dndStart: string;
  /** End time of DND in HH:mm (24-hour format), e.g. "07:00" */
  dndEnd: string;
  /** Sound chime on new scan */
  soundEnabled: boolean;
}

const STORAGE_KEY = 'freeqr_scan_notification_settings_v1';

export const getDefaultScanNotificationSettings = (): ScanNotificationSettings => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
          dndEnabled: typeof parsed.dndEnabled === 'boolean' ? parsed.dndEnabled : false,
          dndStart: typeof parsed.dndStart === 'string' && parsed.dndStart ? parsed.dndStart : '22:00',
          dndEnd: typeof parsed.dndEnd === 'string' && parsed.dndEnd ? parsed.dndEnd : '07:00',
          soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        };
      }
    }
  } catch (e) {
    console.warn('[ScanNotificationSettings] Failed to load settings from storage:', e);
  }

  return {
    enabled: true,
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '07:00',
    soundEnabled: true,
  };
};

export const saveScanNotificationSettings = (settings: ScanNotificationSettings): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (e) {
    console.warn('[ScanNotificationSettings] Failed to save settings to storage:', e);
  }
};

/**
 * Checks whether the current local time falls within the configured DND window.
 * Supports cross-midnight windows (e.g. 22:00 to 07:00) and same-day windows (e.g. 13:00 to 15:00).
 */
export const isDNDActiveNow = (settings: ScanNotificationSettings, testDate?: Date): boolean => {
  if (!settings.dndEnabled) return false;

  const now = testDate || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = (settings.dndStart || '22:00').split(':').map(Number);
  const [endH, endM] = (settings.dndEnd || '07:00').split(':').map(Number);

  const startMinutes = (startH || 0) * 60 + (startM || 0);
  const endMinutes = (endH || 0) * 60 + (endM || 0);

  if (startMinutes === endMinutes) {
    // If start == end and DND is enabled, suppress 24/7
    return true;
  }

  if (startMinutes < endMinutes) {
    // Same-day window (e.g. 09:00 to 17:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight window spanning midnight (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
};
