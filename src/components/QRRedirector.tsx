import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, ensureAppCheckReady } from '../lib/firebase';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface QRRedirectorProps {
  trackingId: string;
  onNavigate: (path: string) => void;
}

export default function QRRedirector({ trackingId, onNavigate }: QRRedirectorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveLink() {
      console.log(`[QRRedirector] Starting client-side resolution for ID: "${trackingId}"...`);
      try {
        setLoading(true);
        setError(null);

        // Ensure App Check is ready
        await ensureAppCheckReady();

        // Step 1: Query qr_codes collection directly by doc ID (trackingId)
        const qrCodeDocRef = doc(db, 'qr_codes', trackingId);
        const qrCodeSnap = await getDoc(qrCodeDocRef);

        if (qrCodeSnap.exists() && active) {
          const data = qrCodeSnap.data();
          console.log(`[QRRedirector] Found match in qr_codes:`, data);
          if (data?.originalUrl) {
            console.log(`[QRRedirector] Executing redirect to originalUrl: "${data.originalUrl}"`);
            window.location.href = data.originalUrl;
            return;
          }
        }

        // Step 2: Fallback to dynamicQRs collection directly by doc ID (trackingId)
        console.log(`[QRRedirector] [Fallback 1] Checking dynamicQRs for ID: "${trackingId}"`);
        const dynamicQrDocRef = doc(db, 'dynamicQRs', trackingId);
        const dynamicQrSnap = await getDoc(dynamicQrDocRef);

        if (dynamicQrSnap.exists() && active) {
          const data = dynamicQrSnap.data();
          console.log(`[QRRedirector] Found match in dynamicQRs:`, data);
          if (data?.destinationUrl) {
            console.log(`[QRRedirector] Executing redirect to destinationUrl: "${data.destinationUrl}"`);
            window.location.href = data.destinationUrl;
            return;
          }
        }

        // Step 3: Fallback to projects collection directly by doc ID (trackingId)
        console.log(`[QRRedirector] [Fallback 2] Checking projects for ID: "${trackingId}"`);
        const projectDocRef = doc(db, 'projects', trackingId);
        const projectSnap = await getDoc(projectDocRef);

        if (projectSnap.exists() && active) {
          const data = projectSnap.data();
          console.log(`[QRRedirector] Found match in projects:`, data);
          if (data?.content) {
            console.log(`[QRRedirector] Executing redirect to content URL: "${data.content}"`);
            window.location.href = data.content;
            return;
          }
        }

        // If we reach here, the short link is not found
        console.warn(`[QRRedirector] Short link not found in database for ID: "${trackingId}"`);
        if (active) {
          setError('Link Not Found');
          setLoading(false);
        }
      } catch (err: any) {
        console.error(`[QRRedirector ERROR] Error during link resolution:`, err);
        if (active) {
          setError(err?.message || 'Failed to resolve the link due to a database error.');
          setLoading(false);
        }
      }
    }

    resolveLink();

    return () => {
      active = false;
    };
  }, [trackingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4" id="qr-redirector-loading">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full animate-spin">
            <Loader2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Resolving short link...</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please wait while we fetch the destination address and securely forward you.
          </p>
          <div className="text-[10px] font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
            ID: {trackingId}
          </div>
        </motion.div>
      </div>
    );
  }

  // Modern styled 404 / Link Not Found UI
  return (
    <div className="flex items-center justify-center min-h-[65vh] py-12 px-4" id="qr-redirector-404">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full text-center"
      >
        <div className="bg-amber-50 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Link Not Found
        </h1>
        
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          We couldn't find the destination URL associated with this short link. It may have been deleted, or the address might be incorrect.
        </p>
        
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all w-full cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back to Homepage</span>
        </button>
        
        <div className="mt-6 text-[11px] font-mono text-slate-400">
          ID: {trackingId}
        </div>
      </motion.div>
    </div>
  );
}
