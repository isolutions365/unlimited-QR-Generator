import express from 'express';
import path from 'path';
import fs from 'fs';
import { getFaqData } from '../src/data/faqData';

import enDict from '../src/locales/en.json';
import arDict from '../src/locales/ar.json';
import urDict from '../src/locales/ur.json';
import deDict from '../src/locales/de.json';
import frDict from '../src/locales/fr.json';
import esDict from '../src/locales/es.json';
import ptDict from '../src/locales/pt.json';
import itDict from '../src/locales/it.json';
import trDict from '../src/locales/tr.json';
import idDict from '../src/locales/id.json';
import hiDict from '../src/locales/hi.json';
import zhDict from '../src/locales/zh.json';
import jaDict from '../src/locales/ja.json';
import koDict from '../src/locales/ko.json';

import blogEn from '../src/locales/blog/en.json';
import blogAr from '../src/locales/blog/ar.json';
import blogUr from '../src/locales/blog/ur.json';
import blogDe from '../src/locales/blog/de.json';
import blogFr from '../src/locales/blog/fr.json';
import blogEs from '../src/locales/blog/es.json';
import blogPt from '../src/locales/blog/pt.json';
import blogIt from '../src/locales/blog/it.json';
import blogTr from '../src/locales/blog/tr.json';
import blogId from '../src/locales/blog/id.json';
import blogHi from '../src/locales/blog/hi.json';
import blogZh from '../src/locales/blog/zh.json';
import blogJa from '../src/locales/blog/ja.json';
import blogKo from '../src/locales/blog/ko.json';

// ============================================
// ENHANCED SITEMAP ROUTES WITH UNIQUE SEO DATA
// ============================================
export interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  seoTitle?: string;
  seoDescription?: string;
  isLanding?: boolean;
}

export const sitemapRoutes: SitemapRoute[] = [
  { 
    path: '/', 
    changefreq: 'weekly', 
    priority: '1.0',
    seoTitle: 'Free QR Code Generator - Dynamic QR Codes & Custom Creator',
    seoDescription: 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Complete with full design control, no sign-up required.'
  },
  { 
    path: '/about', 
    changefreq: 'monthly', 
    priority: '0.6', 
    seoTitle: 'About Free QR Code Generator - 100% Free Dynamic QR Tool',
    seoDescription: 'Learn about Free QR Code Generator, the free tool for creating dynamic QR codes with custom branding, real-time analytics, and no signup required.' 
  },
  { 
    path: '/contact', 
    changefreq: 'monthly', 
    priority: '0.6',
    seoTitle: 'Contact Free QR Code Generator - Support & Inquiries',
    seoDescription: 'Get in touch with Free QR Code Generator team for support, partnerships, or general inquiries. We are here to help 24/7.' 
  },
  { 
    path: '/faq', 
    changefreq: 'weekly', 
    priority: '0.9',
    seoTitle: 'FAQ - Free QR Code Generator | Common Questions Answered',
    seoDescription: 'Find answers to 25+ common questions about QR codes, static vs dynamic codes, error correction levels, customization, and how to create them.' 
  },
  { 
    path: '/blog', 
    changefreq: 'daily', 
    priority: '0.9',
    seoTitle: 'Guides, Tutorials & Marketing Blog - Free QR Code Generator',
    seoDescription: 'Read our technical and strategic guides on QR codes, dynamic redirects, QR codes for restaurant menus, business networking, and contactless services.' 
  },
  { 
    path: '/pricing', 
    changefreq: 'monthly', 
    priority: '0.7',
    seoTitle: 'Pricing - Free QR Code Generator (Always Free)',
    seoDescription: 'Free QR Code Generator is 100% free. No credit card, no signup, no watermarks. Create unlimited dynamic QR codes with full features.' 
  },
  { 
    path: '/privacy-policy', 
    changefreq: 'yearly', 
    priority: '0.4',
    seoTitle: 'Privacy Policy & Data Security Compliance | FreeQRBarcodes.com',
    seoDescription: 'Review our strict privacy policy. Zero cloud databases for static codes, offline-first client-side storage, and fully GDPR/CCPA compliant metrics.' 
  },
  { 
    path: '/security', 
    changefreq: 'yearly', 
    priority: '0.4',
    seoTitle: 'Security Standards & Phishing Prevention | FreeQRBarcodes.com',
    seoDescription: 'Review our advanced security architecture, including barcode input sanitization, defense against optical phishing (QRishing), and local encryption.' 
  },
  { 
    path: '/accessibility', 
    changefreq: 'yearly', 
    priority: '0.4',
    seoTitle: 'WCAG 2.2 Accessibility Standards | FreeQRBarcodes.com',
    seoDescription: 'Explore our commitment to accessibility. Learn about tactile QR guidelines, contrast ratios, and screen-reader compatibility under WCAG 2.2 AA.' 
  },
  { 
    path: '/terms', 
    changefreq: 'yearly', 
    priority: '0.4',
    seoTitle: 'Terms of Service - Free QR Code Generator',
    seoDescription: 'Read the terms of service for using Free QR Code Generator. Free for personal and commercial use with no restrictions.' 
  },
  { 
    path: '/academy', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'QR Code Academy - Learn QR Technology & Best Practices',
    seoDescription: 'Comprehensive guides on QR specifications, error correction, scannability standards, cybersecurity, and implementation best practices.' 
  },
  { 
    path: '/barcode-generator', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Free Barcode Generator - 1D & 2D Barcodes (Code 128, EAN, UPC)',
    seoDescription: 'Create free 1D linear and 2D matrix barcodes: Code 128, EAN-13, UPC-A, Code 39, ISBN, Data Matrix, PDF417. Print-ready vector exports.' 
  },
  { 
    path: '/bulk-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Bulk QR Code Generator - Create 1000s via CSV/Excel',
    seoDescription: 'Upload CSV or Excel files to generate hundreds or thousands of unique QR codes in bulk. Download ZIP with high-resolution branded codes.' 
  },
  { 
    path: '/zatca-invoice', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free ZATCA Phase 1 QR Code Generator (TLV) | FreeQRBarcodes',
    seoDescription: 'Generate ZATCA Phase 1 compliant TLV/Base64 QR codes for Simplified Tax Invoices instantly. Free, browser-based, no signup. Includes TLV inspector for Phase 2 verification.'
  },
  
  // Landing pages
  { 
    path: '/url-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free URL QR Code Generator - Trackable Short Links',
    seoDescription: 'Create free URL QR codes with trackable short links. Edit destination after printing, monitor scans, and export SVG/PNG. No signup required.' 
  },
  { 
    path: '/pdf-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free PDF QR Code Generator - Create Document QR Codes',
    seoDescription: 'Create custom QR codes that link directly to your online PDF documents, user manuals, catalogs, brochures, and reports. 100% free with vector export.' 
  },
  { 
    path: '/wifi-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free WiFi QR Code Generator - Instant Connect',
    seoDescription: 'Create WiFi QR codes for WPA/WPA2/WPA3 networks. Guests scan and connect automatically without typing passwords. Free and private.' 
  },
  { 
    path: '/vcard-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free vCard QR Code Generator - Create vCard 3.0 Contact Codes',
    seoDescription: 'Create standard vCard 3.0 contact QR codes with your name, phone, email, job title, company, address, and website. 100% free with instant export.' 
  },
  { 
    path: '/email-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Email QR Code Generator - Pre-filled Messages',
    seoDescription: 'Create email QR codes with pre-set recipient, subject, and body. Perfect for marketing campaigns and customer support. Free to use.' 
  },
  { 
    path: '/sms-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free SMS QR Code Generator - Text Message QR',
    seoDescription: 'Generate SMS QR codes with predefined phone numbers and message text. Ideal for promotions, alerts, and two-way communication.' 
  },
  { 
    path: '/whatsapp-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free WhatsApp QR Code Generator - Chat Links',
    seoDescription: 'Create WhatsApp QR codes to start conversations instantly. Pre-filled messages for support, sales, and marketing. Free and easy.' 
  },
  { 
    path: '/instagram-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Instagram QR Code Generator - Bio Links',
    seoDescription: 'Generate Instagram QR codes for bio links, posts, and reels. Drive traffic to your profile with custom branded QR codes.' 
  },
  { 
    path: '/facebook-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Facebook QR Code Generator - Page Links',
    seoDescription: 'Create Facebook QR codes for pages, groups, and events. Increase followers and engagement with scannable social links.' 
  },
  { 
    path: '/youtube-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free YouTube QR Code Generator - Channel Links',
    seoDescription: 'Generate YouTube QR codes for channels, videos, and playlists. Boost subscribers with custom branded QR codes. Free vector exports.' 
  },
  { 
    path: '/restaurant-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Restaurant QR Code Generator - Table & Venue QR Codes',
    seoDescription: 'Create custom QR codes for your restaurant, cafe, or bar. Link diners to your restaurant website, table info, social pages, and guest links.' 
  },
  { 
    path: '/business-card-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Business Card QR Code Generator - For Printed Business Cards',
    seoDescription: 'Generate clean, scanable QR codes to print on paper business cards. Help contacts save your details directly to their phones at networking events.' 
  },
  { 
    path: '/app-store-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free App Store QR Code Generator - iOS & Android',
    seoDescription: 'Create smart app download QR codes that auto-detect iOS or Android and redirect to the correct store. Perfect for app marketing.' 
  },
  { 
    path: '/location-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Location QR Code Generator - GPS & Map Links',
    seoDescription: 'Generate GPS QR codes for store locators, event venues, and tourism spots. Encode coordinates and map links for instant navigation.' 
  },
  { 
    path: '/restaurant-menu-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Restaurant Menu QR Code Generator - Digital Food & Drink Menus',
    seoDescription: 'Create custom menu QR codes for dining tables. Link guests directly to your digital food and drink menu, wine list, or hosted PDF menu.' 
  },
  { 
    path: '/digital-card-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Digital Card QR Code Generator - Paperless Contact Sharing',
    seoDescription: 'Create digital contact QR codes for screen-based, paperless contact sharing. Display on your phone or device for seamless mobile-to-mobile networking.' 
  },
  { 
    path: '/pdf-sharing-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free PDF Sharing QR Code Generator - Share Documents with Groups',
    seoDescription: 'Create QR codes designed for sharing documents, event handouts, training materials, and presentation slides with groups and audiences effortlessly.' 
  },
  { 
    path: '/animated-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Animated QR Code Generator | Dynamic & Moving QR Codes',
    seoDescription: 'Make your QR codes stand out with beautiful animated styles, loop transitions, custom GIF overlays, and eye-catching movement patterns.' 
  },
  { 
    path: '/payment-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Payment QR Code Generator | PayPal, IBAN & UPI QR Codes',
    seoDescription: 'Generate secure, customized payment QR codes. Accept PayPal, Venmo, Cash App, UPI, and bank IBAN transfers with a frictionless mobile scan.' 
  },
  { 
    path: '/crypto-qr-generator', 
    changefreq: 'weekly', 
    priority: '0.9', 
    isLanding: true,
    seoTitle: 'Free Crypto QR Code Generator | Bitcoin & Ethereum Wallet QRs',
    seoDescription: 'Generate secure, custom QR codes for cryptocurrency wallet addresses. Supports Bitcoin, Ethereum, Solana, and major crypto networks.' 
  },

  // Solutions pages
  { 
    path: '/solutions/contactless-menu', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Contactless Restaurant Menu QR Solution - Free Digital Menus',
    seoDescription: 'Implement contactless digital menus with QR codes. Update items instantly, reduce printing costs, and enhance guest experience.' 
  },
  { 
    path: '/solutions/digital-business-card', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Digital Business Card Solution - vCard QR Codes',
    seoDescription: 'Modern professional networking with digital business card QR codes. One-tap contact saving, custom branding, and real-time analytics.' 
  },
  { 
    path: '/solutions/google-review-booster', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Google Review Booster QR Solution - Get More 5-Star Reviews',
    seoDescription: 'Countertop QR codes that accelerate 5-star Google Business reviews. Increase ratings and attract more customers effortlessly.' 
  },
  { 
    path: '/solutions/wifi-guest-onboarding', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Guest WiFi Onboarding QR Solution - Hotels, Offices, Cafes',
    seoDescription: 'Seamless guest wireless connectivity with WiFi QR codes. No password typing required. Perfect for hotels, offices, and cafes.' 
  },
  { 
    path: '/solutions/event-ticket-qr-code', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Event Ticketing QR Solution - Fast Attendee Validation',
    seoDescription: 'QR code event ticketing and access control. Fast attendee validation, badge scanning, and real-time entry tracking for conferences.' 
  },
  { 
    path: '/solutions/event-ticketing-checkin', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'Event Check-In & Ticketing QR Solution',
    seoDescription: 'High-speed attendee check-in and access control with dynamic QR codes for live summits and conferences.' 
  },
  { 
    path: '/solutions/app-download-marketing', 
    changefreq: 'weekly', 
    priority: '0.8',
    seoTitle: 'App Download Marketing QR Solution',
    seoDescription: 'Smart multi-platform QR codes that dynamically route users to Apple App Store or Google Play.' 
  }
];

export const SEO_META_MAP: Record<string, SitemapRoute> = sitemapRoutes.reduce((acc, route) => {
  acc[route.path] = route;
  return acc;
}, {} as Record<string, SitemapRoute>);

// ============================================
// BLOG DATA (for SSR prerendering & SEO)
// ============================================
export interface BlogArticleMeta {
  title: string;
  description: string;
  date: string;
  dateModified: string;
  author: string;
  category: string;
}

export const blogArticles: Record<string, BlogArticleMeta> = {
  'what-is-qr-code-how-it-works': {
    title: 'What Is a QR Code & How Does It Work? The Definitive Guide',
    description: 'Discover the math, science, and practical mechanics behind QR codes. From automotive tracking in 1994 to universal digital convenience today.',
    date: '2026-06-02',
    dateModified: '2026-08-28',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  'static-vs-dynamic-qr-codes-guide': {
    title: 'Static vs. Dynamic QR Codes: Complete Architectural Guide',
    description: 'Choosing between static and dynamic QR codes is critical. Learn how payload immutability, server redirects, and real-time telemetry dictate the ideal solution.',
    date: '2026-06-14',
    dateModified: '2026-08-30',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  'qr-code-error-correction-levels-explained': {
    title: 'QR Error Correction Explained: L, M, Q, and H Comparison',
    description: 'Master Reed-Solomon error correction algorithms in QR codes. Learn how 7% to 30% recovery thresholds enable custom logos without scan failures.',
    date: '2026-07-02',
    dateModified: '2026-08-25',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  'omnichannel-retail-qr-codes-footfall-to-sales': {
    title: 'Omnichannel Retail: Converting In-Store Footfall into Digital Sales',
    description: 'Discover how modern retail stores use smart QR window decals and shelf-talkers to capture lost revenue and sync offline visitors with e-commerce.',
    date: '2026-06-18',
    dateModified: '2026-08-22',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  'b2b-lead-generation-with-qr-landing-pages': {
    title: 'B2B Lead Generation: High-Converting Trade Show QR Strategies',
    description: 'Learn how enterprise sales teams replace generic brochures with personalized dynamic QR codes to track booth visits and score prospects in real-time.',
    date: '2026-07-11',
    dateModified: '2026-08-26',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  'smart-packaging-qr-codes-product-engagement': {
    title: 'Smart Product Packaging: Driving Customer Engagement & Authenticity',
    description: 'Explore how FMCG and luxury brands print dynamic QR codes on packaging for serial verification, ingredient transparency, and loyalty rewards.',
    date: '2026-08-01',
    dateModified: '2026-08-29',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  'utm-tracking-measuring-qr-code-roi-ga4': {
    title: 'UTM Tracking & GA4: Measuring Exact Offline Print Campaign ROI',
    description: 'A step-by-step masterclass on structuring UTM campaign tags for QR codes to track billboard, direct mail, and magazine conversions in Google Analytics 4.',
    date: '2026-06-10',
    dateModified: '2026-08-20',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  'retargeting-offline-audiences-with-dynamic-qr': {
    title: 'Offline-to-Online Retargeting: Building Audiences from Physical Scans',
    description: 'Learn how dynamic QR redirect servers trigger Meta Pixels, Google Tag Manager events, and TikTok remarketing tags upon physical scan interactions.',
    date: '2026-07-08',
    dateModified: '2026-08-24',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  'ab-testing-print-advertising-with-qr-codes': {
    title: 'A/B Testing Physical Print Ads with Dynamic QR Short Links',
    description: 'Discover how growth marketers run split tests on print fliers, flyers, and direct mailers by routing alternating QR scans to different landing pages.',
    date: '2026-08-05',
    dateModified: '2026-08-31',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  'small-business-qr-code-starter-playbook': {
    title: 'The Small Business QR Playbook: 10 High-Impact Use Cases',
    description: 'Ten cost-effective, frictionless QR code implementations that neighborhood cafes, salons, auto shops, and boutiques can deploy in under 5 minutes.',
    date: '2026-06-05',
    dateModified: '2026-08-18',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  'how-to-boost-google-reviews-with-countertop-qr': {
    title: 'How to 10x Google Reviews with Countertop QR Display Stands',
    description: 'Learn the exact psychological triggers and technical setup to get satisfied customers to leave 5-star Google Business ratings right at checkout.',
    date: '2026-07-15',
    dateModified: '2026-08-27',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  'contactless-invoicing-qr-payment-receipts': {
    title: 'Contactless Invoicing: Adding Instant Payment QR Codes to Bills',
    description: 'Discover how freelancers, service contractors, and pop-up vendors generate instant payment QR codes on invoices for zero-fee rapid settlement.',
    date: '2026-08-06',
    dateModified: '2026-09-01',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  'anatomy-of-2d-matrix-grids-micro-qr-iqr': {
    title: 'The Technical Architecture of 2D Matrix Codes: Micro QR, iQR, and Standard Models',
    description: 'An in-depth technical analysis of 2D barcode variants, module capacities, coordinate encoding, and specialized industrial matrix standards.',
    date: '2026-06-22',
    dateModified: '2026-08-21',
    author: 'Dr. Elena Rostova, Cryptography & Signals Specialist',
    category: 'Technology'
  },
  'qr-code-cybersecurity-preventing-qshing-attacks': {
    title: 'Cybersecurity in QR Systems: Preventing Qshing & Malicious URL Redirection',
    description: 'Learn how cybercriminals exploit physical QR codes through QR phishing (Qshing) and how enterprise security protocols safeguard user scans.',
    date: '2026-07-19',
    dateModified: '2026-08-28',
    author: 'Dr. Elena Rostova, Cryptography & Signals Specialist',
    category: 'Technology'
  },
  'gs1-digital-link-2027-barcode-standards-transition': {
    title: 'GS1 Digital Link Transition: The 2027 Barcode Revolution Explained',
    description: 'Discover how the global retail industry is transitioning from legacy 1D UPC barcodes to 2D QR codes powered by the GS1 Digital Link standard.',
    date: '2026-08-10',
    dateModified: '2026-09-02',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'Technology'
  },
  'hotel-digital-checkin-guest-experience-qr': {
    title: 'Frictionless Hotel Check-Ins: Keyless Room Access & Concierge Web Apps',
    description: 'Learn how boutique and luxury hotels use contactless QR codes in lobbies and guest rooms to streamline check-ins, room service orders, and amenities booking.',
    date: '2026-06-25',
    dateModified: '2026-08-19',
    author: 'Elena Rossi, Hospitality Technology Specialist',
    category: 'Contactless Solutions'
  },
  'touchless-healthcare-clinic-patient-registration-qr': {
    title: 'Touchless Patient Registration: Modernizing Clinic Waiting Rooms with QR Forms',
    description: 'Explore how medical clinics, dental practices, and diagnostic centers streamline patient check-in and medical history intake using hygienic QR forms.',
    date: '2026-07-14',
    dateModified: '2026-08-23',
    author: 'Dr. Aris Thorne, Healthcare Systems Consultant',
    category: 'Contactless Solutions'
  },
  'smart-facility-maintenance-ticketing-equipment-qr': {
    title: 'Smart Facilities & Equipment Management: Instant Maintenance Ticketing',
    description: 'Discover how facility managers track HVAC units, elevators, and office assets with rugged industrial QR code decals linking to instant service logs.',
    date: '2026-08-04',
    dateModified: '2026-08-30',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'Contactless Solutions'
  },
  'complete-guide-to-digital-qr-restaurant-menus': {
    title: 'Modernizing the Dining Experience: Digital QR Menus vs Physical Laminates',
    description: 'Everything restaurateurs need to know about designing, printing, and optimizing contactless digital QR menus to increase average order values.',
    date: '2026-06-08',
    dateModified: '2026-08-17',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  'dynamic-pricing-and-realtime-menu-updates-qr': {
    title: 'Dynamic Pricing & Real-Time Item Disabling: Running Lean Kitchen Operations',
    description: 'Learn how high-volume bars and restaurants implement happy hour specials, surge pricing, and live 86-lists without reprinting tabletop QR stands.',
    date: '2026-07-06',
    dateModified: '2026-08-25',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  'tableside-ordering-and-speeding-up-table-turnover': {
    title: 'Table-Side Ordering & Self-Checkout: Increasing Table Turnaround by 30%',
    description: 'Explore how fast-casual and high-volume dining establishments boost table turnover rates and staff tips using tableside QR ordering and payments.',
    date: '2026-07-29',
    dateModified: '2026-08-31',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  'high-speed-event-ticketing-and-access-control-qr': {
    title: 'High-Throughput Ticketing: Scanning 1,000+ Attendees per Minute at Festivals',
    description: 'Learn how music festivals, stadiums, and conferences deploy high-speed QR barcode scanners, cryptographic validation, and offline turnstiles.',
    date: '2026-06-16',
    dateModified: '2026-08-22',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  'smart-networking-vcard-badges-for-conferences': {
    title: 'Interactive Conference Badges: Frictionless Digital Business Card Networking',
    description: 'Discover how corporate summit organizers replace paper business cards with dynamic vCard QR badges for instant contact exchange and lead scoring.',
    date: '2026-07-10',
    dateModified: '2026-08-27',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  'live-audience-polls-qa-interactive-event-qr': {
    title: 'Live Audience Polls & Stage Q&A: Engaging Hybrid Summit Attendees in Real-Time',
    description: 'Learn how keynote speakers and event producers drive 80%+ audience participation using giant stage-screen QR codes for live voting and anonymous Q&A.',
    date: '2026-08-08',
    dateModified: '2026-09-02',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  'interactive-textbooks-and-classroom-handouts-qr': {
    title: 'Interactive Textbooks: Linking Static Classroom Handouts to 3D Models & Video Lectures',
    description: 'Explore how K-12 educators and university professors transform static worksheets into dynamic learning portals with video solutions and 3D AR models.',
    date: '2026-06-12',
    dateModified: '2026-08-19',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  'campus-navigation-and-smart-building-directories-qr': {
    title: 'Campus Navigation & Building Directories: Guiding Freshmen with Geo-Tagged QRs',
    description: 'Learn how modern universities and hospital complexes place scannable QR signs at campus intersections to provide interactive 3D wayfinding maps.',
    date: '2026-07-21',
    dateModified: '2026-08-28',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  'qr-based-automated-student-attendance-systems': {
    title: 'Automated Attendance Systems: QR-Based Lecture Hall Check-In Best Practices',
    description: 'Discover how university lecture halls automate roll call for 300+ students in under two minutes using rotating dynamic QR codes and geofencing.',
    date: '2026-08-12',
    dateModified: '2026-09-03',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  'multi-link-social-bio-qr-codes-one-scan': {
    title: 'Multi-Link Bio QR Codes: Unifying Instagram, TikTok, YouTube & Spotify in One Scan',
    description: 'Learn how content creators, musicians, and influencers design aesthetic multi-link landing pages connected to a single scannable QR code.',
    date: '2026-06-20',
    dateModified: '2026-08-24',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  },
  'pop-up-store-activations-viral-social-qr-campaigns': {
    title: 'Interactive Pop-Up Store Activations: Turning Foot Traffic into Viral Social Followers',
    description: 'Discover how direct-to-consumer (DTC) fashion and beauty brands turn temporary pop-up shops into viral TikTok and Instagram follower magnets.',
    date: '2026-07-18',
    dateModified: '2026-08-29',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  },
  'influencer-merch-unboxing-direct-social-engagement': {
    title: 'Influencer Merch & Unboxing Campaigns: Driving Direct Engagement from Product Tags',
    description: 'Learn how top creators design custom hangtags and packaging inserts with QR codes to trigger viral unboxing videos and community hashtag growth.',
    date: '2026-08-14',
    dateModified: '2026-09-03',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  }
};

// ============================================
// LANDING PAGE FAQ DATA (for SSR schema injection)
// ============================================
export const landingPageFaqs: Record<string, Array<{q: string; a: string}>> = {
  'url-qr-generator': [
    { q: 'What is a URL QR code?', a: 'A URL QR code is a scannable barcode that redirects to a website link when scanned by a smartphone camera.' },
    { q: 'Can I track scans on my URL QR code?', a: 'Yes, dynamic URL QR codes provide real-time scan analytics including location, device type, and timestamp.' },
    { q: 'Can I change the URL after printing?', a: 'Yes, dynamic QR codes allow you to update the destination URL anytime without reprinting.' },
    { q: 'Is the URL QR code generator free?', a: 'Yes, Free QR Code Generator provides 100% free URL QR codes with no signup required.' },
    { q: 'What file formats can I download?', a: 'You can export in SVG, EPS, PDF, and high-resolution PNG formats.' },
    { q: 'How do I add my logo to a URL QR code?', a: 'Upload your logo in the design panel. The generator automatically centers it with error correction.' }
  ],
  'wifi-qr-generator': [
    { q: 'What is a WiFi QR code?', a: 'A WiFi QR code encodes network credentials so guests can connect automatically without typing passwords.' },
    { q: 'Which WiFi security protocols are supported?', a: 'We support WPA, WPA2, WPA3, and WEP encryption protocols.' },
    { q: 'Can I create a WiFi QR code without a password?', a: 'Yes, you can generate open network QR codes for public guest WiFi.' }
  ],
  'pdf-qr-generator': [
    { q: 'What is a PDF QR code?', a: 'A PDF QR code links to a downloadable PDF document, menu, catalog, or whitepaper.' },
    { q: 'Can I update the PDF after printing?', a: 'Yes, dynamic PDF QR codes allow you to replace the document without reprinting the code.' }
  ],
  'vcard-qr-generator': [
    { q: 'What is a vCard QR code?', a: 'A vCard QR code encodes contact information in VCF format for one-tap address book saving.' },
    { q: 'Which vCard versions are supported?', a: 'We support vCard 3.0 and 4.0 formats for maximum compatibility.' }
  ],
  'email-qr-generator': [
    { q: 'What is an Email QR code?', a: 'An Email QR code opens the scanner\'s default email client with recipient, subject line, and body text pre-populated.' },
    { q: 'Can I track email QR code scans?', a: 'Yes, dynamic email QR codes track every scan before launching the device email composer.' }
  ],
  'sms-qr-generator': [
    { q: 'How does an SMS QR code work?', a: 'Scanning an SMS QR code automatically opens the phone\'s messaging app with a destination number and pre-typed message.' },
    { q: 'Is SMS QR free to generate?', a: 'Yes, generating SMS QR codes is 100% free with unlimited scans.' }
  ],
  'whatsapp-qr-generator': [
    { q: 'What does a WhatsApp QR code do?', a: 'It initiates a direct WhatsApp chat with your phone number and optional pre-configured greeting message.' },
    { q: 'Does WhatsApp QR code work internationally?', a: 'Yes, ensure you include your country code without the plus sign or leading zeros.' }
  ],
  'restaurant-qr-generator': [
    { q: 'Why use a QR code for restaurant menus?', a: 'QR menus eliminate physical printing costs, enable instant price updates, and offer a touchless dining experience.' },
    { q: 'Can I update menu items without reprinting tableside QR stands?', a: 'Yes, dynamic menu QR codes update instantly in the cloud.' }
  ],
  'restaurant-menu-qr-generator': [
    { q: 'Why use a QR code for restaurant menus?', a: 'QR menus eliminate physical printing costs, enable instant price updates, and offer a touchless dining experience.' },
    { q: 'Can I update menu items without reprinting tableside QR stands?', a: 'Yes, dynamic menu QR codes update instantly in the cloud.' },
    { q: 'Do guests need an app to scan the restaurant menu?', a: 'No, guests can scan the QR code with their native phone camera.' }
  ],
  'digital-card-qr-generator': [
    { q: 'Is this digital business card generator free?', a: 'Yes! Generating static vCard QR codes on FreeQRBarcodes.com is 100% free with zero scan limits.' },
    { q: 'Do people need a special app to scan the card?', a: 'No, default smartphone cameras read and parse vCard data automatically.' },
    { q: 'Can I add social media links?', a: 'Yes! You can put your main profiles or portfolio page URL in the website fields.' }
  ],
  'pdf-sharing-qr-generator': [
    { q: 'What is a PDF QR code?', a: 'A PDF QR code links to a downloadable PDF document, menu, catalog, or whitepaper.' },
    { q: 'Can I update the PDF after printing?', a: 'Yes, dynamic PDF QR codes allow you to replace the document without reprinting the code.' }
  ],
  'animated-qr-generator': [
    { q: 'Will animated QR codes scan properly?', a: 'Yes! As long as the central data modules and finder patterns maintain sufficient contrast, camera optics parse animated QRs reliably.' },
    { q: 'What file formats can I download for animated QR codes?', a: 'You can export animated QR codes as GIF, MP4, WebM, or SVG.' },
    { q: 'Is the animated QR generator free?', a: 'Yes, 100% free to design, preview, and export without watermarks.' }
  ],
  'payment-qr-generator': [
    { q: 'Which payment platforms are supported?', a: 'We support PayPal, Venmo, Cash App, UPI, Bitcoin, Ethereum, and custom banking links.' },
    { q: 'Are payment QR codes safe to display publicly?', a: 'Yes. Payment QR codes only contain public payment requests or wallet addresses. They cannot pull funds without user authentication.' },
    { q: 'Is there a transaction fee for using payment QR codes?', a: 'No! FreeQRBarcodes charges zero fees. Standard platform fees from PayPal/Venmo still apply.' }
  ],
  'crypto-qr-generator': [
    { q: 'Which cryptocurrencies are supported?', a: 'Supports Bitcoin (BTC), Ethereum (ETH), Solana (SOL), USDT, USDC, and all major blockchain networks.' },
    { q: 'Are crypto wallet QR codes safe?', a: 'Yes, the QR code encodes only your public receive address. Your private keys are never exposed.' },
    { q: 'Can I include an exact payment amount in the QR code?', a: 'Yes, you can specify an optional crypto amount to request precise transaction amounts.' }
  ]
};

// ============================================
// SCHEMA BUILDERS
// ============================================

export const ORGANIZATION_SAME_AS: string[] = [
  "https://www.producthunt.com/posts/free-qr-generator-4",
  "https://www.freeqrbarcodes.com/about",
  "https://www.freeqrbarcodes.com/why-freeqrgen",
  "https://www.freeqrbarcodes.com/faq",
  "https://www.freeqrbarcodes.com/blog",
  "https://www.freeqrbarcodes.com/templates",
  "https://www.freeqrbarcodes.com/compare",
  "https://www.freeqrbarcodes.com/solutions",
  "https://www.freeqrbarcodes.com/system-status"
];

export function buildHomepageSchema(locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png",
          "caption": "Free QR Code Generator Logo"
        },
        "image": { "@id": "https://www.freeqrbarcodes.com/#logo" },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.freeqrbarcodes.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": "Free QR Code Generator - Dynamic QR Codes & Custom Creator",
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".hero-description", "#quick-answer"]
        }
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#webapplication`,
        "name": "Free QR Code Generator - Dynamic QR Codes & Custom Creator",
        "url": pageUrl,
        "description": "Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Complete with full design control, no sign-up required.",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "URL QR: Secure web redirects with live trackable shortened links.",
          "PDF QR: Contactless dynamic documents loading restaurant menus & guides.",
          "WiFi QR: Auto-pair guests to local wireless routers with no password typed.",
          "vCard QR: Share rich digital contact records immediately to scanners.",
          "Email QR: Preconfigure receiver addresses with customized boilerplate body text.",
          "SMS QR: Compose direct-to-text messages with pre-allocated phone nodes.",
          "WhatsApp QR: Trigger instant customized chat logs instantly with customer staff.",
          "Social QR: Consolidate bio-links directly to Instagram, Facebook and Youtube."
        ]
      },
      {
        "@type": "HowTo",
        "name": "How to Create a Custom QR Code",
        "description": "3 simple steps to create a free custom QR code with tracking and branding.",
        "totalTime": "PT2M",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Select Your Content Type",
            "text": "Choose from URL, vCard contact, WiFi password, plain text, SMS, WhatsApp link, or digital restaurant menu.",
            "url": `${pageUrl}#step1`
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Customize Design & Branding",
            "text": "Apply custom brand colors, linear gradients, unique corner eye shapes, and upload your central brand logo.",
            "url": `${pageUrl}#step2`
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Download & Track Scans",
            "text": "Export print-ready SVG or PNG files immediately and enable dynamic short-link scan tracking analytics.",
            "url": `${pageUrl}#step3`
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

export function buildBlogSchema(slug: string, article: BlogArticleMeta, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const articleUrl = locale === 'en' ? `${baseUrl}/blog/${slug}` : `${baseUrl}/${locale}/blog/${slug}`;
  const blogUrl = locale === 'en' ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#blogposting`,
        "headline": article.title,
        "description": article.description,
        "url": articleUrl,
        "datePublished": article.date.includes('T') ? article.date : `${article.date}T08:00:00+00:00`,
        "dateModified": article.dateModified ? (article.dateModified.includes('T') ? article.dateModified : `${article.dateModified}T08:00:00+00:00`) : (article.date.includes('T') ? article.date : `${article.date}T08:00:00+00:00`),
        "author": {
          "@type": "Person",
          "name": article.author,
          "url": "https://www.freeqrbarcodes.com/about",
          "jobTitle": "QR Code Technology Specialist",
          "worksFor": {
            "@type": "Organization",
            "name": "Free QR Code Generator",
            "@id": "https://www.freeqrbarcodes.com/#organization"
          }
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://www.freeqrbarcodes.com/#organization",
          "name": "Free QR Code Generator",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        },
        "inLanguage": locale,
        "articleSection": article.category,
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["#article-intro-text", "#article-main-body"]
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": blogUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": articleUrl
          }
        ]
      }
    ]
  };
}

export function buildLandingPageSchema(slug: string, route: SitemapRoute, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}/${slug}` : `${baseUrl}/${locale}/${slug}`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  const faqs = landingPageFaqs[slug] || [];
  
  const schemas: any[] = [
    {
      "@type": "Organization",
      "@id": "https://www.freeqrbarcodes.com/#organization",
      "name": "Free QR Code Generator",
      "url": "https://www.freeqrbarcodes.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.freeqrbarcodes.com/#logo",
        "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
      },
      "sameAs": ORGANIZATION_SAME_AS
    },
    {
      "@type": "WebSite",
      "@id": "https://www.freeqrbarcodes.com/#website",
      "name": "Free QR Code Generator",
      "url": "https://www.freeqrbarcodes.com/",
      "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      "url": pageUrl,
      "name": route.seoTitle || "Free QR Code Generator",
      "description": route.seoDescription || "",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".hero-description", "#technical-reference-node"]
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": route.seoTitle || "Free QR Code Generator",
      "applicationCategory": "UtilitiesApplication, BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": homeName,
          "item": homeUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": route.seoTitle ? route.seoTitle.split(' - ')[0].split(' | ')[0] : slug,
          "item": pageUrl
        }
      ]
    }
  ];

  // Add FAQPage schema if FAQs exist
  if (faqs.length > 0) {
    schemas.push({
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": schemas
  };
}

export function buildAboutPageSchema(route: SitemapRoute, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}${route.path}` : `${baseUrl}/${locale}${route.path}`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "description": "Provider of 100% free dynamic QR codes, high-density matrix symbology generators, and real-time scan analytics tools.",
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#aboutpage`,
        "url": pageUrl,
        "name": route.seoTitle || "About Free QR Code Generator",
        "description": route.seoDescription || "Learn about Free QR Code Generator, the free tool for creating dynamic QR codes with custom branding, real-time analytics, and no signup required.",
        "mainEntity": {
          "@id": "https://www.freeqrbarcodes.com/#organization"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About Us",
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

export function buildFaqPageSchema(route: SitemapRoute, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}${route.path}` : `${baseUrl}/${locale}${route.path}`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  const rawFaqs = getFaqData('en');
  const mainEntity = rawFaqs.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": route.seoTitle || "FAQ - Free QR Code Generator | Common Questions Answered",
        "description": route.seoDescription || "Find answers to 25+ common questions about QR codes, static vs dynamic codes, error correction levels, customization, and how to create them."
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faqpage`,
        "name": "Free QR Code Generator FAQ",
        "description": route.seoDescription || "Frequently asked questions about QR code generation, error correction, analytics, and security.",
        "mainEntity": mainEntity
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "FAQ",
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

export function buildBlogListingSchema(locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}/blog` : `${baseUrl}/${locale}/blog`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  const articleKeys = Object.keys(blogArticles);
  const itemListElements = articleKeys.map((slug, idx) => {
    const article = blogArticles[slug];
    const itemUrl = locale === 'en' ? `${baseUrl}/blog/${slug}` : `${baseUrl}/${locale}/blog/${slug}`;
    return {
      "@type": "ListItem",
      "position": idx + 1,
      "name": article.title,
      "url": itemUrl
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "Blog",
        "@id": `${pageUrl}#blog`,
        "url": pageUrl,
        "name": "Guides, Tutorials & Marketing Blog - Free QR Code Generator",
        "description": "Read our technical and strategic guides on QR codes, dynamic redirects, QR codes for restaurant menus, business networking, and contactless services.",
        "publisher": {
          "@id": "https://www.freeqrbarcodes.com/#organization"
        }
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#itemlist`,
        "name": "Free QR Code Generator Blog Articles & Guides",
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "numberOfItems": itemListElements.length,
        "itemListElement": itemListElements
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

export function buildSolutionSchema(route: SitemapRoute | { path: string; seoTitle?: string; seoDescription?: string }, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}${route.path}` : `${baseUrl}/${locale}${route.path}`;
  const solutionsUrl = locale === 'en' ? `${baseUrl}/solutions` : `${baseUrl}/${locale}/solutions`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  const solutionSlug = route.path.replace('/solutions/', '').replace(/-/g, ' ');
  const solutionName = route.seoTitle ? route.seoTitle.split(' - ')[0] : (solutionSlug.replace(/\b\w/g, l => l.toUpperCase()) + ' QR Solution');
  const solutionDesc = route.seoDescription || `Custom enterprise-grade ${solutionName} designed for high-density matrix scanning, vector exports, and real-time telemetry.`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": route.seoTitle || solutionName,
        "description": solutionDesc
      },
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        "name": solutionName,
        "serviceType": "QR Code Generation & Matrix Symbology Solutions",
        "description": solutionDesc,
        "provider": {
          "@id": "https://www.freeqrbarcodes.com/#organization"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Solutions",
            "item": solutionsUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": solutionName,
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

export function buildGenericPageSchema(route: SitemapRoute, locale: SupportedLocale = 'en') {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const pageUrl = locale === 'en' ? `${baseUrl}${route.path}` : `${baseUrl}/${locale}${route.path}`;
  const homeUrl = locale === 'en' ? `${baseUrl}/` : `${baseUrl}/${locale}`;
  const homeName = LOCALE_HOME_NAMES[locale] || 'Home';
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.freeqrbarcodes.com/#organization",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.freeqrbarcodes.com/#logo",
          "url": "https://www.freeqrbarcodes.com/apple-touch-icon.png"
        },
        "sameAs": ORGANIZATION_SAME_AS
      },
      {
        "@type": "WebSite",
        "@id": "https://www.freeqrbarcodes.com/#website",
        "name": "Free QR Code Generator",
        "url": "https://www.freeqrbarcodes.com/",
        "publisher": { "@id": "https://www.freeqrbarcodes.com/#organization" }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": route.seoTitle || "Free QR Code Generator",
        "description": route.seoDescription || ""
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": route.seoTitle ? route.seoTitle.split(' - ')[0].split(' | ')[0] : route.path,
            "item": pageUrl
          }
        ]
      }
    ]
  };
}

// ============================================
// SITEMAP XML GENERATOR
// ============================================

export function buildSitemapXml(): string {
  const baseUrl = 'https://www.freeqrbarcodes.com';
  const lastmod = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  let count = 0;
  
  for (const route of sitemapRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.path === '/' ? '' : route.path}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
    count++;
  }
  
  // Add blog articles
  for (const slug of Object.keys(blogArticles)) {
    const article = blogArticles[slug];
    const articleDate = article.date && /^\d{4}-\d{2}-\d{2}$/.test(article.date) ? article.date : lastmod;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${articleDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
    count++;
  }
  
  xml += `</urlset>`;
  
  // Final route validation to ensure all 71 canonical URLs are present
  if (count !== 71) {
    console.warn(`Sitemap generation validation mismatch: expected 71 URLs, generated ${count}.`);
  } else {
    console.info(`Sitemap generation validated: successfully compiled exactly ${count} canonical URLs.`);
  }
  
  return xml;
}

// ============================================
// SUPPORTED LOCALES & HREFLANG GENERATOR
// ============================================

export const SUPPORTED_LOCALES = [
  'en', 'ar', 'ur', 'de', 'fr', 'es', 'pt', 'it', 'tr', 'id', 'hi', 'zh', 'ja', 'ko'
] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_HOME_NAMES: Record<SupportedLocale, string> = {
  en: 'Home',
  ar: 'الرئيسية',
  ur: 'Home',
  de: 'Startseite',
  fr: 'Accueil',
  es: 'Inicio',
  pt: 'Início',
  it: 'Home',
  tr: 'Ana Sayfa',
  id: 'Beranda',
  hi: 'मुख्य पृष्ठ',
  zh: '首页',
  ja: 'ホーム',
  ko: '홈'
};

const localeDicts: Record<SupportedLocale, Record<string, string>> = {
  en: enDict,
  ar: arDict,
  ur: urDict,
  de: deDict,
  fr: frDict,
  es: esDict,
  pt: ptDict,
  it: itDict,
  tr: trDict,
  id: idDict,
  hi: hiDict,
  zh: zhDict,
  ja: jaDict,
  ko: koDict,
};

const blogLocaleDicts: Record<SupportedLocale, any[]> = {
  en: blogEn,
  ar: blogAr,
  ur: blogUr,
  de: blogDe,
  fr: blogFr,
  es: blogEs,
  pt: blogPt,
  it: blogIt,
  tr: blogTr,
  id: blogId,
  hi: blogHi,
  zh: blogZh,
  ja: blogJa,
  ko: blogKo,
};

const legacyBlogMap: Record<string, string> = {
  'what-is-a-qr-code-and-how-does-it-work': 'what-is-qr-code-how-it-works',
  'static-vs-dynamic-qr-codes-complete-architectural-guide': 'static-vs-dynamic-qr-codes-guide',
  'qr-code-restaurant-menu-guide': 'qr-code-restaurant-menu-guide',
  'what-is-a-dynamic-qr-code': 'static-vs-dynamic-qr-codes-guide',
};

export function getLocalizedSeoMetadata(
  cleanPath: string,
  locale: SupportedLocale,
  defaultTitle: string,
  defaultDescription: string
): { title: string; description: string } {
  if (locale === 'en' || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return { title: defaultTitle, description: defaultDescription };
  }

  const dict = localeDicts[locale];
  if (!dict) {
    return { title: defaultTitle, description: defaultDescription };
  }

  let title = '';
  let description = '';

  // 1. Homepage
  if (cleanPath === '/' || cleanPath === '') {
    title = dict['guides.item.url-qr-generator.title'] || dict['footer.brandName'] || '';
    description = dict['footer.brandDesc'] || dict['guides.item.url-qr-generator.desc'] || '';
  }

  // 2. Landing / Tool Pages
  const toolSlug = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  if (!title && dict[`guides.item.${toolSlug}.title`]) {
    title = dict[`guides.item.${toolSlug}.title`];
    description = dict[`guides.item.${toolSlug}.desc`] || '';
  }

  // 3. Solutions Pages
  if (!title && cleanPath.startsWith('/solutions/')) {
    const solSlug = cleanPath.replace('/solutions/', '');
    if (dict[`programmatic.item.${solSlug}.title`]) {
      title = dict[`programmatic.item.${solSlug}.title`];
      description = dict[`programmatic.item.${solSlug}.desc`] || '';
    }
  }

  // 4. Blog Index
  if (!title && cleanPath === '/blog') {
    if (dict['blog.blogTitle']) title = dict['blog.blogTitle'];
    if (dict['blog.marketingGuidesDesc']) description = dict['blog.marketingGuidesDesc'];
  }

  // 5. Blog Posts
  if (!title && cleanPath.startsWith('/blog/')) {
    let postSlug = cleanPath.replace('/blog/', '').replace(/\/$/, '');
    if (legacyBlogMap[postSlug]) {
      postSlug = legacyBlogMap[postSlug];
    }
    const blogList = blogLocaleDicts[locale];
    if (Array.isArray(blogList)) {
      const post = blogList.find((p: any) => p && p.slug === postSlug);
      if (post) {
        title = post.metaTitle || post.title || '';
        description = post.metaDescription || post.intro || '';
      }
    }
  }

  // 6. FAQ Page
  if (!title && cleanPath === '/faq') {
    if (dict['faq.title']) title = dict['faq.title'];
    if (dict['faq.description']) description = dict['faq.description'];
  }

  // 7. Company / Static Pages
  const staticMap: Record<string, { t: string; d: string }> = {
    '/about': { t: 'company.aboutTitle', d: 'company.aboutDesc' },
    '/contact': { t: 'company.contactTitle', d: 'company.contactDesc' },
    '/privacy-policy': { t: 'company.privacyTitle', d: 'company.privacyDesc' },
    '/terms': { t: 'company.termsTitle', d: 'company.termsDesc' },
    '/solutions': { t: 'programmatic.title', d: 'programmatic.directorySubheading' },
    '/templates': { t: 'templates.title', d: 'templates.directorySubheading' },
    '/compare': { t: 'compare.title', d: 'compare.directorySubheading' },
  };

  if (!title && staticMap[cleanPath]) {
    const { t, d } = staticMap[cleanPath];
    if (dict[t]) title = dict[t];
    if (dict[d]) description = dict[d];
  }

  return {
    title: title || defaultTitle,
    description: description || defaultDescription,
  };
}

/**
 * Extracts the locale prefix (if any) and normalizes the canonical route path
 */
export function extractLocaleAndPath(pathname: string): { locale: SupportedLocale; cleanPath: string } {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length > 0 && (SUPPORTED_LOCALES as readonly string[]).includes(parts[0])) {
    const locale = parts[0] as SupportedLocale;
    const cleanPath = parts.length > 1 ? '/' + parts.slice(1).join('/') : '/';
    return { locale, cleanPath };
  }
  return { locale: 'en', cleanPath: normalized };
}

/**
 * Generates the full hreflang alternates link tags for all 14 supported languages + x-default
 */
export function buildHreflangTags(cleanPath: string, baseUrl = 'https://www.freeqrbarcodes.com'): string {
  const normalizedPath = cleanPath === '/' ? '' : (cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`);
  const enUrl = `${baseUrl}${normalizedPath || '/'}`;
  
  const entries: { hreflang: string; href: string }[] = [
    { hreflang: 'en', href: enUrl },
    { hreflang: 'ar', href: `${baseUrl}/ar${normalizedPath}` },
    { hreflang: 'ur', href: `${baseUrl}/ur${normalizedPath}` },
    { hreflang: 'de', href: `${baseUrl}/de${normalizedPath}` },
    { hreflang: 'fr', href: `${baseUrl}/fr${normalizedPath}` },
    { hreflang: 'es', href: `${baseUrl}/es${normalizedPath}` },
    { hreflang: 'pt', href: `${baseUrl}/pt${normalizedPath}` },
    { hreflang: 'it', href: `${baseUrl}/it${normalizedPath}` },
    { hreflang: 'tr', href: `${baseUrl}/tr${normalizedPath}` },
    { hreflang: 'id', href: `${baseUrl}/id${normalizedPath}` },
    { hreflang: 'hi', href: `${baseUrl}/hi${normalizedPath}` },
    { hreflang: 'zh', href: `${baseUrl}/zh${normalizedPath}` },
    { hreflang: 'ja', href: `${baseUrl}/ja${normalizedPath}` },
    { hreflang: 'ko', href: `${baseUrl}/ko${normalizedPath}` },
    { hreflang: 'x-default', href: enUrl }
  ];

  return entries.map(e => `<link rel="alternate" hreflang="${e.hreflang}" href="${e.href}" />`).join('\n    ');
}

// ============================================
// SERVE HTML WITH SEO AND SCHEMA MIDDLEWARE
// ============================================

let cachedProdHtml: string | null = null;
const seoResponseCache = new Map<string, { html: string; timestamp: number }>();
const SEO_CACHE_TTL_MS = 60 * 1000;

export async function serveHtmlWithSeoAndSchema(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const rawPath = (req.path || '/').replace(/\/+$/, '') || '/';
    
    // Skip API and static asset requests
    if (
      rawPath.startsWith('/api/') || 
      rawPath.startsWith('/ws') || 
      rawPath.startsWith('/@') || 
      rawPath.startsWith('/node_modules/') || 
      rawPath.startsWith('/src/') ||
      rawPath.startsWith('/assets/') ||
      rawPath.match(/\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|webmanifest)$/)
    ) {
      return next();
    }

    const cacheKey = `${rawPath}?${req.url.split('?')[1] || ''}`;
    const cached = seoResponseCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < SEO_CACHE_TTL_MS) {
      res.setHeader('Content-Security-Policy-Report-Only', "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.google.com https://www.gstatic.com https://www.producthunt.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://*.googleapis.com; frame-src https://www.google.com https://www.producthunt.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self';");
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
      res.setHeader('CDN-Cache-Control', 'no-store');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.status(200).send(cached.html);
    }

    // Serve sitemap.xml directly
    if (rawPath === '/sitemap.xml') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(buildSitemapXml());
    }

    // Determine HTML template path with high-performance in-memory caching for production
    const isProd = process.env.NODE_ENV === 'production';
    let html: string;

    if (isProd && cachedProdHtml) {
      html = cachedProdHtml;
    } else {
      const indexPath = isProd
        ? path.join(process.cwd(), 'dist', 'index.html')
        : path.join(process.cwd(), 'index.html');

      if (!fs.existsSync(indexPath)) {
        return next();
      }

      html = fs.readFileSync(indexPath, 'utf-8');
      if (isProd) {
        cachedProdHtml = html;
      }
    }

    // Apply Vite transform in development mode
    if (!isProd && (global as any).viteInstance) {
      try {
        html = await (global as any).viteInstance.transformIndexHtml(req.originalUrl || req.url, html);
      } catch (viteErr) {
        console.warn('[Vite Transform Error]:', viteErr);
      }
    }

    // ============================================
    // ROUTE MATCHING LOGIC (ENHANCED WITH LOCALES)
    // ============================================
    const { locale, cleanPath } = extractLocaleAndPath(rawPath);
    
    // 1. Exact match in sitemapRoutes
    let matchedRoute = sitemapRoutes.find(r => r.path === cleanPath);
    
    // 2. Pattern match for blog posts: /blog/:slug
    let isBlogPost = false;
    let blogSlug = '';
    if (!matchedRoute && cleanPath.startsWith('/blog/')) {
      blogSlug = cleanPath.replace('/blog/', '').replace(/\/$/, '');
      if (blogArticles[blogSlug]) {
        isBlogPost = true;
      }
    }
    
    // 3. Pattern match for solutions: /solutions/*
    let isSolution = false;
    if (!matchedRoute && cleanPath.startsWith('/solutions/')) {
      isSolution = true;
    }

    // ============================================
    // SEO DATA & SCHEMA GENERATION
    // ============================================
    
    const baseUrl = 'https://www.freeqrbarcodes.com';
    let pageTitle = 'Free QR Code Generator - Dynamic QR Codes & Custom Creator';
    let pageDescription = 'Create free dynamic QR codes with logos, custom colors, gradients, and real-time scan analytics. Complete with full design control, no sign-up required.';
    let pageUrl = locale === 'en'
      ? `${baseUrl}${cleanPath === '/' ? '/' : cleanPath}`
      : `${baseUrl}/${locale}${cleanPath === '/' ? '' : cleanPath}`;
    let schemaJson: any = buildHomepageSchema(locale);
    let prerenderedH1 = '';
    let noscriptHtml = '';

    // --- HOMEPAGE SEO ---
    if (cleanPath === '/' || matchedRoute?.path === '/') {
      pageTitle = matchedRoute?.seoTitle || pageTitle;
      pageDescription = matchedRoute?.seoDescription || pageDescription;
      schemaJson = buildHomepageSchema(locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">Free QR Code Generator</h1>`;
      noscriptHtml = `
        <div class="max-w-5xl mx-auto px-6 py-16">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed max-w-3xl mt-4">${pageDescription}</p>
          
          <div class="mt-12 space-y-8">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Professional QR & Barcode Creator Tools</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Generate high-resolution vector QR codes for websites, WiFi networks, vCard business profiles, social media hubs, and multi-format linear barcodes (UPC-A, EAN-13, Code 128) with custom artistic patterns, hex gradients, and embedded company logos.
              </p>
            </section>
            
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Why Choose Our Free QR Code Studio</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Enjoy 100% free unlimited vector exports in SVG, PDF, and PNG formats. Our client-side privacy-first architecture guarantees that your private WiFi credentials, contacts, and sensitive links are encoded locally in your browser with zero data harvesting.
              </p>
            </section>
          </div>
        </div>
      `;
    }
    // --- BLOG POST SEO ---
    else if (isBlogPost && blogArticles[blogSlug]) {
      const article = blogArticles[blogSlug];
      pageTitle = `${article.title} - Free QR Code Generator Blog`;
      pageDescription = article.description;
      schemaJson = buildBlogSchema(blogSlug, article, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">${article.title}</h1>`;
      noscriptHtml = `
        <article class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <div class="text-sm text-slate-500 mb-6">
            <span>By ${article.author}</span> | 
            <time datetime="${article.date}">${article.date}</time> | 
            <span>Category: ${article.category}</span>
          </div>
          
          <section class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight mb-3">Article Overview</h2>
            <p class="text-base text-slate-700 leading-relaxed">${article.description}</p>
          </section>
          
          <p><a href="/blog" class="text-indigo-600 font-bold hover:underline">← Back to Blog Articles</a></p>
        </article>
      `;
    }
    // --- BLOG INDEX / LISTING SEO ---
    else if (cleanPath === '/blog') {
      pageTitle = matchedRoute?.seoTitle || 'QR Code Guides, Tutorials & Marketing Insights | FreeQRBarcodes.com';
      pageDescription = matchedRoute?.seoDescription || 'Explore in-depth technical guides, dynamic QR best practices, contactless menu strategies, and barcode industry tutorials.';
      schemaJson = buildBlogListingSchema(locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">QR Code Guides & Marketing Blog</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed mb-8">${pageDescription}</p>
          
          <section class="space-y-6">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Featured Articles & Implementation Guides</h2>
            <ul class="space-y-4">
              ${Object.keys(blogArticles).map(slug => {
                const art = blogArticles[slug];
                return `
                  <li class="border-b border-slate-100 pb-4">
                    <h3 class="text-lg font-bold text-slate-900"><a href="/blog/${slug}" class="text-indigo-600 hover:underline">${art.title}</a></h3>
                    <p class="text-sm text-slate-600 mt-1">${art.description}</p>
                  </li>
                `;
              }).join('')}
            </ul>
          </section>
        </div>
      `;
    }
    // --- ABOUT PAGE SEO ---
    else if (cleanPath === '/about') {
      pageTitle = matchedRoute?.seoTitle || 'About Free QR Code Generator - 100% Free Dynamic QR Tool';
      pageDescription = matchedRoute?.seoDescription || 'Learn about Free QR Code Generator, the free tool for creating dynamic QR codes with custom branding, real-time analytics, and no signup required.';
      schemaJson = buildAboutPageSchema(matchedRoute || {
        path: '/about',
        changefreq: 'monthly',
        priority: '0.6',
        seoTitle: pageTitle,
        seoDescription: pageDescription
      }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">About Free QR Code Generator</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed mb-8">${pageDescription}</p>
          
          <div class="space-y-8">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Our Mission & Platform Architecture</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                We started with a simple belief: QR codes don't have to be boring black-and-white grids or locked behind costly enterprise subscriptions. We deliver industrial-strength dynamic vector generation directly in your browser.
              </p>
            </section>
            
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Privacy-First Local Encoding</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                All matrix calculations, logo centerpieces, and vector renderings are computed client-side in your device's sandbox. Your private passwords and payload strings remain secure.
              </p>
            </section>
          </div>
        </div>
      `;
    }
    // --- FAQ PAGE SEO ---
    else if (cleanPath === '/faq') {
      pageTitle = matchedRoute?.seoTitle || 'FAQ - Free QR Code Generator | Common Questions Answered';
      pageDescription = matchedRoute?.seoDescription || 'Find answers to 25+ common questions about QR codes, static vs dynamic codes, error correction levels, customization, and how to create them.';
      schemaJson = buildFaqPageSchema(matchedRoute || {
        path: '/faq',
        changefreq: 'monthly',
        priority: '0.6',
        seoTitle: pageTitle,
        seoDescription: pageDescription
      }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">Frequently Asked Questions</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed mb-8">${pageDescription}</p>
          
          <section class="space-y-6">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Universal Knowledge Base & Common Questions</h2>
            <div class="space-y-4">
              ${getFaqData('en').slice(0, 10).map(faq => `
                <div class="border-b border-slate-100 pb-4">
                  <h3 class="text-base font-bold text-slate-900">${faq.question}</h3>
                  <p class="text-sm text-slate-600 mt-1">${faq.answer}</p>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      `;
    }
    // --- SOLUTIONS PAGES ---
    else if (isSolution || cleanPath.startsWith('/solutions/')) {
      const solutionSlug = cleanPath.replace('/solutions/', '').replace(/-/g, ' ');
      const solutionName = matchedRoute?.seoTitle ? matchedRoute.seoTitle.split(' - ')[0] : (solutionSlug.replace(/\b\w/g, l => l.toUpperCase()) + ' QR Solution');
      pageTitle = matchedRoute?.seoTitle || `${solutionName} QR Solution - Free QR Code Generator`;
      pageDescription = matchedRoute?.seoDescription || `Implement ${solutionName} with QR codes. Free tool with dynamic updates, analytics, and vector exports. No signup required.`;
      
      schemaJson = buildSolutionSchema(matchedRoute || {
        path: cleanPath,
        changefreq: 'weekly',
        priority: '0.8',
        seoTitle: pageTitle,
        seoDescription: pageDescription
      }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">${solutionName}</h1>`;
      noscriptHtml = `
        <div class="max-w-5xl mx-auto px-6 py-16">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed max-w-3xl mt-4">${pageDescription}</p>
          
          <div class="mt-12 space-y-8">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Solution Features & Capabilities</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Streamline workflows with high-density barcode rendering, instant error-correction level adjustments (L, M, Q, H), and bespoke styling to elevate your brand presence.
              </p>
            </section>
            
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Implementation & Deployment</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Deploy dynamic QR codes across printed signage, digital menus, packaging decals, and point-of-sale systems with guaranteed high scan rates.
              </p>
            </section>
          </div>
          
          <div class="mt-8">
            <a href="/" class="text-indigo-600 font-bold hover:underline">← Back to Creative Station</a>
          </div>
        </div>
      `;
    }
    // --- LANDING PAGE SEO ---
    else if (matchedRoute?.isLanding) {
      pageTitle = matchedRoute.seoTitle || pageTitle;
      pageDescription = matchedRoute.seoDescription || pageDescription;
      schemaJson = buildLandingPageSchema(matchedRoute.path.replace('/', ''), matchedRoute, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">${pageTitle.split(' - ')[0]}</h1>`;
      noscriptHtml = `
        <div class="max-w-5xl mx-auto px-6 py-16">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed max-w-3xl mt-4">${pageDescription}</p>
          
          <div class="mt-12 space-y-8">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">How It Works</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Enter your target link or payload, customize eye styles and hex gradients, embed your brand logo with high-density Reed-Solomon error correction, and download instant vector files (SVG/PDF/PNG).
              </p>
            </section>
            
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Our free generator creates both static and dynamic QR codes that never expire, support unlimited scans, and work seamlessly across iOS, Android, and industrial scanners.
              </p>
            </section>
          </div>
          
          <div class="mt-8">
            <a href="/" class="text-indigo-600 font-bold hover:underline">← Back to Home</a>
          </div>
        </div>
      `;
    }
    // --- PRIVACY POLICY PAGE ---
    else if (cleanPath === '/privacy-policy') {
      pageTitle = matchedRoute?.seoTitle || 'Privacy Policy & Data Security Compliance | FreeQRBarcodes.com';
      pageDescription = matchedRoute?.seoDescription || 'Review our strict privacy policy. Zero cloud databases for static codes, offline-first client-side storage, and fully GDPR/CCPA compliant metrics.';
      schemaJson = buildGenericPageSchema(matchedRoute || { path: '/privacy-policy', changefreq: 'yearly', priority: '0.4', seoTitle: pageTitle, seoDescription: pageDescription }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">Privacy Policy & Zero-Tracking Security Architecture</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <div class="text-xs text-slate-500 mb-6 uppercase tracking-wider font-semibold">Last Updated: July 6, 2026 | Version v3.0.0</div>
          <p class="text-base text-slate-700 leading-relaxed mb-6">${pageDescription}</p>
          
          <div class="space-y-8 mt-8">
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">1. Client-Side Processing Strategy (Zero-Tracking)</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                FreeQRBarcodes.com operates primarily as a client-side utility. Static QR codes are generated directly in your web browser memory using standard JavaScript canvas libraries. None of the data arrays, payloads, WiFi keys, or contact information are uploaded to our servers.
              </p>
            </section>
            
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">2. Dynamic Campaigns & Analytics Data Collection</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                For dynamic campaign redirects, we act as a Data Processor. We collect anonymized redirection counts, date-time intervals, browser client agent details, and regional location hashes. This telemetry is stored in secure encrypted cloud containers and automatically purged after 180 days.
              </p>
            </section>

            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">3. GDPR & CCPA Compliance Rights</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain the right to be forgotten, the right to data portability, and the right to restrict processing. You can manage or delete your campaign metrics instantly via our dashboard.
              </p>
            </section>
          </div>
        </div>
      `;
    }
    // --- SECURITY ASSURANCE PAGE ---
    else if (cleanPath === '/security') {
      pageTitle = matchedRoute?.seoTitle || 'Security Standards & Phishing Prevention | FreeQRBarcodes.com';
      pageDescription = matchedRoute?.seoDescription || 'Review our advanced security architecture, including barcode input sanitization, defense against optical phishing (QRishing), and local encryption.';
      schemaJson = buildGenericPageSchema(matchedRoute || { path: '/security', changefreq: 'yearly', priority: '0.4', seoTitle: pageTitle, seoDescription: pageDescription }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">Security Architecture & Input Sanitization</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <div class="text-xs text-slate-500 mb-6 uppercase tracking-wider font-semibold">Last Updated: July 4, 2026 | Version v2.8.0</div>
          <p class="text-base text-slate-700 leading-relaxed mb-6">${pageDescription}</p>
          
          <div class="space-y-8 mt-8">
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">1. Mitigating QR Code Phishing ("QRishing")</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                Phishing attacks leveraging optical codes represent a severe vector. To mitigate this threat, FreeQRBarcodes.com parses and sanitizes all input matrices client-side. We filter strings against common injection expressions, preventing malicious SQL strings, scripts, and executable terminal vectors from being compiled.
              </p>
            </section>
            
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">2. Transit Cryptography and Infrastructure Hardening</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                All external API calls, dynamic redirections, and system interfaces are encrypted in transit using Transport Layer Security (TLS 1.3) protocols. Automated firewalls detect and suppress Distributed Denial of Service (DDoS) attempts, while continuous static security analysis checks every deployment node.
              </p>
            </section>
          </div>
        </div>
      `;
    }
    // --- ACCESSIBILITY STATEMENT PAGE ---
    else if (cleanPath === '/accessibility') {
      pageTitle = matchedRoute?.seoTitle || 'WCAG 2.2 Accessibility Standards | FreeQRBarcodes.com';
      pageDescription = matchedRoute?.seoDescription || 'Explore our commitment to accessibility. Learn about tactile QR guidelines, contrast ratios, and screen-reader compatibility under WCAG 2.2 AA.';
      schemaJson = buildGenericPageSchema(matchedRoute || { path: '/accessibility', changefreq: 'yearly', priority: '0.4', seoTitle: pageTitle, seoDescription: pageDescription }, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">Accessibility Statement & WCAG 2.2 Conformity</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <div class="text-xs text-slate-500 mb-6 uppercase tracking-wider font-semibold">Last Updated: July 1, 2026 | Version v2.0.1</div>
          <p class="text-base text-slate-700 leading-relaxed mb-6">${pageDescription}</p>
          
          <div class="space-y-8 mt-8">
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">1. Digital Accessibility Standards</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                We design and program our interfaces to conform rigorously with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. Our digital workspace fully supports screen readers through standardized ARIA labeling, respects user-level contrast configurations, and features custom keyboard focus traps to ensure seamless navigation.
              </p>
            </section>
            
            <section class="border-t border-slate-100 pt-6">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight mb-3">2. Physical Accessibility Guidelines</h2>
              <p class="text-sm text-slate-600 leading-relaxed">
                An accessibility gap exists between screen-based interactions and printed media. To resolve this, we provide guidance for tactile reliefs, textured boundary framing, and braille pairing options alongside public barcode targets, enabling visually impaired or blind operators to scan printed materials autonomously.
              </p>
            </section>
          </div>
        </div>
      `;
    }
    // --- GENERIC PAGE SEO ---
    else if (matchedRoute && matchedRoute.seoTitle) {
      pageTitle = matchedRoute.seoTitle;
      pageDescription = matchedRoute.seoDescription || pageDescription;
      schemaJson = buildGenericPageSchema(matchedRoute, locale);
      
      prerenderedH1 = `<h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">${pageTitle.split(' - ')[0]}</h1>`;
      noscriptHtml = `
        <div class="max-w-4xl mx-auto py-10 px-4">
          ${prerenderedH1}
          <p class="text-base text-slate-700 leading-relaxed mt-4">${pageDescription}</p>
          
          <div class="mt-8 space-y-6">
            <section>
              <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Overview & Technical Specifications</h2>
              <p class="text-sm text-slate-600 mt-2 leading-relaxed">
                Explore our comprehensive documentation, configuration options, and privacy standards engineered for seamless digital-to-physical connectivity.
              </p>
            </section>
          </div>
          
          <div class="mt-8">
            <a href="/" class="text-indigo-600 font-bold hover:underline">← Back to Creative Station</a>
          </div>
        </div>
      `;
    }

    // ============================================
    // APPLY LOCALIZED SEO METADATA (P2 FIX)
    // ============================================
    if (locale !== 'en') {
      const localized = getLocalizedSeoMetadata(cleanPath, locale, pageTitle, pageDescription);
      pageTitle = localized.title;
      pageDescription = localized.description;
    }

    // ============================================
    // HTML INJECTION & REPLACEMENTS
    // ============================================
    
    // Inject Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
    
    // Inject Meta Description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/i, `<meta name="description" content="${pageDescription}" />`);
    } else {
      html = html.replace('</head>', `<meta name="description" content="${pageDescription}" />\n</head>`);
    }
    
    // Synchronize <html> lang and dir attributes based on request locale
    html = html.replace(/<html[^>]*lang=["'][^"']*["']/i, `<html lang="${locale}"`);
    if (locale === 'ar' || locale === 'ur') {
      if (!html.includes('dir="rtl"')) {
        html = html.replace(/<html([^>]*)>/i, '<html$1 dir="rtl">');
      }
    } else {
      html = html.replace(/dir=["']rtl["']/gi, 'dir="ltr"');
    }

    // Inject Canonical URL
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${pageUrl}" />`);
    } else {
      html = html.replace('</head>', `<link rel="canonical" href="${pageUrl}" />\n</head>`);
    }

    // Inject Complete Hreflang Tags (en, ar, ur, hi, fr, es, tr, id — plus x-default)
    const hreflangTags = buildHreflangTags(cleanPath, baseUrl);
    html = html.replace(/<link[^>]*hreflang=["'][^"']*["'][^>]*>\s*/gi, '');
    if (html.includes('rel="canonical"')) {
      html = html.replace(/(<link[^>]*rel=["']canonical["'][^>]*>)/i, `$1\n    ${hreflangTags}`);
    } else {
      html = html.replace('</head>', `    ${hreflangTags}\n</head>`);
    }
    
    // Inject OpenGraph Tags
    if (html.includes('property="og:title"')) {
      html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${pageTitle}" />`);
    }
    if (html.includes('property="og:description"')) {
      html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${pageDescription}" />`);
    }
    if (html.includes('property="og:url"')) {
      html = html.replace(/<meta[^>]*property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${pageUrl}" />`);
    }
    
    // Inject Twitter Card Tags
    if (html.includes('name="twitter:title"')) {
      html = html.replace(/<meta[^>]*name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${pageTitle}" />`);
    }
    if (html.includes('name="twitter:description"')) {
      html = html.replace(/<meta[^>]*name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${pageDescription}" />`);
    }
    
    // Inject JSON-LD Schema
    const schemaScript = `<!-- DYNAMIC_SCHEMA_START -->\n<script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n</script>\n<!-- DYNAMIC_SCHEMA_END -->`;
    const startMarker = '<!-- DYNAMIC_SCHEMA_START -->';
    const endMarker = '<!-- DYNAMIC_SCHEMA_END -->';
    const startIndex = html.indexOf(startMarker);
    const endIndex = html.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      html = html.substring(0, startIndex) + schemaScript + html.substring(endIndex + endMarker.length);
    } else if (html.includes('<!-- DYNAMIC_SCHEMA_PLACEHOLDER -->')) {
      html = html.replace('<!-- DYNAMIC_SCHEMA_PLACEHOLDER -->', schemaScript);
    } else {
      html = html.replace('</head>', `${schemaScript}\n</head>`);
    }
    
    // Replace sr-only H1 if present to avoid hidden duplicate tags
    if (html.includes('<h1 class="sr-only">')) {
      html = html.replace(/<h1 class="sr-only">.*?<\/h1>/gi, '');
    }
    
    const wrappedNoscriptHtml = `
      <main id="main-content">
        ${noscriptHtml}
      </main>
    `;

    // Inject visible prerendered HTML directly inside #root
    // When React mounts on the client (createRoot.render), React cleanly replaces #root contents
    if (html.includes('<!-- PRERENDERED_HTML_PLACEHOLDER -->')) {
      html = html.replace('<!-- PRERENDERED_HTML_PLACEHOLDER -->', wrappedNoscriptHtml);
    } else if (html.includes('<div id="root"></div>')) {
      html = html.replace('<div id="root"></div>', `<div id="root">${wrappedNoscriptHtml}</div>`);
    }

    // Set high performance non-stale headers and CSP report-only header
    res.setHeader('Content-Security-Policy-Report-Only', "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.google.com https://www.gstatic.com https://www.producthunt.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://*.googleapis.com; frame-src https://www.google.com https://www.producthunt.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self';");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    seoResponseCache.set(cacheKey, { html, timestamp: Date.now() });
    res.status(200).send(html);

  } catch (err) {
    console.error('[SEO Injection Middleware Error]:', err);
    next();
  }
}
