import React, { useEffect, useRef, useState } from 'react';

interface AdSenseUnitProps {
  id: string;
  adClient?: string; // Optional custom client ID, defaults to fallback setup
  adSlot: string;    // The AdSense unit's slot code
  adFormat?: string; // e.g. 'auto', 'fluid', 'rectangle' etc.
  fullWidthResponsive?: boolean;
  className?: string; // Extra styling classes
  style?: React.CSSProperties; // Optional inline overrides
  label?: string; // Default: 'ADVERTISEMENT'
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdSenseUnit({
  id,
  adClient = "ca-pub-1877345878061699", // Production Google AdSense Client ID
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style,
  label = 'ADVERTISEMENT'
}: AdSenseUnitProps) {
  const [hasError, setHasError] = useState(false);
  const initialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only attempt to initialize if we are in a browser environment
    if (typeof window !== 'undefined') {
      const isProd = (import.meta as any).env?.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
      
      // Load AdSense script dynamically only on production
      if (isProd) {
        const hasScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (!hasScript) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }
      }

      if (initialized.current) return;

      const checkAndInit = () => {
        if (initialized.current) return;
        const width = containerRef.current?.offsetWidth || 0;
        if (width > 0) {
          try {
            // Setup window.adsbygoogle array if missing
            window.adsbygoogle = window.adsbygoogle || [];
            
            // Push the advertisement initialization object safely
            window.adsbygoogle.push({});
            initialized.current = true;
            console.log('[AdSenseUnit] Successfully initialized ad slot:', adSlot, 'width:', width);
          } catch (err) {
            console.warn('[AdSenseUnit] Initialization skipped or delayed:', err);
            setHasError(true);
          }
        }
      };

      // Try initial call
      checkAndInit();

      // Setup ResizeObserver to run when container dimensions resolve (e.g. from 0px/hidden state)
      let observer: ResizeObserver | null = null;
      if (!initialized.current && typeof ResizeObserver !== 'undefined' && containerRef.current) {
        observer = new ResizeObserver(() => {
          if (!initialized.current) {
            checkAndInit();
            if (initialized.current && observer) {
              observer.disconnect();
            }
          }
        });
        observer.observe(containerRef.current);
      }

      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [adClient, adSlot]);

  return (
    <div 
      ref={containerRef}
      id={id}
      className={`relative flex flex-col items-center justify-center bg-gray-50/50 border border-gray-200/50 rounded-2xl p-3 text-center overflow-hidden transition-all duration-300 hover:border-gray-200 shadow-3xs ${className}`}
    >
      {/* Policy Compliant Label tag */}
      <span className="text-[9px] font-mono font-bold tracking-widest text-gray-400 mb-2 uppercase select-none">
        {label}
      </span>

      {/* Ad unit canvas container with fallback minimum dimensions */}
      <div className="w-full flex justify-center items-center relative" style={{ minHeight: style?.height || style?.minHeight || '90px' }}>
        {/* Standard AdSense client container */}
        <ins
          className="adsbygoogle w-full block"
          style={style || { display: 'block', minHeight: '90px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />

        {/* Polished, professional visual proxy to show in development / local testing preview */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200/80 rounded-xl p-4 cursor-default select-none group">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">
              Premium Ad Placement Active
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-1 select-all">
            slot: {adSlot} • form: {adFormat}
          </p>
        </div>
      </div>
    </div>
  );
}
