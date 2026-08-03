import React from 'react';
import { useTranslation } from '../utils/i18n';
import { isRtlLocale } from '../utils/translations';

import { QRProject } from '../types';
import { 
  RefreshCw, 
  Trash2, 
  Copy, 
  Sparkles, 
  Check, 
  Database, 
  Folder, 
  FolderPlus, 
  Plus, 
  X,
  CheckSquare
} from 'lucide-react';

interface SavedProjectsProps {
  projects: QRProject[];
  onSelect: (project: QRProject) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => Promise<void> | void;
  onSeedData?: (projectId: string, trackingId: string) => void;
  onUpdateCategory?: (projectId: string, category: string) => Promise<void>;
  onBatchUpdateCategory?: (ids: string[], category: string) => Promise<void>;
  isLoading: boolean;
}

export default function SavedProjects({ 
  projects,
  onSelect,
  onDelete,
  onBatchDelete,
  onSeedData,
  onUpdateCategory,
  onBatchUpdateCategory,
  isLoading
}: SavedProjectsProps) {
  const { t, locale } = useTranslation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [movingProjectId, setMovingProjectId] = React.useState<string | null>(null);
  
  // Batch selection state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isBatchMoving, setIsBatchMoving] = React.useState(false);

  // Custom empty folders loaded from/stored in localStorage
  const [customFolders, setCustomFolders] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('qr_custom_folders_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global listener to close dropdowns when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = () => {
      setMovingProjectId(null);
      setIsBatchMoving(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleCopyLink = (e: React.MouseEvent, trackingId: string, id: string) => {
    e.stopPropagation();
    const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
    navigator.clipboard.writeText(`${appUrl}/qr/${trackingId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFolder = (name: string) => {
    const trimmed = ((val) => (val || '').trim())(name);
    if (!trimmed) return;
    if (customFolders.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...customFolders, trimmed];
    setCustomFolders(updated);
    localStorage.setItem('qr_custom_folders_list', JSON.stringify(updated));
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (((val) => (val || '').trim())(newFolderName)) {
      handleCreateFolder(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    const updated = customFolders.filter(f => f.toLowerCase() !== folderToDelete.toLowerCase());
    setCustomFolders(updated);
    localStorage.setItem('qr_custom_folders_list', JSON.stringify(updated));
    if (activeCategory?.toLowerCase() === folderToDelete.toLowerCase()) {
      setActiveCategory(null);
    }
  };

  const handleMoveProject = async (projectId: string, category: string) => {
    if (onUpdateCategory) {
      await onUpdateCategory(projectId, category);
    }
  };

  // Extract unique categories (derived from active projects)
  const allCategories = React.useMemo(() => {
    const derivedCats = Array.from(
      new Set(
        (projects || [])
          .map(p => ((val) => (val || '').trim())(p.category))
          .filter(Boolean) as string[]
      )
    );
    // Combine custom (empty) folders and derived folders uniquely
    const unique = new Set([...customFolders, ...derivedCats]);
    return Array.from(unique);
  }, [projects, customFolders]);

  // Filter projects by chosen option
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory) return (projects || []);
    if (activeCategory === 'uncategorized') {
      return (projects || []).filter(p => !p.category || !((val) => (val || '').trim())(p.category));
    }
    return (projects || []).filter(p => (((val) => (val || '').trim())(p.category ?? "")).toLowerCase() === (((val) => (val || '').trim())(activeCategory ?? "")).toLowerCase());
  }, [projects, activeCategory]);

  // Batch selection handlers
  const handleToggleSelect = (id: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const allFilteredSelected = React.useMemo(() => {
    if (filteredProjects.length === 0) return false;
    return filteredProjects.every(p => selectedIds.includes(p.id));
  }, [filteredProjects, selectedIds]);

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filteredProjects.map(p => p.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const existingSet = new Set(selectedIds);
      filteredProjects.forEach(p => existingSet.add(p.id));
      setSelectedIds(Array.from(existingSet));
    }
  };

  const handleExecuteBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (onBatchDelete) {
      await onBatchDelete(selectedIds);
    } else {
      if (!confirm(t('confirm.batchDeletePresets', 'Are you sure you want to delete {count} selected QR presets?', { count: selectedIds.length }))) return;
      await Promise.all(selectedIds.map(id => onDelete(id)));
    }
    setSelectedIds([]);
  };

  const handleExecuteBatchMove = async (category: string) => {
    if (selectedIds.length === 0) return;
    if (onBatchUpdateCategory) {
      await onBatchUpdateCategory(selectedIds, category);
    } else if (onUpdateCategory) {
      await Promise.all(selectedIds.map(id => onUpdateCategory(id, category)));
    }
    setSelectedIds([]);
    setIsBatchMoving(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
      {/* Title & Folder Creation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            {t('saved.title', 'Saved Designs & Projects')}
          </h2>
          <p className="text-xs text-gray-500 mt-1 flex-wrap">{t('saved.desc', 'Manage saved QR codes, view tracking status, and filter designs by custom folder categories.')}</p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {filteredProjects.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 bg-white"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              {allFilteredSelected ? t('saved.deselectAll', 'Deselect All') : t('saved.selectAll', 'Select All')}
            </button>
          )}

          {!isCreatingFolder ? (
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-150 text-indigo-700 font-semibold text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
              {t('saved.newFolderBtn', 'New Folder')}
            </button>
          ) : (
            <form onSubmit={handleCreateFolderSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                aria-label="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                maxLength={30}
                placeholder={t('saved.folderPlaceholder', 'Folder name...')}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
              >
                {t('saved.createBtn', 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs py-1.5 px-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-600">{t('saved.loading', 'Loading saved items...')}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
          <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-gray-700">{t('saved.noProjectsTitle', 'No Projects Saved Yet')}</h3>
          <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] mx-auto">{t('saved.noProjectsDesc', 'Configure a QR, add colors, assign a folder category, and click "Save Design" above.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Category Filter Bar Slider */}
          {(allCategories.length > 0 || projects.length > 0) && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-0.5 -mx-2 px-2 scrollbar-none flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold ${
                  activeCategory === null
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t('saved.allCount', 'All ({count})', { count: projects.length })}
              </button>

              {allCategories.map(cat => {
                const count = projects.filter(p => (((val) => (val || '').trim())(p.category ?? "")).toLowerCase() === (((val) => (val || '').trim())(cat ?? "")).toLowerCase()).length;
                const isCustom = customFolders.some(f => f.toLowerCase() === cat.toLowerCase());
                return (
                  <div
                    key={cat}
                    className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition font-semibold flex items-center gap-1.5 border border-transparent ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Folder className={`w-3 h-3 ${activeCategory === cat ? 'text-indigo-100' : 'text-indigo-500'}`} />
                      {cat} ({count})
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(cat);
                        }}
                        title={`Remove custom folder "${cat}"`}
                        className={`hover:bg-red-500/10 rounded p-0.5 transition-colors cursor-pointer ${
                          activeCategory === cat ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-red-600'
                        }`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {projects.some(p => !p.category || !((val) => (val || '').trim())(p.category)) && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('uncategorized')}
                  className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-semibold ${
                    activeCategory === 'uncategorized'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t('saved.uncategorizedLabel', 'Uncategorized')} ({projects.filter(p => !p.category || !((val) => (val || '').trim())(p.category)).length})
                </button>
              )}
            </div>
          )}

          {/* Batch Action Toolbar */}
          {selectedIds.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-indigo-200">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-semibold text-indigo-100">
                  {t('saved.batchSelectedCount', '{count} selected', { count: selectedIds.length })}
                </span>
              </div>

              <div className="flex items-center gap-2 relative flex-wrap">
                {/* Batch Move Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBatchMoving(!isBatchMoving);
                    }}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-white/10"
                  >
                    <Folder className="w-3.5 h-3.5 text-indigo-300" />
                    {t('saved.batchMoveBtn', 'Move to Folder')}
                  </button>

                  {isBatchMoving && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 z-50 w-52 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xl py-1.5 text-xs animate-in fade-in duration-100"
                    >
                      <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        {t('saved.moveSelectedTo', 'Move Selected To')}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteBatchMove('')}
                        className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer font-medium text-slate-700"
                      >
                        <Folder className="w-3.5 h-3.5 text-slate-400" />
                        {t('saved.uncategorizedLabel', 'Uncategorized')}
                      </button>

                      {allCategories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleExecuteBatchMove(cat)}
                          className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer font-medium text-slate-700 truncate"
                        >
                          <Folder className="w-3.5 h-3.5 text-indigo-500" />
                          {cat}
                        </button>
                      ))}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          const newFolder = prompt('Enter a name for the new folder:');
                          if (newFolder && ((val) => (val || '').trim())(newFolder)) {
                            const trimmed = ((val) => (val || '').trim())(newFolder);
                            handleCreateFolder(trimmed);
                            handleExecuteBatchMove(trimmed);
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        {t('saved.newFolderBtn', 'New Folder')}...
                      </button>
                    </div>
                  )}
                </div>

                {/* Batch Delete Button */}
                <button
                  type="button"
                  onClick={handleExecuteBatchDelete}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-3xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('saved.batchDeleteBtn', 'Delete Selected')}
                </button>

                {/* Clear Selection */}
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="p-1.5 hover:bg-white/10 text-indigo-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={t('saved.clearSelection', 'Clear selection')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-gray-150 rounded-xl bg-slate-50/20">
              <Folder className="w-6 h-6 text-indigo-300 mx-auto mb-1.5" />
              <h3 className="text-xs font-semibold text-gray-700">{t('saved.noProjectsCategoryTitle', 'No projects in this category')}</h3>
              <p className="text-[10px] text-slate-600 mt-0.5">{t('saved.noProjectsCategoryDesc', 'Change filters or update project categories to view.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredProjects.map(proj => {
                const isSelected = selectedIds.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelect(proj)}
                    className={`bg-white hover:bg-gray-50 border rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-3 group relative shadow-xs ${
                      isSelected ? 'border-indigo-400 bg-indigo-50/25 ring-2 ring-indigo-500/20 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                    } ${isRtlLocale(locale) ? 'rtl-active' : ''}`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="shrink-0 pt-0.5 flex items-center ltr-lock"
                        >
                          <input
                            type="checkbox"
                            aria-label={`Select project ${proj.name}`}
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(proj.id, e)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-105"
                          />
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                          <span className="text-xs font-semibold text-gray-800 block truncate group-hover:text-indigo-600 rtl-content">
                            {proj.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono block truncate max-w-[200px] ltr-lock">
                            {proj.content}
                          </span>
                          {proj.category && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full mt-1.5 ltr-lock">
                              <Folder className="w-2.5 h-2.5 text-indigo-500 ltr-lock" />
                              {proj.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Controls (Move Folder, Restore Config, Delete) */}
                      <div className="flex items-center gap-1 relative ltr-lock shrink-0">
                        <button
                          type="button"
                          title="Move project to folder"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMovingProjectId(movingProjectId === proj.id ? null : proj.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ltr-lock ${
                            movingProjectId === proj.id
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'hover:bg-gray-100 text-gray-500 hover:text-indigo-600'
                          }`}
                        >
                          <Folder className="w-3.5 h-3.5 ltr-lock" />
                        </button>

                        {movingProjectId === proj.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl border border-gray-150 shadow-lg py-1.5 text-left text-xs animate-in fade-in duration-100 ltr-lock"
                          >
                            <div className="px-2.5 py-1 text-[9px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1 ltr-lock">
                              {t('saved.organizeTitle', 'Organize in Folder')}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                handleMoveProject(proj.id, '');
                                setMovingProjectId(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer ltr-lock ${!proj.category ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-600'}`}
                            >
                              <Folder className="w-3 h-3 opacity-60 ltr-lock" />
                              {t('saved.uncategorizedLabel', 'Uncategorized')}
                            </button>
                            
                            {allCategories.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  handleMoveProject(proj.id, cat);
                                  setMovingProjectId(null);
                                }}
                                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer truncate ltr-lock ${proj.category === cat ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-600'}`}
                              >
                                <Folder className="w-3 h-3 text-indigo-500 ltr-lock" />
                                {cat}
                              </button>
                            ))}
                            
                            <div className="border-t border-gray-150 my-1 ltr-lock"></div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newFolder = prompt('Enter a name for the new folder:');
                                if (newFolder && ((val) => (val || '').trim())(newFolder)) {
                                  handleCreateFolder(((val) => (val || '').trim())(newFolder));
                                  handleMoveProject(proj.id, ((val) => (val || '').trim())(newFolder));
                                }
                                setMovingProjectId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 font-semibold flex items-center gap-1.5 cursor-pointer ltr-lock"
                            >
                              <Plus className="w-3.5 h-3.5 ltr-lock" />
                              {t('saved.newFolderBtn', 'New Folder')}...
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          title="Restore config to panel"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(proj);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer ltr-lock"
                        >
                          <RefreshCw className="w-3.5 h-3.5 ltr-lock" />
                        </button>
                        <button
                          type="button"
                          title="Delete design"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(proj.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer ltr-lock"
                        >
                          <Trash2 className="w-3.5 h-3.5 ltr-lock" />
                        </button>
                      </div>
                    </div>

                    {/* Tracking stats preview */}
                    <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-600 font-mono ltr-lock">
                          {proj.type}
                        </span>
                        {proj.trackingEnabled && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 ltr-lock">
                            {t('saved.scansCount', '{count} Scans', { count: proj.scanCount })}
                          </span>
                        )}
                        {proj.expiryDate && (() => {
                          const isExpired = new Date() > new Date(proj.expiryDate);
                          return (
                            <span 
                              title={isExpired ? `Expired on ${new Date(proj.expiryDate).toLocaleString()}` : `Expires on ${new Date(proj.expiryDate).toLocaleString()}`}
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition ltr-lock ${
                                isExpired 
                                  ? 'bg-red-50 text-red-600 border border-red-100/50' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                              }`}
                            >
                              {isExpired ? t('saved.expiredBadge', 'Expired ⚠️') : t('saved.timedBadge', 'Timed ⏳')}
                            </span>
                          );
                        })()}
                      </div>

                      {proj.trackingEnabled && (
                        <div className="flex items-center gap-1 ltr-lock">
                          {import.meta.env.DEV && onSeedData && (
                            <button
                              type="button"
                              title="Generate fake analytics clicks (Internal Testing Only)"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeedData(proj.id, proj.trackingId);
                              }}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded transition-colors ltr-lock"
                            >
                              {t('saved.seedClicksBtn', '+ Seed clicks')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(e, proj.trackingId, proj.id)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-all ltr-lock"
                            title="Copy tracking redirect link"
                          >
                            {copiedId === proj.id ? (
                              <Check className="w-3 h-3 text-emerald-600 ltr-lock" />
                            ) : (
                              <Copy className="w-3 h-3 ltr-lock" />
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
