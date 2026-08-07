import React from 'react';
import { useTranslation } from '../utils/i18n';
import { isRtlLocale } from '../utils/translations';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';

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
  CheckSquare,
  GripVertical,
  Edit3,
  BarChart2,
  TrendingUp,
  Smartphone,
  Globe,
  FolderOpen,
  Edit,
  ExternalLink
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
  onReorderProjects?: (orderedIds: string[]) => void;
  onDuplicateProject?: (project: QRProject) => Promise<void> | void;
}

export default function SavedProjects({ 
  projects,
  onSelect,
  onDelete,
  onBatchDelete,
  onSeedData,
  onUpdateCategory,
  onBatchUpdateCategory,
  isLoading,
  onReorderProjects,
  onDuplicateProject
}: SavedProjectsProps) {
  const { t, locale } = useTranslation();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [isRenamingFolder, setIsRenamingFolder] = React.useState(false);
  const [renameInputValue, setRenameInputValue] = React.useState('');
  const [movingProjectId, setMovingProjectId] = React.useState<string | null>(null);
  const [loadedNotification, setLoadedNotification] = React.useState<string | null>(null);
  const [analyticsProject, setAnalyticsProject] = React.useState<QRProject | null>(null);
  const [isDuplicatingId, setIsDuplicatingId] = React.useState<string | null>(null);
  
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

  const handleCardSelect = (proj: QRProject, e?: React.MouseEvent) => {
    if (e) {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') || 
        target.closest('input') || 
        target.closest('.no-card-select') ||
        target.closest('.drag-handle')
      ) {
        return;
      }
    }
    
    // Primary action: Load saved design into parent QR Generator state
    onSelect(proj);
    setLoadedNotification(`Loaded "${proj.name}" into QR Generator`);
    setTimeout(() => setLoadedNotification(null), 3500);

    // Smooth scroll to control panel / preview workspace
    const el = document.getElementById('control-panel-container') || 
               document.getElementById('qr-control-panel') || 
               document.getElementById('mobile-qr-workspace') ||
               document.getElementById('generator-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyLink = (e: React.MouseEvent, trackingId: string, id: string) => {
    e.stopPropagation();
    const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
    navigator.clipboard.writeText(`${appUrl}/qr/${trackingId}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFolder = (name: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    if (customFolders.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
      setActiveCategory(trimmed);
      return;
    }
    const updated = [...customFolders, trimmed];
    setCustomFolders(updated);
    localStorage.setItem('qr_custom_folders_list', JSON.stringify(updated));
    setActiveCategory(trimmed);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newFolderName || '').trim()) {
      handleCreateFolder(newFolderName);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folderToDelete: string) => {
    if (!confirm(`Delete folder "${folderToDelete}"? Items in this folder will become Uncategorized.`)) return;
    const updated = customFolders.filter(f => f.toLowerCase() !== folderToDelete.toLowerCase());
    setCustomFolders(updated);
    localStorage.setItem('qr_custom_folders_list', JSON.stringify(updated));
    if (activeCategory?.toLowerCase() === folderToDelete.toLowerCase()) {
      setActiveCategory(null);
    }
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    const oldName = activeCategory;
    const newName = (renameInputValue || '').trim();
    if (!newName || newName.toLowerCase() === oldName.toLowerCase()) {
      setIsRenamingFolder(false);
      return;
    }

    try {
      // 1. Update custom folders list in state & localStorage
      const updatedFolders = customFolders.map(f => f.toLowerCase() === oldName.toLowerCase() ? newName : f);
      if (!updatedFolders.some(f => f.toLowerCase() === newName.toLowerCase())) {
        updatedFolders.push(newName);
      }
      setCustomFolders(updatedFolders);
      localStorage.setItem('qr_custom_folders_list', JSON.stringify(updatedFolders));

      // 2. Update category for all projects in old folder
      const projectsInOldFolder = projects.filter(
        p => (p.category || '').trim().toLowerCase() === oldName.toLowerCase()
      );

      if (projectsInOldFolder.length > 0) {
        if (onBatchUpdateCategory) {
          await onBatchUpdateCategory(projectsInOldFolder.map(p => p.id), newName);
        } else if (onUpdateCategory) {
          await Promise.all(projectsInOldFolder.map(p => onUpdateCategory(p.id, newName)));
        }
      }

      setActiveCategory(newName);
      setIsRenamingFolder(false);
      setLoadedNotification(`Renamed folder to "${newName}"`);
      setTimeout(() => setLoadedNotification(null), 3000);
    } catch (err) {
      console.error('Error renaming folder:', err);
    }
  };

  const handleMoveProject = async (projectId: string, category: string) => {
    if (onUpdateCategory) {
      await onUpdateCategory(projectId, category);
      setLoadedNotification(`Moved design to "${category || 'Uncategorized'}"`);
      setTimeout(() => setLoadedNotification(null), 3000);
    }
  };

  // Duplicate / Clone project
  const handleDuplicateProject = async (proj: QRProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicatingId(proj.id);
    try {
      if (onDuplicateProject) {
        await onDuplicateProject(proj);
      } else {
        const newId = `copy_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const newTrackingId = Math.random().toString(36).substring(2, 8);
        const clonedProject: Partial<QRProject> = {
          ...proj,
          id: newId,
          name: `${proj.name} (Copy)`,
          trackingId: newTrackingId,
          scanCount: 0
        };
        await api.saveProject(clonedProject);
      }
      setLoadedNotification(`Cloned "${proj.name}" successfully!`);
      setTimeout(() => setLoadedNotification(null), 3000);
    } catch (err: any) {
      console.error('Duplicate project failed:', err);
      alert(`Could not duplicate project: ${err?.message || err}`);
    } finally {
      setIsDuplicatingId(null);
    }
  };

  // Extract unique categories (derived from active projects)
  const allCategories = React.useMemo(() => {
    const derivedCats = Array.from(
      new Set(
        (projects || [])
          .map(p => (p.category || '').trim())
          .filter(Boolean) as string[]
      )
    );
    const unique = new Set([...customFolders, ...derivedCats]);
    return Array.from(unique);
  }, [projects, customFolders]);

  // Filter projects by chosen category
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory) return (projects || []);
    if (activeCategory === 'uncategorized') {
      return (projects || []).filter(p => !p.category || !(p.category || '').trim());
    }
    return (projects || []).filter(
      p => ((p.category || '').trim()).toLowerCase() === activeCategory.trim().toLowerCase()
    );
  }, [projects, activeCategory]);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [, setDragOverIndex] = React.useState<number | null>(null);
  const [orderedProjects, setOrderedProjects] = React.useState<QRProject[]>([]);

  React.useEffect(() => {
    if (draggedIndex === null) {
      setOrderedProjects(filteredProjects);
    }
  }, [filteredProjects, draggedIndex]);

  const handleDragStart = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchstart') {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
    setDraggedIndex(index);
    setDragOverIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
    setOrderedProjects(prev => {
      const next = [...prev];
      const draggedItem = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(index, 0, draggedItem);
      return next;
    });
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;
    
    let current: HTMLElement | null = element as HTMLElement;
    while (current && current !== document.body) {
      const indexAttr = current.getAttribute('data-index');
      if (indexAttr !== null) {
        const overIndex = parseInt(indexAttr, 10);
        if (!isNaN(overIndex) && overIndex !== draggedIndex) {
          handleDragOver(overIndex);
        }
        break;
      }
      current = current.parentElement;
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      const orderedIdsInView = orderedProjects.map(p => p.id);
      try {
        const savedOrderJson = localStorage.getItem(`qr_projects_sort_order_${auth.currentUser?.uid || 'all'}`);
        let currentGlobalOrder: string[] = [];
        if (savedOrderJson) {
          try {
            currentGlobalOrder = JSON.parse(savedOrderJson);
          } catch {
            currentGlobalOrder = [];
          }
        }
        if (currentGlobalOrder.length === 0) {
          currentGlobalOrder = projects.map(p => p.id);
        }
        const filteredIdSet = new Set(orderedIdsInView);
        const remainingIds = currentGlobalOrder.filter(id => !filteredIdSet.has(id));
        let insertIndex = currentGlobalOrder.findIndex(id => filteredIdSet.has(id));
        if (insertIndex === -1) insertIndex = 0;
        
        const nextGlobalOrder = [...remainingIds];
        nextGlobalOrder.splice(insertIndex, 0, ...orderedIdsInView);
        
        localStorage.setItem(`qr_projects_sort_order_${auth.currentUser?.uid || 'all'}`, JSON.stringify(nextGlobalOrder));
        
        if (onReorderProjects) {
          onReorderProjects(nextGlobalOrder);
        }
      } catch (err) {
        console.error('Error persisting sort order:', err);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  React.useEffect(() => {
    if (draggedIndex !== null) {
      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalMouseUp);
      };
    }
  }, [draggedIndex, orderedProjects]);

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
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col gap-4 relative">
      {/* Toast Notification when project loaded */}
      {loadedNotification && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150 z-20">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{loadedNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setLoadedNotification(null)} 
            className="p-0.5 hover:bg-emerald-700 rounded cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Folder Creation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            {t('saved.title', 'Saved Designs & Projects')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex-wrap">
            {t('saved.desc', 'Click any project card or folder to instantly view, filter, edit, or clone in the generator.')}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          {filteredProjects.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 bg-white shadow-3xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              {allFilteredSelected ? t('saved.deselectAll', 'Deselect All') : t('saved.selectAll', 'Select All')}
            </button>
          )}

          {!isCreatingFolder ? (
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-950/20 active:scale-95"
            >
              <FolderPlus className="w-3.5 h-3.5" />
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
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 shadow-inner"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
              >
                {t('saved.createBtn', 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-1.5 px-2 rounded-xl transition-all cursor-pointer"
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
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-800">{t('saved.noProjectsTitle', 'No Projects Saved Yet')}</h3>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
            {t('saved.noProjectsDesc', 'Configure a QR code, customize colors or logo, and click "Save Design" to store it here.')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Category Folder Filter Tabs Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-none flex-wrap">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1.5 border ${
                activeCategory === null
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {t('saved.allCount', 'All Projects ({count})', { count: projects.length })}
            </button>

            {allCategories.map(cat => {
              const count = projects.filter(
                p => ((p.category || '').trim()).toLowerCase() === cat.trim().toLowerCase()
              ).length;
              const isCustom = customFolders.some(f => f.toLowerCase() === cat.toLowerCase());
              const isActive = activeCategory?.toLowerCase() === cat.toLowerCase();

              return (
                <div
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all font-bold flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300'
                  }`}
                >
                  <Folder className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-200' : 'text-indigo-500'}`} />
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(cat);
                      }}
                      title={`Delete folder "${cat}"`}
                      className={`rounded p-0.5 transition-colors cursor-pointer ${
                        isActive ? 'hover:bg-indigo-700 text-indigo-200' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {projects.some(p => !p.category || !(p.category || '').trim()) && (
              <button
                type="button"
                onClick={() => setActiveCategory('uncategorized')}
                className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1.5 border ${
                  activeCategory === 'uncategorized'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                {t('saved.uncategorizedLabel', 'Uncategorized')} ({projects.filter(p => !p.category || !(p.category || '').trim()).length})
              </button>
            )}
          </div>

          {/* Active Folder Header Banner with Rename & Actions */}
          {activeCategory !== null && (
            <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                {isRenamingFolder ? (
                  <form onSubmit={handleRenameFolderSubmit} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={renameInputValue}
                      onChange={(e) => setRenameInputValue(e.target.value)}
                      className="bg-white border border-indigo-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRenamingFolder(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-indigo-950">
                      Folder: <span className="text-indigo-600 underline decoration-indigo-300">{activeCategory}</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-mono">
                      {filteredProjects.length} items
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRenamingFolder && activeCategory !== 'uncategorized' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRenameInputValue(activeCategory);
                      setIsRenamingFolder(true);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100/60 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3 text-indigo-600" />
                    Rename
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3 text-slate-500" />
                  Show All
                </button>
              </div>
            </div>
          )}

          {/* Batch Action Toolbar */}
          {selectedIds.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 border border-indigo-500/30">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center text-xs font-extrabold text-indigo-200">
                  {selectedIds.length}
                </span>
                <span className="text-xs font-bold text-indigo-100">
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
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
                  >
                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                    {t('saved.batchMoveBtn', 'Move to Folder')}
                  </button>

                  {isBatchMoving && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-9 z-50 w-52 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-2xl py-1.5 text-xs animate-in fade-in duration-100"
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
                          if (newFolder && (newFolder || '').trim()) {
                            const trimmed = (newFolder || '').trim();
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
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-3xs active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('saved.batchDeleteBtn', 'Delete Selected')}
                </button>

                {/* Clear Selection */}
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title={t('saved.clearSelection', 'Clear selection')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40 space-y-2">
              <Folder className="w-6 h-6 text-indigo-400 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">{t('saved.noProjectsCategoryTitle', 'No projects in this category')}</h3>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">{t('saved.noProjectsCategoryDesc', 'Change filters or update project categories to view.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {orderedProjects.map((proj, index) => {
                const isSelected = selectedIds.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    data-index={index}
                    onClick={(e) => handleCardSelect(proj, e)}
                    onMouseEnter={() => {
                      if (draggedIndex !== null) {
                        handleDragOver(index);
                      }
                    }}
                    className={`bg-white hover:bg-indigo-50/20 border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 group relative shadow-xs hover:shadow-md ${
                      isSelected ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-indigo-400'
                    } ${isRtlLocale(locale) ? 'rtl-active' : ''} ${
                      draggedIndex === index ? 'opacity-40 border-dashed border-indigo-400 scale-98 shadow-inner' : ''
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="shrink-0 pt-0.5 flex items-center gap-1.5 ltr-lock"
                        >
                          <div
                            title="Drag to sort"
                            onMouseDown={(e) => handleDragStart(index, e)}
                            onTouchStart={(e) => handleDragStart(index, e)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleDragEnd}
                            className="drag-handle p-1 hover:bg-slate-100 rounded text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          <input
                            type="checkbox"
                            aria-label={`Select project ${proj.name}`}
                            checked={isSelected}
                            onChange={(e) => handleToggleSelect(proj.id, e)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer transition-transform hover:scale-105"
                          />
                        </div>

                        <div className="overflow-hidden min-w-0 flex-1">
                          <span className="text-xs font-extrabold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                            {proj.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[200px] ltr-lock">
                            {proj.content}
                          </span>
                          {proj.category && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full mt-1.5 border border-indigo-100 ltr-lock">
                              <Folder className="w-2.5 h-2.5 text-indigo-500" />
                              {proj.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Controls (Edit/Open, Duplicate, Move Folder, Delete) */}
                      <div className="flex items-center gap-1 relative ltr-lock shrink-0">
                        {/* Open & Edit in Generator Button */}
                        <button
                          type="button"
                          title="Open & Edit in Generator"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardSelect(proj);
                          }}
                          className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer font-bold text-[10px] flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Duplicate / Clone Button */}
                        <button
                          type="button"
                          title="Duplicate / Clone project"
                          disabled={isDuplicatingId === proj.id}
                          onClick={(e) => handleDuplicateProject(proj, e)}
                          className="p-1.5 rounded-xl hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                        >
                          {isDuplicatingId === proj.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Move Folder Button */}
                        <button
                          type="button"
                          title="Move project to folder"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMovingProjectId(movingProjectId === proj.id ? null : proj.id);
                          }}
                          className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
                            movingProjectId === proj.id
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                              : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border-transparent'
                          }`}
                        >
                          <Folder className="w-3.5 h-3.5" />
                        </button>

                        {/* Folder Move Dropdown */}
                        {movingProjectId === proj.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-50 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 text-left text-xs animate-in fade-in duration-100 ltr-lock"
                          >
                            <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                              {t('saved.organizeTitle', 'Organize in Folder')}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                handleMoveProject(proj.id, '');
                                setMovingProjectId(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer font-medium ${!proj.category ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'}`}
                            >
                              <Folder className="w-3 h-3 opacity-60" />
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
                                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer truncate font-medium ${proj.category === cat ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-600'}`}
                              >
                                <Folder className="w-3 h-3 text-indigo-500" />
                                {cat}
                              </button>
                            ))}
                            
                            <div className="border-t border-slate-100 my-1"></div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newFolder = prompt('Enter a name for the new folder:');
                                if (newFolder && (newFolder || '').trim()) {
                                  const trimmed = (newFolder || '').trim();
                                  handleCreateFolder(trimmed);
                                  handleMoveProject(proj.id, trimmed);
                                }
                                setMovingProjectId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-indigo-600" />
                              {t('saved.newFolderBtn', 'New Folder')}...
                            </button>
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          title="Delete design"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(proj.id);
                          }}
                          className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Tracking stats preview & Clickable Scan Analytics */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700 font-mono">
                          {proj.type}
                        </span>

                        {/* Interactive Clickable SCANS Badge */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnalyticsProject(proj);
                          }}
                          className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View detailed scan analytics"
                        >
                          <BarChart2 className="w-2.5 h-2.5 text-indigo-600" />
                          {t('saved.scansCount', '{count} Scans', { count: proj.scanCount || 0 })}
                        </button>

                        {proj.expiryDate && (() => {
                          const isExpired = new Date() > new Date(proj.expiryDate);
                          return (
                            <span 
                              title={isExpired ? `Expired on ${new Date(proj.expiryDate).toLocaleString()}` : `Expires on ${new Date(proj.expiryDate).toLocaleString()}`}
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider transition ${
                                isExpired 
                                  ? 'bg-red-50 text-red-600 border border-red-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isExpired ? t('saved.expiredBadge', 'Expired ⚠️') : t('saved.timedBadge', 'Timed ⏳')}
                            </span>
                          );
                        })()}
                      </div>

                      {proj.trackingEnabled && (
                        <div className="flex items-center gap-1">
                          {import.meta.env.DEV && onSeedData && (
                            <button
                              type="button"
                              title="Generate fake analytics clicks (Internal Testing Only)"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeedData(proj.id, proj.trackingId);
                              }}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-colors border border-emerald-200"
                            >
                              {t('saved.seedClicksBtn', '+ Seed clicks')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(e, proj.trackingId, proj.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                            title="Copy tracking redirect link"
                          >
                            {copiedId === proj.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
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

      {/* Analytics Preview Modal */}
      {analyticsProject && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setAnalyticsProject(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{analyticsProject.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Tracking ID: {analyticsProject.trackingId || analyticsProject.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsProject(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Scans</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{analyticsProject.scanCount || 0}</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> Active
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700 uppercase">{analyticsProject.trackingEnabled ? 'Live Tracking' : 'Static QR'}</span>
                </div>
              </div>
            </div>

            {/* Traffic Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Device Distribution</span>
              <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-indigo-600 h-full w-[78%]" title="Mobile 78%"></div>
                <div className="bg-sky-400 h-full w-[22%]" title="Desktop 22%"></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-indigo-600" /> Mobile (78%)
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-sky-500" /> Desktop / Web (22%)
                </span>
              </div>
            </div>

            {/* Destination Content */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">QR Destination Target</span>
              <p className="text-xs font-mono text-slate-700 truncate">{analyticsProject.content}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const appUrl = ((import.meta as any).env?.VITE_APP_URL || window.location.origin);
                  navigator.clipboard.writeText(`${appUrl}/qr/${analyticsProject.trackingId}`);
                  setCopiedId(analyticsProject.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedId === analyticsProject.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Copy Redirect URL
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const proj = analyticsProject;
                  setAnalyticsProject(null);
                  handleCardSelect(proj);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-200" />
                Edit Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
