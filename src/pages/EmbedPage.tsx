import React, { useState } from 'react';
import { useTranslation } from '../utils/i18n';

import { ArrowLeft, Copy, Check, Code, Zap, ExternalLink, ShieldAlert, Heart, Info, Globe, Home, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface EmbedPageProps {
  onNavigate: (path: string) => void;
}

interface BadgeOption {
  id: string;
  name: string;
  description: string;
  html: string;
}

export default function EmbedPage({
   onNavigate }: EmbedPageProps) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const badges: BadgeOption[] = [
    {
      id: 'light-minimal',
      name: t('embed.badge.light', 'Light Minimalist'),
      description: t('embed.badge.light.desc', 'Clean off-white capsule with subtle borders and premium indigo accent. Integrates smoothly on any standard modern page.'),
      html: `<a href="https://www.freeqrbarcodes.com" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #1e293b; text-decoration: none; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; width: fit-content; max-width: 200px;" onmouseover="this.style.borderColor='#cbd5e1';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='0 1px 2px rgba(0,0,0,0.05)'">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h2v2h-2z"></path><path d="M18 18h2v2h-2z"></path><path d="M14 18h2v2h-2z"></path><path d="M18 14h2v2h-2z"></path></svg>
  <span style="white-space: nowrap;">QR Codes by <strong style="color: #4f46e5; font-weight: 700;">Free QR Generator</strong></span>
</a>`
    },
    {
      id: 'dark-sleek',
      name: t('embed.badge.dark', 'Dark Matte Sleek'),
      description: t('embed.badge.dark.desc', 'Sophisticated dark slate badge designed for dark-themed footers, panels, or dashboards. Violet accent highlights branding.'),
      html: `<a href="https://www.freeqrbarcodes.com" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #f8fafc; text-decoration: none; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); transition: all 0.2s ease; width: fit-content; max-width: 200px;" onmouseover="this.style.borderColor='#475569';this.style.boxShadow='0 2px 4px rgba(0,0,0,0.3)'" onmouseout="this.style.borderColor='#334155';this.style.boxShadow='0 1px 2px rgba(0,0,0,0.2)'">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h2v2h-2z"></path><path d="M18 18h2v2h-2z"></path><path d="M14 18h2v2h-2z"></path><path d="M18 14h2v2h-2z"></path></svg>
  <span style="white-space: nowrap;">QR Codes by <strong style="color: #a78bfa; font-weight: 700;">Free QR Generator</strong></span>
</a>`
    },
    {
      id: 'indigo-gradient',
      name: t('embed.badge.indigo', 'Royal Indigo Gradient'),
      description: t('embed.badge.indigo.desc', 'Bold interactive pill boasting a professional twilight indigo gradient. High-contrast white typography with dynamic shadow effects.'),
      html: `<a href="https://www.freeqrbarcodes.com" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #ffffff; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); transition: all 0.2s ease; width: fit-content; max-width: 200px;" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 16px rgba(79, 70, 229, 0.35)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 12px rgba(79, 70, 229, 0.25)'">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h2v2h-2z"></path><path d="M18 18h2v2h-2z"></path><path d="M14 18h2v2h-2z"></path><path d="M18 14h2v2h-2z"></path></svg>
  <span style="white-space: nowrap;">QR Codes by <strong style="color: #ffffff; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Free QR Generator</strong></span>
</a>`
    },
    {
      id: 'borderless-subtle',
      name: t('embed.badge.slate', 'Slate Minimal Borderless'),
      description: t('embed.badge.slate.desc', 'Ultra-clean background-free badge using simple neutral tones. Blends directly into standard light text sections or footers.'),
      html: `<a href="https://www.freeqrbarcodes.com" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 500; color: #64748b; text-decoration: none; transition: all 0.2s ease; width: fit-content;" onmouseover="this.style.color='#4f46e5'" onmouseout="this.style.color='#64748b'">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h2v2h-2z"></path><path d="M18 18h2v2h-2z"></path><path d="M14 18h2v2h-2z"></path><path d="M18 14h2v2h-2z"></path></svg>
  <span style="white-space: nowrap;">QR Codes by <strong style="font-weight: 700;">Free QR Generator</strong></span>
</a>`
    }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }).catch((err) => {
      console.warn('[EmbedPage] Clipboard write error caught:', err);
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in" id="embed-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white py-2.5 px-4 rounded-xl border border-slate-100 shadow-2xs mb-6">
        <button 
          onClick={() => onNavigate('/')} 
          className="hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('common.home', 'Home')}</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-800 font-bold">{t('embed.titleShort', 'Embed Badges')}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group cursor-pointer focus:outline-hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        {t('embed.backButton', 'Back to Creative Station')}
      </button>

      {/* Header section */}
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
            {t('embed.badgePartner', 'Developer & Partner Widgets')}
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" /> {t('embed.seoOptimized', 'SEO Optimized')}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
          {t('embed.title', 'Get Our "Powered By" Badge')}
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          {t('embed.desc', 'Show your support for public open-source web utilities! Embed a lightweight, gorgeous widget in your website footer or side section. This snippet is fully inline-styled with zero external CSS or JavaScript files, assuring perfect speed and layout security.')}
        </p>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List of Badges */}
        <div className="lg:col-span-8 space-y-8">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 transition-all hover:border-slate-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                    <Code className="w-4 h-4 text-indigo-500" />
                    {badge.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                </div>
                {/* Live Preview Element */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center min-w-[200px] shrink-0">
                  <div dangerouslySetInnerHTML={{ __html: badge.html }} />
                </div>
              </div>

              {/* Code display block */}
              <div className="relative group">
                <pre className="text-[10px] font-mono bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto max-h-32 border border-slate-800 leading-relaxed pr-16 select-all">
                  {badge.html}
                </pre>
                <button
                  onClick={() => copyToClipboard(badge.html, badge.id)}
                  className={`absolute top-2 right-2 p-2 rounded-lg transition-all border shadow-sm ${
                    copiedId === badge.id
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700'
                  } cursor-pointer`}
                  title={t('embed.copySnippetTitle', 'Copy Embed Snippet')}
                >
                  {copiedId === badge.id ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> {t('embed.copied', 'Copied!')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5">
                      <Copy className="w-3 h-3" /> {t('embed.copySnippet', 'Copy Snippet')}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Tips & Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 p-6 rounded-2xl border border-indigo-100/50 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              {t('embed.partnerTitle', 'Why partner with us?')}
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-800">{t('embed.partner1Title', 'Support Free Software:')}</strong> {t('embed.partner1Desc', 'iSolutions QR Generator is a 100% free, unlimited, ad-free toolkit designed for local stores, schools, and developers. Placing a badge helps us stay free forever.')}
              </p>
              <p>
                <strong className="text-slate-800">{t('embed.partner2Title', 'Boost SEO Authority:')}</strong> {t('embed.partner2Desc', 'Linking to high-quality dynamic web generators elevates domain trust parameters securely.')}
              </p>
              <p>
                <strong className="text-slate-800">{t('embed.partner3Title', 'Lightweight & Safe:')}</strong> {t('embed.partner3Desc', 'The widget does not load external tracking scripts or analytics assets, ensuring absolute load speed compliance.')}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              {t('embed.tipsTitle', 'Integration Tips')}
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-650 leading-relaxed list-disc list-inside">
              <li>{t('embed.tip1', 'Place the HTML snippet inside your footer area or sidebar widget placeholder.')}</li>
              <li>{t('embed.tip2', 'You can adjust the inline <code>max-width</code> or padding parameter to fit any bespoke column widths.', { code: (chunks) => <code className="bg-slate-50 px-1 py-0.5 rounded font-mono text-slate-600">{chunks}</code> })}</li>
              <li>{t('embed.tip3', 'No style bleeding: inline CSS rules prevent global stylesheet pollution.')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}