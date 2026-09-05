import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  RefreshCw, 
  Lock, 
  Info, 
  ArrowRight,
  HelpCircle,
  QrCode,
  Layers,
  Database
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export interface StaticVsDynamicComparisonProps {
  onSelectStatic?: () => void;
  onSelectDynamic?: () => void;
  className?: string;
  id?: string;
}

export const StaticVsDynamicComparison: React.FC<StaticVsDynamicComparisonProps> = ({
  onSelectStatic,
  onSelectDynamic,
  className = '',
  id = 'static-vs-dynamic-comparison'
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'static' | 'dynamic'>('all');

  const comparisonFeatures = [
    {
      feature: t('compare.pricingLabel', 'Pricing & Fees'),
      description: t('compare.pricingDesc', 'Cost to generate, download, and use commercially'),
      staticVal: t('compare.staticPricing', '100% Free Forever'),
      staticSub: t('compare.staticPricingSub', 'No hidden fees or paywalls'),
      staticBadge: 'positive',
      dynamicVal: t('compare.dynamicPricing', 'Free to Try & Deploy'),
      dynamicSub: t('compare.dynamicPricingSub', 'Free tier included; upgraded plans for unlimited retention'),
      dynamicBadge: 'neutral'
    },
    {
      feature: t('compare.signupLabel', 'Account & Sign-Up Requirement'),
      description: t('compare.signupDesc', 'Whether an account is needed before generating or downloading'),
      staticVal: t('compare.staticSignup', 'No Sign-Up Required (0 steps)'),
      staticSub: t('compare.staticSignupSub', 'Instant browser generation, zero registration'),
      staticBadge: 'positive',
      dynamicVal: t('compare.dynamicSignup', 'No Upfront Sign-Up to Try'),
      dynamicSub: t('compare.dynamicSignupSub', 'Create instantly; connect free account to save & manage dashboard'),
      dynamicBadge: 'neutral'
    },
    {
      feature: t('compare.expirationLabel', 'Lifespan & Expiration'),
      description: t('compare.expirationDesc', 'How long the printed QR code remains functional'),
      staticVal: t('compare.staticExpiration', 'Never Expires (Permanent)'),
      staticSub: t('compare.staticExpirationSub', 'Direct matrix encoding never depends on external servers'),
      staticBadge: 'positive',
      dynamicVal: t('compare.dynamicExpiration', '180-Day Free Data Retention'),
      dynamicSub: t('compare.dynamicExpirationSub', 'Unclaimed/guest test logs auto-purge after 180 days unless upgraded or renewed'),
      dynamicBadge: 'warning'
    },
    {
      feature: t('compare.analyticsLabel', 'Scan Tracking & Analytics'),
      description: t('compare.analyticsDesc', 'Ability to count scans, viewer devices, and scan locations'),
      staticVal: t('compare.staticAnalytics', 'No Analytics (Zero Telemetry)'),
      staticSub: t('compare.staticAnalyticsSub', 'Direct offline scan; 100% privacy with no tracking data collected'),
      staticBadge: 'neutral',
      dynamicVal: t('compare.dynamicAnalytics', 'Real-Time Analytics Included'),
      dynamicSub: t('compare.dynamicAnalyticsSub', 'Scan counts, device types, operating systems & regional heatmaps'),
      dynamicBadge: 'positive'
    },
    {
      feature: t('compare.editingLabel', 'Post-Print Destination Editing'),
      description: t('compare.editingDesc', 'Change the target link without reprinting paper/packaging'),
      staticVal: t('compare.staticEditing', 'Cannot Be Changed After Print'),
      staticSub: t('compare.staticEditingSub', 'Data is physically locked into the matrix pattern'),
      staticBadge: 'negative',
      dynamicVal: t('compare.dynamicEditing', 'Editable Anytime in 1 Click'),
      dynamicSub: t('compare.dynamicEditingSub', 'Update target URL on the fly without reprinting materials'),
      dynamicBadge: 'positive'
    },
    {
      feature: t('compare.privacyLabel', 'Privacy & Hosting Dependency'),
      description: t('compare.privacyDesc', 'Where data is processed and stored'),
      staticVal: t('compare.staticPrivacy', '100% Client-Side / Offline'),
      staticSub: t('compare.staticPrivacySub', 'Zero server hops; generated in local browser memory'),
      staticBadge: 'positive',
      dynamicVal: t('compare.dynamicPrivacy', 'Cloud Redirect Routing'),
      dynamicSub: t('compare.dynamicPrivacySub', 'Encrypted Firestore redirect server resolves destination instantly'),
      dynamicBadge: 'neutral'
    },
  ];

  return (
    <section 
      id={id} 
      aria-label="Static vs Dynamic QR Code Honest Comparison"
      className={`w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('compare.transparencyBadge', 'Honest & Transparent Comparison')}</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('compare.headline', 'Static vs. Dynamic QR Codes: What You Really Get')}
        </h2>
        
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(
            'compare.subtitle', 
            'We believe in 100% honesty. Static QR codes are completely free and permanent. Dynamic QR codes provide live analytics and editable links through our cloud servers, with a 180-day retention window on the free tier.'
          )}
        </p>
      </div>

      {/* Side-by-Side Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        
        {/* 1. Static QR Code Card */}
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                {t('compare.staticPill', '100% Free Forever • Zero Sign-Up')}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                {t('compare.staticTag', 'Offline Sovereign')}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-emerald-600" />
              <span>{t('compare.staticTitle', 'Static QR Codes')}</span>
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t(
                'compare.staticSummary',
                'Your destination URL, Wi-Fi keys, or vCard details are encoded directly into the black and white pixel pattern. No intermediary servers, no accounts, and no expiration dates.'
              )}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.staticBullet1Title', 'Never Expires:')}</strong>{' '}
                  <span>{t('compare.staticBullet1Desc', 'Works permanently as long as the printed image is readable.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.staticBullet2Title', 'No Sign-Up or Credit Card:')}</strong>{' '}
                  <span>{t('compare.staticBullet2Desc', 'Generate and download vector SVG / high-res PNG instantly in 1 click.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.staticBullet3Title', '100% Private & Offline:')}</strong>{' '}
                  <span>{t('compare.staticBullet3Desc', 'Zero telemetry or analytics sent to any database. Complete data privacy.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-500 pt-1">
                <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-slate-700 font-medium">{t('compare.staticTradeoffTitle', 'Trade-off:')}</strong>{' '}
                  <span>{t('compare.staticTradeoffDesc', 'Cannot change the destination after printing; does not track scan counts.')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-150 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">{t('compare.bestForLabel', 'Best For')}</span>
              <span className="text-xs font-bold text-slate-800">{t('compare.staticBestFor', 'Wi-Fi, Personal vCards, Packaging, Permanent URLs')}</span>
            </div>
            {onSelectStatic && (
              <button
                type="button"
                onClick={onSelectStatic}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{t('compare.createStaticBtn', 'Create Static QR')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Dynamic QR Code Card */}
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full pointer-events-none -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <BarChart3 className="w-3.5 h-3.5" />
                {t('compare.dynamicPill', 'Free to Try • Live Analytics & Editable')}
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-500 uppercase">
                {t('compare.dynamicTag', 'Cloud-Routed')}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-indigo-600" />
              <span>{t('compare.dynamicTitle', 'Dynamic QR Codes')}</span>
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t(
                'compare.dynamicSummary',
                'Encodes a short routing URL that redirects scanners to your live destination. Allows editing target URLs after print and tracking visitor analytics in real time.'
              )}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.dynamicBullet1Title', 'Editable After Printing:')}</strong>{' '}
                  <span>{t('compare.dynamicBullet1Desc', 'Fix broken links or swap campaign landing pages without expensive reprints.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.dynamicBullet2Title', 'Real-Time Scan Telemetry:')}</strong>{' '}
                  <span>{t('compare.dynamicBullet2Desc', 'Track total scans, mobile device OS, hourly peaks, and regional scans.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <strong className="text-slate-900 font-semibold">{t('compare.dynamicBullet3Title', 'Instant Free Demo:')}</strong>{' '}
                  <span>{t('compare.dynamicBullet3Desc', 'Test dynamic routing without upfront payment or mandatory credit card.')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="text-amber-950 font-bold">{t('compare.dynamicRetentionTitle', '180-Day Free Retention Policy:')}</strong>{' '}
                  <span className="text-amber-800">
                    {t(
                      'compare.dynamicRetentionDesc',
                      'Free guest/anonymous dynamic scan logs & temporary links are kept for 180 days. Connect an account to retain projects permanently.'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-150 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left w-full sm:w-auto">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">{t('compare.bestForLabel', 'Best For')}</span>
              <span className="text-xs font-bold text-slate-800">{t('compare.dynamicBestFor', 'Marketing Campaigns, Restaurant Menus, Promo Flyers')}</span>
            </div>
            {onSelectDynamic && (
              <button
                type="button"
                onClick={onSelectDynamic}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{t('compare.createDynamicBtn', 'Enable Dynamic Track')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Transparent Detailed Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{t('compare.tableHeading', 'Complete Technical & Policy Matrix')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('compare.tableSubheading', 'Direct, verifiable breakdown of features, limits, and server infrastructure.')}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('compare.firestoreBacked', 'Backed by Google Cloud Firestore')}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-700 uppercase font-mono font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6 w-1/3">{t('compare.colFeature', 'Feature / Metric')}</th>
                <th className="py-3.5 px-4 sm:px-6 w-1/3 bg-emerald-50/50 text-emerald-950 border-x border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('compare.colStatic', 'Static QR (Client-Side)')}</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 sm:px-6 w-1/3 bg-indigo-50/50 text-indigo-950">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('compare.colDynamic', 'Dynamic QR (Cloud Redirect)')}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {comparisonFeatures.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">{row.feature}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{row.description}</div>
                  </td>

                  {/* Static Value */}
                  <td className="py-4 px-4 sm:px-6 bg-emerald-50/20 border-x border-slate-200 align-top">
                    <div className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{row.staticVal}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-snug">{row.staticSub}</div>
                  </td>

                  {/* Dynamic Value */}
                  <td className="py-4 px-4 sm:px-6 bg-indigo-50/20 align-top">
                    <div className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                      row.dynamicBadge === 'warning' ? 'text-amber-900' : 'text-indigo-950'
                    }`}>
                      {row.dynamicBadge === 'warning' ? (
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span>{row.dynamicVal}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 leading-snug">{row.dynamicSub}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why the Difference Explainer Callout */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {t('compare.whyDifferenceTitle', 'Why is there a 180-day retention window on Free Dynamic QRs?')}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(
                  'compare.whyDifferenceDesc',
                  'Static QR codes are rendered directly by your web browser canvas using pure mathematics—they cost zero server resources to exist forever. Dynamic QR codes route through cloud servers and log analytics to a database on every scan. To keep our service free and prevent abandoned link spam, unclaimed guest test links and telemetry are retained for 180 days unless claimed under an active account.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaticVsDynamicComparison;
