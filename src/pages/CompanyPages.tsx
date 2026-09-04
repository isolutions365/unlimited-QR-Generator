import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import BreadcrumbNav from '../components/BreadcrumbNav';

import { ShieldCheck, Mail, MapPin, Users, Award, Briefcase, Heart, Send, CheckCircle2, Globe, ArrowLeft, MessageSquare, Phone, Info } from 'lucide-react';

interface CompanyPagesProps {
  view: 'about' | 'privacy' | 'contact' | 'terms';
  onNavigate: (path: string) => void;
}

export default function CompanyPages({
   view, onNavigate }: CompanyPagesProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let title = 'Terms & Conditions | FreeQRBarcodes.com Service Agreement';
    let description = 'Review the Terms & Conditions of FreeQRBarcodes.com. Understand the user guidelines, fair use policy, and local data persistence rules of our free QR platform.';
    
    if (view === 'terms') {
      title = 'Terms & Conditions | FreeQRBarcodes.com Service Agreement';
      description = 'Review the Terms & Conditions of FreeQRBarcodes.com. Understand the user guidelines, fair use policy, and local data persistence rules of our free QR platform.';
    } else if (view === 'about') {
      title = 'About FreeQRBarcodes.com | Leaders in Dynamic QR Code Technology';
      description = 'Learn about FreeQRBarcodes.com, our mission, technology stack, security architectures, and core team behind the advanced QR code design platform.';
    } else if (view === 'contact') {
      title = 'Contact Us | FreeQRBarcodes.com Support & Compliance Hub';
      description = 'Get in touch with the FreeQRBarcodes.com technical team or our compliance officers for questions, enterprise integration inquiries, or support.';
    } else if (view === 'privacy') {
      title = 'Privacy Policy | FreeQRBarcodes.com - Secure, Offline-First QR Generation';
      description = 'Read the FreeQRBarcodes.com privacy policy. Learn how we utilize offline-first browser rendering to protect your network passwords, URLs, and vCards.';
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `https://www.freeqrbarcodes.com/${view}`);
  }, [view]);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.freeqrbarcodes.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": view === 'terms' ? 'Terms & Conditions' : view === 'about' ? 'About Us' : view === 'contact' ? 'Contact Us' : 'Privacy Policy',
        "item": `https://www.freeqrbarcodes.com/${view}`
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": view === 'terms' ? 'Terms & Conditions - FreeQRBarcodes.com' : view === 'about' ? 'About Us - FreeQRBarcodes.com' : view === 'contact' ? 'Contact Us - FreeQRBarcodes.com' : 'Privacy Policy - FreeQRBarcodes.com',
    "description": view === 'terms' ? 'Review the Terms & Conditions of FreeQRBarcodes.com. Understand the user guidelines, fair use policy, and local data persistence rules.' : 'Corporate policy and structural content.',
    "url": `https://www.freeqrbarcodes.com/${view}`
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API contact request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        items={[
          {
            label: view === 'terms' ? String(t('company.terms', 'Terms & Conditions')) : view === 'privacy' ? String(t('company.privacy', 'Privacy Policy')) : view === 'about' ? String(t('company.about', 'About Us')) : String(t('company.contact', 'Contact Us')),
            active: true
          }
        ]}
        onNavigate={onNavigate}
        className="mb-6 bg-white"
        schemaId="company-breadcrumb-schema"
      />

      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group cursor-pointer focus:outline-hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        {t('company.backButton', 'Back to Creative Station')}
      </button>

      {view === 'about' && (
        <div id="about-us-page" className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              {t('company.journeyBadge', 'Our Journey')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {t('company.aboutTitle', 'About iSolutions QR Generator')}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              {t('company.aboutDesc', "We started with a simple belief: QR codes don't have to be boring black-and-white grids. They can be dynamic, artistic extensions of your visual and corporate brand identity.")}
            </p>
          </div>

          {/* Key Metrics & Offerings Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {t('company.metricsTitle', 'What We Offer & Platform Performance')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="block text-3xl font-black text-indigo-600 font-bold">14K+</span>
                <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">{t('company.metric1Title', 'Monthly Campaigns')}</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('company.metric1Desc', 'Businesses trust us to build high-performance vector schemas monthly.')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="block text-3xl font-black text-indigo-600 font-bold">99.9%</span>
                <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">{t('company.metric2Title', 'Scan Accuracy')}</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('company.metric2Desc', 'Robust Reed-Solomon error correction keeps high scan-rates on all devices.')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <span className="block text-3xl font-black text-indigo-600 font-bold">100%</span>
                <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">{t('company.metric3Title', 'Local Encryption')}</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {t('company.metric3Desc', 'Your credentials are kept safely encrypted and never leave your sandbox.')}
                </p>
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">{t('company.principlesTitle', 'Our Core Principles')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{t('company.principle1Title', 'Pristine Aesthetic Layouts')}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('company.principle1Desc', 'We select beautiful custom color gradients, sleek eye frames, and tailored dots for ultimate branding value.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{t('company.principle2Title', 'Developer-First Mentality')}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('company.principle2Desc', 'Designed to easily fit modern full-stack workflows with local decoupled sandboxes.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{t('company.principle3Title', 'Uncompromising Integrity')}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('company.principle3Desc', 'Our platform executes local operations immediately and securely with transparent cookie and data handling.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{t('company.principle4Title', 'End-User Experience')}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('company.principle4Desc', 'We guarantee friction-free scanning triggers on iOS, Android, and other hardware readers.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl space-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">{t('company.operationsBadge', 'Our Operations')}</span>
            <h2 className="text-lg font-extrabold text-white tracking-tight">{t('company.operationsTitle', 'Powered by iSolutions ICo')}</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              {t('company.operationsDesc', 'iSolutions QR Generator is designed and developed by <strong>iSolutions ICo</strong>. We specialize in high-availability web tools, responsive UX designs, and robust systems aimed at making marketing technology accessible to everyone.', { strong: (chunks) => <strong>{chunks}</strong> })}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-indigo-400" /> isolutionsico.com</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-400" /> admin@isolutionsico.com</span>
            </div>
          </div>
        </div>
      )}

      {view === 'privacy' && (
        <div id="privacy-policy-page" className="space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              {t('company.complianceBadge', 'Compliance & Security')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {t('company.privacyTitle', 'Privacy Policy')}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {t('company.lastUpdated', 'Last Updated: June 2, 2026')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                {t('company.privacy.sec1Title', '1. Data Encryption and Local Storage')}
              </h2>
              <p>
                {t('company.privacy.sec1Desc', 'All QR parameters, designs, and user compositions are fully encrypted in your local sandbox. Some static selections utilize localStorage to maintain preferences. No custom branding designs or configurations are stored permanently on arbitrary networks without explicit action.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                {t('company.privacy.sec2Title', '2. Real-Time Scan Analytics')}
              </h2>
              <p>
                {t('company.privacy.sec2Desc', 'For dynamic tracked campaigns, our databases securely log scans (including system user-agents, metadata, timestamp records, etc.) purely to compile performance charts in the <strong>Scan Analytics</strong> section.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {t('company.privacy.sec3Title', '3. Third-Party Service Integrations')}
              </h2>
              <p>
                {t('company.privacy.sec3Desc', 'This platform includes options to redirect parameters to platforms like WhatsApp, Email clients, WiFi modules, or social profiles. These third parties implement their own custom guidelines and security configurations.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                {t('company.privacy.sec4Title', '4. Reach Out For Inquiries')}
              </h2>
              <p>
                {t('company.privacy.sec4Desc', 'If you have questions, inquiries, or would like to request file/data deletion, reach out instantly to our compliance contact at <span>admin@isolutionsico.com</span>', { span: (chunks) => <span className="font-semibold text-indigo-600">{chunks}</span> })}
              </p>
            </section>
          </div>
        </div>
      )}

      {view === 'terms' && (
        <div id="terms-and-conditions-page" className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              {t('company.legalBadge', 'Legal Framework & Agreements')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {t('company.termsTitle', 'Terms & Conditions')}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {t('company.lastUpdated', 'Last Updated: June 2, 2026')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                {t('company.terms.sec1Title', '1. Acceptance of Terms')}
              </h2>
              <p>
                {t('company.terms.sec1Desc', 'By accessing or using the iSolutions QR Generator, you represent and warrant that you have read, understood, and agree to be bound by these Terms and Conditions. These terms govern all generated templates, local schema persistence, standard redirects, and visual campaigns.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                {t('company.terms.sec2Title', '2. Fair Use Policy & Content Safety')}
              </h2>
              <p>
                {t('company.terms.sec2Desc', 'You are solely responsible for all content embedded or linked within QR codes generated through this platform. You agree not to distribute link hubs or formatted templates that point to malware, phishing sites, unsolicited spam material, or other prohibited contents under localized state regulations. We reserve the full right to decline support if violations are reported.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                {t('company.terms.sec3Title', '3. Technical Accuracy & Execution Warning')}
              </h2>
              <p>
                {t('company.terms.sec3Desc', 'While our high-performance generator utilizes proper Reed-Solomon algorithms and customizable error correction (L, M, Q, H presets) to sustain extreme compatibility, final scannability remains heavily reliant on correct styling, sufficient color contrast, printing quality, and direct scanner camera hardware. We advise verifying generated previews on physical target devices prior to mass physical deployment.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                {t('company.terms.sec4Title', '4. Local Schema Storage & Intellectual Property')}
              </h2>
              <p>
                {t('company.terms.sec4Desc', 'Your customized configurations, history caches, and workspace exports are kept local using decentralized key-value persistence. All proprietary graphic templates, engine rendering systems, and creative station interfaces are the operational property of iSolutions ICo and protected under international intellectual property legal frame structures.')}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                {t('company.terms.sec5Title', '5. Compliance Contacts')}
              </h2>
              <p>
                {t('company.terms.sec5Desc', 'All regulatory feedback, inquiries, operational questions, or policy dispute reports should be addressed immediately to our support center at <span>admin@isolutionsico.com</span>.', { span: (chunks) => <span className="font-semibold text-indigo-650">{chunks}</span> })}
              </p>
            </section>
          </div>
        </div>
      )}

      {view === 'contact' && (
        <div id="contact-us-page" className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              {t('company.contactBadge', 'Get In Touch')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {t('company.contactTitle', 'Contact Us')}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              {t('company.contactDesc', 'Have a question about our QR tools, dynamic links, or custom templates? Reach out to us, and we will get back to you immediately.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Details Info Panel */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">{t('company.detailsTitle', 'Our Details')}</h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('company.details.inquiry', 'Feedback & Inquiry')}</span>
                    <a href="mailto:admin@isolutionsico.com" className="text-xs font-semibold text-slate-800 hover:text-indigo-650 transition-colors">
                      admin@isolutionsico.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('company.details.corp', 'Corporate Division')}</span>
                    <span className="text-xs font-semibold text-slate-800">
                      iSolutions ICo
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('company.details.location', 'Location Node')}</span>
                    <span className="text-xs font-semibold text-slate-800 leading-normal block">
                      {t('company.details.locationVal', 'Global Tech Hub, Digital Solutions Area')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Banner Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 font-mono tracking-wide uppercase">{t('company.inboxesTitle', 'Encrypted Inboxes')}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t('company.inboxesDesc', 'We review incoming inquiries within 24 business hours. All submissions are kept private and confidential in compliance with modern secure storage requirements.')}
                </p>
              </div>
            </div>

            {/* Interactive Contact Form Panel */}
            <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              {isSubmitted ? (
                <div id="contact-success-panel" className="text-center py-10 px-4 space-y-4 animate-scale-in">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-650 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">{t('company.successTitle', 'Message Submitted Successfully!')}</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {t('company.successDesc', 'Thank you for reaching out. A representative from iSolutions ICo will inspect your feedback and reply to your e-mail shortly.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 py-2 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {t('company.sendAnother', 'Send Another Message')}
                  </button>
                </div>
              ) : (
                <form id="contact-form-component" onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">{t('company.formTitle', 'Send A Message')}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('company.labelName', 'Full Name')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('company.placeholderName', 'John Doe')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('company.labelEmail', 'Email Address')}</label>
                      <input
                        type="email"
                        required
                        placeholder={t('company.placeholderEmail', 'john@example.com')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('company.labelSubject', 'Subject')}</label>
                    <input
                      type="text"
                      required
                      placeholder={t('company.placeholderSubject', 'Inquiry or Partnership Topic')}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">{t('company.labelMessage', 'Message Body')}</label>
                    <textarea
                      rows={4}
                      required
                      placeholder={t('company.placeholderBody', 'Detail your requirements so our staff can provide precision guidance...')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-slate-900 hover:shadow-lg disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? t('company.sending', 'Sending Request...') : t('company.sendMessage', 'Send Message')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
