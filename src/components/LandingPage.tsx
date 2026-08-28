import React from 'react';
import LandingHero, { LandingHeroProps } from './LandingHero';

export interface LandingPageProps extends LandingHeroProps {}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectCategory,
  onPrimaryCTA,
  onSecondaryCTA,
}) => {
  const handleLaunchStudio = () => {
    if (onPrimaryCTA) {
      onPrimaryCTA();
    } else {
      const studioElement = document.getElementById('generator-studio');
      if (studioElement) {
        studioElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectCat = (tabId: string) => {
    if (onSelectCategory) {
      onSelectCategory(tabId);
    }
    const studioElement = document.getElementById('generator-studio');
    if (studioElement) {
      studioElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative w-full bg-slate-50 text-slate-900 overflow-hidden border-b border-slate-200/80 pt-4 pb-8 lg:pt-8 lg:pb-12 shadow-xs z-0">
      {/* Background Specular Ambient Glow Gradients in Light Theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Mesh in Light Theme */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LandingHero
          onSelectCategory={handleSelectCat}
          onPrimaryCTA={handleLaunchStudio}
          onSecondaryCTA={() => {
            if (onSecondaryCTA) onSecondaryCTA();
            else handleSelectCat('print');
          }}
        />
      </div>
    </div>
  );
};

export default LandingPage;
