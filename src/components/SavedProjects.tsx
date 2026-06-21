import React from 'react';
import { QRProject } from '../types';
import { RefreshCw, Trash2, Copy, Sparkles, Check, Database, Folder } from 'lucide-react';

interface SavedProjectsProps {
  projects: QRProject[];
  onSelect: (project: QRProject) => void;
  onDelete: (id: string) => void;
  onSeedData?: (projectId: string, trackingId: string) => void;
  isLoading: boolean;
}

export default function SavedProjects({
  projects,
  onSelect,
  onDelete,
  onSeedData,
  isLoading
}: SavedProjectsProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const handleCopyLink = (e: React.MouseEvent, trackingId: string, id: string) => {
    e.stopPropagation();
    const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
    navigator.clipboard.writeText(`${appUrl}/qr/${trackingId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique categories
  const allCategories = React.useMemo(() => {
    const cats = Array.from(
      new Set(
        (projects || [])
          .map(p => p.category?.trim())
          .filter(Boolean) as string[]
      )
    );
    return cats;
  }, [projects]);

  // Filter projects by chosen option
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory) return (projects || []);
    if (activeCategory === 'uncategorized') {
      return (projects || []).filter(p => !p.category || !p.category.trim());
    }
    return (projects || []).filter(p => p.category?.trim().toLowerCase() === activeCategory.toLowerCase());
  }, [projects, activeCategory]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Saved Designs & Projects
        </h2>
        <p className="text-xs text-gray-500 mt-1 flex-wrap">Manage saved QR codes, view tracking status, and filter designs by folder category.</p>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-gray-400">Loading saved items...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
          <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-gray-700">No Projects Saved Yet</h3>
          <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">Configure a QR, add colors, assign a folder category, and click "Save Design" above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Category Filter Bar slider */}
          {allCategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-0.5 -mx-2 px-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold ${
                  activeCategory === null
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({projects.length})
              </button>
              {allCategories.map(cat => {
                const count = projects.filter(p => p.category?.trim().toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold flex items-center gap-1 border border-transparent ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Folder className={`w-3 h-3 ${activeCategory === cat ? 'text-indigo-100' : 'text-indigo-500'}`} />
                    {cat} ({count})
                  </button>
                );
              })}
              {projects.some(p => !p.category || !p.category.trim()) && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('uncategorized')}
                  className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold ${
                    activeCategory === 'uncategorized'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Uncategorized ({projects.filter(p => !p.category || !p.category.trim()).length})
                </button>
              )}
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-gray-150 rounded-xl bg-slate-50/20">
              <Folder className="w-6 h-6 text-indigo-300 mx-auto mb-1.5" />
              <h3 className="text-xs font-semibold text-gray-700">No projects in this category</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Change filters or update project categories to view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredProjects.map(proj => {
                const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
                const fullUrl = `${appUrl}/qr/${proj.trackingId}`;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelect(proj)}
                    className="bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-3 group relative shadow-sm"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-gray-800 block truncate group-hover:text-indigo-600">
                          {proj.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono block truncate max-w-[200px]">
                          {proj.content}
                        </span>
                        {proj.category && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full mt-1.5">
                            <Folder className="w-2.5 h-2.5 text-indigo-500" />
                            {proj.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Restore config to panel"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(proj);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete design"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(proj.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                {/* Tracking stats preview */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600 font-mono">
                      {proj.type}
                    </span>
                    {proj.trackingEnabled && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600">
                        {proj.scanCount} Scans
                      </span>
                    )}
                    {proj.expiryDate && (() => {
                      const isExpired = new Date() > new Date(proj.expiryDate);
                      return (
                        <span 
                          title={isExpired ? `Expired on ${new Date(proj.expiryDate).toLocaleString()}` : `Expires on ${new Date(proj.expiryDate).toLocaleString()}`}
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition ${
                            isExpired 
                              ? 'bg-red-50 text-red-600 border border-red-100/50' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                          }`}
                        >
                          {isExpired ? 'Expired ⚠️' : 'Timed ⏳'}
                        </span>
                      );
                    })()}
                  </div>

                  {proj.trackingEnabled && (
                    <div className="flex items-center gap-1">
                      {onSeedData && (
                        <button
                          type="button"
                          title="Generate fake analytics clicks"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeedData(proj.id, proj.trackingId);
                          }}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded transition-colors"
                        >
                          + Seed clicks
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, proj.trackingId, proj.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-all"
                        title="Copy tracking redirect link"
                      >
                        {copiedId === proj.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
