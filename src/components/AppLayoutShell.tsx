import React, { useState } from 'react';
import { usePlatformLayout, PlatformInfo } from '../hooks/usePlatformLayout';
import MobileHeader from './MobileHeader';
import MobileBottomNav, { MobileTabType } from './MobileBottomNav';
import QRScannerModal from './QRScannerModal';
import { UserSession } from '../lib/api';

export interface AppLayoutShellProps {
  /** The standard desktop header component */
  desktopHeader: React.ReactNode;
  /** The standard sub-navigation bar for desktop */
  desktopSubNav?: React.ReactNode;
  /** The primary content for desktop web */
  desktopMainContent: React.ReactNode;
  /** The mobile generator workspace view */
  mobileGeneratorWorkspace?: React.ReactNode;
  /** Mobile tools / landing view */
  mobileToolsWorkspace?: React.ReactNode;
  /** Mobile saved projects view */
  mobileSavedProjectsWorkspace?: React.ReactNode;
  /** Mobile settings / profile workspace */
  mobileSettingsWorkspace?: React.ReactNode;
  /** Desktop footer component */
  desktopFooter?: React.ReactNode;

  /** Active mobile tab state */
  activeMobileTab: MobileTabType;
  /** Callback when mobile bottom tab changes */
  onMobileTabChange: (tab: MobileTabType) => void;
  /** Saved projects count for badge */
  savedProjectsCount?: number;

  /** App handlers */
  user?: UserSession | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  onOpenSettings?: () => void;
  navigateTo: (path: string) => void;
}

export default function AppLayoutShell({
  desktopHeader,
  desktopSubNav,
  desktopMainContent,
  mobileGeneratorWorkspace,
  mobileToolsWorkspace,
  mobileSavedProjectsWorkspace,
  mobileSettingsWorkspace,
  desktopFooter,
  activeMobileTab,
  onMobileTabChange,
  savedProjectsCount = 0,
  user,
  onSignInClick,
  onSignOut,
  onOpenSettings,
  navigateTo
}: AppLayoutShellProps) {
  const platform = usePlatformLayout();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleMobileTabClick = (tab: MobileTabType) => {
    if (tab === 'scanner') {
      setIsScannerOpen(true);
      return;
    }
    if (tab === 'settings' && onOpenSettings) {
      onOpenSettings();
    }
    onMobileTabChange(tab);
  };

  // STRICT SAFETY CONSTRAINT:
  // If in Desktop Web View, render Desktop Header, SubNav, Desktop Main Content, and Footer EXACTLY as designed.
  if (platform.isDesktopView) {
    return (
      <div id="desktop-app-shell" className="min-h-screen flex flex-col bg-slate-100/50 text-slate-900 font-sans">
        {/* Desktop Header */}
        {desktopHeader}

        {/* Desktop Main Content Container */}
        <div className="flex-1">
          {desktopMainContent}
        </div>

        {/* Desktop Footer */}
        {desktopFooter}
      </div>
    );
  }

  // MOBILE APP / NATIVE VIEW:
  // Renders compact MobileHeader, hides heavy multi-row headers, renders mobile bottom tab bar & camera scanner
  return (
    <div id="mobile-app-shell" className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Sleek Mobile Header */}
      <MobileHeader
        platformName={platform.platformName}
        isNative={platform.isNative}
        isSimulatedMobile={platform.isSimulatedMobile}
        onToggleSimulatedMobile={platform.toggleSimulatedMobile}
        onOpenSettings={onOpenSettings}
        user={user}
        onSignInClick={onSignInClick}
        onSignOut={onSignOut}
        navigateTo={navigateTo}
      />

      {/* Main Mobile App Body Container */}
      <main className="flex-1 px-3 py-4 max-w-md mx-auto w-full space-y-4 overflow-x-hidden">
        {activeMobileTab === 'generator' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {mobileGeneratorWorkspace || desktopMainContent}
          </div>
        )}

        {activeMobileTab === 'tools' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {mobileToolsWorkspace || (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>📱</span> Mobile QR Power Tools
                </h2>
                <p className="text-xs text-slate-400">
                  Select a specialized QR generator or tool below to get started instantly.
                </p>
                {desktopSubNav}
              </div>
            )}
          </div>
        )}

        {activeMobileTab === 'saved' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {mobileSavedProjectsWorkspace || (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
                <h2 className="text-sm font-bold text-white mb-3">Saved Projects & History</h2>
                {mobileSavedProjectsWorkspace}
              </div>
            )}
          </div>
        )}

        {activeMobileTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {mobileSettingsWorkspace || (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-4">
                <h2 className="text-sm font-bold text-white">App Settings & Account Profile</h2>
                <p className="text-xs text-slate-400">Tap below to customize audio feedback, default download formats, or manage your account.</p>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-950 cursor-pointer"
                  >
                    Open Settings Panel
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Camera / Image QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeMobileTab={activeMobileTab}
        onTabChange={handleMobileTabClick}
        savedCount={savedProjectsCount}
        isNative={platform.isNative}
      />
    </div>
  );
}
