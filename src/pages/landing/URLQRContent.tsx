import React, { useState } from 'react';
import { useTranslation } from '../../utils/i18n';

import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  FileText,
  Globe,
  QrCode,
  Utensils,
  Briefcase,
  Home,
  School,
  Activity,
  Lock,
  Eye,
  Image,
  Link,
  MapPin,
  Calendar,
  Check
} from 'lucide-react';

interface URLQRContentProps {
  onSelectRoute: (path: string) => void;
}

export const urlQrFaqs = [
  {
    q: "What is a URL QR Code and how does it function?",
    a: "A URL QR Code (Quick Response Code) is a specialized two-dimensional optical barcode that encapsulates a web address or hyperlink protocol (such as HTTP or HTTPS). When scanned by a smart device’s built-in optical sensor or camera, the device decodes the static black-and-white pixel grid, extracts the target web string, and automatically redirects the user's mobile browser to the specified landing page. It acts as a frictionless physical-to-digital link, eliminating the need for manual typing."
  },
  {
    q: "Is generating a URL QR Code on FreeQRGen.pro completely free?",
    a: "Yes, 100% free. The static URL QR codes created on FreeQRGen.pro are free forever, have no scanning limitations, and will never expire. We do not insert any hidden watermarks, and there are absolutely no premium sign-up requirements or trial periods."
  },
  {
    q: "What is the difference between a static and a dynamic URL QR Code?",
    a: "A static URL QR Code embeds the actual destination web address directly into its pixel matrix. Once printed, the destination link cannot be modified. A dynamic URL QR Code, on the other hand, encodes a shortened redirect link. This redirect link routes the user through an analytics server, allowing you to update the target destination URL at any time without reprinting the physical QR code, while also tracking extensive scan statistics."
  },
  {
    q: "Can I customize the design, colors, and logo of my URL QR Code?",
    a: "Absolutely. Our platform offers full-spectrum aesthetic customization. You can choose from linear gradients, custom solid colors, diverse dot styles, custom corner eye shapes, and safely upload your brand's centerpiece logo. The generator maintains standard Reed-Solomon error correction to ensure the code remains functional after visual styling."
  },
  {
    q: "How many scans can my generated QR code receive?",
    a: "There are absolutely no scan limits. Whether your printed QR code is scanned 10 times or 10 million times, it will remain active and functional indefinitely, with zero hidden bandwidth charges."
  },
  {
    q: "Do users need a special scanning app to open my link?",
    a: "No. All modern Apple iOS and Google Android devices have native QR code scanners integrated directly into their default camera applications. Users simply open their camera, point it at the code, and tap the instant web banner that appears."
  },
  {
    q: "Is there an optimal size for printing a URL QR Code?",
    a: "For standard marketing materials (such as business cards, brochures, or restaurant table tents), we recommend a minimum physical print size of 2.0 cm x 2.0 cm (0.8 inches x 0.8 inches). For larger displays, ensure the distance-to-size ratio is approximately 10:1 (e.g., a code scanned from 10 meters away should be at least 1 meter wide)."
  },
  {
    q: "Why is contrast important when styling a QR Code?",
    a: "Optical scanners rely on high contrast to distinguish the dark foreground pixels from the light background canvas. For maximum reliability, always use a dark foreground color (such as black, dark blue, or deep purple) on a clean, solid light background. Inverting colors or using low-contrast palettes can make the code unreadable to cameras."
  },
  {
    q: "How does error correction work and which level should I use?",
    a: "QR codes utilize Reed-Solomon mathematical error correction, which allows the pattern to be scanned successfully even if up to 30% of it is dirty, damaged, or covered by a custom logo. If you plan to embed a centerpiece brand logo, our generator automatically scales error correction to the High (H) setting (30% redundancy) to preserve scannability."
  },
  {
    q: "Can I encode deep links into a URL QR Code?",
    a: "Yes. You can encode standard HTTPS web links, subdomains, deep links that open specific mobile apps directly (e.g., instagram://, fb://, spotify://), app store download links, and URLs containing UTM campaign tracking parameters."
  },
  {
    q: "Is my personal data safe when using your website?",
    a: "Pristine security is our core value. All static QR code compilation occurs entirely inside your local browser sandbox. We never transmit, store, or index your destination URLs or customized brand assets on remote databases, ensuring complete data privacy."
  },
  {
    q: "Can I download my QR code in vector formats for professional print?",
    a: "Yes. Our platform supports exporting in infinitely scalable vector formats like SVG and print-ready PDF, as well as high-resolution PNG raster files. This ensures your code remains razor-sharp when printed on giant billboards or tiny product packages."
  },
  {
    q: "Does FreeQRGen.pro insert watermarks or branding on my QR code?",
    a: "Never. We believe in providing a clean, professional, and completely unbranded utility. All generated files are 100% watermark-free, giving your brand complete creative control."
  },
  {
    q: "What should I do if my QR code won't scan?",
    a: "First, verify that the target URL is spelled correctly and is active. Second, check that there is high contrast between the foreground and background. Third, ensure the physical code isn't printed too small or blurry, and verify that the custom center logo does not block the corner finder patterns."
  },
  {
    q: "Can I link a URL QR Code to a digital menu or PDF?",
    a: "Yes. You can link it directly to any web-hosted document, digital menu, Google Drive folder, or online PDF. Additionally, we offer dedicated WiFi, PDF, and vCard generators to optimize those specific user flows."
  }
];

export default function URLQRContent({
   onSelectRoute }: URLQRContentProps) {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const navTo = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onSelectRoute(path);
  };

  const faqs = urlQrFaqs.map((faq, index) => ({
    q: t(`urlqr.faqQ${index + 1}`, faq.q),
    a: t(`urlqr.faqA${index + 1}`, faq.a)
  }));

  return (
    <article className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
      
      {/* Dynamic SEO Title & Headings Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            {t('urlqr.definitionTitle', 'What is a URL QR Code? An In-Depth Definition')}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {t('urlqr.definitionDescStart', 'A ')}<strong>{t('urlqr.definitionDescStrong', 'URL QR Code')}</strong>{t('urlqr.definitionDescEnd', ' is a specialized two-dimensional optical barcode that encodes a standard web address or uniform resource identifier (URI). Developed under international standard ISO/IEC 18004, it operates as a physical hyperlink. Instead of forcing users to manually type long, complex domains or tracking strings into a mobile web browser, a quick scan with a smartphone camera instantly decodes the matrix, parses the target protocol (such as ')}<code>https://</code>{t('urlqr.definitionDescEndExtra', '), and directs the user to the precise digital destination.')}
        </p>
        <p className="text-sm text-slate-600">
          {t('urlqr.definitionP2', 'At its core, a URL QR Code is composed of multiple functional regions, including dark and light modules, quiet zones, finder patterns (the three large distinct squares in the corners used for orientation), and alignment grids. Our free url qr code generator handles all necessary structural compilation locally, translating raw text into safe, compliant, and aesthetically optimized patterns in real-time.')}
        </p>
      </section>

      {/* Trust Signals Block */}
      <section className="mt-10 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-6 space-y-4">
        <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2 select-none">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          {t('urlqr.trustTitle', 'Pristine Quality & Trust Security Standard')}
        </h3>
        <p className="text-xs text-slate-600">
          {t('urlqr.trustDescStart', 'Unlike other online generators that redirect your traffic through third-party domains, insert unsolicited ads, or add annoying watermarks, ')}<strong>{t('urlqr.trustDescStrong', 'FreeQRGen.pro')}</strong>{t('urlqr.trustDescEnd', ' provides a fully transparent, browser-based service.')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustNoWatermark', 'No Watermark Ever')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustNoReg', 'No Registration Required')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustFree', '100% Free Forever')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustLocal', 'Local Browser Processing')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustVector', 'High-Speed Vector Export')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('urlqr.trustEnterprise', 'Enterprise-Grade Security')}</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            {t('urlqr.howItWorksTitle', 'How URL QR Codes Work Under the Hood')}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {t('urlqr.howItWorksDescStart', 'The transformation of a standard alphanumeric string (like a website URL) into a scanable physical matrix involves precise mathematical encoding. Standard QR codes support four primary modes: numeric, alphanumeric, byte, and Kanji. URL QR codes primarily rely on ')}<strong>{t('urlqr.howItWorksDescStrong', 'Byte Mode')}</strong>{t('urlqr.howItWorksDescEnd', ', which supports 8-bit characters and successfully accommodates protocol standards, query parameters, subfolders, and hashtags.')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.staticEncodingTitle', 'Static URL QR Encoding')}</h4>
            <p className="text-xs text-slate-600">
              {t('urlqr.staticEncodingDesc', 'In a static QR code, the target link is hardcoded directly into the black-and-white module grid. The length of your URL directly affects the physical density of the code. A longer URL containing tracking parameters creates a highly dense matrix with hundreds of tiny pixel blocks, which require high print resolutions and large scan distances.')}
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.dynamicEncodingTitle', 'Dynamic URL QR Encoding')}</h4>
            <p className="text-xs text-slate-600">
              {t('urlqr.dynamicEncodingDesc', 'A dynamic QR code encodes a short, standardized URL that redirects the user to the final destination through an intermediary routing server. Because the encoded string is short, the physical grid remains clean and simple, scanning almost instantly from any distance. Furthermore, the final destination can be updated remotely at any time without reprinting.')}
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            {t('urlqr.comparisonTitle', 'Static vs. Dynamic URL QR Codes')}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {t('urlqr.comparisonDesc', 'Choosing the right type of QR code depends on your specific campaign requirements, text target audience, and print media durability.')}
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold">
              <tr>
                <th className="px-4 py-3">{t('urlqr.tableFeature', 'Feature')}</th>
                <th className="px-4 py-3">{t('urlqr.tableStatic', 'Static URL QR Code')}</th>
                <th className="px-4 py-3">{t('urlqr.tableDynamic', 'Dynamic URL QR Code')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">{t('urlqr.tableF1', 'Updateable Destination')}</td>
                <td className="px-4 py-3 text-red-600">{t('urlqr.tableF1No', 'No (Permanent)')}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{t('urlqr.tableF1Yes', 'Yes (Real-time update)')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">{t('urlqr.tableF2', 'Scan Tracking & Analytics')}</td>
                <td className="px-4 py-3 text-red-600">{t('urlqr.tableF2No', 'No')}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{t('urlqr.tableF2Yes', 'Yes (Device, Location, Time)')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">{t('urlqr.tableF3', 'Shortened Redirect URL')}</td>
                <td className="px-4 py-3 text-red-600">{t('urlqr.tableF3No', 'No (Direct embed)')}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{t('urlqr.tableF3Yes', 'Yes (Keeps matrix clean)')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">{t('urlqr.tableF4', 'Scanning Speed')}</td>
                <td className="px-4 py-3">{t('urlqr.tableF4Static', 'Varies by URL length')}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{t('urlqr.tableF4Dynamic', 'Instant (Simple grid)')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">{t('urlqr.tableF5', 'Cost')}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">{t('urlqr.tableF5Free', '100% Free (Forever)')}</td>
                <td className="px-4 py-3">{t('urlqr.tableF5Premium', 'Free standard, premium analytics')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            {t('urlqr.faqTitle', 'Frequently Asked Questions')}
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center text-left text-sm font-semibold text-slate-900 focus:outline-none"
              >
                <span>{faq.q}</span>
                {openFaqIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaqIndex === index && (
                <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic CTA Card Section */}
      <section className="mt-12 p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-4 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            {t('urlqr.ctaBadge', '100% Free & Unlimited')}
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {t('urlqr.ctaTitle', 'Ready to Build Your Custom URL QR Code?')}
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            {t('urlqr.ctaDesc', 'Design, customize, and export high-resolution QR codes instantly in vector SVG or print-ready format. No registration, no watermarks.')}
          </p>
          <div className="pt-2">
            <a
              href="#"
              onClick={(e) => navTo(e, '/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-950 text-sm font-bold rounded-lg shadow-md hover:bg-indigo-50 hover:scale-[1.02] transition-all duration-200"
            >
              <span>{t('urlqr.ctaButton', 'Generate Free QR Code Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}