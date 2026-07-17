import React, { useState } from 'react';
import { api } from '../lib/api';
import { Mail, Lock, User, X, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; email: string; name: string }) => void;
  initialTab?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'signin' }: AuthModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!((val) => (val || '').trim())(name)) throw new Error(t('auth.nameRequired', 'Name is required') as any);
        const res = await api.register(email, password, name);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || t('auth.failed', 'Authentication failed. Please verify credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div 
        className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-2" />

        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 py-1 px-2.5 rounded-full text-[10px] font-bold font-mono mb-2">
              <Sparkles className="w-3 h-3" />
              {t('auth.secureCloudShield', 'SECURE CLOUD SHIELD')}
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {activeTab === 'signin' ? t('auth.welcomeBack', 'Welcome back') : t('auth.createAccount', 'Create account')}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'signin' 
                ? t('auth.signInDesc', 'Sign in to access saved QR designs and analytics') 
                : t('auth.signUpDesc', 'Get started and persist your QR dashboard records')}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 mb-4 flex border-b border-gray-100">
          <button
            type="button"
            className={`pb-3 text-xs font-semibold px-4 transition-all border-b-2 ${
              activeTab === 'signin' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('signin');
              setError(null);
            }}
          >
            {t('auth.signInTab', 'Sign In')}
          </button>
          <button
            type="button"
            className={`pb-3 text-xs font-semibold px-4 transition-all border-b-2 ${
              activeTab === 'signup' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('signup');
              setError(null);
            }}
          >
            {t('auth.signUpTab', 'Sign Up')}
          </button>
        </div>

        {/* Details and error boxes */}
        <div className="px-6 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-600 font-mono mb-4 leading-relaxed">
              {error}
            </div>
          )}

          {/* Core Auths Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('auth.fullName', 'Full Name')}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('auth.emailAddress', 'Email Address')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('auth.securePassword', 'Secure Password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-150 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{activeTab === 'signin' ? t('auth.signInButton', 'Sign In') : t('auth.signUpButton', 'Create Credentials')}</span>
              )}
            </button>
          </form>
        </div>

        {/* Modal Info Footer */}
        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 text-center mt-6">
          <p className="text-[10px] text-gray-400 font-mono">
            {t('auth.storageInfo', 'Secure, light SQL storage engine configuration. All operations fully authenticated.')}
          </p>
        </div>
      </div>
    </div>
  );
}
