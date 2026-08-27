import React, { useEffect } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { getProductionBaseUrl } from '../config/siteConfig';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
  onNavigate?: (path: string) => void;
  /** Custom ID for the injected script tag to prevent collisions */
  schemaId?: string;
}

export default function BreadcrumbNav({ items, className = '', onNavigate, schemaId = 'dynamic-breadcrumb-schema' }: BreadcrumbNavProps) {
  const { t, locale } = useTranslation();
  const rootUrl = getProductionBaseUrl();

  // Full breadcrumb list including Home root
  const fullItems: BreadcrumbItem[] = [
    {
      label: t('common.home', 'Home'),
      href: `/${locale === 'en' ? '' : locale}`,
      onClick: onNavigate ? () => onNavigate('/') : undefined
    },
    ...items
  ];

  // Dynamically inject BreadcrumbList JSON-LD Schema into document.head
  useEffect(() => {
    const scriptTagId = schemaId;
    let scriptEl = document.getElementById(scriptTagId);

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${rootUrl}/${locale === 'en' ? '' : locale}#breadcrumb-${schemaId}`,
      'itemListElement': fullItems.map((item, idx) => {
        let itemUrl = rootUrl;
        if (item.href) {
          if (item.href.startsWith('http')) {
            itemUrl = item.href;
          } else {
            const cleanHref = item.href.replace(/^\//, '');
            itemUrl = `${rootUrl}/${cleanHref}`;
          }
        }
        return {
          '@type': 'ListItem',
          'position': idx + 1,
          'name': item.label,
          'item': itemUrl
        };
      })
    };

    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptTagId;
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemaData, null, 2);

    return () => {
      const el = document.getElementById(scriptTagId);
      if (el) {
        el.remove();
      }
    };
  }, [items, locale, rootUrl, schemaId]);

  return (
    <nav
      className={`flex items-center flex-wrap gap-1.5 text-xs font-medium text-slate-500 py-2.5 px-3.5 bg-slate-100/80 rounded-xl border border-slate-200/60 shadow-2xs backdrop-blur-xs select-none ${className}`}
      aria-label={t('common.breadcrumb', 'Breadcrumb navigation')}
    >
      <ol className="flex items-center flex-wrap gap-1.5 list-none m-0 p-0">
        {fullItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === fullItems.length - 1 || item.active;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-semibold text-slate-800 truncate max-w-[240px] sm:max-w-xs"
                  aria-current="page"
                  title={item.label}
                >
                  {isFirst && <Home className="w-3.5 h-3.5 inline-block mr-1 text-slate-600 -mt-0.5" />}
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.href && onNavigate) {
                      onNavigate(item.href);
                    }
                  }}
                  className="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1 font-medium hover:underline decoration-indigo-300 underline-offset-2"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 text-slate-500 hover:text-indigo-600" aria-hidden="true" />}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
