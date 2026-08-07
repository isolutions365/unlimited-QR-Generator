import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Globe, CheckCircle2, AlertTriangle, XCircle, 
  Code2, ExternalLink, Download, Copy, Check, ChevronRight, 
  Sparkles, Layers, FileCode, ShieldCheck, HelpCircle, Eye, Info, RefreshCw
} from 'lucide-react';
import { Locale, SUPPORTED_LOCALES } from '../utils/translations';
import { 
  auditAllRoutes, 
  AuditedRouteInfo, 
  SEOAuditSummary, 
  MissingSchemaRecommendation 
} from '../utils/seoRouteAuditor';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  hi: 'हिन्दी',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
};

interface SEOAuditTabProps {
  currentLocale: Locale;
  onLocaleChange: (loc: Locale) => void;
}

export default function SEOAuditTab({ currentLocale, onLocaleChange }: SEOAuditTabProps) {
  const [selectedAuditLocale, setSelectedAuditLocale] = useState<Locale>(currentLocale);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [missingSchemaOnly, setMissingSchemaOnly] = useState(false);
  const [activeRouteInspect, setActiveRouteInspect] = useState<AuditedRouteInfo | null>(null);
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);
  const [copiedHead, setCopiedHead] = useState(false);

  // Compute audit for selected locale
  const { routes, summary } = useMemo(() => {
    return auditAllRoutes(selectedAuditLocale);
  }, [selectedAuditLocale]);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchSearch = 
        route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = categoryFilter === 'all' || route.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || route.status === statusFilter;
      const matchMissingSchema = !missingSchemaOnly || route.missingSchemas.length > 0;

      return matchSearch && matchCategory && matchStatus && matchMissingSchema;
    });
  }, [routes, searchTerm, categoryFilter, statusFilter, missingSchemaOnly]);

  const handleLocaleSelect = (loc: Locale) => {
    setSelectedAuditLocale(loc);
    onLocaleChange(loc);
  };

  const handleCopyJsonLd = (snippet: object, index: number) => {
    navigator.clipboard.writeText(JSON.stringify(snippet, null, 2));
    setCopiedSnippetIndex(index);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  const handleCopyHeadTags = (route: AuditedRouteInfo) => {
    const headMarkup = `<!-- SEO Meta Tags for ${route.path} (${selectedAuditLocale}) -->
<title>${route.title}</title>
<meta name="description" content="${route.description}" />
<link rel="canonical" href="${route.canonicalUrl}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${route.ogTitle}" />
<meta property="og:description" content="${route.ogDescription}" />
<meta property="og:url" content="${route.canonicalUrl}" />
<meta property="og:image" content="${route.ogImage}" />
<meta property="og:locale" content="${route.ogLocale}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="${route.twitterCard}" />
<meta name="twitter:title" content="${route.ogTitle}" />
<meta name="twitter:description" content="${route.ogDescription}" />
<meta name="twitter:image" content="${route.ogImage}" />

<!-- Hreflang Alternates (${route.hreflangs.length} locales) -->
${route.hreflangs.map(h => `<link rel="alternate" hreflang="${h.lang}" href="${h.url}" />`).join('\n')}`;

    navigator.clipboard.writeText(headMarkup);
    setCopiedHead(true);
    setTimeout(() => setCopiedHead(false), 2000);
  };

  const handleExportJson = () => {
    const exportData = {
      auditTimestamp: new Date().toISOString(),
      locale: selectedAuditLocale,
      summary,
      auditedRoutes: routes
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `freeqrgen_seo_health_${selectedAuditLocale}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Language Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full tracking-widest font-mono">
                SEO HEALTH DIAGNOSTIC ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.4 Multilingual</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Route Metadata, Canonical & Schema Inspector
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit open-graph tags, canonical formatting, 14-locale hreflang mappings, and structured JSON-LD schemas across all application routes.
            </p>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer self-start lg:self-auto shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Audit JSON</span>
          </button>
        </div>

        {/* 14 Language Tabs */}
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 font-mono">
            SELECT TARGET AUDIT LANGUAGE ({SUPPORTED_LOCALES.length} LOCALES)
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUPPORTED_LOCALES.map((loc) => {
              const isSelected = selectedAuditLocale === loc;
              return (
                <button
                  key={loc}
                  onClick={() => handleLocaleSelect(loc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-sm font-extrabold' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Globe className={`w-3 h-3 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                  <span className="uppercase">{loc}</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                    ({LOCALE_NAMES[loc]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
            Audited Routes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{summary.totalRoutes}</span>
            <span className="text-xs text-slate-500 font-medium">registered</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{summary.healthyCount} Healthy</span>
            <span className="text-slate-300">•</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            <span>{summary.warningCount} Warnings</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
            Overall Health Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${summary.avgHealthScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {summary.avgHealthScore}%
            </span>
            <span className="text-xs text-slate-500 font-medium">index</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${summary.avgHealthScore >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${summary.avgHealthScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
            Hreflang & Canonical
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600">{summary.canonicalHealthRate}%</span>
            <span className="text-xs text-indigo-500 font-bold">15 links/route</span>
          </div>
          <div className="mt-2 text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-500" />
            <span>ISO-639 Multilingual Ready</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
            Schema Coverage
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{summary.schemaCoverageRate}%</span>
            <span className="text-xs text-purple-500 font-medium">JSON-LD</span>
          </div>
          <div className="mt-2 text-[10px] text-purple-600 font-semibold flex items-center gap-1">
            <Code2 className="w-3 h-3 text-purple-500" />
            <span>WebSite, Breadcrumbs & Tools</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search route path, title, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium cursor-pointer"
            >
              <option value="all">All Route Categories</option>
              <option value="Generators & Tools">Generators & Tools</option>
              <option value="Core & Trust">Core & Trust</option>
              <option value="Knowledge & Blog">Knowledge & Blog</option>
              <option value="Templates & Compare">Templates & Compare</option>
              <option value="Solutions & Industries">Solutions & Industries</option>
            </select>
          </div>

          {/* Health Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium cursor-pointer"
            >
              <option value="all">All Health Statuses</option>
              <option value="healthy">Healthy (85%+)</option>
              <option value="warning">Warnings</option>
              <option value="critical">Critical Issues</option>
            </select>
          </div>

          {/* Missing Schema Toggle */}
          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={missingSchemaOnly}
                onChange={(e) => setMissingSchemaOnly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Missing Schemas</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 font-medium">
          <span>Showing <strong className="text-slate-800">{filteredRoutes.length}</strong> of {routes.length} routes</span>
          {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || missingSchemaOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setMissingSchemaOnly(false);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Route Audit Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider">
                <th className="py-3 px-4">Route Path & Category</th>
                <th className="py-3 px-4">Meta Title & Length</th>
                <th className="py-3 px-4">Canonical & Hreflangs</th>
                <th className="py-3 px-4">Active Schemas</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRoutes.map((route) => {
                const titleLengthColor = route.titleStatus === 'good' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50';
                
                return (
                  <tr key={route.path} className="hover:bg-slate-50/80 transition-colors">
                    {/* Path & Category */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{route.path}</div>
                      <span className="text-[10px] font-sans font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {route.category}
                      </span>
                    </td>

                    {/* Meta Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{route.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${titleLengthColor}`}>
                          {route.titleLength} chars
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{route.description}</span>
                      </div>
                    </td>

                    {/* Canonical & Hreflangs */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-indigo-700 font-medium truncate max-w-[200px]" title={route.canonicalUrl}>
                        {route.canonicalUrl.replace('https://www.freeqrgen.pro', '')}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-500">
                        <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{route.hreflangs.length} Hreflang alternates</span>
                      </div>
                    </td>

                    {/* Active Schemas */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {route.existingSchemas.map((schema) => (
                          <span key={schema} className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                            {schema}
                          </span>
                        ))}
                        {route.missingSchemas.length > 0 && (
                          <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200" title="Missing recommended schema">
                            +{route.missingSchemas.length} missing
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Health Score */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`font-black text-sm ${route.healthScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {route.healthScore}%
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full ${
                          route.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {route.status}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveRouteInspect(route)}
                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect SEO</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-xs">No routes match your active filter criteria</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal / Drawer */}
      <AnimatePresence>
        {activeRouteInspect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-indigo-400 uppercase">{activeRouteInspect.category}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-300 font-mono">Locale: {selectedAuditLocale.toUpperCase()}</span>
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight font-mono text-white">
                      {activeRouteInspect.path}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyHeadTags(activeRouteInspect)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    {copiedHead ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHead ? 'Copied Head Tags!' : 'Copy <head> Tags'}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveRouteInspect(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                
                {/* Meta Tags Inspection Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    DOM HEAD METADATA INSPECTION
                  </h4>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">&lt;title&gt; ({activeRouteInspect.titleLength} chars)</span>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-900 mt-1">
                        {activeRouteInspect.title}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">&lt;meta name="description"&gt; ({activeRouteInspect.descriptionLength} chars)</span>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 mt-1 leading-relaxed">
                        {activeRouteInspect.description}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">&lt;link rel="canonical"&gt;</span>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-indigo-700 font-bold mt-1">
                        {activeRouteInspect.canonicalUrl}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hreflang Alternates */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      14-LOCALE HREFLANG ALTERNATES ({activeRouteInspect.hreflangs.length} ENTRIES)
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      x-default Registered
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    {activeRouteInspect.hreflangs.map((h) => (
                      <div key={h.lang} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="font-black text-indigo-600 uppercase">{h.lang}</span>
                        <span className="text-slate-500 truncate max-w-[220px]" title={h.url}>{h.url.replace('https://www.freeqrgen.pro', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schema Recommendations & Snippets */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-purple-600" />
                    STRUCTURED JSON-LD SCHEMAS & RECOMMENDATIONS
                  </h4>

                  <div className="space-y-3">
                    {/* Active Schemas */}
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200">
                      <span className="text-xs font-bold text-purple-900 block mb-2">
                        Active Schemas Detected ({activeRouteInspect.existingSchemas.length})
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {activeRouteInspect.existingSchemas.map(s => (
                          <span key={s} className="px-2.5 py-1 bg-purple-600 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Schema Snippets */}
                    {activeRouteInspect.missingSchemas.map((rec, idx) => (
                      <div key={rec.type} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="font-extrabold text-xs text-amber-900">
                              Recommended Additional Schema: <code className="font-mono">{rec.type}</code>
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                              {rec.importance} priority
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyJsonLd(rec.sampleSnippet, idx)}
                            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer"
                          >
                            {copiedSnippetIndex === idx ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSnippetIndex === idx ? 'Copied Snippet!' : 'Copy JSON-LD'}</span>
                          </button>
                        </div>

                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          {rec.reason}
                        </p>

                        <div className="bg-slate-900 text-emerald-400 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-48">
                          <pre>{JSON.stringify(rec.sampleSnippet, null, 2)}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Audit status: <strong className="text-slate-800 uppercase">{activeRouteInspect.status}</strong> ({activeRouteInspect.healthScore}% health)
                </span>
                <button
                  onClick={() => setActiveRouteInspect(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Done Inspecting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
