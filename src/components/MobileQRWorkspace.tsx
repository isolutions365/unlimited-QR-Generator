import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Eye, 
  SlidersHorizontal, 
  Palette, 
  Image as ImageIcon, 
  Download, 
  Save, 
  QrCode,
  Check,
  Zap
} from 'lucide-react';
import ControlPanel from './ControlPanel';
import PreviewPanel from './PreviewPanel';
import SavedProjects from './SavedProjects';
import { QRProject } from '../types';
import { SoundSettings } from '../utils/audioFeedback';

interface MobileQRWorkspaceProps {
  currentProject: Partial<QRProject>;
  onChange: (project: Partial<QRProject>) => void;
  onSave: () => void;
  isSaving: boolean;
  userEmail?: string;
  projects: QRProject[];
  onSelectProject: (project: QRProject) => void;
  onDeleteProject: (id: string) => void;
  onBatchDeleteProjects?: (ids: string[]) => Promise<void> | void;
  onSeedScanClick?: (projectId: string, trackingId: string) => void;
  onUpdateProjectCategory?: (projectId: string, category: string) => Promise<void>;
  onBatchUpdateCategory?: (ids: string[], category: string) => Promise<void>;
  isLoadingData: boolean;
  onReorderProjects?: (orderedIds: string[]) => void;
  handleSimTestScan: (text: string) => void;
  handleDownloadTrigger: (format: 'png' | 'svg' | 'pdf' | 'eps', scale?: number) => void;
  soundSettings: SoundSettings;
  onOpenSettings: () => void;
}

export default function MobileQRWorkspace({
  currentProject,
  onChange,
  onSave,
  isSaving,
  userEmail,
  projects,
  onSelectProject,
  onDeleteProject,
  onBatchDeleteProjects,
  onSeedScanClick,
  onUpdateProjectCategory,
  onBatchUpdateCategory,
  isLoadingData,
  onReorderProjects,
  handleSimTestScan,
  handleDownloadTrigger,
  soundSettings,
  onOpenSettings
}: MobileQRWorkspaceProps) {
  const [mobileTab, setMobileTab] = useState<'preview' | 'editor' | 'saved'>('editor');

  return (
    <div dir="ltr" id="mobile-qr-workspace" className="flex flex-col gap-4">
      {/* Mobile Accessibility Touch Target Styles (44x44px minimum touch targets) */}
      <style>{`
        #mobile-qr-workspace input[type="range"] {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          min-height: 44px !important;
          height: 44px !important;
          background: transparent;
          cursor: pointer;
          touch-action: manipulation;
        }
        #mobile-qr-workspace input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 9999px;
        }
        #mobile-qr-workspace input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          height: 26px;
          width: 26px;
          border-radius: 50%;
          background-color: #4f46e5;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          margin-top: -9px;
          transition: transform 0.15s ease, background-color 0.15s ease;
        }
        #mobile-qr-workspace input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.2);
          background-color: #4338ca;
        }
        #mobile-qr-workspace input[type="range"]::-moz-range-track {
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 9999px;
        }
        #mobile-qr-workspace input[type="range"]::-moz-range-thumb {
          height: 26px;
          width: 26px;
          border-radius: 50%;
          background-color: #4f46e5;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        #mobile-qr-workspace input[type="color"] {
          min-width: 44px !important;
          min-height: 44px !important;
          width: 44px !important;
          height: 44px !important;
          padding: 2px !important;
          border-radius: 12px !important;
          touch-action: manipulation;
          cursor: pointer;
        }
      `}</style>
      {/* Mobile Workspace Mode Switcher (Editor vs Preview vs Saved) */}
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-300 shadow-lg">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Editor
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('saved')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'saved'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          Saved ({projects.length})
        </button>
      </div>

      {/* Editor View */}
      {mobileTab === 'editor' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Quick Preview Header Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                {(currentProject.type || 'url').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">{currentProject.name || 'My Custom QR Code'}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">{currentProject.content || ''}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="px-3 py-1.5 bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-extrabold hover:bg-indigo-600/40 transition-colors cursor-pointer shrink-0"
            >
              View QR
            </button>
          </div>

          {/* Control Panel */}
          <ControlPanel
            currentProject={currentProject}
            onChange={onChange}
            onSave={onSave}
            isSaving={isSaving}
            userEmail={userEmail}
            projects={projects}
          />
        </div>
      )}

      {/* Preview View */}
      {mobileTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <PreviewPanel
            currentProject={currentProject}
            onTestScan={handleSimTestScan}
            onDownloadTrigger={() => handleDownloadTrigger('png')}
            onChange={onChange}
            isSaving={isSaving}
            soundSettings={soundSettings}
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}

      {/* Saved View */}
      {mobileTab === 'saved' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <SavedProjects
            projects={projects}
            onSelect={(proj) => {
              onSelectProject(proj);
              setMobileTab('editor');
            }}
            onDelete={onDeleteProject}
            onBatchDelete={onBatchDeleteProjects}
            onSeedData={onSeedScanClick}
            onUpdateCategory={onUpdateProjectCategory}
            onBatchUpdateCategory={onBatchUpdateCategory}
            isLoading={isLoadingData}
            onReorderProjects={onReorderProjects}
          />
        </div>
      )}
    </div>
  );
}
