import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Zap, 
  ShieldCheck, 
  Receipt, 
  Utensils, 
  Wallet, 
  Printer, 
  Contact, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  FileCheck, 
  Smartphone, 
  Grid3X3, 
  DollarSign, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';

export interface LandingHeroProps {
  onSelectCategory?: (tabId: string) => void;
  onPrimaryCTA?: () => void;
  onSecondaryCTA?: () => void;
}

// 5 Core Tool Categories & Real Preview Texture Data
export type PreviewTextureType = 'menu' | 'payments' | 'avery' | 'zatca' | 'cards';

interface TextureInfo {
  id: PreviewTextureType;
  tabKey: string;
  badgeTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  gradientBg: string;
  glowColor: string;
  title: string;
  subtitle: string;
}

const TEXTURES: TextureInfo[] = [
  {
    id: 'menu',
    tabKey: 'menu',
    badgeTitle: '🍽️ Digital Restaurant Menus',
    icon: Utensils,
    accentColor: 'text-amber-600',
    gradientBg: 'from-amber-500/10 via-orange-500/5 to-slate-50/40',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    title: 'Gourmet Bistro Digital Menu',
    subtitle: 'Table #14 • Contactless NFC & QR Scan'
  },
  {
    id: 'payments',
    tabKey: 'payments',
    badgeTitle: '💳 Instant Crypto & UPI Payments',
    icon: Wallet,
    accentColor: 'text-emerald-600',
    gradientBg: 'from-emerald-500/10 via-teal-500/5 to-slate-50/40',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    title: 'Instant Multi-Chain Checkout',
    subtitle: 'BTC, ETH, SOL & Instant UPI Auto-Pair'
  },
  {
    id: 'avery',
    tabKey: 'print',
    badgeTitle: '🖨️ Avery 5160 Bulk Label Print Studio',
    icon: Printer,
    accentColor: 'text-indigo-600',
    gradientBg: 'from-indigo-500/10 via-blue-500/5 to-slate-50/40',
    glowColor: 'rgba(99, 102, 241, 0.15)',
    title: 'Avery 5160 Sheet Grid (3x10)',
    subtitle: '30 Labels / Sheet • Precision Vector PDF'
  },
  {
    id: 'zatca',
    tabKey: 'zatca',
    badgeTitle: '🧾 ZATCA TLV Compliant (KSA)',
    icon: Receipt,
    accentColor: 'text-emerald-600',
    gradientBg: 'from-emerald-600/10 via-emerald-500/5 to-slate-50/40',
    glowColor: 'rgba(5, 150, 105, 0.15)',
    title: 'Tax E-Invoice Phase 2 (TLV)',
    subtitle: '100% KSA Tax Authority Compliant • Base64 Tag'
  },
  {
    id: 'cards',
    tabKey: 'card',
    badgeTitle: '🤖 AI Dynamic Forms & RSVPs',
    icon: Contact,
    accentColor: 'text-purple-600',
    gradientBg: 'from-purple-500/10 via-pink-500/5 to-slate-50/40',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    title: 'vCard & Intelligent Interactive Forms',
    subtitle: 'Smart RSVP Tracking & Lead Capture'
  }
];

export default function LandingHero({ onSelectCategory, onPrimaryCTA, onSecondaryCTA }: LandingHeroProps) {
  const { t } = useTranslation();
  const [activeTextureIndex, setActiveTextureIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const activeTexture = TEXTURES[activeTextureIndex];

  // 3D Tilt Parallax setup
  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 140, mass: 1.1 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  const cardTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const cardTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), springConfig);

  const glossX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glossY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  // Handle Mouse movement across stage
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 400;

    const relX = (e.clientX - rect.left) / width - 0.5;
    const relY = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(relX);
    mouseY.set(relY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    setIsAutoPlaying(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsAutoPlaying(false);
  };

  // Autoplay texture rotation every 4.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveTextureIndex((prev) => (prev + 1) % TEXTURES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNavClick = (tabId: string, textureIdx: number) => {
    setActiveTextureIndex(textureIdx);
    if (onSelectCategory) {
      onSelectCategory(tabId);
    }
  };

  return (
    <section className="relative overflow-hidden bg-white text-slate-900 pt-8 pb-12 lg:pt-12 lg:pb-16 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 w-full">
      {/* Background Specular Ambient Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Mesh */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Badge */}
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>{t('hero.announcement', 'Complete All-in-One QR & Barcode Suite 2026')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </motion.div>
        </div>

        {/* Hero Main Header & Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text & Interactive Navigation */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              The Ultimate <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                All-in-One QR & Barcode Studio
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 font-normal max-w-2xl leading-relaxed">
              Create ZATCA e-invoices, restaurant digital menus, crypto payment links, and bulk print-ready label sheets with 100% free vector export.
            </p>

            {/* Quick-Category Tabs */}
            <div className="mt-7 w-full max-w-xl">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5 font-mono">
                ⚡ Quick Tool Select
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {[
                  { id: 'menu', idx: 0, label: 'Menus & Forms' },
                  { id: 'payments', idx: 1, label: 'Payments & Crypto' },
                  { id: 'print', idx: 2, label: 'Bulk Print Studio' },
                  { id: 'zatca', idx: 3, label: 'ZATCA Invoice' },
                  { id: 'card', idx: 4, label: 'vCards & Wi-Fi' },
                ].map((tab) => {
                  const isSelected = activeTextureIndex === tab.idx;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleNavClick(tab.id, tab.idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border animate-icon-blur-up ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20 scale-105' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (onPrimaryCTA) onPrimaryCTA();
                  else if (onSelectCategory) onSelectCategory('create');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <QrCode className="w-4 h-4 tool-icon-blur-up" />
                <span>Launch Studio Generator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSecondaryCTA) onSecondaryCTA();
                  else if (onSelectCategory) onSelectCategory('print');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 hover:border-slate-400 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-600 tool-icon-blur-up" />
                <span>Explore Avery Label Printer</span>
              </button>
            </div>

            {/* Key Feature Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-slate-200 w-full flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                100% Free Vector SVG & PDF
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Sign-Up Required
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Offline Generator Engine
              </span>
            </div>

          </div>

          {/* Right Column: Dynamic 3D WebGL Canvas & Orbiting Badges */}
          <div className="lg:col-span-5 flex items-center justify-center">
            
            <div 
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[420px] aspect-square flex items-center justify-center [perspective:1200px] select-none cursor-grab active:cursor-grabbing p-2"
            >

              {/* Orbiting Badges Container around 3D Stage */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">

                {/* Badge 1: Top Left - Digital Restaurant Menus */}
                <motion.button
                  type="button"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  onClick={() => handleNavClick('menu', 0)}
                  className={`pointer-events-auto absolute top-0 left-0 px-2.5 py-1 rounded-2xl border backdrop-blur-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-icon-blur-up ${
                    activeTextureIndex === 0 
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-500/20' 
                      : 'bg-white/95 border-slate-200 text-slate-700 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  <span className="text-sm sm:text-base tool-icon-blur-up">🍽️</span>
                  <span>Digital Restaurant Menus</span>
                </motion.button>

                {/* Badge 2: Top Right - Instant Crypto & UPI Payments */}
                <motion.button
                  type="button"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  onClick={() => handleNavClick('payments', 1)}
                  className={`pointer-events-auto absolute top-0 right-0 px-2.5 py-1 rounded-2xl border backdrop-blur-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-icon-blur-up ${
                    activeTextureIndex === 1 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md ring-2 ring-emerald-500/20' 
                      : 'bg-white/95 border-slate-200 text-slate-700 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <span className="text-sm sm:text-base tool-icon-blur-up">💳</span>
                  <span>Crypto & UPI Payments</span>
                </motion.button>

                {/* Badge 3: Mid Right - Avery 5160 Bulk Label Print Studio */}
                <motion.button
                  type="button"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  onClick={() => handleNavClick('print', 2)}
                  className={`pointer-events-auto absolute top-1/2 right-0 -translate-y-1/2 px-2.5 py-1 rounded-2xl border backdrop-blur-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-icon-blur-up ${
                    activeTextureIndex === 2 
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-white/95 border-slate-200 text-slate-700 hover:border-indigo-300 shadow-xs'
                  }`}
                >
                  <span className="text-sm sm:text-base tool-icon-blur-up">🖨️</span>
                  <span>Avery 5160 Bulk Print</span>
                </motion.button>

                {/* Badge 4: Bottom Left - ZATCA TLV Compliant (KSA) */}
                <motion.button
                  type="button"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  onClick={() => handleNavClick('zatca', 3)}
                  className={`pointer-events-auto absolute bottom-0 left-0 px-2.5 py-1 rounded-2xl border backdrop-blur-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-icon-blur-up ${
                    activeTextureIndex === 3 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md ring-2 ring-emerald-500/20' 
                      : 'bg-white/95 border-slate-200 text-slate-700 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <span className="text-sm sm:text-base tool-icon-blur-up">🧾</span>
                  <span>ZATCA TLV Compliant</span>
                </motion.button>

                {/* Badge 5: Bottom Right - AI Dynamic Forms & RSVPs */}
                <motion.button
                  type="button"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  onClick={() => handleNavClick('card', 4)}
                  className={`pointer-events-auto absolute bottom-0 right-0 px-2.5 py-1 rounded-2xl border backdrop-blur-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-icon-blur-up ${
                    activeTextureIndex === 4 
                      ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-md ring-2 ring-purple-500/20' 
                      : 'bg-white/95 border-slate-200 text-slate-700 hover:border-purple-300 shadow-xs'
                  }`}
                >
                  <span className="text-sm sm:text-base tool-icon-blur-up">🤖</span>
                  <span>AI Forms & RSVPs</span>
                </motion.button>

              </div>

              {/* Glassmorphic 3D Central Card Frame */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                  x: cardTranslateX,
                  y: cardTranslateY
                }}
                className="relative w-72 sm:w-80 h-[370px] sm:h-[400px] rounded-[32px] bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] backdrop-blur-xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300"
              >
                {/* Gloss specular reflection overlay */}
                <motion.div
                  className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/50 to-indigo-500/10 mix-blend-overlay pointer-events-none z-30"
                  style={{
                    backgroundPositionX: glossX,
                    backgroundPositionY: glossY
                  }}
                />

                {/* 3D Laser Scanning Beam sweeps vertically over active card surface */}
                <motion.div
                  animate={{
                    top: ['0%', '92%', '0%']
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] z-20 pointer-events-none"
                >
                  <div className="w-full h-8 -mt-4 bg-gradient-to-b from-indigo-500/15 to-transparent pointer-events-none" />
                </motion.div>

                {/* Card Top Header Status Bar */}
                <div className="flex items-center justify-between z-10 [transform:translateZ(30px)] pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">
                      {activeTexture.badgeTitle.replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span>60 FPS</span>
                  </div>
                </div>

                {/* Dynamic Screen Content Textures inside 3D Card */}
                <div className="relative flex-1 my-3 flex flex-col justify-center items-center z-10 [transform:translateZ(40px)]">
                  <AnimatePresence mode="wait">
                    
                    {/* Texture 1: Restaurant Menu */}
                    {activeTextureIndex === 0 && (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full bg-slate-50 rounded-2xl border border-amber-200/80 p-3.5 flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div>
                            <span className="text-xs font-bold text-amber-700 block">🍕 Trattoria Bella</span>
                            <span className="text-[9px] text-slate-500">Scanned at Table #14</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-200/80">NFC & QR</span>
                        </div>

                        <div className="space-y-1.5 my-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-800 font-medium">
                            <span>Truffle Pasta</span>
                            <span className="text-amber-600 font-bold">$18.50</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-800 font-medium">
                            <span>Artisanal Pizza</span>
                            <span className="text-amber-600 font-bold">$16.00</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <div className="w-12 h-12 bg-slate-900 p-1 rounded-lg shrink-0 flex items-center justify-center animate-qr-blur-up">
                            <QrCode className="w-full h-full text-white" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-900 block truncate">Scan to Order & Pay</span>
                            <span className="text-[8px] text-slate-500 block">Instant Kitchen Router Dispatch</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Texture 2: Crypto & UPI Payment */}
                    {activeTextureIndex === 1 && (
                      <motion.div
                        key="payments"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full bg-slate-50 rounded-2xl border border-emerald-200/80 p-3.5 flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">Instant Pay Hub</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-200/80">Verified</span>
                        </div>

                        <div className="text-center my-1">
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">Amount Due</span>
                          <span className="text-xl font-extrabold text-slate-900 font-mono">$49.99 USD</span>
                          <div className="flex items-center justify-center gap-2 mt-1 text-[9px] text-emerald-600 font-bold">
                            <span>BTC</span> • <span>ETH</span> • <span>SOL</span> • <span>UPI</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <div className="w-12 h-12 bg-slate-900 p-1 rounded-lg shrink-0 flex items-center justify-center animate-qr-blur-up">
                            <QrCode className="w-full h-full text-white" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[10px] font-bold text-slate-900 block truncate">Zero Fee Crypto QR</span>
                            <span className="text-[8px] text-slate-500 block">Direct Wallet Confirmation</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Texture 3: Avery 5160 Label Sheet */}
                    {activeTextureIndex === 2 && (
                      <motion.div
                        key="avery"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full bg-slate-50 rounded-2xl border border-indigo-200/80 p-3 flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <div className="flex items-center gap-1">
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[11px] font-bold text-indigo-700">Avery 5160 Labels</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500">30 / Page</span>
                        </div>

                        {/* Label Grid simulation */}
                        <div className="grid grid-cols-3 gap-1.5 my-1.5">
                          {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="bg-white p-1 rounded-md border border-slate-200 shadow-2xs flex items-center justify-between">
                              <div className="w-4 h-4 bg-indigo-600 rounded-xs flex items-center justify-center">
                                <QrCode className="w-3 h-3 text-white" />
                              </div>
                              <div className="text-[6px] font-mono font-bold text-slate-800 leading-tight">
                                LAB-{100 + idx}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-200/80 text-center">
                          <span className="text-[9px] font-bold text-indigo-700">Ready for PDF / Laser Printing</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Texture 4: ZATCA Invoice (KSA TLV Compliant) - Generic Tax Vector Shield (NO government logos) */}
                    {activeTextureIndex === 3 && (
                      <motion.div
                        key="zatca"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full bg-slate-50 rounded-2xl border border-emerald-200/80 p-3.5 flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            {/* Generic Vector Tax Shield Icon - NO official government logo */}
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">ZATCA Phase 2 TLV</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-200/80">KSA Tax</span>
                        </div>

                        <div className="space-y-1 text-left text-[10px]">
                          <div className="flex justify-between text-slate-600">
                            <span>VAT Registration:</span>
                            <span className="font-mono text-emerald-700 font-bold">310123456700003</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Tax (15%):</span>
                            <span className="font-mono text-slate-900">SAR 150.00</span>
                          </div>
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>Grand Total:</span>
                            <span className="font-mono text-emerald-700">SAR 1,150.00</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <div className="w-12 h-12 bg-slate-900 p-1 rounded-lg shrink-0 flex items-center justify-center animate-qr-blur-up">
                            <QrCode className="w-full h-full text-white" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[10px] font-bold text-slate-900 block truncate">TLV Base64 Encoded QR</span>
                            <span className="text-[8px] text-slate-500 block">Cryptographic Stamp Compliant</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Texture 5: AI Forms & RSVPs */}
                    {activeTextureIndex === 4 && (
                      <motion.div
                        key="cards"
                        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        transition={{ duration: 0.35 }}
                        className="w-full h-full bg-slate-50 rounded-2xl border border-purple-200/80 p-3.5 flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">AI RSVP & Dynamic Form</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[9px] font-bold border border-purple-200/80">Smart Form</span>
                        </div>

                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs text-left space-y-1">
                          <span className="text-[10px] font-bold text-slate-900 block">Annual Tech Summit 2026</span>
                          <span className="text-[9px] text-slate-500 block">Live RSVP & Badge Issuance</span>
                          <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-purple-600 h-full w-3/4" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <div className="w-12 h-12 bg-slate-900 p-1 rounded-lg shrink-0 flex items-center justify-center animate-qr-blur-up">
                            <QrCode className="w-full h-full text-white" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="text-[10px] font-bold text-slate-900 block truncate">Scan for Instant RSVP</span>
                            <span className="text-[8px] text-slate-500 block">Auto-Sync Lead Submissions</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Autoplay Progress Dots Footer */}
                <div className="flex items-center justify-between z-10 [transform:translateZ(30px)] pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {TEXTURES.map((tItem, idx) => (
                      <button
                        key={tItem.id}
                        type="button"
                        onClick={() => {
                          setActiveTextureIndex(idx);
                          setIsAutoPlaying(false);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          activeTextureIndex === idx ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Select texture ${tItem.badgeTitle}`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    3D Interactive Preview
                  </span>
                </div>

              </motion.div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
