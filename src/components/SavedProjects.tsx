import React from 'react';
import { QRProject } from '../types';
import { RefreshCw, Trash2, Copy, Sparkles, Check, Database } from 'lucide-react';

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

  const handleCopyLink = (e: React.MouseEvent, trackingId: string, id: string) => {
    e.stopPropagation();
    const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
    navigator.clipboard.writeText(`${appUrl}/qr/${trackingId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Saved Designs & Projects
        </h2>
        <p className="text-xs text-gray-500 mt-1">Manage saved QR codes, view tracking status, and seed mock stats.</p>
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
          <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">Configure a QR, add colors, and click "Save Design" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
          {projects.map(proj => {
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
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      {proj.type}
                    </span>
                    {proj.trackingEnabled && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600">
                        {proj.scanCount} Scans
                      </span>
                    )}
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
  );
}
