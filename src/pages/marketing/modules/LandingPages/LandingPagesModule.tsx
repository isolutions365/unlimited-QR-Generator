import React, { useState, useEffect, useMemo } from 'react';
import { buildProductionUrl } from '../../../../config/siteConfig';
import { 
  Smartphone, Plus, Search, Edit2, Link2, Eye, Layout, Trash2, 
  Save, Globe, Copy, ArrowUp, ArrowDown, GripVertical, Settings, 
  Palette, ShieldAlert, Zap, Sliders, CheckCircle, Clock, 
  Download, Grid, MapPin, Mail, Play, MousePointer, Share2, FileText,
  Smartphone as PhoneIcon, Monitor, Check, Calendar, Inbox, ChevronRight,
  Filter, RotateCcw, RefreshCcw
} from 'lucide-react';

import { db, auth } from '../../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, doc, setDoc, deleteDoc, getDocs, query, where, 
  onSnapshot, addDoc, serverTimestamp, increment 
} from 'firebase/firestore';

import { 
  ThemePreset, PageComponent, LandingPageConfig, 
  FormSubmission, ContactFormField, SocialLinkItem 
} from './types';
import { THEME_PRESETS, COMPONENT_PALETTE, createDefaultComponent, DEFAULT_STARTER_PAGES } from './constants';
import LandingPagePreview from './LandingPagePreview';

export default function LandingPagesModule() {
  // Authentication & Loading States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Landing Pages State
  const [pages, setPages] = useState<LandingPageConfig[]>([]);
  const [activePageId, setActivePageId] = useState<string>('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Form Submissions State
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmissionFilter, setSelectedSubmissionFilter] = useState<string>('all');

  // UI Navigation Tabs
  const [activeSidebarTab, setActiveSidebarTab] = useState<'components' | 'themes' | 'seo' | 'submissions'>('components');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Fetch / Sync Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Sync Landing Pages & Submissions from Firebase (or LocalStorage Fallback)
  useEffect(() => {
    if (!authChecked) return;

    if (currentUser) {
      // 1. Listen for Firestore landing pages belonging to current user
      const qPages = query(collection(db, 'landingPages'), where('userId', '==', currentUser.uid));
      const unsubPages = onSnapshot(qPages, (snapshot) => {
        const fetchedPages: LandingPageConfig[] = [];
        snapshot.forEach((doc) => {
          fetchedPages.push({ id: doc.id, ...doc.data() } as LandingPageConfig);
        });

        if (fetchedPages.length === 0) {
          // Provision default starter pages in Firestore for a rich experience
          const defaults = DEFAULT_STARTER_PAGES().map(p => ({ ...p, userId: currentUser.uid }));
          defaults.forEach(async (p) => {
            await setDoc(doc(db, 'landingPages', p.id), p);
          });
          setPages(defaults);
          setActivePageId(defaults[0].id);
        } else {
          setPages(fetchedPages);
          // Auto-select first page if none is active
          if (!activePageId || !fetchedPages.some(p => p.id === activePageId)) {
            setActivePageId(fetchedPages[0].id);
          }
        }
        setLoading(false);
      }, (err) => {
        console.error('Firestore landing pages subscription error:', err);
        setLoading(false);
      });

      // 2. Listen for Firestore submissions belonging to the current user's landing pages
      const qSubs = query(collection(db, 'submissions'), where('userId', '==', currentUser.uid));
      const unsubSubs = onSnapshot(qSubs, (snapshot) => {
        const fetchedSubs: FormSubmission[] = [];
        snapshot.forEach((doc) => {
          fetchedSubs.push({ id: doc.id, ...doc.data() } as FormSubmission);
        });
        setSubmissions(fetchedSubs.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
      }, (err) => {
        console.warn('Firestore submissions subscription note:', err);
      });

      return () => {
        unsubPages();
        unsubSubs();
      };
    } else {
      // Guest Fallback Mode - Load from LocalStorage
      const localPagesRaw = localStorage.getItem('guest_landing_pages');
      if (localPagesRaw) {
        try {
          const parsed = JSON.parse(localPagesRaw);
          setPages(parsed);
          if (parsed.length > 0) setActivePageId(parsed[0].id);
        } catch {
          setPages(DEFAULT_STARTER_PAGES());
          setActivePageId(DEFAULT_STARTER_PAGES()[0].id);
        }
      } else {
        const defaults = DEFAULT_STARTER_PAGES();
        setPages(defaults);
        setActivePageId(defaults[0].id);
        localStorage.setItem('guest_landing_pages', JSON.stringify(defaults));
      }

      // Guest Form Submissions Fallback
      const localSubsRaw = localStorage.getItem('guest_form_submissions');
      if (localSubsRaw) {
        try {
          setSubmissions(JSON.parse(localSubsRaw));
        } catch {
          setSubmissions([]);
        }
      }
      setLoading(false);
    }
  }, [currentUser, authChecked]);

  useEffect(() => {
    const handleUpdate = () => {
      if (!currentUser) {
        const localPagesRaw = localStorage.getItem('guest_landing_pages');
        if (localPagesRaw) {
          try {
            const parsed = JSON.parse(localPagesRaw);
            setPages(parsed);
            if (parsed.length > 0 && (!activePageId || !parsed.some((p: any) => p.id === activePageId))) {
              setActivePageId(parsed[0].id);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    window.addEventListener('qr-marketing-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-marketing-data-updated', handleUpdate);
    };
  }, [currentUser, activePageId]);

  // Active page model helper
  const activePage = useMemo(() => {
    return pages.find((p) => p.id === activePageId) || null;
  }, [pages, activePageId]);

  // Selected Component Helper
  const selectedComponent = useMemo(() => {
    if (!activePage || !selectedComponentId) return null;
    return activePage.components.find((c) => c.id === selectedComponentId) || null;
  }, [activePage, selectedComponentId]);

  // Perform Page saving (auto-saves on changes or triggered on action)
  const savePageData = async (updatedPage: LandingPageConfig) => {
    setSaveStatus('saving');
    try {
      if (currentUser) {
        // Real cloud save
        await setDoc(doc(db, 'landingPages', updatedPage.id), {
          ...updatedPage,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // Local state save
        const newPages = pages.map((p) => p.id === updatedPage.id ? updatedPage : p);
        localStorage.setItem('guest_landing_pages', JSON.stringify(newPages));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Save landing page failed:', err);
      setSaveStatus('error');
    }
  };

  // CREATE NEW PAGE
  const handleCreateNewPage = () => {
    const slugSuffix = Math.random().toString(36).substring(2, 6);
    const newPage: LandingPageConfig = {
      id: `page-${Date.now()}`,
      title: 'New Drag & Drop Mobile Page',
      slug: `promo-page-${slugSuffix}`,
      userId: currentUser?.uid || 'guest-user',
      theme: THEME_PRESETS.minimal,
      seo: {
        metaTitle: 'Brand New Launch Offer',
        metaDescription: 'Claim customized vouchers and explore video guides.',
        keywords: 'mobile landing page, promotion, drag and drop builder',
        shareImage: ''
      },
      visits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [
        {
          id: `comp-h-${Date.now()}`,
          type: 'hero',
          title: 'Brand Launch Showcase',
          subtitle: 'Welcome! This is your custom-designed mobile coupon canvas. Click elements or drag new widgets from the sidebar to edit them.',
          ctaText: 'Visit Official Shop',
          ctaLink: '#',
          bgType: 'gradient',
          bgColor: '#0f172a',
          bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          bgImageUrl: '',
          textColor: '#ffffff',
          align: 'center'
        }
      ]
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    setActivePageId(newPage.id);
    setSelectedComponentId(newPage.components[0].id);

    if (currentUser) {
      setDoc(doc(db, 'landingPages', newPage.id), newPage);
    } else {
      localStorage.setItem('guest_landing_pages', JSON.stringify(updatedPages));
    }
  };

  // DELETE ACTIVE PAGE
  const handleDeletePage = async (pageId: string) => {
    if (pages.length <= 1) {
      alert('You must maintain at least one landing page configuration.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this landing page? This will also wipe its analytics data.');
    if (!confirmed) return;

    const remainingPages = pages.filter((p) => p.id !== pageId);
    setPages(remainingPages);
    setActivePageId(remainingPages[0].id);

    try {
      if (currentUser) {
        await deleteDoc(doc(db, 'landingPages', pageId));
      } else {
        localStorage.setItem('guest_landing_pages', JSON.stringify(remainingPages));
      }
    } catch (err) {
      console.error('Failed to delete landing page:', err);
    }
  };

  // UPDATE ACTIVE PAGE FIELD HELPERS
  const handlePageTitleOrSlugChange = (field: 'title' | 'slug', val: string) => {
    if (!activePage) return;
    const cleanVal = field === 'slug' ? val.toLowerCase().replace(/[^a-z0-9-_]/g, '') : val;
    const updated = { ...activePage, [field]: cleanVal };
    
    // Update local list first for instant rendering
    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // UPDATE GLOBAL PRESET THEME
  const handleThemePresetSelect = (presetKey: string) => {
    if (!activePage) return;
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;

    const updated = {
      ...activePage,
      theme: { ...preset }
    };

    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // UPDATE CUSTOM THEME PROPERTY
  const handleCustomThemeChange = (property: keyof ThemePreset, val: string) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      theme: {
        ...activePage.theme,
        [property]: val,
        name: property === 'name' ? val : 'Custom Design'
      }
    };

    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // UPDATE SEO SETTINGS
  const handleSEOChange = (key: string, val: string) => {
    if (!activePage) return;
    const updated = {
      ...activePage,
      seo: {
        ...activePage.seo,
        [key]: val
      }
    };

    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // ================= DRAG & DROP DESIGN CORE =================

  // Left Library Drag Start Handler
  const handleLibraryDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('source', 'library');
    e.dataTransfer.setData('componentType', type);
  };

  // Canvas Drag Start (for re-ordering existing components)
  const handleCanvasDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('source', 'canvas');
    e.dataTransfer.setData('componentIndex', index.toString());
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCanvasDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!activePage) return;

    const source = e.dataTransfer.getData('source');

    if (source === 'library') {
      // Adding a brand new element
      const type = e.dataTransfer.getData('componentType');
      const newId = `comp-${type}-${Date.now()}`;
      const newComp = createDefaultComponent(type, newId);

      const updatedComponents = [...activePage.components];
      updatedComponents.splice(targetIndex, 0, newComp);

      const updated = { ...activePage, components: updatedComponents };
      setPages(pages.map((p) => p.id === activePage.id ? updated : p));
      setSelectedComponentId(newId);
      savePageData(updated);

    } else if (source === 'canvas') {
      // Re-ordering existing elements
      const sourceIndex = parseInt(e.dataTransfer.getData('componentIndex'), 10);
      if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

      const updatedComponents = [...activePage.components];
      const [movedComp] = updatedComponents.splice(sourceIndex, 1);
      updatedComponents.splice(targetIndex, 0, movedComp);

      const updated = { ...activePage, components: updatedComponents };
      setPages(pages.map((p) => p.id === activePage.id ? updated : p));
      savePageData(updated);
    }
  };

  // CLICK TO INSERT (Fallback or convenience option)
  const handleAddComponentByClick = (type: string) => {
    if (!activePage) return;
    const newId = `comp-${type}-${Date.now()}`;
    const newComp = createDefaultComponent(type, newId);

    const updated = {
      ...activePage,
      components: [...activePage.components, newComp]
    };

    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    setSelectedComponentId(newId);
    savePageData(updated);
  };

  // UPDATE SPECIFIC COMPONENT PROPERTIES
  const handleComponentPropChange = (compId: string, updatedProps: Partial<PageComponent>) => {
    if (!activePage) return;
    
    const updatedComponents = activePage.components.map((c) => {
      if (c.id === compId) {
        return { ...c, ...updatedProps } as PageComponent;
      }
      return c;
    });

    const updated = { ...activePage, components: updatedComponents };
    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // DELETE COMPONENT BLOCK
  const handleDeleteComponent = (compId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activePage) return;

    const updatedComponents = activePage.components.filter((c) => c.id !== compId);
    const updated = { ...activePage, components: updatedComponents };

    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    if (selectedComponentId === compId) setSelectedComponentId(null);
    savePageData(updated);
  };

  // REORDER VIA ARROWS (Alternative for pure clicks)
  const handleMoveComponent = (index: number, direction: 'up' | 'down') => {
    if (!activePage) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activePage.components.length) return;

    const updatedComponents = [...activePage.components];
    const temp = updatedComponents[index];
    updatedComponents[index] = updatedComponents[targetIndex];
    updatedComponents[targetIndex] = temp;

    const updated = { ...activePage, components: updatedComponents };
    setPages(pages.map((p) => p.id === activePage.id ? updated : p));
    savePageData(updated);
  };

  // SUBMIT VISITOR FORM (Logs lead into Firebase/LocalStorage)
  const handlePreviewFormSubmit = async (formData: Record<string, string>) => {
    if (!activePage) return;

    const newSub: FormSubmission = {
      id: `sub-${Date.now()}`,
      pageId: activePage.id,
      pageTitle: activePage.title,
      timestamp: new Date().toISOString(),
      formData,
      userId: activePage.userId
    };

    if (currentUser) {
      // Save to Firebase submissions collection
      await addDoc(collection(db, 'submissions'), newSub);
      // Increment Firestore page visits or submission tally as a nice metric
      await setDoc(doc(db, 'landingPages', activePage.id), { visits: increment(1) }, { merge: true });
    } else {
      // Save to local list
      const updatedSubs = [newSub, ...submissions];
      setSubmissions(updatedSubs);
      localStorage.setItem('guest_form_submissions', JSON.stringify(updatedSubs));
    }
  };

  // HELPERS
  const getIcon = (name: string) => {
    switch (name) {
      case 'Layout': return <Layout className="w-4 h-4 text-indigo-500" />;
      case 'Image': return <Grid className="w-4 h-4 text-emerald-500" />;
      case 'Video': return <Play className="w-4 h-4 text-red-500" />;
      case 'MousePointer': return <MousePointer className="w-4 h-4 text-blue-500" />;
      case 'Share2': return <Share2 className="w-4 h-4 text-amber-500" />;
      case 'MapPin': return <MapPin className="w-4 h-4 text-cyan-500" />;
      case 'Grid': return <Grid className="w-4 h-4 text-purple-500" />;
      case 'FileText': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'Mail': return <Mail className="w-4 h-4 text-teal-500" />;
      case 'Clock': return <Clock className="w-4 h-4 text-violet-500" />;
      default: return <Sliders className="w-4 h-4 text-slate-500" />;
    }
  };

  // Copy link to clipboard
  const handleCopyLink = (slug: string) => {
    const fullLink = buildProductionUrl(`/p/${slug}`);
    navigator.clipboard.writeText(fullLink).catch(() => {});
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Filtered Submissions list for leads tab
  const filteredSubmissions = useMemo(() => {
    if (selectedSubmissionFilter === 'all') return submissions;
    return submissions.filter(s => s.pageId === selectedSubmissionFilter);
  }, [submissions, selectedSubmissionFilter]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase animate-pulse">Initializing Landing Page Builder...</p>
      </div>
    );
  }

  return (
    <div id="landing-pages-builder-container" className="space-y-6">
      
      {/* HEADER CONTROLS BAR */}
      <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-0.5">
            <h1 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Landing Page Builder
            </h1>
            <p className="text-[11px] text-slate-500">Design touch-friendly mobile campaign grids. Drag widgets, alter variables, and sync live leads.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 ml-2">
            <select 
              value={activePageId} 
              onChange={(e) => {
                setActivePageId(e.target.value);
                setSelectedComponentId(null);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-6 cursor-pointer"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <button 
              onClick={handleCreateNewPage}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-indigo-600 transition-colors cursor-pointer"
              title="Create New Page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activePage && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mr-2">
              <span className={`w-2.5 h-2.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {saveStatus === 'saving' ? 'Saving Cloud...' : saveStatus === 'saved' ? 'Synced to Firebase' : currentUser ? 'Cloud Synced' : 'Guest Mode (LocalStorage)'}
              </span>
            </div>

            <button 
              onClick={() => setIsSandboxMode(!isSandboxMode)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                isSandboxMode 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {isSandboxMode ? 'Exit Simulator' : 'Standalone Preview'}
            </button>

            <button 
              onClick={() => handleCopyLink(activePage.slug)}
              className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-150 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" />
              {copiedSlug === activePage.slug ? 'Copied Link!' : 'Copy Slug'}
            </button>

            <button 
              onClick={() => handleDeletePage(activePage.id)}
              className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-1 cursor-pointer transition-colors"
              title="Delete page configuration"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {activePage && (
        <>
          {/* SANDBOX STANDALONE PREVIEW OVERLAY */}
          {isSandboxMode ? (
            <div className="bg-slate-900 border border-slate-950 p-6 rounded-3xl shadow-lg relative animate-scale-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-widest">
                    Standalone Sandbox View: {activePage.title} (Slug: /{activePage.slug})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${previewDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${previewDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsSandboxMode(false)}
                    className="py-1 px-2.5 bg-red-650 hover:bg-red-700 rounded text-[10px] font-bold text-white uppercase"
                  >
                    Close Simulator
                  </button>
                </div>
              </div>

              {/* Device Frames */}
              <div className="flex items-center justify-center min-h-[500px]">
                {previewDevice === 'mobile' ? (
                  <div className="w-[360px] h-[640px] border-[12px] border-slate-950 rounded-[40px] shadow-2xl bg-white overflow-hidden relative flex flex-col justify-between">
                    <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 z-20 flex items-center justify-center">
                      <div className="w-20 h-4 bg-black rounded-b-xl" />
                    </div>
                    <div className="flex-1 overflow-y-auto pt-6 scrollbar-thin">
                      <LandingPagePreview config={activePage} onFormSubmit={handlePreviewFormSubmit} />
                    </div>
                    <div className="h-4 bg-slate-950 flex items-center justify-center">
                      <div className="w-24 h-1 bg-white/50 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl h-[600px] border-4 border-slate-950 rounded-2xl shadow-2xl bg-white overflow-hidden relative flex flex-col">
                    <div className="h-6 bg-slate-950 text-[10px] text-slate-400 px-4 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                      <span>https://qrf.gs/p/{activePage.slug}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                      <LandingPagePreview config={activePage} onFormSubmit={handlePreviewFormSubmit} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* BUILDER SPLIT SCREEN INTERFACE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: PALETTE & LIB */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-3xs">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Component Library</h3>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">10 Blocks</span>
                  </div>

                  <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto scrollbar-thin">
                    <p className="text-[10px] text-slate-400 font-semibold mb-3">Drag a block onto the simulator canvas drop zones, or simply click to append to the end.</p>
                    
                    {COMPONENT_PALETTE.map((item) => (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleLibraryDragStart(e, item.type)}
                        onClick={() => handleAddComponentByClick(item.type)}
                        className="p-3 bg-white border border-slate-100 hover:border-indigo-150 hover:shadow-2xs rounded-xl flex items-start gap-3 transition-all cursor-grab active:cursor-grabbing group select-none"
                      >
                        <div className="p-2 bg-slate-50 group-hover:bg-indigo-50 rounded-lg shrink-0 transition-colors">
                          {getIcon(item.iconName)}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.label}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: LIVE SIMULATOR CANVAS */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm border-[10px] border-slate-900 rounded-[38px] shadow-lg bg-white overflow-hidden relative min-h-[580px] flex flex-col">
                  {/* Smartphone top bar mock */}
                  <div className="h-6 bg-slate-900 flex items-center justify-center relative z-20 shrink-0">
                    <div className="w-16 h-4 bg-black rounded-b-xl" />
                  </div>

                  {/* Interactive builder wrapper */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin select-none"
                    style={{ 
                      background: activePage.theme.bgGradient || activePage.theme.bgColor,
                      color: activePage.theme.textColor
                    }}
                  >
                    {/* Top Canvas Drop zone */}
                    <div 
                      onDragOver={handleCanvasDragOver}
                      onDrop={(e) => handleCanvasDrop(e, 0)}
                      className="h-3 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50/50 flex items-center justify-center text-[8px] font-bold text-indigo-500 hover:h-8 transition-all"
                    >
                      <span>Drop component here</span>
                    </div>

                    {activePage.components.length === 0 ? (
                      <div className="text-center py-20 bg-white/60 rounded-2xl p-6 border-2 border-dashed border-slate-300">
                        <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Canvas is empty</p>
                        <p className="text-[9px] text-slate-400 mt-1">Drag blocks from the library to design</p>
                      </div>
                    ) : (
                      activePage.components.map((comp, idx) => {
                        const isSelected = comp.id === selectedComponentId;
                        return (
                          <div
                            key={comp.id}
                            draggable
                            onDragStart={(e) => handleCanvasDragStart(e, idx)}
                            onDragOver={handleCanvasDragOver}
                            onDrop={(e) => handleCanvasDrop(e, idx + 1)}
                            onClick={() => setSelectedComponentId(comp.id)}
                            className={`relative group rounded-3xl transition-all ${
                              isSelected 
                                ? 'ring-2 ring-indigo-600 ring-offset-2 scale-101 shadow-md' 
                                : 'hover:ring-1 hover:ring-indigo-300'
                            }`}
                          >
                            {/* Visual builder overlay helper handles */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveComponent(idx, 'up'); }}
                                disabled={idx === 0}
                                className="p-1 bg-white hover:bg-slate-50 rounded text-slate-600 disabled:opacity-30 border border-slate-200"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveComponent(idx, 'down'); }}
                                disabled={idx === activePage.components.length - 1}
                                className="p-1 bg-white hover:bg-slate-50 rounded text-slate-600 disabled:opacity-30 border border-slate-200"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteComponent(comp.id, e)}
                                className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Render corresponding visual block */}
                            {comp.type === 'hero' && (
                              <div className="p-4 rounded-3xl bg-white/20 border border-white/10 pointer-events-none">
                                <h3 className="text-sm font-black leading-tight">{comp.title || 'Brand Headline'}</h3>
                                <p className="text-[10px] opacity-80 mt-1">{comp.subtitle}</p>
                              </div>
                            )}

                            {comp.type === 'image' && (
                              <div className="overflow-hidden border border-white/10 rounded-3xl shadow-3xs pointer-events-none">
                                <img src={comp.url} alt={comp.altText} className="w-full aspect-video object-cover" />
                                <span className="text-[9px] p-2 block bg-white/90 text-slate-600 text-center">{comp.caption || 'Image Frame'}</span>
                              </div>
                            )}

                            {comp.type === 'video' && (
                              <div className="bg-slate-900 aspect-video rounded-3xl flex flex-col items-center justify-center text-slate-400 p-4 border border-white/10 relative">
                                <Play className="w-6 h-6 text-red-600 mb-1" />
                                <span className="text-[9px] font-bold">Video Link Embed Player</span>
                              </div>
                            )}

                            {comp.type === 'button' && (
                              <div 
                                className="py-2 px-4 rounded-xl text-center text-[10px] font-black pointer-events-none uppercase tracking-wider"
                                style={{ backgroundColor: comp.color || '#4f46e5', color: comp.textColor || '#fff' }}
                              >
                                {comp.text || 'Action Button'}
                              </div>
                            )}

                            {comp.type === 'social' && (
                              <div className="flex justify-center gap-2 py-1">
                                {comp.links?.filter((l: any) => l.active).map((l: any, i: number) => (
                                  <span key={i} className="w-7 h-7 bg-slate-100 border border-slate-200 text-[8px] font-extrabold text-slate-700 uppercase flex items-center justify-center rounded-full">
                                    {l.platform.substring(0, 2)}
                                  </span>
                                ))}
                              </div>
                            )}

                            {comp.type === 'map' && (
                              <div className="bg-white rounded-3xl p-3 border border-slate-150 text-slate-800 space-y-1.5 pointer-events-none">
                                <span className="text-[10px] font-extrabold text-slate-900 block">{comp.markerTitle || 'Map Location'}</span>
                                <div className="h-16 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                                  <MapPin className="w-5 h-5 text-red-500" />
                                </div>
                              </div>
                            )}

                            {comp.type === 'gallery' && (
                              <div className="grid grid-cols-3 gap-1 pointer-events-none">
                                {comp.images?.map((img: string, i: number) => (
                                  <div key={i} className="aspect-square bg-slate-50 border border-white/10 rounded-xl overflow-hidden">
                                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {comp.type === 'pdf' && (
                              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between pointer-events-none text-slate-800">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                  <span className="text-[10px] font-extrabold text-slate-900 truncate max-w-[120px]">{comp.title || 'PDF Document'}</span>
                                </div>
                                <span className="text-[8px] font-bold uppercase py-0.5 px-2 bg-slate-100 text-slate-600 rounded">PDF</span>
                              </div>
                            )}

                            {comp.type === 'contactForm' && (
                              <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 text-slate-800 pointer-events-none">
                                <span className="text-[9px] font-extrabold text-slate-900 uppercase tracking-wider block text-center border-b pb-1 mb-1">{comp.title || 'Contact Form'}</span>
                                <div className="h-4 bg-slate-50 rounded border" />
                                <div className="h-4 bg-slate-50 rounded border" />
                              </div>
                            )}

                            {comp.type === 'countdown' && (
                              <div className="p-3 bg-slate-50 text-slate-800 rounded-2xl border text-center pointer-events-none space-y-1">
                                <span className="text-[8px] font-bold uppercase tracking-wider block text-slate-400">{comp.label || 'KICKOFF'}</span>
                                <span className="text-xs font-black font-mono">02d : 14h : 35m : 18s</span>
                              </div>
                            )}

                            {/* Drop index marker */}
                            <div 
                              onDragOver={handleCanvasDragOver}
                              onDrop={(e) => handleCanvasDrop(e, idx + 1)}
                              className="absolute inset-x-0 -bottom-2 h-2 z-15 hover:bg-indigo-200/50"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Smartphone bottom bar mock */}
                  <div className="h-4 bg-slate-900 flex items-center justify-center relative z-20 shrink-0">
                    <div className="w-20 h-1 bg-white/50 rounded-full" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: INSPECTOR & GLOBAL SETTINGS */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Tabs Selector */}
                <div className="bg-white border border-slate-150 p-1.5 rounded-2xl shadow-3xs flex items-center justify-between gap-1">
                  <button
                    onClick={() => setActiveSidebarTab('components')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${activeSidebarTab === 'components' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Block Specs
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('themes')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${activeSidebarTab === 'themes' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    Theme
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('seo')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${activeSidebarTab === 'seo' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    SEO
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('submissions')}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer transition-all ${activeSidebarTab === 'submissions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    Leads
                  </button>
                </div>

                {/* TAB 1: PROPERTIES INSPECTOR */}
                {activeSidebarTab === 'components' && (
                  <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Properties Inspector</h3>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">ID: {selectedComponentId ? 'Active' : 'Select Block'}</span>
                    </div>

                    {!selectedComponent ? (
                      <div className="text-center py-16 text-slate-400 space-y-2">
                        <Sliders className="w-8 h-8 text-slate-350 mx-auto animate-pulse" />
                        <h4 className="text-xs font-bold text-slate-600 uppercase">No Active Component</h4>
                        <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">Click any component frame in the simulator canvas to load its custom parameters.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fade-in max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                        <div className="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Type: {selectedComponent.type}</span>
                          <button
                            onClick={() => handleDeleteComponent(selectedComponent.id)}
                            className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>

                        {/* HERO FIELD CONTROLS */}
                        {selectedComponent.type === 'hero' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Headline Title</label>
                              <input 
                                type="text"
                                value={selectedComponent.title || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { title: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Subtitle Copy</label>
                              <textarea 
                                value={selectedComponent.subtitle || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { subtitle: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">CTA Button Label</label>
                                <input 
                                  type="text"
                                  value={selectedComponent.ctaText || ''}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { ctaText: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">CTA Target URL</label>
                                <input 
                                  type="text"
                                  value={selectedComponent.ctaLink || ''}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { ctaLink: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Text Align</label>
                                <select 
                                  value={selectedComponent.align || 'center'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { align: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Background Type</label>
                                <select 
                                  value={selectedComponent.bgType || 'color'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { bgType: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="color">Solid Color</option>
                                  <option value="gradient">Gradient</option>
                                  <option value="image">Background Image</option>
                                </select>
                              </div>
                            </div>
                            {selectedComponent.bgType === 'color' && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Solid Color Hex</label>
                                <input 
                                  type="color"
                                  value={selectedComponent.bgColor || '#4f46e5'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { bgColor: e.target.value })}
                                  className="w-full h-8 cursor-pointer rounded-xl"
                                />
                              </div>
                            )}
                            {selectedComponent.bgType === 'gradient' && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">CSS Gradient rule</label>
                                <input 
                                  type="text"
                                  value={selectedComponent.bgGradient || ''}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { bgGradient: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                            )}
                            {selectedComponent.bgType === 'image' && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Background Image URL</label>
                                <input 
                                  type="text"
                                  value={selectedComponent.bgImageUrl || ''}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { bgImageUrl: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* IMAGE FIELD CONTROLS */}
                        {selectedComponent.type === 'image' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Image Asset URL</label>
                              <input 
                                type="text"
                                value={selectedComponent.url || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { url: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Caption Title</label>
                              <input 
                                type="text"
                                value={selectedComponent.caption || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { caption: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Redirect Link URL (Optional)</label>
                              <input 
                                type="text"
                                value={selectedComponent.linkUrl || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { linkUrl: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Border Corners</label>
                                <select 
                                  value={selectedComponent.borderRadius || 'lg'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { borderRadius: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="none">Sharp edges (None)</option>
                                  <option value="md">Curved (Medium)</option>
                                  <option value="lg">Soft Pillows (Large)</option>
                                  <option value="full">Perfect Circles (Full)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Crop Aspect Ratio</label>
                                <select 
                                  value={selectedComponent.aspectRatio || '16:9'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { aspectRatio: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="auto">Uncropped (Auto)</option>
                                  <option value="16:9">Wide Movie (16:9)</option>
                                  <option value="1:1">Square Grid (1:1)</option>
                                  <option value="4:3">Retro Classic (4:3)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* VIDEO FIELD CONTROLS */}
                        {selectedComponent.type === 'video' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Embed URL or direct MP4 stream</label>
                              <input 
                                type="text"
                                value={selectedComponent.url || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { url: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Hosting Provider</label>
                              <select 
                                value={selectedComponent.platform || 'youtube'}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { platform: e.target.value as any })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                              >
                                <option value="youtube">YouTube Embed</option>
                                <option value="vimeo">Vimeo Embed</option>
                                <option value="direct">Direct Direct Stream URL (.mp4)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* BUTTON FIELD CONTROLS */}
                        {selectedComponent.type === 'button' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Button Label</label>
                              <input 
                                type="text"
                                value={selectedComponent.text || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { text: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Redirect Hyperlink</label>
                              <input 
                                type="text"
                                value={selectedComponent.link || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { link: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Button Style</label>
                                <select 
                                  value={selectedComponent.style || 'filled'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { style: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="filled">Solid Filled</option>
                                  <option value="outline">Thin Outline</option>
                                  <option value="gradient">Pink Gradient</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Scale Size</label>
                                <select 
                                  value={selectedComponent.size || 'md'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { size: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 pr-6 cursor-pointer"
                                >
                                  <option value="sm">Small Dense</option>
                                  <option value="md">Standard Medium</option>
                                  <option value="lg">Oversized Callout</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Accent Base Color</label>
                              <input 
                                type="color"
                                value={selectedComponent.color || '#4f46e5'}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { color: e.target.value })}
                                className="w-full h-8 cursor-pointer rounded-xl"
                              />
                            </div>
                          </div>
                        )}

                        {/* SOCIAL LINKS FIELD CONTROLS */}
                        {selectedComponent.type === 'social' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Social Channels Configuration</label>
                            
                            {(selectedComponent.links || []).map((lnk: any, idx: number) => (
                              <div key={idx} className="p-2 border rounded-xl space-y-2 bg-slate-50">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold capitalize text-indigo-700">{lnk.platform}</span>
                                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={lnk.active}
                                      onChange={(e) => {
                                        const updatedLinks = [...selectedComponent.links];
                                        updatedLinks[idx] = { ...lnk, active: e.target.checked };
                                        handleComponentPropChange(selectedComponent.id, { links: updatedLinks });
                                      }}
                                    />
                                    Active
                                  </label>
                                </div>
                                {lnk.active && (
                                  <input 
                                    type="text"
                                    placeholder={`/${lnk.platform} username or URL`}
                                    value={lnk.url || ''}
                                    onChange={(e) => {
                                      const updatedLinks = [...selectedComponent.links];
                                      updatedLinks[idx] = { ...lnk, url: e.target.value };
                                      handleComponentPropChange(selectedComponent.id, { links: updatedLinks });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-[10px] focus:ring-1 outline-none"
                                  />
                                )}
                              </div>
                            ))}

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Icon Frame</label>
                                <select 
                                  value={selectedComponent.style || 'circle'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { style: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs pr-6"
                                >
                                  <option value="circle">Perfect Spheres</option>
                                  <option value="square">Rounded Rects</option>
                                  <option value="minimal">Bare Icons (Invisible bg)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Base Icon Color</label>
                                <input 
                                  type="color"
                                  value={selectedComponent.color || '#4f46e5'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { color: e.target.value })}
                                  className="w-full h-8 cursor-pointer rounded-xl"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MAP PIN FIELD CONTROLS */}
                        {selectedComponent.type === 'map' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Marker Title</label>
                              <input 
                                type="text"
                                value={selectedComponent.markerTitle || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { markerTitle: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Physical Address Search</label>
                              <input 
                                type="text"
                                value={selectedComponent.address || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { address: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500">Latitude</label>
                                <input 
                                  type="number"
                                  step="0.0001"
                                  value={selectedComponent.latitude || 40.7128}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { latitude: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500">Longitude</label>
                                <input 
                                  type="number"
                                  step="0.0001"
                                  value={selectedComponent.longitude || -74.006}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { longitude: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500">Zoom level</label>
                                <input 
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={selectedComponent.zoom || 13}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { zoom: parseInt(e.target.value, 10) || 12 })}
                                  className="w-full px-2 py-1.5 border rounded text-xs focus:ring-1 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* GALLERY COLLAGE FIELD CONTROLS */}
                        {selectedComponent.type === 'gallery' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-600">Collage Image List (Comma separated paths)</label>
                            <textarea 
                              value={selectedComponent.images?.join(', ') || ''}
                              onChange={(e) => {
                                const list = e.target.value.split(',').map((it) => it.trim()).filter(Boolean);
                                handleComponentPropChange(selectedComponent.id, { images: list });
                              }}
                              rows={4}
                              className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none font-mono"
                              placeholder="https://images.com/pic1.jpg, https://images.com/pic2.jpg"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Layout columns</label>
                                <select 
                                  value={selectedComponent.columns || 3}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { columns: parseInt(e.target.value, 10) as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs pr-6"
                                >
                                  <option value={2}>2 Columns</option>
                                  <option value={3}>3 Columns</option>
                                  <option value={4}>4 Columns</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Grid Gapping</label>
                                <select 
                                  value={selectedComponent.gap || 'md'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { gap: e.target.value as any })}
                                  className="w-full px-3 py-1.5 border rounded-xl text-xs pr-6"
                                >
                                  <option value="sm">Tight (sm)</option>
                                  <option value="md">Balanced (md)</option>
                                  <option value="lg">Generous (lg)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PDF FIELD CONTROLS */}
                        {selectedComponent.type === 'pdf' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">PDF File Download Link</label>
                              <input 
                                type="text"
                                value={selectedComponent.pdfUrl || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { pdfUrl: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Panel Header Title</label>
                              <input 
                                type="text"
                                value={selectedComponent.title || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { title: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Description Guidelines</label>
                              <textarea 
                                value={selectedComponent.description || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* COUNTDOWN TIMER FIELD CONTROLS */}
                        {selectedComponent.type === 'countdown' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Target Date & Time (ISO/YYYY-MM-DDTHH:MM)</label>
                              <input 
                                type="datetime-local"
                                value={selectedComponent.targetDate || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { targetDate: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Progress Title Label</label>
                              <input 
                                type="text"
                                value={selectedComponent.label || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { label: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Timer visual style</label>
                              <select 
                                value={selectedComponent.style || 'digital'}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { style: e.target.value as any })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs pr-6"
                              >
                                <option value="digital">Continuous Retro</option>
                                <option value="cards">Flip Cards Grid</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Box Background</label>
                                <input 
                                  type="color"
                                  value={selectedComponent.bgColor || '#f1f5f9'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { bgColor: e.target.value })}
                                  className="w-full h-8 cursor-pointer rounded-xl"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600">Digit color</label>
                                <input 
                                  type="color"
                                  value={selectedComponent.textColor || '#0f172a'}
                                  onChange={(e) => handleComponentPropChange(selectedComponent.id, { textColor: e.target.value })}
                                  className="w-full h-8 cursor-pointer rounded-xl"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CONTACT FORM FIELD CONTROLS */}
                        {selectedComponent.type === 'contactForm' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Form Header Title</label>
                              <input 
                                type="text"
                                value={selectedComponent.title || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { title: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Form Description / Purpose</label>
                              <textarea 
                                value={selectedComponent.description || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Submit Button label</label>
                              <input 
                                type="text"
                                value={selectedComponent.buttonText || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { buttonText: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600">Email Recipient Notification</label>
                              <input 
                                type="email"
                                value={selectedComponent.emailRecipient || ''}
                                onChange={(e) => handleComponentPropChange(selectedComponent.id, { emailRecipient: e.target.value })}
                                className="w-full px-3 py-1.5 border rounded-xl text-xs focus:ring-1 outline-none font-mono"
                                placeholder="sales@example.com"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: THEME CUSTOMIZER */}
                {activeSidebarTab === 'themes' && (
                  <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Theme Designer</h3>
                      <Palette className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Presets List */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Aesthetic Presets</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(THEME_PRESETS).map((key) => {
                            const t = THEME_PRESETS[key];
                            const isActive = activePage.theme.name === t.name;
                            return (
                              <button
                                key={key}
                                onClick={() => handleThemePresetSelect(key)}
                                className={`p-2.5 rounded-xl border text-left space-y-1.5 cursor-pointer transition-all ${
                                  isActive ? 'border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-500' : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                }`}
                              >
                                <span className="text-[10px] font-black text-slate-800 block leading-none">{t.name}</span>
                                <div className="flex items-center gap-1">
                                  <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ background: t.primaryColor }} />
                                  <span className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ background: t.bgColor }} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom override settings */}
                      <div className="border-t border-slate-100 pt-3 space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tailor Design Values</label>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Active Brand Primary Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={activePage.theme.primaryColor || '#4f46e5'}
                              onChange={(e) => handleCustomThemeChange('primaryColor', e.target.value)}
                              className="w-10 h-8 cursor-pointer rounded-lg shrink-0"
                            />
                            <input 
                              type="text"
                              value={activePage.theme.primaryColor || ''}
                              onChange={(e) => handleCustomThemeChange('primaryColor', e.target.value)}
                              className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Base Text Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={activePage.theme.textColor || '#1e293b'}
                              onChange={(e) => handleCustomThemeChange('textColor', e.target.value)}
                              className="w-10 h-8 cursor-pointer rounded-lg shrink-0"
                            />
                            <input 
                              type="text"
                              value={activePage.theme.textColor || ''}
                              onChange={(e) => handleCustomThemeChange('textColor', e.target.value)}
                              className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Canvas Base Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color"
                              value={activePage.theme.bgColor || '#ffffff'}
                              onChange={(e) => handleCustomThemeChange('bgColor', e.target.value)}
                              className="w-10 h-8 cursor-pointer rounded-lg shrink-0"
                            />
                            <input 
                              type="text"
                              value={activePage.theme.bgColor || ''}
                              onChange={(e) => handleCustomThemeChange('bgColor', e.target.value)}
                              className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Background Gradient Layer (optional CSS rule)</label>
                          <input 
                            type="text"
                            value={activePage.theme.bgGradient || ''}
                            onChange={(e) => handleCustomThemeChange('bgGradient', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-xl text-xs font-mono outline-none"
                            placeholder="linear-gradient(to bottom, #fff, #eee)"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Typography Pairing</label>
                          <select 
                            value={activePage.theme.fontFamily || 'font-sans'}
                            onChange={(e) => handleCustomThemeChange('fontFamily', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-xl text-xs pr-6"
                          >
                            <option value="font-sans">Inter Clean Sans (Modern)</option>
                            <option value="font-serif">Playfair Display Serif (Elegant / Luxury)</option>
                            <option value="font-mono">JetBrains Mono (Digital / Tech)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SEO CONFIG */}
                {activeSidebarTab === 'seo' && (
                  <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Search Optimization</h3>
                      <Globe className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Customize Page Title Slug</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">/p/</span>
                          <input 
                            type="text"
                            value={activePage.slug || ''}
                            onChange={(e) => handlePageTitleOrSlugChange('slug', e.target.value)}
                            className="flex-1 px-3 py-1.5 border rounded-xl text-xs font-mono outline-none text-indigo-700"
                            placeholder="summer-vip-deal"
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 leading-none mt-1">Short letters, numbers and hyphens only.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Campaign Header Label</label>
                        <input 
                          type="text"
                          value={activePage.title || ''}
                          onChange={(e) => handlePageTitleOrSlugChange('title', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Meta Title</label>
                        <input 
                          type="text"
                          value={activePage.seo.metaTitle || ''}
                          onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1"
                          placeholder="Summer Release Drop"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Meta Search Description</label>
                        <textarea 
                          value={activePage.seo.metaDescription || ''}
                          onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1"
                          placeholder="Exclusive coupon vouchers for Vanguard drop."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Search Keywords (Comma separated)</label>
                        <input 
                          type="text"
                          value={activePage.seo.keywords || ''}
                          onChange={(e) => handleSEOChange('keywords', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1"
                          placeholder="coupons, shoes, discount"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">OG Share Image (URL)</label>
                        <input 
                          type="text"
                          value={activePage.seo.shareImage || ''}
                          onChange={(e) => handleSEOChange('shareImage', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-xl text-xs outline-none focus:ring-1"
                          placeholder="https://images.com/preview.png"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LEADS SUBMISSIONS INBOX */}
                {activeSidebarTab === 'submissions' && (
                  <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Leads & Signups Inbox</h3>
                      <Inbox className="w-4 h-4 text-indigo-600" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          value={selectedSubmissionFilter}
                          onChange={(e) => setSelectedSubmissionFilter(e.target.value)}
                          className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none pr-6 cursor-pointer flex-1"
                        >
                          <option value="all">All Campaign Pages</option>
                          {pages.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
                        {filteredSubmissions.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <Mail className="w-6 h-6 text-slate-350 mx-auto" />
                            <h4 className="text-[11px] font-bold text-slate-600">Inbox is empty</h4>
                            <p className="text-[9px] text-slate-400 max-w-[150px] mx-auto">Publish your form and submit test leads to preview data logging.</p>
                          </div>
                        ) : (
                          filteredSubmissions.map((sub) => (
                            <div key={sub.id} className="p-3 bg-white border border-slate-150 hover:border-indigo-150 rounded-xl space-y-2 transition-colors">
                              <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
                                <span className="text-[9px] font-bold text-indigo-600 truncate max-w-[100px]">{sub.pageTitle}</span>
                                <span className="text-[8px] text-slate-400 font-medium">{new Date(sub.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="space-y-1">
                                {Object.entries(sub.formData).map(([k, v]) => (
                                  <div key={k} className="flex flex-col text-[10px]">
                                    <span className="font-extrabold text-slate-500 capitalize">{k}:</span>
                                    <span className="font-medium text-slate-800 break-all">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
