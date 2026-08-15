import React from 'react';
import { 
  QrCode, 
  Settings, 
  User, 
  LogIn, 
  Smartphone, 
  Monitor, 
  SlidersHorizontal,
  Zap
} from 'lucide-react';
import Logo from './Logo';
import { UserSession } from '../lib/api';

interface MobileHeaderProps {
  platformName?: string;
  isNative?: boolean;
  isSimulatedMobile?: boolean;
  onToggleSimulatedMobile?: () => void;
  onOpenSettings?: () => void;
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
  user,
  onSignInClick,
  onSignOut,
  navigateTo
}: MobileHeaderProps) {
  return (
    <header
      dir="ltr"
      id="mobile-app-header"
      className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md"
    >
      {/* Left: Brand Logo & Mobile Native Badge */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <Logo size={34} />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
            <Smartphone className="w-2.5 h-2.5 text-indigo-400" />
            {isNative ? `${platformName.toUpperCase()} APP` : 'MOBILE APP'}
          </span>

          {/* Dev/Simulator Toggle indicator */}
          {onToggleSimulatedMobile && !isNative && (
            <button
              type="button"
              onClick={onToggleSimulatedMobile}
              className="text-[9px] font-bold text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
              title="Toggle Web vs Mobile layout mode"
            >
              {isSimulatedMobile ? <Monitor className="w-2.5 h-2.5 inline mr-1 text-amber-400" /> : <Smartphone className="w-2.5 h-2.5 inline mr-1 text-indigo-400" />}
              {isSimulatedMobile ? 'Desktop' : 'Mobile'}
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Controls (Settings & Auth) */}
      <div className="flex items-center gap-2">
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            aria-label="Open App Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {user ? (
          <button
            type="button"
            onClick={() => navigateTo('/profile')}
            className="p-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 flex items-center gap-1.5 px-2.5 text-xs font-extrabold cursor-pointer hover:bg-indigo-600/40 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[80px] text-[11px]">{user.name.split(' ')[0]}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignInClick}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
        )}
      </div>
    </header>
  );
}
