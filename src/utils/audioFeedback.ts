export interface SoundSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0 (Master volume)
  scanVolume: number; // 0.0 to 1.0 (Scan alerts volume)
  saveVolume: number; // 0.0 to 1.0 (Save actions volume)
  soundType: 'beep' | 'chime' | 'ping' | 'pop';
  playOnGenerate: boolean;
  playOnTestScan: boolean;
}

const STORAGE_KEY = 'freeqr_sound_settings_v1';

export const getDefaultSoundSettings = (): SoundSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const masterVol = typeof parsed.soundVolume === 'number' ? parsed.soundVolume : 0.4;
      return {
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        soundVolume: masterVol,
        scanVolume: typeof parsed.scanVolume === 'number' ? parsed.scanVolume : masterVol,
        saveVolume: typeof parsed.saveVolume === 'number' ? parsed.saveVolume : masterVol,
        soundType: ['beep', 'chime', 'ping', 'pop'].includes(parsed.soundType) ? parsed.soundType : 'chime',
        playOnGenerate: typeof parsed.playOnGenerate === 'boolean' ? parsed.playOnGenerate : true,
        playOnTestScan: typeof parsed.playOnTestScan === 'boolean' ? parsed.playOnTestScan : true,
      };
    }
  } catch (e) {
    // Ignore storage errors
  }
  return {
    soundEnabled: true,
    soundVolume: 0.4,
    scanVolume: 0.4,
    saveVolume: 0.4,
    soundType: 'chime',
    playOnGenerate: true,
    playOnTestScan: true,
  };
};

export const saveSoundSettings = (settings: SoundSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Synthesize audio feedback tones using Web Audio API
 */
export const playAudioSound = (
  action: 'generate' | 'test_scan' | 'preview',
  customSettings?: SoundSettings
) => {
  const settings = customSettings || getDefaultSoundSettings();
  if (!settings.soundEnabled) return;

  if (action === 'generate' && !settings.playOnGenerate && !customSettings) return;
  if (action === 'test_scan' && !settings.playOnTestScan && !customSettings) return;

  // Granular volume control selection
  let targetVol = settings.soundVolume;
  if (action === 'test_scan') {
    targetVol = typeof settings.scanVolume === 'number' ? settings.scanVolume : settings.soundVolume;
  } else if (action === 'generate') {
    targetVol = typeof settings.saveVolume === 'number' ? settings.saveVolume : settings.soundVolume;
  }

  if (targetVol <= 0) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const vol = Math.min(Math.max(targetVol, 0), 1);

    if (action === 'test_scan' || settings.soundType === 'ping') {
      // Crisp success ping tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (settings.soundType === 'chime' || action === 'generate') {
      // Dual-tone ascending chime (C5 to G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5 principal
      osc2.frequency.setValueAtTime(783.99, now + 0.07); // G5 chime accent

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.start(now);
      osc2.start(now + 0.07);
      osc1.stop(now + 0.28);
      osc2.stop(now + 0.38);
    } else if (settings.soundType === 'pop') {
      // Soft tactile pop tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.04);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.22, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      // Standard clean 'beep' tone (650Hz with swift pitch boost)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.setValueAtTime(1046.5, now + 0.05); // C6
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol * 0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  } catch (err) {
    console.warn('[AudioFeedback] Sound blocked by browser policy or audio context error:', err);
  }
};
