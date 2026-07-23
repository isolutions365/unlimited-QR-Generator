import React, { useState } from 'react';
import { api } from '../lib/api';
import { loginWithEmail, signupWithEmail, loginWithGoogle, verifyUserEmail, sendPasswordReset } from '../lib/firebaseAuthServices';
import { Mail, Lock, User, X, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
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

  // Password reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    if (!resetEmail.trim()) {
      setResetError(t('auth.emailRequired', 'Email address is required.') as string);
      return;
    }

    setIsResetLoading(true);
    try {
      await sendPasswordReset(resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      let errMsg = err.message || t('auth.resetFailed', 'Failed to send password reset email.');
      if (err.code === 'auth/user-not-found') {
        errMsg = t('auth.userNotFound', 'No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        errMsg = t('auth.invalidEmail', 'Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = t('auth.tooManyRequests', 'Too many requests. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        errMsg = t('auth.networkError', 'Network error. Please check your connection and try again.');
      }
      setResetError(errMsg);
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const cred = await loginWithGoogle();
      if (cred?.user) {
        const userObj = {
          id: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User'
        };
        onSuccess(userObj);
        onClose();
      }
    } catch (err: any) {
      let errMsg = err.message || t('auth.googleFailed', 'Google authentication failed.');
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = t('auth.popupClosed', 'Sign-in popup was closed before completing authorization.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = t('auth.popupCancelled', 'Multiple sign-in attempts detected.');
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        if (!((val) => (val || '').trim())(name)) throw new Error(t('auth.nameRequired', 'Name is required') as any);
        
        // Firebase Email Signup
        const cred = await signupWithEmail(email, password, name);
        
        // Automatically send email verification
        try {
          await verifyUserEmail(cred.user);
        } catch (vErr) {
          console.warn('[Firebase Auth] Verification email notice:', vErr);
        }

        const userObj = {
          id: cred.user.uid,
          email: cred.user.email || email,
          name: cred.user.displayName || name || email.split('@')[0]
        };
        onSuccess(userObj);
        onClose();
      } else {
        // Firebase Email Login
        const cred = await loginWithEmail(email, password);
        const userObj = {
          id: cred.user.uid,
          email: cred.user.email || email,
          name: cred.user.displayName || email.split('@')[0]
        };
        onSuccess(userObj);
        onClose();
      }
    } catch (err: any) {
      let errMsg = err.message || t('auth.failed', 'Authentication failed. Please verify credentials.');
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = t('auth.invalidCredentials', 'Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = t('auth.emailInUse', 'An account with this email address already exists.');
      } else if (err.code === 'auth/weak-password') {
        errMsg = t('auth.weakPassword', 'Password should be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        errMsg = t('auth.invalidEmail', 'Please enter a valid email address.');
      }
      setError(errMsg);
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
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 mb-4 flex border-b border-gray-100">
          <button
            type="button"
            disabled={isLoading}
            className={`pb-3 text-xs font-semibold px-4 transition-all border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
            disabled={isLoading}
            className={`pb-3 text-xs font-semibold px-4 transition-all border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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

          {/* Social Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-4 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 rounded-2xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('auth.continueWithGoogle', 'Continue with Google')}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-white px-3 text-slate-400">
                {t('auth.orContinueWithEmail', 'OR CONTINUE WITH EMAIL')}
              </span>
            </div>
          </div>

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
                    disabled={isLoading}
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {activeTab === 'signin' && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setResetEmail(email);
                      setResetError(null);
                      setResetSuccess(false);
                      setShowResetModal(true);
                    }}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                  >
                    {t('auth.forgotPasswordLink', 'Forgot Password?')}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-semibold shadow-xl shadow-indigo-150 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('auth.submitting', 'Submitting...')}</span>
                </>
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

      {/* Forgot Password Sub-Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl w-full max-w-sm border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <KeyRound className="w-5 h-5" />
                <h4 className="text-base font-bold text-gray-900">{t('auth.resetPasswordTitle', 'Reset Password')}</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetLoading}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {t('auth.resetPasswordDesc', 'Enter your registered email address below and we will send you a link to reset your password.')}
            </p>

            {resetError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-600 font-mono mb-4 leading-relaxed">
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-[11px] text-emerald-700 mb-2 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <p className="font-semibold text-xs text-emerald-900">
                  {t('auth.resetSentHeader', 'Reset Link Sent')}
                </p>
                <p className="text-emerald-700 leading-relaxed text-xs">
                  {t('auth.resetSuccessMsg', 'Password reset email has been sent. Please check your inbox and spam folder.')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="mt-2 w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  {t('auth.backToSignIn', 'Back to Sign In')}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('auth.emailAddress', 'Email Address')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      disabled={isResetLoading}
                      placeholder="name@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isResetLoading}
                    onClick={() => setShowResetModal(false)}
                    className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {t('auth.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="w-1/2 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isResetLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{t('auth.sendResetLink', 'Send Link')}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
