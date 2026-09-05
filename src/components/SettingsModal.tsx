import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Sliders, Play, Check, Zap, Shield, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { SoundSettings, saveSoundSettings, playAudioSound } from '../utils/audioFeedback';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundSettings: SoundSettings;
  onUpdateSoundSettings: (newSettings: SoundSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  soundSettings,
  onUpdateSoundSettings,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<SoundSettings>(soundSettings);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  // Sync state when modal opens & handle Escape key
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(soundSettings);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, soundSettings, onClose]);

  if (!isOpen) return null;

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      // 1. ServiceWorker unregistration
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear Cache Storage
      if ('caches' in window) {
        const names = await caches.keys();
        for (const name of names) {
          await caches.delete(name);
        }
      }

      // 3. Execute index.html global helper if present
      if (typeof (window as any).clearAppCacheAndSW === 'function') {
        await (window as any).clearAppCacheAndSW();
      }

      setCacheClearedSuccess(true);
      setTimeout(() => setCacheClearedSuccess(false), 5000);
    } catch (err) {
      console.warn('[Cache Clear Error]', err);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleToggleSound = (enabled: boolean) => {
    const updated = { ...localSettings, soundEnabled: enabled };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
    if (enabled) {
      playAudioSound('preview', updated);
    }
  };

  const handleTypeChange = (type: SoundSettings['soundType']) => {
    const updated = { ...localSettings, soundType: type };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
    if (updated.soundEnabled) {
      playAudioSound('preview', updated);
    }
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...localSettings, soundVolume: vol };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
  };

  const handleScanVolumeChange = (vol: number) => {
    const updated = { ...localSettings, scanVolume: vol };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
  };

  const handleSaveVolumeChange = (vol: number) => {
    const updated = { ...localSettings, saveVolume: vol };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
  };

  const handleGenerateToggle = (enabled: boolean) => {
    const updated = { ...localSettings, playOnGenerate: enabled };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
  };

  const handleTestScanToggle = (enabled: boolean) => {
    const updated = { ...localSettings, playOnTestScan: enabled };
    setLocalSettings(updated);
    onUpdateSoundSettings(updated);
    saveSoundSettings(updated);
  };

  const handleTestSound = () => {
    setIsPlayingTest(true);
    playAudioSound('preview', { ...localSettings, soundEnabled: true });
    setTimeout(() => setIsPlayingTest(false), 400);
  };

  const soundTypeOptions: { id: SoundSettings['soundType']; label: string; desc: string }[] = [
    { id: 'chime', label: t('settings.typeChime', 'Harmonic Chime'), desc: t('settings.typeChimeDesc', 'Soft ascending dual-tone chime') },
    { id: 'beep', label: t('settings.typeBeep', 'Classic Beep'), desc: t('settings.typeBeepDesc', 'Crisp dual-frequency scanner beep') },
    { id: 'ping', label: t('settings.typePing', 'High Ping'), desc: t('settings.typePingDesc', 'Short high-pitch frequency ping') },
    { id: 'pop', label: t('settings.typePop', 'Tactile Pop'), desc: t('settings.typePopDesc', 'Subtle tactile bubble pop sound') },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('settings.modalTitle', 'App Preferences & Audio Settings')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('settings.modalSub', 'Configure sound effects for QR generation and test scans')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Main Sound Master Toggle Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              localSettings.soundEnabled
                ? 'bg-indigo-50/40 border-indigo-200/80 shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    localSettings.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {localSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {t('settings.soundToggleTitle', 'Audio Feedback Tones')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {t('settings.soundToggleDesc', 'Play instant audio tones when creating or testing QR codes')}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => handleToggleSound(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Volume Slider & Test Sound Button when enabled */}
              {localSettings.soundEnabled && (
                <div className="mt-4 pt-4 border-t border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{t('settings.volume', 'Volume Level')}</span>
                      <span className="font-mono text-indigo-600">{Math.round(localSettings.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={localSettings.soundVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-indigo-100 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={handleTestSound}
                    disabled={isPlayingTest}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
                  >
                    <Play className={`w-3.5 h-3.5 ${isPlayingTest ? 'animate-bounce' : ''}`} />
                    <span>{t('settings.testSoundBtn', 'Test Sound')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sound Style Picker */}
            {localSettings.soundEnabled && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('settings.selectSoundStyle', 'Audio Tone Style')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {soundTypeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleTypeChange(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        localSettings.soundType === opt.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                        {localSettings.soundType === opt.id && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Event Specific Triggers & Granular Volumes */}
            {localSettings.soundEnabled && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>{t('settings.triggersTitle', 'Trigger Events & Specific Volumes')}</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {t('settings.granularLabel', 'Granular Control')}
                  </span>
                </label>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-4">
                  {/* Scan Alerts Volume & Toggle */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.playOnTestScan}
                          onChange={(e) => handleTestScanToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {t('settings.onTestScanLabel', 'Scan Alerts Sound')}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {localSettings.playOnTestScan ? `${Math.round((localSettings.scanVolume ?? localSettings.soundVolume) * 100)}%` : t('settings.muted', 'Muted')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playAudioSound('test_scan', { ...localSettings, soundEnabled: true, playOnTestScan: true });
                          }}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title={t('settings.testScanSound', 'Test Scan Alert Sound')}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {localSettings.playOnTestScan && (
                      <div className="flex items-center gap-3 pl-6">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={localSettings.scanVolume ?? localSettings.soundVolume}
                          onChange={(e) => handleScanVolumeChange(parseFloat(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200/60" />

                  {/* Save Actions Volume & Toggle */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.playOnGenerate}
                          onChange={(e) => handleGenerateToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {t('settings.onGenerateLabel', 'Save & Generate Actions Sound')}
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {localSettings.playOnGenerate ? `${Math.round((localSettings.saveVolume ?? localSettings.soundVolume) * 100)}%` : t('settings.muted', 'Muted')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            playAudioSound('generate', { ...localSettings, soundEnabled: true, playOnGenerate: true });
                          }}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title={t('settings.testSaveSound', 'Test Save Action Sound')}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {localSettings.playOnGenerate && (
                      <div className="flex items-center gap-3 pl-6">
                        <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={localSettings.saveVolume ?? localSettings.soundVolume}
                          onChange={(e) => handleSaveVolumeChange(parseFloat(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Storage & Cache Management */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('settings.storageTitle', 'Storage & Local Cache')}
              </label>
              <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                      {t('settings.clearCacheTitle', 'Clear Local Cache & Service Worker')}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {t('settings.clearCacheDesc', 'Unregister active service workers and purge cached application bundles.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    disabled={isClearingCache}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isClearingCache ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{isClearingCache ? t('settings.clearing', 'Clearing...') : t('settings.clearCacheBtn', 'Clear Cache')}</span>
                  </button>
                </div>

                {cacheClearedSuccess && (
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('settings.cacheClearedSuccess', 'Cache purged & service worker unregistered successfully!')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('settings.reloadPage', 'Reload')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy / Local Storage Info */}
            <div className="flex items-center gap-2 p-3 bg-slate-100/70 text-slate-600 rounded-xl text-xs">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{t('settings.privacyNote', 'Audio synthesized locally via Web Audio API. Preferences saved to browser storage.')}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {t('settings.done', 'Done')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
