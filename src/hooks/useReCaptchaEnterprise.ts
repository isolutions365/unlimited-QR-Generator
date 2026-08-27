import { useEffect, useState, useCallback, useRef } from 'react';
import { appCheck, triggerReCaptchaExecution, initializeDeferredAppCheck } from '../lib/firebase';
import { getToken } from 'firebase/app-check';

/**
 * Custom hook to safely load and manage reCAPTCHA Enterprise,
 * ensuring no race conditions exist during initial load.
 */
export function useReCaptchaEnterprise() {
  const [isReady, setIsReady] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);

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

  // Safe wrapper for executing tokens
  const executeToken = useCallback(
    async (action: string = 'user_action'): Promise<string | null> => {
      if (typeof window === 'undefined') return null;

      // 1. Attempt App Check token fetching in parallel if appCheck exists (or can be initialized)
      const activeAppCheck = appCheck || initializeDeferredAppCheck();
      if (activeAppCheck) {
        try {
          console.log(`[useReCaptchaEnterprise] Fetching App Check token for "${action}"...`);
          const tokenResult = await getToken(activeAppCheck, false); // use cached or refresh naturally
          console.log('[useReCaptchaEnterprise] Successfully fetched/verified App Check token.');
        } catch (appCheckErr) {
          console.warn('[useReCaptchaEnterprise] App Check token fetch notice (continuing non-blockingly):', appCheckErr);
        }
      }

      // 2. Safely verify if grecaptcha enterprise is ready in the DOM before executing
      if (!isGrecaptchaReady()) {
        console.warn(`[useReCaptchaEnterprise] cannot execute action "${action}": window.grecaptcha is not loaded yet.`);
        return null;
      }

      try {
        const grecaptcha = (window as any).grecaptcha;
        return new Promise<string | null>((resolve) => {
          grecaptcha.enterprise.ready(() => {
            grecaptcha.enterprise
              .execute('6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs', { action })
              .then((token: string) => {
                console.log(`[useReCaptchaEnterprise] Successfully executed token for "${action}":`, token ? 'Success' : 'Empty');
                resolve(token);
              })
              .catch((err: any) => {
                console.warn(`[useReCaptchaEnterprise] Execution error for "${action}":`, err);
                resolve(null);
              });
          });
        });
      } catch (err) {
        console.warn('[useReCaptchaEnterprise] Execution failed catastrophically:', err);
        return null;
      }
    },
    [isGrecaptchaReady]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if the current hostname is a supported production domain before injecting script
    const hostname = window.location.hostname;
    const isSupportedDomain = hostname === 'freeqrbarcodes.com' || hostname === 'www.freeqrbarcodes.com';

    if (!isSupportedDomain) {
      // In dev/staging/preview sandboxes, skip external reCAPTCHA script injection to prevent 'Invalid domain for site key' error badges
      return;
    }

    // A. Ensure the reCAPTCHA Enterprise script tag is injected and loading
    const scriptId = 'recaptcha-enterprise-script';
    let script = (document.getElementById(scriptId) || document.querySelector('script[src*="recaptcha/enterprise.js"]')) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LeQA3QtAAAAAJ-vfZZIUeaO7IeI3MS2UFvL5ozs';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      console.log('[useReCaptchaEnterprise] Dynamically injected reCAPTCHA Enterprise script tag.');
    } else {
      console.log('[useReCaptchaEnterprise] Found existing reCAPTCHA Enterprise script tag on the page.');
    }

    // B. Setup poller to check when the script finishes loading and window.grecaptcha becomes fully operational
    const checkAvailability = () => {
      attemptsRef.current++;
      if (isGrecaptchaReady()) {
        console.log('[useReCaptchaEnterprise] reCAPTCHA Enterprise is fully loaded and ready!');
        setIsReady(true);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // Initialize App Check lazily now that we are ready
        initializeDeferredAppCheck();

        // Trigger background initial warmup token request to ensure Google Cloud registers active requests
        executeToken('mount').catch(() => {});
      } else if (attemptsRef.current >= 30) {
        // Stop polling after 30 seconds to prevent resource drain
        console.warn('[useReCaptchaEnterprise] Timed out waiting for reCAPTCHA Enterprise script to load.');
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    };

    // Run first check immediately or bind to script onload
    if (isGrecaptchaReady()) {
      setIsReady(true);
      initializeDeferredAppCheck();
      executeToken('mount').catch(() => {});
    } else {
      script.addEventListener('load', checkAvailability);
      checkIntervalRef.current = setInterval(checkAvailability, 1000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isGrecaptchaReady, executeToken]);

  return { isReady, executeToken };
}
