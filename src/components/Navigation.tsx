import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

interface NavLink {
  name: string;
  path?: string;
  action?: string;
  icon: React.ElementType;
}

interface NavigationProps {
  links: NavLink[];
  currentPath: string;
  activeTab?: string;
  onLinkClick: (link: NavLink) => void;
  isRtl: boolean;
}

export default function Navigation({ links, currentPath, activeTab, onLinkClick, isRtl }: NavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically determine how many links are displayed directly based on screen width and language (RTL)
  const maxVisible = (() => {
    if (isRtl) {
      if (windowWidth >= 1536) return 5;
      if (windowWidth >= 1440) return 4;
      if (windowWidth >= 1360) return 3;
      return 3;
    } else {
      if (windowWidth >= 1536) return 7;
      if (windowWidth >= 1440) return 6;
      if (windowWidth >= 1360) return 5;
      return 4;
    }
  })();

  const visibleLinks = links.slice(0, maxVisible);
  const moreLinks = links.slice(maxVisible);

  const isLinkActive = (link: NavLink) => {
    if (link.action) {
      const tabName = link.action.replace('tab_', '');
      return currentPath === '/' && activeTab === tabName;
    }
    return currentPath === link.path;
  };

  return (
    <nav 
      className={`hidden xl:flex items-center gap-1.5 min-w-0 overflow-visible ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {visibleLinks.map((link) => {
        const active = isLinkActive(link);
        return (
          <button
            key={link.name}
            onClick={() => onLinkClick(link)}
            className={`flex items-center ${isRtl ? 'gap-1 px-2' : 'gap-1.5 px-3'} py-1.5 font-bold transition-all rounded-lg whitespace-nowrap shrink-0 ${
              isRtl 
                ? 'text-[10px] xl:text-[11px] 2xl:text-xs tracking-tight' 
                : 'text-xs'
            } ${
              active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            <link.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{link.name}</span>
          </button>
        );
      })}

      {moreLinks.length > 0 && (
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg whitespace-nowrap ${
              isRtl ? 'text-[11px] 2xl:text-xs' : 'text-xs'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isMoreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 right-0"
              >
                {moreLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <button
                      key={link.name}
                      onClick={() => { onLinkClick(link); setIsMoreOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ${
                        active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      <link.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  );
}
