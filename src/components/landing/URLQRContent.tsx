import React, { useState } from 'react';
import { useTranslation } from '../../utils/i18n';

import { 
  ShieldCheck, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Zap, 
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
    q: "Is generating a URL QR Code on FreeQRBarcodes.com completely free?",
    a: "Yes, 100% free. The static URL QR codes created on FreeQRBarcodes.com are free forever, have no scanning limitations, and will never expire. We do not insert any hidden watermarks, and there are absolutely no premium sign-up requirements or trial periods."
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
    q: "Does FreeQRBarcodes.com insert watermarks or branding on my QR code?",
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

  const faqs = urlQrFaqs;

  return (
    <article className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
      
      {/* Dynamic SEO Title & Headings Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            What is a URL QR Code? An In-Depth Definition
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          A <strong>URL QR Code</strong> is a specialized <a href="https://en.wikipedia.org/wiki/QR_code" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">two-dimensional optical barcode (QR Code)</a> that encodes a standard web address or uniform resource identifier (URI). Developed under <a href="https://www.iso.org/standard/62021.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">international ISO/IEC 18004 standard</a>, it operates as a physical hyperlink. Instead of forcing users to manually type long, complex domains or tracking strings into a mobile web browser, a quick scan with a smartphone camera instantly decodes the matrix, parses the target protocol (such as <code>https://</code>), and directs the user to the precise digital destination.
        </p>
        <p className="text-sm text-slate-600">
          At its core, a URL QR Code is composed of multiple functional regions, including dark and light modules, quiet zones, finder patterns (the three large distinct squares in the corners used for orientation), and alignment grids. Our free url qr code generator handles all necessary structural compilation locally, translating raw text into safe, compliant, and aesthetically optimized patterns in real-time.
        </p>
      </section>

      {/* Trust Signals Block */}
      <section className="mt-10 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 p-6 space-y-4">
        <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2 select-none">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Pristine Quality & Trust Security Standard
        </h3>
        <p className="text-xs text-slate-600">
          Unlike other online generators that redirect your traffic through third-party domains, insert unsolicited ads, or add annoying watermarks, <strong>FreeQRBarcodes.com</strong> provides a fully transparent, browser-based service.
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
            How URL QR Codes Work Under the Hood
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          The transformation of a standard alphanumeric string (like a website URL) into a scanable physical matrix involves precise mathematical encoding. Standard QR codes support four primary modes: numeric, alphanumeric, byte, and Kanji. URL QR codes primarily rely on <strong>Byte Mode</strong>, which supports 8-bit characters and successfully accommodates protocol standards, query parameters, subfolders, and hashtags.
        </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.staticUrlEncoding', 'Static URL QR Encoding')}</h4>
            <p className="text-xs text-slate-600">
              In a static QR code, the target link is hardcoded directly into the black-and-white module grid. The length of your URL directly affects the physical density of the code. A longer URL containing tracking parameters creates a highly dense matrix with hundreds of tiny pixel blocks, which require high print resolutions and large scan distances.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.dynamicUrlEncoding', 'Dynamic URL QR Encoding')}</h4>
            <p className="text-xs text-slate-600">
              A dynamic QR code encodes a short, standardized URL that redirects the user to the final destination through an intermediary routing server. Because the encoded string is short, the physical grid remains clean and simple, scanning almost instantly from any distance. Furthermore, the final destination can be updated remotely at any time without reprinting.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Comprehensive Comparison: Static vs. Dynamic URL QR Codes
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Selecting the ideal format for your business campaign is crucial. Review our precise technical breakdown to choose the correct approach:
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-3xs mt-4">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.technicalParameter', 'Technical Parameter')}</th>
                <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.staticUrlQrCode', 'Static URL QR Code')}</th>
                <th scope="col" className="px-4 py-3 text-left font-bold text-slate-900 uppercase tracking-wider">{t('urlqr.dynamicUrlQrCode', 'Dynamic URL QR Code')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Link Editing Post-Print</td>
                <td className="px-4 py-3 text-slate-600">Impossible (hardcoded directly in pixels)</td>
                <td className="px-4 py-3 text-slate-600">Unlimited (update URL target remotely)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Scan Tracking & Analytics</td>
                <td className="px-4 py-3 text-slate-600">No (direct client-to-site resolution)</td>
                <td className="px-4 py-3 text-slate-600">Yes (monitor scan date, browser, and locations)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Matrix Density & Complexity</td>
                <td className="px-4 py-3 text-slate-600">High (grows with URL character count)</td>
                <td className="px-4 py-3 text-slate-600">Low (always minimal, clean pixel count)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Optimal Scan Speeds</td>
                <td className="px-4 py-3 text-slate-600">Instant for simple URLs, slower for long strings</td>
                <td className="px-4 py-3 text-slate-600">Exceptionally fast across all hardware</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Offline Reliability</td>
                <td className="px-4 py-3 text-slate-600">100% Offline (requires zero routing servers)</td>
                <td className="px-4 py-3 text-slate-600">Online-reliant (routing server must be active)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Best Use Case</td>
                <td className="px-4 py-3 text-slate-600">Permanent branding, simple domains, local networks</td>
                <td className="px-4 py-3 text-slate-600">Marketing campaigns, flyers, product menus</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Business Use Cases H2 */}
      <section className="mt-16 space-y-8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Strategic Business Use Cases & Real-World Examples
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Integrating URL QR codes into your visual touchpoints bridges the physical gap to your digital funnel. Below, we examine key industry use cases where they deliver exceptional engagement:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Restaurants & Diners</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Place QR codes on table tents, bar counters, or entrance stickers to link diners directly to dynamic online PDF menus, interactive ordering portals, or seasonal wine lists. This avoids expensive printing, minimizes paper waste, and speeds up dining operations.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Retail & E-Commerce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Print checkout barcodes on receipts, loyalty pamphlets, or cash wrappers to direct customers to digital product registration pages, exclusive online discounts, feedback questionnaires, or loyalty program enrollment.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Real Estate Agency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Include QR linkers directly on street signs, print pamphlets, or open-house handouts. Scanners can view comprehensive virtual listings, 3D tours, detailed property dimensions, or schedule an in-person viewing with the listing broker in seconds.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Healthcare & Clinics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Feature secure check-in QR codes in waiting lounges to streamline patient intakes. Direct patients to digital registration forms, secure pre-appointment screeners, health history reports, or directions to specialized lab centers.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Schools & Universities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Educators place codes on slide presentations, whiteboards, or syllabus handbooks to redirect students to lecture outlines, reference videos, homework portals, campus map guides, or grading rubrics.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Marketing & Print Ads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deploy codes with structured UTM tracking parameters on flyers, magazines, billboards, and transit stops to monitor physical advertising attribution directly inside Google Analytics or custom CRM reporting systems.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Product Packaging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Integrate codes directly onto product boxes or user guides. Direct buyers to product warranty registration forms, digital PDF user manuals, visual troubleshooting guides, or brand authenticity verifiers.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Digital Business Cards</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ditch outdated paper cards and replace them with a dynamic contact code. Direct professional connections to a sleek landing portal housing your portfolio, social handles (such as LinkedIn), and resume downloads.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-150 rounded-2xl shadow-3xs space-y-2 col-span-1 sm:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Events, Small Businesses & Enterprise Usage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Whether you are organizing a small local farmer's market or running a massive enterprise-wide campaign, URL QR Codes provide a highly scalable bridge to digital touchpoints. Link to event schedules, local shop directions on maps, Google Review forms, digital coupon codes, or robust client portals.
            </p>
          </div>

        </div>
      </section>

      {/* Step-by-Step Generator Instructions */}
      <section className="mt-16 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            How to Create a URL QR Code with FreeQRBarcodes.com (Step-by-Step)
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Designing and exporting a premium, high-resolution website link QR code on our platform takes less than 60 seconds. Follow these simple, structured instructions to generate your custom code:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
              1
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 tracking-tight">Input Destination Link</h5>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Paste your complete target URL into the input field. Ensure you include the protocol scheme (<code>http://</code> or <code>https://</code>) to guarantee proper smartphone client recognition.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
              2
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 tracking-tight">Select Branding & Colors</h5>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Choose a stylish linear gradient or single solid color matching your brand identity. Select custom eye frame designs and pixel dot geometries to make the code stand out visually.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
              3
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 tracking-tight">Embed Centerpiece Logo</h5>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Upload your brand logo in high-contrast format or select standard social icons. The generator automatically enables a High error correction buffer to ensure reliable scanning.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-white border border-slate-150 rounded-2xl shadow-3xs relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs select-none">
              4
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-950 tracking-tight">Export & Print Layout</h5>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Download the resulting code as high-resolution PNG for digital layouts, or infinitely scalable vector SVG or PDF for premium professional print jobs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices, Design Guidelines, and Mistakes */}
      <section className="mt-16 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Aesthetic Guidelines, Best Practices, & Common Mistakes
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Ensure your physical marketing campaign achieves maximum ROI by adhering to these professional design guidelines and avoiding common formatting traps:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              Pro Implementation Best Practices
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>High Color Contrast:</strong> Always use dark foreground pixels (navy, charcoal, black) on solid light backgrounds to ensure optimal optical recognition.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Provide Clear CTAs:</strong> Include textual context alongside the code (e.g., "Scan to View Menu" or "Point Camera to Browse Shop").</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Keep Quiet Zones Intact:</strong> Ensure a clear whitespace border (approx. 4 modules wide) surrounds the code to isolate the matrix from surrounding visual noise.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-rose-600" />
              Common Pitfalls to Avoid
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0 font-bold select-none">✕</span>
                <span><strong>Low contrast or inverting colors:</strong> Making the background dark and foreground light can throw off older scanners and camera modules.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0 font-bold select-none">✕</span>
                <span><strong>Overly complex URLs:</strong> Directing to massive links creates extremely tight, dense pixel layouts. Keep links streamlined or use short tracking redirections.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 shrink-0 font-bold select-none">✕</span>
                <span><strong>Linking to non-responsive web pages:</strong> Ensure the target destination is fully optimized for mobile devices, or risk losing visitors instantly.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Internal Linking Area */}
      <section className="mt-16 pt-8 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono select-none">
          Complementary QR Code Builders & Resources
        </h3>
        <p className="text-xs text-slate-600 mt-2">
          Discover our specialized generators designed to streamline wireless networks, social profiles, documents, and professional networking:
        </p>
        <div className="flex flex-wrap gap-2 mt-4 select-none">
          <a
            href="/"
            onClick={(e) => navTo(e, '/')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            🏠 Home Dashboard
          </a>
          <a
            href="/wifi-qr-generator"
            onClick={(e) => navTo(e, '/wifi-qr-generator')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            📶 WiFi QR Generator
          </a>
          <a
            href="/pdf-qr-generator"
            onClick={(e) => navTo(e, '/pdf-qr-generator')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            📄 PDF QR Generator
          </a>
          <a
            href="/facebook-qr-generator"
            onClick={(e) => navTo(e, '/facebook-qr-generator')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            👥 Facebook QR Generator
          </a>
          <a
            href="/vcard-qr-generator"
            onClick={(e) => navTo(e, '/vcard-qr-generator')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            🪪 vCard QR Generator
          </a>
          <a
            href="/whatsapp-qr-generator"
            onClick={(e) => navTo(e, '/whatsapp-qr-generator')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            💬 WhatsApp QR Generator
          </a>
          <a
            href="/blog"
            onClick={(e) => navTo(e, '/blog')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            📚 Knowledge Blog
          </a>
          <a
            href="/faq"
            onClick={(e) => navTo(e, '/faq')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 font-semibold text-[11px] rounded-lg transition-colors shadow-3xs cursor-pointer"
          >
            ❓ Help FAQs
          </a>
        </div>
      </section>

      {/* Accordion FAQs Section (15+ unique questions) */}
      <section className="mt-16 space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Frequently Asked Questions (FAQ) - URL QR Generator
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Review our comprehensive FAQ index addressing common design, security, and technical configuration queries regarding web routing QR codes:
        </p>

        <div className="flex flex-col gap-3 mt-6 select-none">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border rounded-2xl shadow-3xs transition-all overflow-hidden"
                style={{ borderColor: isOpen ? '#6366f1' : '#e2e8f0' }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-4 px-5 flex items-center justify-between gap-4 font-semibold text-xs text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="border-t border-slate-100">
                    <div className="p-5 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </article>
  );
}
