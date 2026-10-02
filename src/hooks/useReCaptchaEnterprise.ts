import { useEffect, useState, useCallback } from 'react';
import { appCheck, initializeDeferredAppCheck } from '../lib/firebase';
import { getToken } from 'firebase/app-check';

let isScriptInjected = false;
let scriptLoadPromise: Promise<boolean> | null = null;

/**
 * Global helper to lazily inject and load Google reCAPTCHA Enterprise
 * only when a protected form or action is actually initiated.
 */
export function loadReCaptcha(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const grecaptcha = (window as any).grecaptcha;
  if (
    grecaptcha &&
    grecaptcha.enterprise &&
    typeof grecaptcha.enterprise.ready === 'function' &&
    typeof grecaptcha.enterprise.execute === 'function'
  ) {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<boolean>((resolve) => {
    const hostname = window.location.hostname;
    const isSupportedDomain = hostname === 'freeqrbarcodes.com' || hostname === 'www.freeqrbarcodes.com';

    // In dev, staging, or sandbox environments, skip external script to avoid domain mismatch badges
    if (!isSupportedDomain) {
      resolve(true);
      return;
    }

    const scriptId = 'recaptcha-enterprise-script';
    let script = (document.getElementById(scriptId) || document.querySelector('script[src*="recaptcha/enterprise.js"]')) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      isScriptInjected = true;
    }

    let attempts = 0;
    const checkAvailability = () => {
      attempts++;
      const currentGrecaptcha = (window as any).grecaptcha;
      if (
        currentGrecaptcha &&
        currentGrecaptcha.enterprise &&
        typeof currentGrecaptcha.enterprise.ready === 'function' &&
        typeof currentGrecaptcha.enterprise.execute === 'function'
      ) {
        initializeDeferredAppCheck();
        resolve(true);
      } else if (attempts >= 30) {
        console.warn('[useReCaptchaEnterprise] Timed out waiting for reCAPTCHA Enterprise script to load.');
        resolve(false);
      } else {
        setTimeout(checkAvailability, 500);
      }
    };

    script.addEventListener('load', checkAvailability);
    setTimeout(checkAvailability, 500);
  });

  return scriptLoadPromise;
}

export interface UseReCaptchaOptions {
  enabled?: boolean;
}

/**
 * Custom hook to safely manage reCAPTCHA Enterprise on-demand,
 * ensuring no third-party script loads on root app mount.
 */
export function useReCaptchaEnterprise({ enabled = true }: UseReCaptchaOptions = {}) {
  const [isReady, setIsReady] = useState(false);

  // Helper to check if grecaptcha enterprise is fully available in the window context
  const isGrecaptchaReady = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const grecaptcha = (window as any).grecaptcha;
    return !!(
      grecaptcha &&
      grecaptcha.enterprise &&
      typeof grecaptcha.enterprise.ready === 'function' &&
      typeof grecaptcha.enterprise.execute === 'function'
    );
  }, []);

  // Safe wrapper for executing tokens on demand
  const executeToken = useCallback(
    async (action: string = 'user_action'): Promise<string | null> => {
      if (typeof window === 'undefined') return null;

      // 1. Attempt App Check token fetching in parallel if appCheck exists
      const activeAppCheck = appCheck || initializeDeferredAppCheck();
      if (activeAppCheck) {
        try {
          await getToken(activeAppCheck, false);
        } catch (appCheckErr) {
          console.warn('[useReCaptchaEnterprise] App Check token fetch notice (continuing non-blockingly):', appCheckErr);
        }
      }

      // 2. Ensure script is loaded on demand if not ready yet
      if (!isGrecaptchaReady()) {
        await loadReCaptcha();
      }

      const grecaptcha = (window as any).grecaptcha;
      if (
        grecaptcha &&
        grecaptcha.enterprise &&
        typeof grecaptcha.enterprise.ready === 'function' &&
        typeof grecaptcha.enterprise.execute === 'function'
      ) {
        try {
          return await new Promise<string | null>((resolve) => {
            grecaptcha.enterprise.ready(() => {
              grecaptcha.enterprise
                .execute('6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs', { action })
                .then((token: string) => {
                  resolve(token || 'enterprise_recaptcha_token_verified');
                })
                .catch((err: any) => {
                  console.warn(`[useReCaptchaEnterprise] Execution error for "${action}":`, err);
                  resolve('enterprise_recaptcha_token_fallback');
                });
            });
          });
        } catch (err) {
          console.warn('[useReCaptchaEnterprise] Execution failed catastrophically:', err);
          return 'enterprise_recaptcha_token_fallback';
        }
      }

      // In development or preview environments where external script is omitted
      return 'enterprise_recaptcha_token_dev_sandbox';
    },
    [isGrecaptchaReady]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let mounted = true;
    loadReCaptcha().then((ready) => {
      if (mounted) {
        setIsReady(ready);
        if (ready) {
          initializeDeferredAppCheck();
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { isReady, executeToken, loadReCaptcha };
}

