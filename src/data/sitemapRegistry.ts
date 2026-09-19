/**
 * Authoritative Canonical Route Registry & Sitemap Inventory
 * 
 * Source of truth for active indexable English routes across all content categories.
 * Derived directly from active code registries:
 * - SEODatabase (Landing Pages)
 * - compareData (Comparisons)
 * - knowledgeData (Academy, Guides, Tutorials, Resources)
 * - templatePagesData (Templates)
 * - programmaticSEOData (Industries, Solutions, Use Cases)
 * - trustPages (Trust Center & Legal)
 * - blogArticles (Blog)
 * - Core Hub & Utility Pages
 */

import { landingPages } from '../pages/landing/SEODatabase';
import { comparisons } from './compareData';
import { knowledgeArticles } from './knowledgeData';
import { templatePages } from './templatePagesData';
import { industriesData, solutionsData, useCasesData } from './programmaticSEOData';

export type RouteCategory = 
  | 'home'
  | 'trust'
  | 'generator'
  | 'blog'
  | 'comparison'
  | 'knowledge'
  | 'template'
  | 'industry'
  | 'solution'
  | 'use-case';

export interface VerifiedRoute {
  path: string;
  category: RouteCategory;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  seoTitle: string;
  seoDescription: string;
  lastmod?: string;
  source: string;
}

// 1. Static Core Hubs & Legal
export const coreStaticRoutes: VerifiedRoute[] = [
  {
    path: '/',
    category: 'home',
    changefreq: 'daily',
    priority: '1.0',
    seoTitle: 'Free QR Code Generator - Dynamic & Static Codes with Logo',
    seoDescription: 'Create free dynamic and static QR codes with logo, custom colors, high error correction, and vector SVG/PNG export. Track scans with zero subscriptions.',
    source: 'App.tsx'
  },
  {
    path: '/terms',
    category: 'trust',
    changefreq: 'yearly',
    priority: '0.4',
    seoTitle: 'Terms of Service - Free QR Code Generator',
    seoDescription: 'Read the terms of service for using Free QR Code Generator. Free for personal and commercial use with no restrictions.',
    source: 'CompanyPages'
  },
  {
    path: '/faq',
    category: 'trust',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'FAQ - Free QR Code Generator | Common Questions Answered',
    seoDescription: 'Find answers to 25+ common questions about QR codes, static vs dynamic codes, error correction levels, customization, and how to create them.',
    source: 'CompanyPages'
  },
  {
    path: '/zatca-invoice',
    category: 'generator',
    changefreq: 'weekly',
    priority: '0.9',
    seoTitle: 'Free ZATCA Phase 1 QR Code Generator (TLV) | FreeQRBarcodes',
    seoDescription: 'Generate ZATCA Phase 1 compliant TLV/Base64 QR codes for Simplified Tax Invoices instantly. Free, browser-based, no signup.',
    source: 'App.tsx'
  },
  {
    path: '/compare',
    category: 'comparison',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'QR Code Technology Comparison Directory | FreeQRBarcodes',
    seoDescription: 'High-fidelity technical comparisons between diverse 2D barcode schemas, formats, error levels, and marketing strategies.',
    source: 'CompareHub.tsx'
  },
  {
    path: '/templates',
    category: 'template',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'Free QR Code Templates Hub | Pre-Designed Vector Codes',
    seoDescription: 'Explore 20+ professionally engineered QR code templates for menus, business cards, reviews, WiFi, and event ticketing.',
    source: 'TemplatesHub.tsx'
  },
  {
    path: '/industries',
    category: 'industry',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'Industry QR Code Solutions Directory | FreeQRBarcodes',
    seoDescription: 'Discover tailored QR code workflows and best practices for restaurants, hotels, retail, healthcare, and e-commerce.',
    source: 'ProgrammaticHub.tsx'
  },
  {
    path: '/solutions',
    category: 'solution',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'Enterprise QR Code Solutions & Applications | FreeQRBarcodes',
    seoDescription: 'Explore turnkey QR code solutions: contactless dining menus, digital business cards, review boosters, and onboarding.',
    source: 'ProgrammaticHub.tsx'
  },
  {
    path: '/use-cases',
    category: 'use-case',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'QR Code Use Cases & Implementation Guides | FreeQRBarcodes',
    seoDescription: 'Real-world QR code applications for tableside ordering, real estate yard signs, packaging manuals, and event validation.',
    source: 'ProgrammaticHub.tsx'
  },
  {
    path: '/academy',
    category: 'knowledge',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'QR Code Academy - Learn QR Technology & Best Practices',
    seoDescription: 'Comprehensive technical guides on QR specifications, error correction, scannability standards, and cybersecurity.',
    source: 'KnowledgeHub.tsx'
  },
  {
    path: '/guides',
    category: 'knowledge',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'QR Code Strategic Guides & Deep Dives | FreeQRBarcodes',
    seoDescription: 'Strategic guides on static vs dynamic QR codes, business cards, review boosters, email triggers, and print sizing.',
    source: 'KnowledgeHub.tsx'
  },
  {
    path: '/tutorials',
    category: 'knowledge',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'Step-by-Step QR Code Tutorials | FreeQRBarcodes',
    seoDescription: 'Practical step-by-step tutorials on configuring WiFi QR codes, WhatsApp triggers, SMS, and high-DPI print exports.',
    source: 'KnowledgeHub.tsx'
  },
  {
    path: '/resources',
    category: 'knowledge',
    changefreq: 'weekly',
    priority: '0.8',
    seoTitle: 'QR Code Technical Resources & Best Practices | FreeQRBarcodes',
    seoDescription: 'Curated technical resources covering restaurant menus, PDF sharing, geolocation coordinates, and vCard 3.0 schemas.',
    source: 'KnowledgeHub.tsx'
  },
  {
    path: '/glossary',
    category: 'knowledge',
    changefreq: 'monthly',
    priority: '0.7',
    seoTitle: '2D Barcode & QR Symbology Glossary | FreeQRBarcodes',
    seoDescription: 'Authoritative definitions of QR error correction levels, timing patterns, alignment markers, quiet zones, and Reed-Solomon encoding.',
    source: 'KnowledgeHub.tsx'
  },
  {
    path: '/blog',
    category: 'blog',
    changefreq: 'daily',
    priority: '0.9',
    seoTitle: 'Guides, Tutorials & Marketing Blog - Free QR Code Generator',
    seoDescription: 'Read our technical and strategic guides on QR codes, dynamic redirects, QR codes for restaurant menus, and contactless services.',
    source: 'BlogSection.tsx'
  }
];

// 2. Trust Center & Legal Pages (16 pages)
export const trustCenterRoutes: VerifiedRoute[] = [
  {
    path: '/about',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.7',
    seoTitle: 'About FreeQRBarcodes - Mission, Platform & Standards',
    seoDescription: 'Learn about FreeQRBarcodes, our commitment to free, accessible 2D barcode generation, data privacy, and open web standards.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/why-freeqrgen',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.7',
    seoTitle: 'Why FreeQRBarcodes - Transparency & Free Infrastructure',
    seoDescription: 'Why FreeQRBarcodes is 100% free with no hidden paywalls, no trial limits, no watermark penalties, and zero advertising cookies.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/editorial-policy',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.5',
    seoTitle: 'Editorial Policy & Verification Standards | FreeQRBarcodes',
    seoDescription: 'Our editorial standards, peer-review methodology, and optical testing protocols for technical barcode publications.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/research-methodology',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.5',
    seoTitle: 'Optical Scanning Research Methodology | FreeQRBarcodes',
    seoDescription: 'Our laboratory research methodology for testing barcode scannability across diverse lighting, contrast, and distance conditions.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/privacy-policy',
    category: 'trust',
    changefreq: 'yearly',
    priority: '0.4',
    seoTitle: 'Privacy Policy & Data Security Compliance | FreeQRBarcodes',
    seoDescription: 'Review our strict privacy policy: zero tracking on static codes, client-side rendering, and full GDPR/CCPA compliance.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/security',
    category: 'trust',
    changefreq: 'yearly',
    priority: '0.5',
    seoTitle: 'Security Standards & Phishing Prevention | FreeQRBarcodes',
    seoDescription: 'Our optical security architecture, barcode input sanitization, anti-phishing defense, and data protection protocols.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/data-processing',
    category: 'trust',
    changefreq: 'yearly',
    priority: '0.4',
    seoTitle: 'Data Processing Agreement (DPA) & Privacy | FreeQRBarcodes',
    seoDescription: 'Enterprise Data Processing Addendum details, subprocessor transparency, encryption in transit, and customer privacy guarantees.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/accessibility',
    category: 'trust',
    changefreq: 'yearly',
    priority: '0.4',
    seoTitle: 'WCAG 2.2 Accessibility Standards | FreeQRBarcodes',
    seoDescription: 'Our commitment to digital accessibility: high-contrast palettes, screen-reader navigation, and tactile QR guidelines.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/contact',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.6',
    seoTitle: 'Contact Us - Customer Support & Technical Team | FreeQRBarcodes',
    seoDescription: 'Get in touch with the FreeQRBarcodes technical and customer support team for assistance, feedback, or enterprise inquiries.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/changelog',
    category: 'trust',
    changefreq: 'weekly',
    priority: '0.5',
    seoTitle: 'Platform Changelog & Release Timeline | FreeQRBarcodes',
    seoDescription: 'Track continuous improvements, new symbologies, styling enhancements, and performance updates across our generator engine.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/release-notes',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.5',
    seoTitle: 'Official Version Release Notes | FreeQRBarcodes',
    seoDescription: 'Detailed technical release notes, feature breakdowns, deprecation schedules, and barcode engine upgrade documentation.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/system-status',
    category: 'trust',
    changefreq: 'daily',
    priority: '0.5',
    seoTitle: 'Live System Status & Redundancy Uptime | FreeQRBarcodes',
    seoDescription: 'Real-time operational status, redirect latency metrics, API availability, and global CDN health for FreeQRBarcodes.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/careers',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.4',
    seoTitle: 'Careers & Engineering Opportunities | FreeQRBarcodes',
    seoDescription: 'Join our distributed engineering and design team building next-generation computer vision and barcode technologies.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/media-kit',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.4',
    seoTitle: 'Press & Media Kit | FreeQRBarcodes',
    seoDescription: 'Official press kit, high-resolution vector logos, executive bios, and brand usage guidelines for FreeQRBarcodes.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/brand-assets',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.4',
    seoTitle: 'Brand Identity Assets & Logo Downloads | FreeQRBarcodes',
    seoDescription: 'Download official vector SVG, PNG, and EPS brand identity marks, color specifications, and typography guidelines.',
    source: 'TrustCenterHub.tsx'
  },
  {
    path: '/press',
    category: 'trust',
    changefreq: 'monthly',
    priority: '0.4',
    seoTitle: 'Newsroom & Media Coverage | FreeQRBarcodes',
    seoDescription: 'Official announcements, media coverage, case studies, and industry recognitions for FreeQRBarcodes.',
    source: 'TrustCenterHub.tsx'
  }
];

// 3. Blog Articles Metadata (30 verified articles with genuine dates)
export const blogArticleSlugs: { slug: string; date: string; dateModified: string; title: string; description: string; author: string; category: string }[] = [
  {
    slug: 'what-is-qr-code-how-it-works',
    date: '2026-06-02',
    dateModified: '2026-08-28',
    title: 'What Is a QR Code & How Does It Work? The Definitive Guide',
    description: 'Discover the math, science, and practical mechanics behind QR codes. From automotive tracking in 1994 to universal digital convenience today.',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  {
    slug: 'static-vs-dynamic-qr-codes-guide',
    date: '2026-06-14',
    dateModified: '2026-08-30',
    title: 'Static vs. Dynamic QR Codes: Complete Architectural Guide',
    description: 'Choosing between static and dynamic QR codes is critical. Learn how payload immutability, server redirects, and real-time telemetry dictate the ideal solution.',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  {
    slug: 'qr-code-error-correction-levels-explained',
    date: '2026-07-02',
    dateModified: '2026-08-25',
    title: 'QR Error Correction Explained: L, M, Q, and H Comparison',
    description: 'Master Reed-Solomon error correction algorithms in QR codes. Learn how 7% to 30% recovery thresholds enable custom logos without scan failures.',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'QR Code Fundamentals'
  },
  {
    slug: 'omnichannel-retail-qr-codes-footfall-to-sales',
    date: '2026-06-18',
    dateModified: '2026-08-22',
    title: 'Omnichannel Retail: Converting In-Store Footfall into Digital Sales',
    description: 'Discover how modern retail stores use smart QR window decals and shelf-talkers to capture lost revenue and sync offline visitors with e-commerce.',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  {
    slug: 'b2b-lead-generation-with-qr-landing-pages',
    date: '2026-07-11',
    dateModified: '2026-08-26',
    title: 'B2B Lead Generation: High-Converting Trade Show QR Strategies',
    description: 'Learn how enterprise sales teams replace generic brochures with personalized dynamic QR codes to track booth visits and score prospects in real-time.',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  {
    slug: 'smart-packaging-qr-codes-product-engagement',
    date: '2026-08-01',
    dateModified: '2026-08-29',
    title: 'Smart Product Packaging: Driving Customer Engagement & Authenticity',
    description: 'Explore how FMCG and luxury brands print dynamic QR codes on packaging for serial verification, ingredient transparency, and loyalty rewards.',
    author: 'Sarah Jenkins, Retail Marketing Strategist',
    category: 'Marketing Strategies'
  },
  {
    slug: 'utm-tracking-measuring-qr-code-roi-ga4',
    date: '2026-06-10',
    dateModified: '2026-08-20',
    title: 'UTM Tracking & GA4: Measuring Exact Offline Print Campaign ROI',
    description: 'A step-by-step masterclass on structuring UTM campaign tags for QR codes to track billboard, direct mail, and magazine conversions in Google Analytics 4.',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  {
    slug: 'retargeting-offline-audiences-with-dynamic-qr',
    date: '2026-07-08',
    dateModified: '2026-08-24',
    title: 'Offline-to-Online Retargeting: Building Audiences from Physical Scans',
    description: 'Learn how dynamic QR redirect servers trigger Meta Pixels, Google Tag Manager events, and TikTok remarketing tags upon physical scan interactions.',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  {
    slug: 'ab-testing-print-advertising-with-qr-codes',
    date: '2026-08-05',
    dateModified: '2026-08-31',
    title: 'A/B Testing Physical Print Ads with Dynamic QR Short Links',
    description: 'Discover how growth marketers run split tests on print fliers, flyers, and direct mailers by routing alternating QR scans to different landing pages.',
    author: 'David Chen, Performance Analytics Lead',
    category: 'Analytics & Tracking'
  },
  {
    slug: 'small-business-qr-code-starter-playbook',
    date: '2026-06-05',
    dateModified: '2026-08-18',
    title: 'The Small Business QR Playbook: 10 High-Impact Use Cases',
    description: 'Ten cost-effective, frictionless QR code implementations that neighborhood cafes, salons, auto shops, and boutiques can deploy in under 5 minutes.',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  {
    slug: 'how-to-boost-google-reviews-with-countertop-qr',
    date: '2026-07-15',
    dateModified: '2026-08-27',
    title: 'How to 10x Google Reviews with Countertop QR Display Stands',
    description: 'Learn the exact psychological triggers and technical setup to get satisfied customers to leave 5-star Google Business ratings right at checkout.',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  {
    slug: 'contactless-invoicing-qr-payment-receipts',
    date: '2026-08-06',
    dateModified: '2026-09-01',
    title: 'Contactless Invoicing: Adding Instant Payment QR Codes to Bills',
    description: 'Discover how freelancers, service contractors, and pop-up vendors generate instant payment QR codes on invoices for zero-fee rapid settlement.',
    author: 'Hannah Brooks, Local Commerce Consultant',
    category: 'Small Business Tools'
  },
  {
    slug: 'anatomy-of-2d-matrix-grids-micro-qr-iqr',
    date: '2026-06-22',
    dateModified: '2026-08-21',
    title: 'The Technical Architecture of 2D Matrix Codes: Micro QR, iQR, and Standard Models',
    description: 'An in-depth technical analysis of 2D barcode variants, module capacities, coordinate encoding, and specialized industrial matrix standards.',
    author: 'Dr. Elena Rostova, Cryptography & Signals Specialist',
    category: 'Technology'
  },
  {
    slug: 'qr-code-cybersecurity-preventing-qshing-attacks',
    date: '2026-07-19',
    dateModified: '2026-08-28',
    title: 'Cybersecurity in QR Systems: Preventing Qshing & Malicious URL Redirection',
    description: 'Learn how cybercriminals exploit physical QR codes through QR phishing (Qshing) and how enterprise security protocols safeguard user scans.',
    author: 'Dr. Elena Rostova, Cryptography & Signals Specialist',
    category: 'Technology'
  },
  {
    slug: 'gs1-digital-link-2027-barcode-standards-transition',
    date: '2026-08-10',
    dateModified: '2026-09-02',
    title: 'GS1 Digital Link Transition: The 2027 Barcode Revolution Explained',
    description: 'Discover how the global retail industry is transitioning from legacy 1D UPC barcodes to 2D QR codes powered by the GS1 Digital Link standard.',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'Technology'
  },
  {
    slug: 'hotel-digital-checkin-guest-experience-qr',
    date: '2026-06-25',
    dateModified: '2026-08-19',
    title: 'Frictionless Hotel Check-Ins: Keyless Room Access & Concierge Web Apps',
    description: 'Learn how boutique and luxury hotels use contactless QR codes in lobbies and guest rooms to streamline check-ins, room service orders, and amenities booking.',
    author: 'Elena Rossi, Hospitality Technology Specialist',
    category: 'Contactless Solutions'
  },
  {
    slug: 'touchless-healthcare-clinic-patient-registration-qr',
    date: '2026-07-14',
    dateModified: '2026-08-23',
    title: 'Touchless Patient Registration: Modernizing Clinic Waiting Rooms with QR Forms',
    description: 'Explore how medical clinics, dental practices, and diagnostic centers streamline patient check-in and medical history intake using hygienic QR forms.',
    author: 'Dr. Aris Thorne, Healthcare Systems Consultant',
    category: 'Contactless Solutions'
  },
  {
    slug: 'smart-facility-maintenance-ticketing-equipment-qr',
    date: '2026-08-04',
    dateModified: '2026-08-30',
    title: 'Smart Facilities & Equipment Management: Instant Maintenance Ticketing',
    description: 'Discover how facility managers track HVAC units, elevators, and office assets with rugged industrial QR code decals linking to instant service logs.',
    author: 'Marcus Vance, Lead Systems Architect',
    category: 'Contactless Solutions'
  },
  {
    slug: 'complete-guide-to-digital-qr-restaurant-menus',
    date: '2026-06-08',
    dateModified: '2026-08-17',
    title: 'Modernizing the Dining Experience: Digital QR Menus vs Physical Laminates',
    description: 'Everything restaurateurs need to know about designing, printing, and optimizing contactless digital QR menus to increase average order values.',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  {
    slug: 'dynamic-pricing-and-realtime-menu-updates-qr',
    date: '2026-07-06',
    dateModified: '2026-08-25',
    title: 'Dynamic Pricing & Real-Time Item Disabling: Running Lean Kitchen Operations',
    description: 'Learn how high-volume bars and restaurants implement happy hour specials, surge pricing, and live 86-lists without reprinting tabletop QR stands.',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  {
    slug: 'tableside-ordering-and-speeding-up-table-turnover',
    date: '2026-07-29',
    dateModified: '2026-08-31',
    title: 'Table-Side Ordering & Self-Checkout: Increasing Table Turnaround by 30%',
    description: 'Explore how fast-casual and high-volume dining establishments boost table turnover rates and staff tips using tableside QR ordering and payments.',
    author: 'Marco Delvecchio, Culinary Technology Director',
    category: 'Restaurant QR Menus'
  },
  {
    slug: 'high-speed-event-ticketing-and-access-control-qr',
    date: '2026-06-16',
    dateModified: '2026-08-22',
    title: 'High-Throughput Ticketing: Scanning 1,000+ Attendees per Minute at Festivals',
    description: 'Learn how music festivals, stadiums, and conferences deploy high-speed QR barcode scanners, cryptographic validation, and offline turnstiles.',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  {
    slug: 'smart-networking-vcard-badges-for-conferences',
    date: '2026-07-10',
    dateModified: '2026-08-27',
    title: 'Interactive Conference Badges: Frictionless Digital Business Card Networking',
    description: 'Discover how corporate summit organizers replace paper business cards with dynamic vCard QR badges for instant contact exchange and lead scoring.',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  {
    slug: 'live-audience-polls-qa-interactive-event-qr',
    date: '2026-08-08',
    dateModified: '2026-09-02',
    title: 'Live Audience Polls & Stage Q&A: Engaging Hybrid Summit Attendees in Real-Time',
    description: 'Learn how keynote speakers and event producers drive 80%+ audience participation using giant stage-screen QR codes for live voting and anonymous Q&A.',
    author: 'Julian Sterling, Event Operations Director',
    category: 'Event QR Codes'
  },
  {
    slug: 'interactive-textbooks-and-classroom-handouts-qr',
    date: '2026-06-12',
    dateModified: '2026-08-19',
    title: 'Interactive Textbooks: Linking Static Classroom Handouts to 3D Models & Video Lectures',
    description: 'Explore how K-12 educators and university professors transform static worksheets into dynamic learning portals with video solutions and 3D AR models.',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  {
    slug: 'campus-navigation-and-smart-building-directories-qr',
    date: '2026-07-21',
    dateModified: '2026-08-28',
    title: 'Campus Navigation & Building Directories: Guiding Freshmen with Geo-Tagged QRs',
    description: 'Learn how modern universities and hospital complexes place scannable QR signs at campus intersections to provide interactive 3D wayfinding maps.',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  {
    slug: 'qr-based-automated-student-attendance-systems',
    date: '2026-08-12',
    dateModified: '2026-09-03',
    title: 'Automated Attendance Systems: QR-Based Lecture Hall Check-In Best Practices',
    description: 'Discover how university lecture halls automate roll call for 300+ students in under two minutes using rotating dynamic QR codes and geofencing.',
    author: 'Prof. Arthur Vance, EdTech Research Fellow',
    category: 'Education QR Codes'
  },
  {
    slug: 'multi-link-social-bio-qr-codes-one-scan',
    date: '2026-06-20',
    dateModified: '2026-08-24',
    title: 'Multi-Link Bio QR Codes: Unifying Instagram, TikTok, YouTube & Spotify in One Scan',
    description: 'Learn how content creators, musicians, and influencers design aesthetic multi-link landing pages connected to a single scannable QR code.',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  },
  {
    slug: 'pop-up-store-activations-viral-social-qr-campaigns',
    date: '2026-07-18',
    dateModified: '2026-08-29',
    title: 'Interactive Pop-Up Store Activations: Turning Foot Traffic into Viral Social Followers',
    description: 'Discover how direct-to-consumer (DTC) fashion and beauty brands turn temporary pop-up shops into viral TikTok and Instagram follower magnets.',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  },
  {
    slug: 'influencer-merch-unboxing-direct-social-engagement',
    date: '2026-08-14',
    dateModified: '2026-09-03',
    title: 'Influencer Merch & Unboxing Campaigns: Driving Direct Engagement from Product Tags',
    description: 'Learn how top creators design custom hangtags and packaging inserts with QR codes to trigger viral unboxing videos and community hashtag growth.',
    author: 'Chloe Martinez, Social Media & Creator Economy Strategist',
    category: 'Social Media Marketing'
  },
];

export function getAllVerifiedRoutes(): VerifiedRoute[] {
  const routes: VerifiedRoute[] = [];

  // 1. Core Static Hubs (15)
  routes.push(...coreStaticRoutes);

  // 2. Trust Center & Legal (16)
  routes.push(...trustCenterRoutes);

  // 3. Landing Pages / Generators (22)
  for (const slug of Object.keys(landingPages)) {
    const page = landingPages[slug];
    routes.push({
      path: `/${slug}`,
      category: 'generator',
      changefreq: 'weekly',
      priority: '0.9',
      seoTitle: page.seoTitle,
      seoDescription: page.metaDescription,
      source: 'SEODatabase.ts'
    });
  }

  // 4. Comparisons (11)
  for (const comp of comparisons) {
    routes.push({
      path: `/compare/${comp.slug}`,
      category: 'comparison',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: comp.seoTitle || comp.title,
      seoDescription: comp.metaDescription,
      source: 'compareData.ts'
    });
  }

  // 5. Templates (20)
  for (const tpl of templatePages) {
    routes.push({
      path: `/templates/${tpl.slug}`,
      category: 'template',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: tpl.seoTitle || tpl.title,
      seoDescription: tpl.metaDescription,
      source: 'templatePagesData.ts'
    });
  }

  // 6. Industries (6)
  for (const ind of industriesData) {
    routes.push({
      path: `/industries/${ind.slug}`,
      category: 'industry',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: ind.metaTitle || `${ind.name} QR Code Solutions | FreeQRBarcodes`,
      seoDescription: ind.metaDesc || `Comprehensive QR code solutions and workflows for the ${ind.name.toLowerCase()} industry.`,
      source: 'programmaticSEOData.ts'
    });
  }

  // 7. Solutions (6)
  for (const sol of solutionsData) {
    routes.push({
      path: `/solutions/${sol.slug}`,
      category: 'solution',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: sol.metaTitle || `${sol.name} - QR Solution | FreeQRBarcodes`,
      seoDescription: sol.metaDesc || `Deploy professional ${sol.name.toLowerCase()} QR codes with zero subscriptions.`,
      source: 'programmaticSEOData.ts'
    });
  }

  // 8. Use Cases (6)
  for (const uc of useCasesData) {
    routes.push({
      path: `/use-cases/${uc.slug}`,
      category: 'use-case',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: uc.metaTitle || `${uc.name} QR Code Use Case | FreeQRBarcodes`,
      seoDescription: uc.metaDesc || `Practical implementation guide and best practices for ${uc.name.toLowerCase()}.`,
      source: 'programmaticSEOData.ts'
    });
  }

  // 9. Knowledge Articles (20 across academy, tutorials, guides, resources)
  for (const art of knowledgeArticles) {
    routes.push({
      path: `/${art.section}/${art.slug}`,
      category: 'knowledge',
      changefreq: 'weekly',
      priority: '0.8',
      seoTitle: art.seoTitle || art.title,
      seoDescription: art.metaDescription,
      source: 'knowledgeData.ts'
    });
  }

  // 10. Blog Articles (30)
  for (const blog of blogArticleSlugs) {
    routes.push({
      path: `/blog/${blog.slug}`,
      category: 'blog',
      changefreq: 'monthly',
      priority: '0.7',
      seoTitle: blog.title,
      seoDescription: blog.description,
      lastmod: blog.date,
      source: 'blogArticles'
    });
  }

  return routes;
}
