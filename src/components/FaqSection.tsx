import React, { useState, useId } from 'react';
import { HelpCircle, ChevronDown, Check, Copy, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'commercial-use',
    question: 'Are these QR codes completely free for commercial use?',
    answer: 'Yes, 100%! All static and dynamic QR codes generated on Free QR & Barcode Generator are completely free for unlimited personal and commercial applications. You receive full ownership with zero scan caps, no hidden fees, and no mandatory subscription requirements.'
  },
  {
    id: 'expiration-limits',
    question: 'Do these QR codes ever expire?',
    answer: 'No, static QR codes directly encode your destination data (such as website URLs, Wi-Fi passwords, or vCards) into the QR matrix itself. As long as your destination link or service remains active, the static QR code will work permanently with unlimited scans.'
  },
  {
    id: 'logo-embedding-readability',
    question: 'How to embed logos inside QR codes without breaking readability?',
    answer: 'When uploading a brand logo or emblem, our generation engine automatically increases the Reed-Solomon Error Correction Level to High (H-Level, recovering up to 30% damaged or obscured modules). Additionally, the engine automatically calculates safe quiet zone padding and scales the logo to max 20-25% matrix coverage to preserve 100% camera scannability.'
  },
  {
    id: 'vector-exports-printing',
    question: 'What vector and high-resolution export formats are supported for printing?',
    answer: 'We support crisp SVG vector exports with embedded base64 assets for lossless printing on billboards, business cards, and product packaging. You can also export high-DPI raster formats (PNG, JPG) scaled up to 4x Ultra HD resolution (1800x1800px) with custom DPI settings.'
  },
  {
    id: 'error-correction-explained',
    question: 'How does Reed-Solomon error correction protect customized QR codes?',
    answer: 'Reed-Solomon error correction incorporates redundant mathematical polynomial blocks into the QR code grid. This ensures that even if part of the QR code is obscured by a logo, scratched, or printed on a curved surface, smartphone cameras can still mathematically reconstruct the original payload seamlessly.'
  }
];

interface FaqSectionProps {
  customFaqs?: FaqItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FaqSection({
  customFaqs,
  title,
  subtitle,
  className = ''
}: FaqSectionProps) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(DEFAULT_FAQS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const baseId = useId();

  const faqs = customFaqs || DEFAULT_FAQS;

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleCopyLink = (faq: FaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#faq-${faq.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(faq.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Build JSON-LD Schema for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': [
        '#faq-section-heading',
        '#faq-section-summary'
      ]
    },
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': t(faq.question, faq.question),
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': t(faq.answer, faq.answer)
      }
    }))
  };

  return (
    <section 
      className={`w-full py-10 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 rounded-3xl my-8 text-slate-800 dark:text-slate-100 ${className}`}
      aria-label="Frequently Asked Questions"
    >
      {/* JSON-LD Rich Snippet Script */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('faq.badge', 'Frequently Asked Questions')}</span>
          </div>
          <h2 id="faq-section-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title || t('faq.sectionTitle', 'Everything You Need to Know About Free QR Codes')}
          </h2>
          <p id="faq-section-summary" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {subtitle || t('faq.sectionSubtitle', 'Learn how our enterprise generator ensures 100% commercial freedom, vector quality, and flawless camera readability.')}
          </p>
        </header>

        {/* Accordion list */}
        <div className="space-y-3 pt-2" role="region" aria-label="FAQ Accordion">
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            const buttonId = `${baseId}-btn-${idx}`;
            const panelId = `${baseId}-panel-${idx}`;

            return (
              <article
                key={faq.id}
                id={`faq-${faq.id}`}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-white dark:bg-slate-800 border-indigo-500/40 dark:border-indigo-500/60 shadow-md shadow-indigo-500/5'
                    : 'bg-white/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-start p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl group select-none"
                >
                  <span className="flex items-center gap-3 min-w-0 font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="truncate">{t(faq.question, faq.question)}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      title={t('faq.copyDirectLink', 'Copy link to this answer')}
                      aria-label="Copy direct question link"
                      onClick={(e) => handleCopyLink(faq, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedId === faq.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-4 pb-5 pt-0 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 mt-1"
                  >
                    <p className="pt-3">{t(faq.answer, faq.answer)}</p>

                    {/* Quality badges for AdSense & Trust building */}
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Commercial License
                      </span>
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-3.5 h-3.5" /> Zero Expiration & Unlimited Scans
                      </span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
