import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
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

    const executeRedirect = async (destination: string) => {
      try {
        await fetch('/api/scans/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackingId, destinationUrl: destination })
        }).catch(e => console.warn('Telemetry record notice:', e));
      } catch (e) {
        // Non-blocking
      }
      window.location.href = destination;
    };

    async function resolveLink() {
      console.log(`[QRRedirector] Starting client-side resolution for ID: "${trackingId}"...`);
      try {
        setLoading(true);
        setError(null);

        // Ensure App Check is ready in a non-blocking, safe way
        try {
          await ensureAppCheckReady();
        } catch (appCheckErr) {
          console.warn('[QRRedirector] Non-blocking App Check warmup notice:', appCheckErr);
        }

        // Step 0a: Query qr_codes collection directly by document ID (trackingId)
        console.log(`[QRRedirector] [Step 0a] Fetching from qr_codes collection by ID "${trackingId}"...`);
        try {
          const qrCodeDocRef = doc(db, 'qr_codes', trackingId);
          const qrCodeSnap = await getDoc(qrCodeDocRef);
          if (qrCodeSnap.exists() && active) {
            const data = qrCodeSnap.data();
            console.log(`[QRRedirector] [Step 0a SUCCESS] Found match in qr_codes:`, data);
            const destination = data?.originalUrl || data?.content;
            if (destination) {
              console.log(`[QRRedirector] Executing redirect to originalUrl: "${destination}"`);
              await executeRedirect(destination);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 0a error:', stepErr);
        }

        // Step 0b: Search qr_codes collection by trackingId field
        console.log(`[QRRedirector] [Step 0b] Querying qr_codes collection where trackingId == "${trackingId}"...`);
        try {
          const qQrCodes = query(collection(db, 'qr_codes'), where('trackingId', '==', trackingId), limit(1));
          const snapQrCodes = await getDocs(qQrCodes);
          if (!snapQrCodes.empty && active) {
            const data = snapQrCodes.docs[0].data();
            console.log(`[QRRedirector] [Step 0b SUCCESS] Found match in qr_codes:`, data);
            const destination = data?.originalUrl || data?.content;
            if (destination) {
              console.log(`[QRRedirector] Executing redirect to: "${destination}"`);
              await executeRedirect(destination);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 0b error:', stepErr);
        }

        // Step 1: Search projects collection by trackingId field
        console.log(`[QRRedirector] [Step 1] Querying projects collection where trackingId == "${trackingId}"...`);
        try {
          const qProjects = query(collection(db, 'projects'), where('trackingId', '==', trackingId), limit(1));
          const snapProjects = await getDocs(qProjects);
          if (!snapProjects.empty && active) {
            const data = snapProjects.docs[0].data();
            console.log(`[QRRedirector] [Step 1 SUCCESS] Found match in projects:`, data);
            if (data?.content) {
              console.log(`[QRRedirector] Executing redirect to: "${data.content}"`);
              await executeRedirect(data.content);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 1 error:', stepErr);
        }

        // Step 2: Search projects collection by document ID
        console.log(`[QRRedirector] [Step 2] Fetching project doc directly by ID "${trackingId}"...`);
        try {
          const projectDocRef = doc(db, 'projects', trackingId);
          const projectSnap = await getDoc(projectDocRef);
          if (projectSnap.exists() && active) {
            const data = projectSnap.data();
            console.log(`[QRRedirector] [Step 2 SUCCESS] Found match in projects:`, data);
            if (data?.content) {
              console.log(`[QRRedirector] Executing redirect to content URL: "${data.content}"`);
              await executeRedirect(data.content);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 2 error:', stepErr);
        }

        // Step 3a: Search dynamicQRs collection by id field
        console.log(`[QRRedirector] [Step 3a] Querying dynamicQRs collection where id == "${trackingId}"...`);
        try {
          const qDynId = query(collection(db, 'dynamicQRs'), where('id', '==', trackingId), limit(1));
          const snapDynId = await getDocs(qDynId);
          if (!snapDynId.empty && active) {
            const data = snapDynId.docs[0].data();
            console.log(`[QRRedirector] [Step 3a SUCCESS] Found match in dynamicQRs by id:`, data);
            const destination = data?.destinationUrl || data?.targetUrl || data?.content;
            if (destination) {
              console.log(`[QRRedirector] Executing redirect to: "${destination}"`);
              await executeRedirect(destination);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 3a error:', stepErr);
        }

        // Step 3b: Search dynamicQRs collection by shortCode field
        console.log(`[QRRedirector] [Step 3b] Querying dynamicQRs collection where shortCode == "${trackingId}"...`);
        try {
          const qDynShort = query(collection(db, 'dynamicQRs'), where('shortCode', '==', trackingId), limit(1));
          const snapDynShort = await getDocs(qDynShort);
          if (!snapDynShort.empty && active) {
            const data = snapDynShort.docs[0].data();
            console.log(`[QRRedirector] [Step 3b SUCCESS] Found match in dynamicQRs by shortCode:`, data);
            const destination = data?.destinationUrl || data?.targetUrl || data?.content;
            if (destination) {
              console.log(`[QRRedirector] Executing redirect to: "${destination}"`);
              await executeRedirect(destination);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 3b error:', stepErr);
        }

        // Step 4: Fallback to dynamicQRs collection directly by doc ID (trackingId)
        console.log(`[QRRedirector] [Step 4] Checking dynamicQRs for ID: "${trackingId}"`);
        try {
          const dynamicQrDocRef = doc(db, 'dynamicQRs', trackingId);
          const dynamicQrSnap = await getDoc(dynamicQrDocRef);
          if (dynamicQrSnap.exists() && active) {
            const data = dynamicQrSnap.data();
            console.log(`[QRRedirector] Found match in dynamicQRs:`, data);
            const destination = data?.destinationUrl || data?.targetUrl || data?.content;
            if (destination) {
              console.log(`[QRRedirector] Executing redirect to destinationUrl: "${destination}"`);
              await executeRedirect(destination);
              return;
            }
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 4 error:', stepErr);
        }

        // Step 5: Search pdf_shares collection directly by ID
        console.log(`[QRRedirector] [Step 5] Checking pdf_shares for ID: "${trackingId}"`);
        try {
          const docPdfRef = doc(db, 'pdf_shares', trackingId);
          const docPdfSnap = await getDoc(docPdfRef);
          if (docPdfSnap.exists() && active) {
            console.log(`[QRRedirector] [Step 5 SUCCESS] Found match in pdf_shares:`, docPdfSnap.data());
            await executeRedirect(`/#pdf-${trackingId}`);
            return;
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 5 error:', stepErr);
        }

        // Step 6: Search business_cards collection directly by ID
        console.log(`[QRRedirector] [Step 6] Checking business_cards for ID: "${trackingId}"`);
        try {
          const docCardRef = doc(db, 'business_cards', trackingId);
          const docCardSnap = await getDoc(docCardRef);
          if (docCardSnap.exists() && active) {
            console.log(`[QRRedirector] [Step 6 SUCCESS] Found match in business_cards:`, docCardSnap.data());
            await executeRedirect(`/#card-${trackingId}`);
            return;
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 6 error:', stepErr);
        }

        // Step 7: Search restaurant_menus collection directly by ID
        console.log(`[QRRedirector] [Step 7] Checking restaurant_menus for ID: "${trackingId}"`);
        try {
          const docMenuRef = doc(db, 'restaurant_menus', trackingId);
          const docMenuSnap = await getDoc(docMenuRef);
          if (docMenuSnap.exists() && active) {
            console.log(`[QRRedirector] [Step 7 SUCCESS] Found match in restaurant_menus:`, docMenuSnap.data());
            await executeRedirect(`/#menu-${trackingId}`);
            return;
          }
        } catch (stepErr) {
          console.error('[QRRedirector] Step 7 error:', stepErr);
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
