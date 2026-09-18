import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Eye, 
  SlidersHorizontal, 
  QrCode,
  ArrowRight,
  Check,
  AlertTriangle,
  Link2,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import ControlPanel from './ControlPanel';
import PreviewPanel from './PreviewPanel';
import SavedProjects from './SavedProjects';
import { MemoizedQRCanvas } from './MemoizedQRCanvas';
import { QRProject } from '../types';
import { SoundSettings } from '../utils/audioFeedback';
import { useTranslation } from '../utils/i18n';

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

// WCAG relative luminance & contrast ratio calculation
const getLuminance = (hexColor: string): number => {
  const hex = hexColor.replace(/^#/, '');
  if (hex.length !== 3 && hex.length !== 6) return 0;
  let r = 0, g = 0, b = 0;
  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  }
  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

const getContrastRatio = (hex1: string, hex2: string): number => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
};

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
  const { t } = useTranslation();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'saved'>('editor');
  const [editorSubTab, setEditorSubTab] = useState<'content' | 'style' | 'logo'>('content');
  const shouldReduceMotion = useReducedMotion();

  const tabs: {
    id: 'editor' | 'preview' | 'saved';
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'editor',
      label: t('common.editor', 'Editor'),
      icon: SlidersHorizontal
    },
    {
      id: 'preview',
      label: t('preview.livePreview', 'Live Preview'),
      icon: Eye
    },
    {
      id: 'saved',
      label: `${t('mobileNav.saved', 'Saved')} (${projects.length})`,
      icon: QrCode
    }
  ];

  const subTabs: {
    id: 'content' | 'style' | 'logo';
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'content', label: t('generator.content', 'Content'), icon: Link2 },
    { id: 'style', label: t('generator.style', 'Style'), icon: Palette },
    { id: 'logo', label: t('generator.logo', 'Logo'), icon: ImageIcon },
  ];

  // Comprehensive multi-factor scannability diagnostics (not contrast alone)
  const fg = currentProject.design?.fgColor || '#0f172a';
  const bg = currentProject.design?.bgColor || '#ffffff';
  const gradientType = currentProject.design?.gradientType || 'none';
  const gradientColor = currentProject.design?.gradientColor || '#2563eb';
  const logoUrl = currentProject.design?.logoUrl;
  const logoScale = currentProject.design?.logoScale ?? 0.18;
  const errorCorrectionLevel = currentProject.design?.errorCorrectionLevel || 'H';
  const content = currentProject.content || '';

  const contrastFG = getContrastRatio(fg, bg);
  const contrastGrad = gradientType !== 'none' ? getContrastRatio(gradientColor, bg) : contrastFG;
  const minContrast = Math.min(contrastFG, contrastGrad);

  let maxRecommendedScale = 0.15;
  if (errorCorrectionLevel === 'M') maxRecommendedScale = 0.20;
  if (errorCorrectionLevel === 'Q') maxRecommendedScale = 0.25;
  if (errorCorrectionLevel === 'H') maxRecommendedScale = 0.28;

  const isLowContrast = minContrast < 3.0;
  const isSuboptimalContrast = minContrast >= 3.0 && minContrast < 4.5;
  const isExcessiveLogo = !!logoUrl && logoScale > maxRecommendedScale;
  const isHighDensityRisk = content.length > 120 && (errorCorrectionLevel === 'L' || errorCorrectionLevel === 'M');

  const hasCriticalIssue = isLowContrast || isExcessiveLogo || isHighDensityRisk;
  const hasWarningIssue = isSuboptimalContrast || (!!logoUrl && logoScale > maxRecommendedScale * 0.85);

  return (
    <div id="mobile-qr-workspace" className="flex flex-col gap-3.5">
      {/* Mobile Accessibility & Range/Color input CSS */}
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
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 9999px;
        }
        #mobile-qr-workspace input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background-color: #2563eb;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          margin-top: -9px;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
        }
        #mobile-qr-workspace input[type="range"]::-webkit-slider-thumb:focus-visible,
        #mobile-qr-workspace input[type="range"]::-webkit-slider-thumb:active {
          background-color: #1d4ed8;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.25);
        }
        #mobile-qr-workspace input[type="range"]::-moz-range-track {
          width: 100%;
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 9999px;
        }
        #mobile-qr-workspace input[type="range"]::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background-color: #2563eb;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
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
        #mobile-qr-workspace input,
        #mobile-qr-workspace select,
        #mobile-qr-workspace textarea {
          font-size: 14px !important;
        }
      `}</style>

      {/* 1. Workspace Navigation: Option 2 Segmented Control */}
      <nav
        role="tablist"
        aria-label="Workspace views"
        className="relative bg-white border border-slate-200/90 p-1 rounded-2xl flex items-center min-h-[48px] shadow-2xs select-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mobileTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`workspace-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`workspace-panel-${tab.id}`}
              onClick={() => setMobileTab(tab.id)}
              className={`relative flex-1 min-w-0 min-h-[44px] px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 z-10 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap ${
                isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Active Segment Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="mobileWorkspaceTabIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-xs z-[-1]"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.01 }
                      : { type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.18 }
                  }
                />
              )}

              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 2. Editor View: Option 2 Top QR Preview Card + Sheet Surface */}
      {mobileTab === 'editor' && (
        <motion.div
          id="workspace-panel-editor"
          role="tabpanel"
          aria-labelledby="workspace-tab-editor"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-4"
        >
          {/* Top QR Preview Card (Clean neutral surface with 16px corner radii) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Real Interactive QR Canvas (12px corner radius) */}
            <div 
              className="relative bg-white p-2 rounded-xl shadow-2xs border border-slate-200/60 flex items-center justify-center overflow-hidden" 
              style={{ width: '220px', height: '220px' }}
            >
              <MemoizedQRCanvas
                textToEncode={currentProject.content || 'https://freeqrbarcodes.com'}
                fgColor={currentProject.design?.fgColor || '#0f172a'}
                bgColor={currentProject.design?.bgColor || '#ffffff'}
                gradientType={currentProject.design?.gradientType || 'none'}
                gradientColor={currentProject.design?.gradientColor || '#2563eb'}
                dotStyle={currentProject.design?.dotStyle || 'square'}
                eyeStyle={currentProject.design?.eyeStyle || 'square'}
                logoUrl={currentProject.design?.logoUrl}
                logoScale={currentProject.design?.logoScale ?? 0.18}
                margin={currentProject.design?.margin ?? 2}
                logoRotation={currentProject.design?.logoRotation ?? 0}
                logoAutoCenter={currentProject.design?.logoAutoCenter ?? true}
                logoBackgroundMask={currentProject.design?.logoBackgroundMask ?? true}
                logoOffsetX={currentProject.design?.logoOffsetX ?? 0}
                logoOffsetY={currentProject.design?.logoOffsetY ?? 0}
                eyeColorTopLeft={currentProject.design?.eyeColorTopLeft}
                eyeColorTopRight={currentProject.design?.eyeColorTopRight}
                eyeColorBottomLeft={currentProject.design?.eyeColorBottomLeft}
                errorCorrectionLevel={currentProject.design?.errorCorrectionLevel || 'H'}
                isPrintModalOpen={false}
                frameStyle={currentProject.design?.frameStyle}
                frameText={currentProject.design?.frameText}
                frameColor={currentProject.design?.frameColor}
                frameTextColor={currentProject.design?.frameTextColor}
                frameFontSize={currentProject.design?.frameFontSize}
                frameTextPosition={currentProject.design?.frameTextPosition}
              />
            </div>

            {/* Scannability Badge (Multi-factor estimated scannability rating) */}
            <div className="mt-4 flex flex-col items-center">
              {hasCriticalIssue ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('preview.gradeCritical', 'Critical Scannability Warning')}</span>
                </span>
              ) : hasWarningIssue ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('preview.gradeModerate', 'Moderate Scannability')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>{t('preview.gradeExcellent', 'Excellent Scannability')}</span>
                </span>
              )}
              <p className="text-xs text-slate-500 font-medium mt-1.5 px-2 max-w-xs text-center leading-normal">
                {t('preview.designEstimateNotice', 'Design estimate. Test the downloaded QR code before printing.')}
              </p>
            </div>

            {/* Project Title */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-2 truncate max-w-full px-2">
              {currentProject.name || 'My Custom QR Code'}
            </h3>
          </div>

          {/* Generator Controls Panel: Content / Style / Logo Sections with clean neutral surfaces and 16px corner radii */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
            {/* Section Tabs: Content / Style / Logo with neutral 12px pill styling */}
            <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1" role="tablist" aria-label="Generator sections">
              {subTabs.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = editorSubTab === sub.id;

                return (
                  <button
                    key={sub.id}
                    role="tab"
                    type="button"
                    aria-selected={isSubActive}
                    onClick={() => setEditorSubTab(sub.id)}
                    className={`relative flex-1 min-h-[44px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs transition-colors cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSubActive
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grouped Section Controls (Static input handling without typing animations) */}
            <div className="pt-1">
              <ControlPanel
                activeMobileSection={editorSubTab}
                currentProject={currentProject}
                onChange={onChange}
                onSave={onSave}
                isSaving={isSaving}
                userEmail={userEmail}
                projects={projects}
              />
            </div>

            {/* Primary Action Button (Opens Live Preview with Translated Label) */}
            <button
              type="button"
              id="mobile-live-preview-btn"
              data-testid="mobile-update-qr-btn"
              onClick={() => setMobileTab('preview')}
              className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer mt-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>{t('preview.livePreview', 'Live Preview')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. Live Preview View */}
      {mobileTab === 'preview' && (
        <motion.div
          id="workspace-panel-preview"
          role="tabpanel"
          aria-labelledby="workspace-tab-preview"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-3.5"
        >
          <PreviewPanel
            currentProject={currentProject}
            onTestScan={handleSimTestScan}
            onDownloadTrigger={() => handleDownloadTrigger('png')}
            onChange={onChange}
            isSaving={isSaving}
            soundSettings={soundSettings}
            onOpenSettings={onOpenSettings}
          />
        </motion.div>
      )}

      {/* 4. Saved Projects View */}
      {mobileTab === 'saved' && (
        <motion.div
          id="workspace-panel-saved"
          role="tabpanel"
          aria-labelledby="workspace-tab-saved"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-3.5"
        >
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
        </motion.div>
      )}
    </div>
  );
}
