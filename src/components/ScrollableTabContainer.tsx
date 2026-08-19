import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableTabContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  gradientColor?: string; // e.g. "from-slate-50", "from-white", "from-slate-900"
  scrollAmount?: number;
  showArrows?: boolean;
}

export const ScrollableTabContainer: React.FC<ScrollableTabContainerProps> = ({
  children,
  className = '',
  innerClassName = 'flex flex-row flex-nowrap items-center gap-1.5 py-0.5 px-1',
  gradientColor = 'from-slate-50',
  scrollAmount = 240,
  showArrows = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Buffer of 3px to avoid subpixel precision rounding issues
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    // Scroll event listener
    el.addEventListener('scroll', checkScroll, { passive: true });

    // ResizeObserver to recheck on container/window size changes
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    // MutationObserver to recheck if tabs or children change dynamically
    const mutationObserver = new MutationObserver(() => {
      checkScroll();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [checkScroll, children]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const offset = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const leftFadeClass = `bg-gradient-to-r ${gradientColor} to-transparent`;
  const rightFadeClass = `bg-gradient-to-l ${gradientColor} to-transparent`;

  return (
    <div className={`relative group/tabcontainer overflow-hidden ${className}`}>
      {/* Left Fade Overlay */}
      {canScrollLeft && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-10 sm:w-14 z-10 pointer-events-none transition-opacity duration-300 ${leftFadeClass}`}
        />
      )}

      {/* Left Scroll Arrow Button */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Scroll tabs left"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-300/90 shadow-md hover:shadow-lg hover:bg-white text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto scrollbar-none select-none ${innerClassName}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right Scroll Arrow Button */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Scroll tabs right"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 border border-slate-300/90 shadow-md hover:shadow-lg hover:bg-white text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer active:scale-90"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      )}

      {/* Right Fade Overlay */}
      {canScrollRight && (
        <div
          className={`absolute right-0 top-0 bottom-0 w-10 sm:w-14 z-10 pointer-events-none transition-opacity duration-300 ${rightFadeClass}`}
        />
      )}
    </div>
  );
};

export default ScrollableTabContainer;
