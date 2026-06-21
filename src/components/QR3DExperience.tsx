import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, QrCode, Shield, Activity, Share2 } from 'lucide-react';

export default function QR3DExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values to track mouse coordinate offsets
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Add buttery smooth springs for realistic floating physics
  const springConfig = { damping: 25, stiffness: 150, mass: 1.2 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig);

  // Map translations to simulate perspective parallax depth layers
  const scanDepthX = useSpring(useTransform(x, [-0.5, 0.5], [-25, 25]), springConfig);
  const scanDepthY = useSpring(useTransform(y, [-0.5, 0.5], [-25, 25]), springConfig);

  // Translate light coordinates for dynamic specular gloss effects
  const glossX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glossY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized coordinates from -0.5 to 0.5
    const relativeX = (event.clientX - rect.left) / width - 0.5;
    const relativeY = (event.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div 
      className="flex items-center justify-center py-6 sm:py-10 [perspective:1200px]"
      id="3d-qr-hero-stage"
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-80 h-80 sm:w-[380px] sm:h-[380px] cursor-grab active:cursor-grabbing select-none"
      >
        {/* Dynamic Specular Mesh backdrop representing "Stripe and VisionOS style glow" */}
        <div 
          className="absolute -inset-10 bg-radial-gradient from-indigo-500/10 via-purple-600/5 to-transparent rounded-full filter blur-3xl opacity-80 pointer-events-none transition-transform duration-500"
          style={{
            transform: `translate3d(${useTransform(x, [-0.5, 0.5], [-40, 40]).get()}px, ${useTransform(y, [-0.5, 0.5], [-40, 40]).get()}px, 0px)`
          }}
        />

        {/* Outer Orbit Glass Ring */}
        <div className="absolute inset-0 rounded-full border border-slate-200/25 bg-slate-900/5 backdrop-blur-3xs animate-spin-slow pointer-events-none" />

        <motion.div
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d'
          }}
          className="relative w-full h-full rounded-[40px] bg-white/70 dark:bg-slate-900/40 border border-white/40 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.18)] backdrop-blur-xl p-8 flex flex-col items-center justify-between transition-all duration-300"
        >
          {/* Dynamic Light Reflection Layer */}
          <motion.div 
            className="absolute inset-0 rounded-[40px] bg-linear-to-tr from-transparent via-white/12 to-indigo-500/8 mix-blend-overlay pointer-events-none z-10"
            style={{
              backgroundPositionX: glossX,
              backgroundPositionY: glossY
            }}
          />

          {/* Card Glassmorphism Header */}
          <div className="w-full flex items-center justify-between z-10 [transform:translateZ(40px)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs" />
              <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase font-mono">VISION QR PRO</span>
            </div>
            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
          </div>

          {/* Central 3D Floating QR Cube */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center [transformStyle:preserve-3d] z-20">
            {/* Soft Shadow behind the QR Code */}
            <div className="absolute w-44 h-44 rounded-2xl bg-slate-950/20 filter blur-xl [transform:translateZ(10px)] transition-all duration-300 pointer-events-none" />

            {/* Inner Floating Hologram Plate */}
            <motion.div
              style={{
                x: scanDepthX,
                y: scanDepthY,
                transform: 'translateZ(35px)'
              }}
              className="absolute w-40 h-40 sm:w-48 sm:h-48 bg-white p-4 rounded-3xl shadow-[0_15px_35px_rgba(31,38,135,0.15)] border border-slate-100 flex items-center justify-center"
            >
              {/* Actual stylable Vector-like QR Symbol (Highly recognizable and tech-themed) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900 stroke-[1.25]" />
                
                {/* Embedded central hardware branding overlay */}
                <div className="absolute w-11 h-11 bg-indigo-600 rounded-xl border-2 border-white shadow-md flex items-center justify-center p-1.5 animate-bounce-slow">
                  <span className="text-[8px] font-black text-white font-mono tracking-tight text-center">PASS</span>
                </div>
              </div>
            </motion.div>

            {/* 3D Wireframe Depth Box (Parallax guidelines) */}
            <div className="absolute inset-2 border border-dashed border-indigo-500/20 rounded-3xl pointer-events-none [transform:translateZ(20px)]" />
          </div>

          {/* VisionOS Control Micro-Panel Footer */}
          <div className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-950/5 dark:border-white/10 rounded-2xl p-2.5 flex items-center justify-between z-10 [transform:translateZ(30px)]">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>TLS Secured</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
