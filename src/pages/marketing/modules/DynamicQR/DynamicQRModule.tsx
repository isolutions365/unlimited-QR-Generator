import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, Link2, Copy, Edit2, RotateCcw, Calendar, Check, Search, Plus, 
  Trash2, Shield, Lock, Globe, Smartphone, Clock, Filter, SlidersHorizontal, 
  AlertTriangle, Play, Pause, Archive, ExternalLink, X, CheckSquare, Square, 
  ChevronDown, RefreshCw, Sparkles, HelpCircle, Layers, CheckCircle2, MoreVertical
} from 'lucide-react';
import { auth } from '../../../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { 
  createDynamicQR, 
  getDynamicQR, 
  updateDynamicQR, 
  deleteDynamicQR, 
  listUserDynamicQRs 
} from '../../../../lib/dynamicQRService';
import { DynamicQR } from '../../../../types';

// Pre-defined demo dynamic QRs if user is offline/not logged in
const DEMO_QRS: DynamicQR[] = [
  {
    id: 'summer-promo',
    name: 'Summer VIP Coupon Redirect',
    ownerId: 'demo-user',
    destinationUrl: 'https://shop.example.com/discounts/vip-exclusive-summer',
    status: 'active',
    createdAt: '2026-08-01T12:00:00Z',
    campaign: 'Summer Promo 2026',
    analytics: {
      scanCount: 1450,
      uniqueScans: 1210,
      lastScannedAt: '2026-08-02T18:30:00Z',
      deviceBreakdown: { ios: 820, android: 510, desktop: 120 },
      countryBreakdown: { US: 950, CA: 300, GB: 200 }
    }
  },
  {
    id: 'bistro-menu',
    name: 'Interactive Digital Menu Dynamic Link',
    ownerId: 'demo-user',
    destinationUrl: 'https://myrestaurant.com/menus/standard-v1.pdf',
    status: 'active',
    createdAt: '2026-07-28T09:15:00Z',
    campaign: 'Main Bistro Menu',
    countryRules: {
      FR: 'https://myrestaurant.com/menus/french-v1.pdf',
      ES: 'https://myrestaurant.com/menus/spanish-v1.pdf'
    },
    analytics: {
      scanCount: 3120,
      uniqueScans: 2750,
      lastScannedAt: '2026-08-02T19:12:00Z',
      deviceBreakdown: { ios: 1950, android: 1100, desktop: 70 },
      countryBreakdown: { US: 1800, FR: 820, ES: 500 }
    }
  },
  {
    id: 'app-dl',
    name: 'App Download Universal Smart QR',
    ownerId: 'demo-user',
    destinationUrl: 'https://onelink.to/mycustombrandapp',
    status: 'active',
    createdAt: '2026-07-15T14:40:00Z',
    campaign: 'App Install Campaign',
    deviceRules: {
      ios: 'https://apps.apple.com/app/mycustombrand',
      android: 'https://play.google.com/store/apps/details?id=mycustombrand'
    },
    analytics: {
      scanCount: 6780,
      uniqueScans: 5900,
      lastScannedAt: '2026-08-02T19:44:00Z',
      deviceBreakdown: { ios: 4100, android: 2580, desktop: 100 },
      countryBreakdown: { US: 4200, GB: 1500, AU: 1080 }
    }
  },
  {
    id: 'vip-coupon-paused',
    name: 'Autumn Pre-launch Ticket RSVP',
    ownerId: 'demo-user',
    destinationUrl: 'https://tickets.example.com/autumn-gala-early',
    status: 'paused',
    createdAt: '2026-07-10T10:00:00Z',
    campaign: 'Autumn Gala 2026',
    password: 'GALA_ACCESS_VIP',
    analytics: {
      scanCount: 340,
      uniqueScans: 290,
      lastScannedAt: '2026-07-25T15:22:00Z',
      deviceBreakdown: { ios: 210, android: 110, desktop: 20 },
      countryBreakdown: { US: 300, GB: 40 }
    }
  }
];

export default function DynamicQRModule() {
  const [qrs, setQrs] = useState<DynamicQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  
  // Interaction states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingQrId, setEditingQrId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'countries' | 'devices' | 'time'>('basic');

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCustomId, setFormCustomId] = useState('');
  const [formDestUrl, setFormDestUrl] = useState('');
  const [formCampaign, setFormCampaign] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'paused'>('active');

  // Rules Fields State
  const [formCountryRules, setFormCountryRules] = useState<{ country: string; url: string }[]>([]);
  const [formDeviceRules, setFormDeviceRules] = useState<{ ios: string; android: string; desktop: string }>({
    ios: '',
    android: '',
    desktop: ''
  });
  const [formTimeRules, setFormTimeRules] = useState<Array<{
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
    destinationUrl: string;
  }>>([]);

  // Track User Auth State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      fetchQRs(currentUser?.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchQRs = async (uid?: string) => {
    setLoading(true);
    try {
      let activeUid = uid || auth.currentUser?.uid;
      if (!activeUid) {
        try {
          const anon = await signInAnonymously(auth);
          activeUid = anon.user.uid;
        } catch (e) {
          console.warn('Anon auth notice:', e);
        }
      }
      if (activeUid) {
        const userQrs = await listUserDynamicQRs(activeUid);
        setQrs(userQrs);
      } else {
        setQrs(DEMO_QRS);
      }
    } catch (err) {
      console.error('Failed to list QRs:', err);
      setQrs(DEMO_QRS);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQRs(user?.uid);
    setRefreshing(false);
  };

  // Helper to generate redirect URLs
  const getShortUrl = (id: string) => `https://qrf.gs/s/${id}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Checkbox management
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedQRs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedQRs.map(qr => qr.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // CRUD Actions
  const handleToggleStatus = async (qr: DynamicQR) => {
    const newStatus: 'active' | 'paused' = qr.status === 'active' ? 'paused' : 'active';
    try {
      await updateDynamicQR(qr.id, { status: newStatus });
      setQrs(prev => prev.map(item => item.id === qr.id ? { ...item, status: newStatus } : item));
    } catch (err) {
      alert('Error updating status: ' + err);
    }
  };

  const handleArchive = async (qr: DynamicQR) => {
    try {
      await updateDynamicQR(qr.id, { status: 'archived' });
      setQrs(prev => prev.map(item => item.id === qr.id ? { ...item, status: 'archived' } : item));
    } catch (err) {
      alert('Error archiving link: ' + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this dynamic link? Any printed physical QR code pointing to this link will break.')) {
      return;
    }
    try {
      await deleteDynamicQR(id);
      setQrs(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      alert('Error deleting link: ' + err);
    }
  };

  const handleDuplicate = async (qr: DynamicQR) => {
    const newId = `${qr.id}-copy-${Math.floor(Math.random() * 1000)}`;
    const duplicatedQr: DynamicQR = {
      ...qr,
      id: newId,
      name: `Copy of ${qr.name}`,
      ownerId: auth.currentUser?.uid || qr.ownerId,
      createdAt: new Date().toISOString(),
      analytics: {
        scanCount: 0,
        uniqueScans: 0,
        lastScannedAt: null,
        deviceBreakdown: {},
        countryBreakdown: {}
      }
    };

    try {
      await createDynamicQR(duplicatedQr);
      setQrs(prev => [duplicatedQr, ...prev]);
    } catch (err) {
      alert('Error duplicating link: ' + err);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: 'pause' | 'resume' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected links? This will permanently break their associated physical codes.`)) {
        return;
      }
    }

    try {
      const updatedList = [...qrs];
      for (const id of selectedIds) {
        const match = updatedList.find(q => q.id === id);
        if (!match) continue;

        if (action === 'delete') {
          await deleteDynamicQR(id);
          const idx = updatedList.findIndex(q => q.id === id);
          if (idx !== -1) updatedList.splice(idx, 1);
        } else {
          let nextStatus: 'active' | 'paused' | 'archived' = 'active';
          if (action === 'pause') nextStatus = 'paused';
          if (action === 'archive') nextStatus = 'archived';

          await updateDynamicQR(id, { status: nextStatus });
          match.status = nextStatus;
        }
      }

      setQrs(action === 'delete' ? updatedList : [...updatedList]);
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to execute bulk operations: ' + err);
    }
  };

  // Form Management Helpers
  const openCreateModal = () => {
    setModalMode('create');
    setEditingQrId(null);
    setActiveModalTab('basic');
    
    // Clear form
    setFormName('');
    setFormCustomId(`dl-${Math.random().toString(36).substring(2, 8)}`);
    setFormDestUrl('');
    setFormCampaign('');
    setFormExpiry('');
    setFormPassword('');
    setFormStatus('active');
    setFormCountryRules([]);
    setFormDeviceRules({ ios: '', android: '', desktop: '' });
    setFormTimeRules([]);

    setIsModalOpen(true);
  };

  const openEditModal = (qr: DynamicQR) => {
    setModalMode('edit');
    setEditingQrId(qr.id);
    setActiveModalTab('basic');

    // Populate fields
    setFormName(qr.name);
    setFormCustomId(qr.id);
    setFormDestUrl(qr.destinationUrl);
    setFormCampaign(qr.campaign || '');
    setFormExpiry(qr.expiryAt ? qr.expiryAt.substring(0, 16) : '');
    setFormPassword(qr.password || '');
    setFormStatus(qr.status === 'paused' ? 'paused' : 'active');

    // Populate country rules
    if (qr.countryRules) {
      const rulesArr = Object.entries(qr.countryRules).map(([country, url]) => ({ country, url }));
      setFormCountryRules(rulesArr);
    } else {
      setFormCountryRules([]);
    }

    // Populate device rules
    setFormDeviceRules({
      ios: qr.deviceRules?.ios || '',
      android: qr.deviceRules?.android || '',
      desktop: qr.deviceRules?.desktop || ''
    });

    // Populate time rules
    setFormTimeRules(qr.timeRules?.rules || []);

    setIsModalOpen(true);
  };

  // Country Rule Helpers
  const addCountryRule = () => {
    setFormCountryRules([...formCountryRules, { country: 'US', url: '' }]);
  };

  const removeCountryRule = (idx: number) => {
    setFormCountryRules(formCountryRules.filter((_, i) => i !== idx));
  };

  const updateCountryRule = (idx: number, field: 'country' | 'url', value: string) => {
    const updated = [...formCountryRules];
    updated[idx][field] = value;
    setFormCountryRules(updated);
  };

  // Time Rule Helpers
  const addTimeRule = () => {
    setFormTimeRules([...formTimeRules, {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
      destinationUrl: ''
    }]);
  };

  const removeTimeRule = (idx: number) => {
    setFormTimeRules(formTimeRules.filter((_, i) => i !== idx));
  };

  const updateTimeRule = (idx: number, field: string, value: any) => {
    const updated = [...formTimeRules];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormTimeRules(updated);
  };

  const handleSaveQr = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert('Please specify a friendly name or campaign label.');
      return;
    }
    if (!formDestUrl.trim()) {
      alert('Please enter a target destination URL.');
      return;
    }

    // Ensure valid URL prefix
    let destinationUrl = formDestUrl.trim();
    if (!/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = 'https://' + destinationUrl;
    }

    // Process Country rules
    const countryRulesObj: Record<string, string> = {};
    formCountryRules.forEach(r => {
      if (r.country && r.url.trim()) {
        let ruleUrl = r.url.trim();
        if (!/^https?:\/\//i.test(ruleUrl)) {
          ruleUrl = 'https://' + ruleUrl;
        }
        countryRulesObj[r.country.toUpperCase()] = ruleUrl;
      }
    });

    // Process Device rules
    const deviceRulesObj: Record<string, string> = {};
    if (formDeviceRules.ios.trim()) {
      let url = formDeviceRules.ios.trim();
      deviceRulesObj.ios = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    }
    if (formDeviceRules.android.trim()) {
      let url = formDeviceRules.android.trim();
      deviceRulesObj.android = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    }
    if (formDeviceRules.desktop.trim()) {
      let url = formDeviceRules.desktop.trim();
      deviceRulesObj.desktop = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    }

    // Process Time rules
    const hasTimeRules = formTimeRules.length > 0;

    const finalQr: DynamicQR = {
      id: formCustomId.trim() || `dl-${Math.random().toString(36).substring(2, 8)}`,
      name: formName.trim(),
      ownerId: user?.uid || 'demo-user',
      destinationUrl,
      status: formStatus,
      createdAt: modalMode === 'edit' && editingQrId 
        ? (qrs.find(q => q.id === editingQrId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      expiryAt: formExpiry ? new Date(formExpiry).toISOString() : null,
      password: formPassword.trim() || null,
      campaign: formCampaign.trim() || null,
      countryRules: Object.keys(countryRulesObj).length > 0 ? countryRulesObj : null,
      deviceRules: Object.keys(deviceRulesObj).length > 0 ? deviceRulesObj : null,
      timeRules: hasTimeRules ? {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        rules: formTimeRules.map(r => {
          let u = r.destinationUrl.trim();
          if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
          return { ...r, destinationUrl: u };
        })
      } : null,
      analytics: modalMode === 'edit' && editingQrId
        ? qrs.find(q => q.id === editingQrId)?.analytics || null
        : {
            scanCount: 0,
            uniqueScans: 0,
            lastScannedAt: null,
            deviceBreakdown: {},
            countryBreakdown: {}
          }
    };

    try {
      if (modalMode === 'create') {
        // Prevent duplicate IDs
        if (qrs.some(q => q.id === finalQr.id)) {
          alert('This custom URL key is already in use. Please choose a different slug key.');
          return;
        }

        await createDynamicQR(finalQr);
        setQrs([finalQr, ...qrs]);
      } else {
        if (editingQrId) {
          await updateDynamicQR(editingQrId, {
            name: finalQr.name,
            destinationUrl: finalQr.destinationUrl,
            status: finalQr.status,
            expiryAt: finalQr.expiryAt,
            password: finalQr.password,
            campaign: finalQr.campaign,
            countryRules: finalQr.countryRules,
            deviceRules: finalQr.deviceRules,
            timeRules: finalQr.timeRules
          });
          setQrs(prev => prev.map(item => item.id === editingQrId ? { ...item, ...finalQr } : item));
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Error saving configuration: ' + err);
    }
  };

  // Search & Filter Logic
  const filteredAndSortedQRs = useMemo(() => {
    let result = [...qrs];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(qr => 
        qr.name.toLowerCase().includes(q) || 
        qr.id.toLowerCase().includes(q) || 
        qr.destinationUrl.toLowerCase().includes(q) || 
        (qr.campaign && qr.campaign.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(qr => qr.status === statusFilter);
    }

    // Advanced Rules Filter
    if (ruleFilter !== 'all') {
      if (ruleFilter === 'countries') {
        result = result.filter(qr => qr.countryRules && Object.keys(qr.countryRules).length > 0);
      } else if (ruleFilter === 'devices') {
        result = result.filter(qr => qr.deviceRules && Object.keys(qr.deviceRules).length > 0);
      } else if (ruleFilter === 'time') {
        result = result.filter(qr => qr.timeRules && qr.timeRules.rules.length > 0);
      } else if (ruleFilter === 'password') {
        result = result.filter(qr => qr.password && qr.password.trim() !== '');
      } else if (ruleFilter === 'expiry') {
        result = result.filter(qr => qr.expiryAt);
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'scans') {
        return (b.analytics?.scanCount || 0) - (a.analytics?.scanCount || 0);
      }
      return 0;
    });

    return result;
  }, [qrs, searchQuery, statusFilter, ruleFilter, sortBy]);

  // Aggregate stats for quick overview
  const totalScansSum = useMemo(() => qrs.reduce((sum, curr) => sum + (curr.analytics?.scanCount || 0), 0), [qrs]);
  const activeCount = useMemo(() => qrs.filter(q => q.status === 'active').length, [qrs]);
  const pausedCount = useMemo(() => qrs.filter(q => q.status === 'paused').length, [qrs]);

  return (
    <div id="marketing-dynamicqr-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Dynamic QR Links
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Change target endpoints, implement geographic routing, schedule rules, and track redirects on-the-fly.</p>
        </div>
        
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button 
            onClick={handleRefresh}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer flex items-center justify-center text-xs font-bold gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
          
          <button 
            onClick={openCreateModal}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Dynamic Link
          </button>
        </div>
      </div>

      {/* Cloud Integration Callout */}
      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Demo Sandbox Active</span>
            You are currently working in local-preview mode. Any dynamic redirections, countries, or passwords you create here will be stored in your browser's local state. <strong className="font-extrabold underline cursor-pointer">Sign in to your client dashboard</strong> to deploy active redirection links on real public domains.
          </div>
        </div>
      )}

      {/* Quick Status Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Links</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{qrs.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Routers</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">{activeCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Paused Routers</span>
          <span className="text-xl font-black text-slate-500 mt-1 block">{pausedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-3xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Redirect Checks</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">{totalScansSum.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters and Search Action Bar */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by friendly name, custom slug, destination URL, or campaign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Rule Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Redirect Rule:</span>
              <select 
                value={ruleFilter}
                onChange={(e) => setRuleFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Any Rule Type</option>
                <option value="countries">Country Geo-Routing</option>
                <option value="devices">Device targeting</option>
                <option value="time">Time Scheduled</option>
                <option value="password">Password Lock</option>
                <option value="expiry">Auto Expiry</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="latest">Latest Created</option>
                <option value="oldest">Oldest Created</option>
                <option value="name">Name (A-Z)</option>
                <option value="scans">Checks (High-Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Sub-Header */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                {selectedIds.length} dynamic links selected for bulk action
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => handleBulkAction('resume')}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3" /> Resume
              </button>
              <button 
                onClick={() => handleBulkAction('pause')}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Pause className="w-3 h-3" /> Pause
              </button>
              <button 
                onClick={() => handleBulkAction('archive')}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-700 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Archive className="w-3 h-3" /> Archive
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] text-slate-500 hover:text-slate-700 font-bold ml-1.5 cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Dynamic QRs Table / Card List */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Dynamic Router Nodes</span>
          <span className="text-[10px] text-slate-400 font-bold">{filteredAndSortedQRs.length} matching rules found</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Retrieving router records...</p>
          </div>
        ) : filteredAndSortedQRs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <QrCode className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
            <p className="text-xs font-semibold">No dynamic routers found matching your current parameters.</p>
            <button 
              onClick={openCreateModal}
              className="px-3.5 py-1.5 bg-slate-150 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Setup your first router
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold bg-slate-50/20">
                    <th className="py-3 px-4 w-10 text-center">
                      <button 
                        onClick={toggleSelectAll}
                        className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {selectedIds.length === filteredAndSortedQRs.length ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-2">Friendly Label & Campaign</th>
                    <th className="py-3 px-2">Short Link Slug</th>
                    <th className="py-3 px-2">Destination Target</th>
                    <th className="py-3 px-2">Rules Configured</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Redirection Metrics / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedQRs.map((qr) => {
                    const isSelected = selectedIds.includes(qr.id);
                    const shortUrl = getShortUrl(qr.id);
                    const hasCountry = qr.countryRules && Object.keys(qr.countryRules).length > 0;
                    const hasDevice = qr.deviceRules && Object.keys(qr.deviceRules).length > 0;
                    const hasTime = qr.timeRules && qr.timeRules.rules && qr.timeRules.rules.length > 0;
                    const hasPassword = qr.password && qr.password.trim() !== '';
                    const hasExpiry = qr.expiryAt;

                    return (
                      <tr 
                        key={qr.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isSelected ? 'bg-indigo-50/20 hover:bg-indigo-50/30' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => toggleSelectId(qr.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-2 max-w-[200px]">
                          <div className="font-extrabold text-slate-950 truncate" title={qr.name}>
                            {qr.name}
                          </div>
                          {qr.campaign ? (
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {qr.campaign}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Generic Router</span>
                          )}
                        </td>

                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-slate-700 font-bold text-[10px]">
                              s/{qr.id}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(shortUrl, qr.id)}
                              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Copy URL slug"
                            >
                              {copiedId === qr.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-2 max-w-[240px] truncate">
                          <a 
                            href={qr.destinationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-mono text-slate-500 hover:text-indigo-600 hover:underline inline-flex items-center gap-1"
                            title={qr.destinationUrl}
                          >
                            {qr.destinationUrl}
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1.5">
                            {hasCountry && (
                              <span className="p-1 bg-teal-50 border border-teal-100 text-teal-600 rounded-md" title="Has Georouting Country Rules">
                                <Globe className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {hasDevice && (
                              <span className="p-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-md" title="Has Device Redirection Rules">
                                <Smartphone className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {hasTime && (
                              <span className="p-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-md" title="Has Time Schedule Rules">
                                <Clock className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {hasPassword && (
                              <span className="p-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-md" title="Password Protected Access Link">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {hasExpiry && (
                              <span className="p-1 bg-slate-50 border border-slate-150 text-slate-500 rounded-md" title={`Expires at ${new Date(qr.expiryAt!).toLocaleDateString()}`}>
                                <Calendar className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {!hasCountry && !hasDevice && !hasTime && !hasPassword && !hasExpiry && (
                              <span className="text-[10px] text-slate-400 font-semibold italic">No custom rules</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-2 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-full ${
                            qr.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : qr.status === 'paused' 
                              ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              qr.status === 'active' ? 'bg-emerald-500' : qr.status === 'paused' ? 'bg-slate-400' : 'bg-rose-500'
                            }`} />
                            {qr.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="text-right shrink-0">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Scans</span>
                              <span className="text-xs font-black text-slate-800">
                                {(qr.analytics?.scanCount || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="h-6 w-[1px] bg-slate-200" />

                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => openEditModal(qr)}
                                className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-150 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer"
                                title="Edit target settings & rules"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => handleToggleStatus(qr)}
                                className={`p-2 border rounded-xl transition-all cursor-pointer ${
                                  qr.status === 'active'
                                    ? 'bg-slate-50 hover:bg-amber-50 border-slate-150 hover:border-amber-200 text-slate-600 hover:text-amber-600'
                                    : 'bg-slate-50 hover:bg-emerald-50 border-slate-150 hover:border-emerald-200 text-slate-600 hover:text-emerald-600'
                                }`}
                                title={qr.status === 'active' ? 'Pause Redirection' : 'Resume Redirection'}
                              >
                                {qr.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>

                              <button 
                                onClick={() => handleDuplicate(qr)}
                                className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-150 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Duplicate Config"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => handleArchive(qr)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title="Archive Link"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => handleDelete(qr.id)}
                                className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-150 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                                title="Delete Link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block lg:hidden divide-y divide-slate-100">
              {filteredAndSortedQRs.map((qr) => {
                const isSelected = selectedIds.includes(qr.id);
                const shortUrl = getShortUrl(qr.id);
                const hasCountry = qr.countryRules && Object.keys(qr.countryRules).length > 0;
                const hasDevice = qr.deviceRules && Object.keys(qr.deviceRules).length > 0;
                const hasTime = qr.timeRules && qr.timeRules.rules && qr.timeRules.rules.length > 0;
                const hasPassword = qr.password && qr.password.trim() !== '';

                return (
                  <div 
                    key={qr.id} 
                    className={`p-4 space-y-3 hover:bg-slate-50/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => toggleSelectId(qr.id)}
                          className="text-slate-400 hover:text-indigo-600 shrink-0 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-xs font-black text-slate-950">{qr.name}</h4>
                          {qr.campaign && (
                            <span className="text-[9px] text-indigo-600 font-extrabold bg-indigo-50 px-1 py-0.5 rounded mt-0.5 inline-block">
                              {qr.campaign}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        qr.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {qr.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-400 font-bold">Short Link:</span>
                        <div className="flex items-center gap-1 font-mono text-slate-700">
                          <span>s/{qr.id}</span>
                          <button 
                            onClick={() => copyToClipboard(shortUrl, qr.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                          >
                            {copiedId === qr.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-400 font-bold shrink-0">Destination:</span>
                        <a 
                          href={qr.destinationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-mono text-slate-500 hover:text-indigo-600 truncate break-all flex items-center gap-0.5 max-w-[180px]"
                        >
                          {qr.destinationUrl}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      {(hasCountry || hasDevice || hasTime || hasPassword) && (
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-150/50 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold mr-1">Active Rules:</span>
                          {hasCountry && <Globe className="w-3 h-3 text-teal-600" />}
                          {hasDevice && <Smartphone className="w-3 h-3 text-purple-600" />}
                          {hasTime && <Clock className="w-3 h-3 text-amber-600" />}
                          {hasPassword && <Lock className="w-3 h-3 text-rose-600" />}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-left">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Scans check</span>
                        <span className="text-xs font-black text-slate-800">
                          {(qr.analytics?.scanCount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => openEditModal(qr)}
                          className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(qr)}
                          className="px-2 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold"
                        >
                          {qr.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button 
                          onClick={() => handleDuplicate(qr)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(qr.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT ADVANCED RULES MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {modalMode === 'create' ? 'Instant Router Creator' : 'Configuration Settings'}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  {modalMode === 'create' ? 'Create New Dynamic Redirect Router' : `Edit Target: ${formName}`}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tab Headers */}
            <div className="flex border-b border-slate-150 shrink-0 overflow-x-auto bg-slate-50/35">
              <button
                onClick={() => setActiveModalTab('basic')}
                className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeModalTab === 'basic' 
                    ? 'border-indigo-600 text-indigo-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Basic Settings
              </button>
              <button
                onClick={() => setActiveModalTab('countries')}
                className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeModalTab === 'countries' 
                    ? 'border-indigo-600 text-indigo-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Geo-Routing Rules
              </button>
              <button
                onClick={() => setActiveModalTab('devices')}
                className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeModalTab === 'devices' 
                    ? 'border-indigo-600 text-indigo-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Device Routing
              </button>
              <button
                onClick={() => setActiveModalTab('time')}
                className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap text-center ${
                  activeModalTab === 'time' 
                    ? 'border-indigo-600 text-indigo-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                4. Schedule Schedules
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <form onSubmit={handleSaveQr} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* TAB 1: BASIC SETTINGS */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Router Name / Label *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Summer Restaurant Menu PDF"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Short link slug key (custom URL ID)
                      </label>
                      <input 
                        type="text"
                        required
                        disabled={modalMode === 'edit'}
                        placeholder="e.g. menu-vip-summer"
                        value={formCustomId}
                        onChange={(e) => setFormCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))}
                        className={`w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs transition-all ${
                          modalMode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50/50 focus:bg-white'
                        }`}
                      />
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        This yields link: <code className="font-mono bg-slate-50 px-1 py-0.5 rounded text-indigo-600">qrf.gs/s/&#123;slug&#125;</code>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Base Target Destination URL *
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. https://shop.mybrand.com/summer-promotion"
                        value={formDestUrl}
                        onChange={(e) => setFormDestUrl(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      This is the general fallback destination if none of the country, device, or time-scheduled rules below apply.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Marketing Campaign Code (Optional Tag)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Q3 Summer Retail Campaign"
                        value={formCampaign}
                        onChange={(e) => setFormCampaign(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                        Initial Redirection Status
                      </label>
                      <select 
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as 'active' | 'paused')}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all font-semibold"
                      >
                        <option value="active">Active (Instant Redirection)</option>
                        <option value="paused">Paused (Holder Template Screen)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-rose-500" />
                        Password Gate Access Code (Optional)
                      </label>
                      <input 
                        type="password"
                        placeholder="Enter password lock to guard redirect"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Automatic Link Expiration Date (Optional)
                      </label>
                      <input 
                        type="datetime-local"
                        value={formExpiry}
                        onChange={(e) => setFormExpiry(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: GEOGRAPHIC COUNTRY ROUTING */}
              {activeModalTab === 'countries' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-800 block">Geographic IP Redirection Rules</span>
                      Route users to localized translation URLs automatically based on their geographic country location check on scan!
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {formCountryRules.map((rule, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                        <div className="w-full sm:w-1/3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Country ISO Code</label>
                          <select 
                            value={rule.country}
                            onChange={(e) => updateCountryRule(idx, 'country', e.target.value)}
                            className="w-full p-2 border border-slate-200 bg-white rounded-lg outline-none font-bold text-slate-700"
                          >
                            <option value="US">United States (US)</option>
                            <option value="GB">United Kingdom (GB)</option>
                            <option value="DE">Germany (DE)</option>
                            <option value="FR">France (FR)</option>
                            <option value="ES">Spain (ES)</option>
                            <option value="IT">Italy (IT)</option>
                            <option value="JP">Japan (JP)</option>
                            <option value="CN">China (CN)</option>
                            <option value="CA">Canada (CA)</option>
                            <option value="MX">Mexico (MX)</option>
                            <option value="BR">Brazil (BR)</option>
                            <option value="AU">Australia (AU)</option>
                            <option value="IN">India (IN)</option>
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Localized Target Destination URL</label>
                          <div className="relative">
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. https://shop.mybrand.com/de/promo"
                              value={rule.url}
                              onChange={(e) => updateCountryRule(idx, 'url', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-white rounded-lg outline-none text-xs"
                            />
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={() => removeCountryRule(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 sm:self-end"
                          title="Delete geographic routing rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addCountryRule}
                      className="py-2 px-3.5 border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer w-full"
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Geographic Override Routing Path
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: DEVICE TARGETING */}
              {activeModalTab === 'devices' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-800 block">Mobile & Desktop Device OS Targeting</span>
                      Route users scanning with Apple iOS (iPhone/iPad) or Google Android to dedicated App Store download paths instantly, with a desktop fallback!
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Apple iOS Redirect Target (Optional)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. https://apps.apple.com/app/mybrand-companion"
                        value={formDeviceRules.ios}
                        onChange={(e) => setFormDeviceRules({ ...formDeviceRules, ios: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Google Android Redirect Target (Optional)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. https://play.google.com/store/apps/details?id=com.mybrand"
                        value={formDeviceRules.android}
                        onChange={(e) => setFormDeviceRules({ ...formDeviceRules, android: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Desktop Web Redirect Target (Optional Override)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. https://www.mybrand.com/app-features-info-hub"
                        value={formDeviceRules.desktop}
                        onChange={(e) => setFormDeviceRules({ ...formDeviceRules, desktop: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs bg-slate-50/50 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TIME-SCHEDULED CAMPAIGNS */}
              {activeModalTab === 'time' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-800 block">Time Scheduled & Day of Week Routing</span>
                      Perfect for scheduling breakfast/lunch/dinner menus in restaurants, weekend-only redirects, or special late-night flash sales!
                    </div>
                  </div>

                  <div className="space-y-3">
                    {formTimeRules.map((rule, idx) => (
                      <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 space-y-3 relative">
                        <button 
                          type="button"
                          onClick={() => removeTimeRule(idx)}
                          className="absolute right-3 top-3 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Delete scheduling rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time Range (Start / End Time)</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="time"
                                required
                                value={rule.startTime}
                                onChange={(e) => updateTimeRule(idx, 'startTime', e.target.value)}
                                className="w-full p-2 border border-slate-200 bg-white rounded-lg outline-none text-xs"
                              />
                              <span className="text-slate-400 font-bold">to</span>
                              <input 
                                type="time"
                                required
                                value={rule.endTime}
                                onChange={(e) => updateTimeRule(idx, 'endTime', e.target.value)}
                                className="w-full p-2 border border-slate-200 bg-white rounded-lg outline-none text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active Days of the Week</label>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {[
                                { val: 1, label: 'M' },
                                { val: 2, label: 'T' },
                                { val: 3, label: 'W' },
                                { val: 4, label: 'T' },
                                { val: 5, label: 'F' },
                                { val: 6, label: 'S' },
                                { val: 0, label: 'S' },
                              ].map((day) => {
                                const isSelected = rule.daysOfWeek?.includes(day.val);
                                return (
                                  <button
                                    type="button"
                                    key={day.val}
                                    onClick={() => {
                                      const nextDays = isSelected
                                        ? rule.daysOfWeek.filter(d => d !== day.val)
                                        : [...(rule.daysOfWeek || []), day.val];
                                      updateTimeRule(idx, 'daysOfWeek', nextDays);
                                    }}
                                    className={`w-6.5 h-6.5 rounded-full text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${
                                      isSelected 
                                        ? 'bg-indigo-600 text-white shadow-xs' 
                                        : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active Destination Target URL</label>
                          <div className="relative">
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                              type="text"
                              required
                              placeholder="e.g. https://myrestaurant.com/menus/dinner-special.pdf"
                              value={rule.destinationUrl}
                              onChange={(e) => updateTimeRule(idx, 'destinationUrl', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-white rounded-lg outline-none text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addTimeRule}
                      className="py-2 px-3.5 border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer w-full"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Scheduled Time Frame Override Rule
                    </button>
                  </div>
                </div>
              )}

            </form>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex items-center justify-between shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-2">
                {activeModalTab !== 'basic' && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (activeModalTab === 'countries') setActiveModalTab('basic');
                      if (activeModalTab === 'devices') setActiveModalTab('countries');
                      if (activeModalTab === 'time') setActiveModalTab('devices');
                    }}
                    className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {activeModalTab !== 'time' ? (
                  <button 
                    type="button"
                    onClick={() => {
                      if (activeModalTab === 'basic') setActiveModalTab('countries');
                      else if (activeModalTab === 'countries') setActiveModalTab('devices');
                      else if (activeModalTab === 'devices') setActiveModalTab('time');
                    }}
                    className="py-2 px-4 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Next Tab
                  </button>
                ) : null}

                <button 
                  type="button"
                  onClick={handleSaveQr}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
                >
                  {modalMode === 'create' ? 'Deploy Router URL' : 'Save Router Changes'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
