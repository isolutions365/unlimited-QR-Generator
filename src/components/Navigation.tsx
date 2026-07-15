import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

interface NavLink {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavigationProps {
  links: NavLink[];
  currentPath: string;
  navigateTo: (path: string) => void;
  isRtl: boolean;
}

export default function Navigation({ links, currentPath, navigateTo, isRtl }: NavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleLinks = links.slice(0, 6);
  const moreLinks = links.slice(6);

  return (
    <nav className={`hidden xl:flex items-center gap-1 min-w-0 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {visibleLinks.map((link) => (
        <button
          key={link.path}
          onClick={() => navigateTo(link.path)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-lg truncate whitespace-nowrap max-w-[140px] ${
            currentPath === link.path ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <link.icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{link.name}</span>
        </button>
      ))}

      {moreLinks.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg whitespace-nowrap"
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
                className={`absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 ${isRtl ? 'left-0' : 'right-0'}`}
              >
                {moreLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => { navigateTo(link.path); setIsMoreOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                  >
                    <link.icon className="w-3.5 h-3.5 shrink-0" />
                    {link.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </nav>
  );
}
