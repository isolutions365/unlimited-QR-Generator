import React from 'react';
import { 
  Settings, 
  Sparkles,
  User, 
  LogIn, 
  Smartphone, 
  Monitor,
} from 'lucide-react';
import Logo from './Logo';
import { UserSession } from '../lib/api';

interface MobileHeaderProps {
  platformName?: string;
  isNative?: boolean;
  isSimulatedMobile?: boolean;
  onToggleSimulatedMobile?: () => void;
  onOpenSettings?: () => void;
  onOpenAIAssistant?: () => void;
  user?: UserSession | null;
  onSignInClick?: () => void;
  onSignOut?: () => void;
  navigateTo: (path: string) => void;
}

export default function MobileHeader({
  platformName = 'web',
  isNative = false,
  isSimulatedMobile = false,
  onToggleSimulatedMobile,
  onOpenSettings,
  onOpenAIAssistant,
  user,
  onSignInClick,
  onSignOut,
  navigateTo
}: MobileHeaderProps) {
  const handleOpenAI = () => {
    window.dispatchEvent(new CustomEvent('open-ai-assistant'));
    onOpenAIAssistant?.();
  };

  return (
    <header
      id="mobile-app-header"
      className="sticky top-0 z-40 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 px-3 sm:px-4 flex items-center justify-between shadow-2xs select-none"
    >
      {/* Left: Brand Identity & Exact Wordmark */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          type="button"
          id="mobile-brand-link"
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -m-1 transition-opacity hover:opacity-90"
          aria-label="FreeQRBarcodes Home"
        >
          <Logo size={28} hideText={true} />
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            FreeQR<span className="text-blue-600">Barcodes</span>
          </span>
        </button>

        {/* Development / Preview layout toggle (unobtrusive & accessible) */}
        {onToggleSimulatedMobile && !isNative && (
          <button
            type="button"
            onClick={onToggleSimulatedMobile}
            className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
            title="Toggle Web vs Mobile layout mode"
            aria-label="Toggle layout mode"
          >
            {isSimulatedMobile ? (
              <>
                <Monitor className="w-3 h-3 text-amber-600" />
                <span>Web</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-blue-600" />
                <span>App</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Right: Actions (AI Assistant & Settings with 44x44px Touch Targets) */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* AI Assistant Action Button */}
        <button
          type="button"
          id="mobile-header-ai-btn"
          onClick={handleOpenAI}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Open AI Assistant"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
        </button>

        {/* App Settings Action Button */}
        {onOpenSettings && (
          <button
            type="button"
            id="mobile-header-settings-btn"
            onClick={onOpenSettings}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="App Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-700" />
          </button>
        )}

        {/* User Profile / Authentication (Compact access) */}
        {user ? (
          <button
            type="button"
            id="mobile-header-profile-btn"
            onClick={() => navigateTo('/profile')}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-blue-700 font-bold text-xs cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="User profile"
            title={`Logged in as ${user.name}`}
          >
            <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          </button>
        ) : onSignInClick ? (
          <button
            type="button"
            id="mobile-header-signin-btn"
            onClick={onSignInClick}
            className="hidden xs:flex w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Sign in"
            title="Sign in"
          >
            <LogIn className="w-4 h-4 text-slate-600" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
