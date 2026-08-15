import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Globe, Smartphone, Compass, RefreshCw, Calendar, 
  MapPin, Clock, Server, Eye, ExternalLink, Zap, Filter, 
  ChevronDown, HelpCircle, Activity, Heart, ArrowUpRight, Play, Copy, ArrowRight, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { auth, db } from '../../../../lib/firebase';
import { 
  listUserDynamicQRs, 
  fetchUserAllDynamicQRScans, 
  logDynamicQRScan,
  updateDynamicQR
} from '../../../../lib/dynamicQRService';
import { DynamicQR, DynamicQRScanLog } from '../../../../types';

// Simulation choices
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' }
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  US: ['New York', 'San Francisco', 'Chicago', 'Los Angeles', 'Miami'],
  GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  DE: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
  FR: ['Paris', 'Lyon', 'Marseille'],
  CA: ['Toronto', 'Vancouver', 'Montreal'],
  JP: ['Tokyo', 'Osaka', 'Kyoto'],
  AU: ['Sydney', 'Melbourne', 'Brisbane']
};

const DEVICES = ['Mobile', 'Desktop', 'Tablet'];

const OS_BY_DEVICE: Record<string, string[]> = {
  Mobile: ['iOS', 'Android'],
  Desktop: ['Windows', 'macOS', 'Linux'],
  Tablet: ['iPadOS', 'Android Tablet']
};

const BROWSERS_BY_OS: Record<string, string[]> = {
  iOS: ['Safari', 'Chrome'],
  Android: ['Chrome', 'Firefox', 'Samsung Internet'],
  Windows: ['Chrome', 'Edge', 'Firefox'],
  macOS: ['Safari', 'Chrome', 'Firefox'],
  Linux: ['Firefox', 'Chrome'],
  iPadOS: ['Safari', 'Chrome'],
  'Android Tablet': ['Chrome', 'Firefox']
};

const REFERRERS = [
  { code: 'Direct', label: 'Direct / QR Scanner App' },
  { code: 'Google Search', label: 'Google Search' },
  { code: 'Facebook', label: 'Facebook Campaign' },
  { code: 'Twitter/X', label: 'Twitter / X Post' },
  { code: 'LinkedIn', label: 'LinkedIn Share' },
  { code: 'Instagram', label: 'Instagram Bio Link' }
];

const COLORS = [
  '#4f46e5', // indigo-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#64748b'  // slate-500
];

// Fallback Country Map for Display
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  JP: 'Japan',
  AU: 'Australia'
};

// Internal seed function for demo mode
function generateDemoScans(qrs: DynamicQR[]): DynamicQRScanLog[] {
  const scans: DynamicQRScanLog[] = [];
  const qrIds = qrs.map(q => q.id);
  if (qrIds.length === 0) return [];

  const now = new Date();
  
  // Seed 180 scans over the last 30 days
  for (let i = 0; i < 180; i++) {
    const qrId = qrIds[Math.floor(Math.random() * qrIds.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    
    // Simulate natural hours (lunch and evenings peak)
    let hour = Math.floor(Math.random() * 24);
    if (Math.random() < 0.4) {
      hour = Math.random() < 0.5 ? 12 : 19;
    }
    const minute = Math.floor(Math.random() * 60);
    
    const timestamp = new Date(now.getTime());
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(hour, minute, 0, 0);

    const countryObj = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const country = countryObj.code;
    const cities = CITIES_BY_COUNTRY[country] || ['Main Region'];
    const city = cities[Math.floor(Math.random() * cities.length)];

    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const osList = OS_BY_DEVICE[device] || ['Other'];
    const os = osList[Math.floor(Math.random() * osList.length)];
    const browserList = BROWSERS_BY_OS[os] || ['Chrome'];
    const browser = browserList[Math.floor(Math.random() * browserList.length)];

    const referrerObj = REFERRERS[Math.floor(Math.random() * REFERRERS.length)];
    const referrer = referrerObj.code;

    scans.push({
      id: `demo-scan-${i}-${Math.random().toString(36).substr(2, 9)}`,
      qrId,
      timestamp: timestamp.toISOString(),
      device,
      browser,
      country,
      city,
      os,
      referrer
    });
  }

  // Sort chronologically descending
  return scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function AnalyticsModule() {
  const [qrs, setQrs] = useState<DynamicQR[]>([]);
  const [scans, setScans] = useState<DynamicQRScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQrId, setSelectedQrId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [user, setUser] = useState(auth.currentUser);
  
  // Simulation Modal state
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [simQrId, setSimQrId] = useState<string>('');
  const [simCountry, setSimCountry] = useState<string>('US');
  const [simCity, setSimCity] = useState<string>('New York');
  const [simDevice, setSimDevice] = useState<string>('Mobile');
  const [simOs, setSimOs] = useState<string>('iOS');
  const [simBrowser, setSimBrowser] = useState<string>('Safari');
  const [simReferrer, setSimReferrer] = useState<string>('Direct');
  const [simDateType, setSimDateType] = useState<'now' | 'past'>('now');
  const [simPastDays, setSimPastDays] = useState<number>(0);
  const [simPastHour, setSimPastHour] = useState<number>(12);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      fetchData(currentUser?.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid?: string) => {
    setLoading(true);
    try {
      if (uid) {
        // Real authenticated flow from Firestore
        const userQrs = await listUserDynamicQRs(uid);
        setQrs(userQrs);
        if (userQrs.length > 0) {
          const userScans = await fetchUserAllDynamicQRScans(uid);
          setScans(userScans);
        } else {
          setScans([]);
        }
      } else {
        // Fallback or demo local storage flow
        let localQrs: DynamicQR[] = [];
        const cachedQrs = localStorage.getItem('demo_dynamic_qrs');
        if (cachedQrs) {
          localQrs = JSON.parse(cachedQrs);
        } else {
          // Pre-populate with standard demo QRs
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
                scanCount: 82,
                uniqueScans: 70,
                lastScannedAt: '2026-08-02T18:30:00Z',
                deviceBreakdown: { Mobile: 60, Desktop: 15, Tablet: 7 },
                countryBreakdown: { US: 50, GB: 20, CA: 12 }
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
              countryRules: { FR: 'https://myrestaurant.com/menus/french-v1.pdf' },
              analytics: {
                scanCount: 55,
                uniqueScans: 48,
                lastScannedAt: '2026-08-02T19:12:00Z',
                deviceBreakdown: { Mobile: 45, Desktop: 6, Tablet: 4 },
                countryBreakdown: { FR: 35, US: 15, DE: 5 }
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
              deviceRules: { ios: 'https://apps.apple.com/app/mycustombrand' },
              analytics: {
                scanCount: 43,
                uniqueScans: 40,
                lastScannedAt: '2026-08-02T19:44:00Z',
                deviceBreakdown: { Mobile: 38, Desktop: 3, Tablet: 2 },
                countryBreakdown: { US: 25, GB: 10, AU: 8 }
              }
            }
          ];
          localQrs = DEMO_QRS;
          localStorage.setItem('demo_dynamic_qrs', JSON.stringify(DEMO_QRS));
        }
        setQrs(localQrs);

        // Fetch or seed demo scans
        const cachedScans = localStorage.getItem('demo_dynamic_qr_scans');
        if (cachedScans) {
          setScans(JSON.parse(cachedScans));
        } else {
          const generated = generateDemoScans(localQrs);
          setScans(generated);
          localStorage.setItem('demo_dynamic_qr_scans', JSON.stringify(generated));
        }
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(user?.uid);
    setRefreshing(false);
  };

  // Sync operating system list when device changes in simulator
  useEffect(() => {
    const list = OS_BY_DEVICE[simDevice] || [];
    if (list.length > 0 && !list.includes(simOs)) {
      setSimOs(list[0]);
    }
  }, [simDevice]);

  // Sync browser list when OS changes in simulator
  useEffect(() => {
    const list = BROWSERS_BY_OS[simOs] || [];
    if (list.length > 0 && !list.includes(simBrowser)) {
      setSimBrowser(list[0]);
    }
  }, [simOs]);

  // Sync city when country changes in simulator
  useEffect(() => {
    const list = CITIES_BY_COUNTRY[simCountry] || [];
    if (list.length > 0 && !list.includes(simCity)) {
      setSimCity(list[0]);
    }
  }, [simCountry]);

  // Initialize selected QR for simulator
  useEffect(() => {
    if (qrs.length > 0 && !simQrId) {
      const activeQrs = qrs.filter(q => q.status === 'active');
      if (activeQrs.length > 0) {
        setSimQrId(activeQrs[0].id);
      } else {
        setSimQrId(qrs[0].id);
      }
    }
  }, [qrs]);

  // Filtered Scans based on selection
  const filteredScans = useMemo(() => {
    let result = scans;
    if (selectedQrId !== 'all') {
      result = result.filter(s => s.qrId === selectedQrId);
    }
    
    const now = new Date();
    if (dateRange === '24h') {
      const boundary = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      result = result.filter(s => new Date(s.timestamp) >= boundary);
    } else if (dateRange === '7d') {
      const boundary = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(s => new Date(s.timestamp) >= boundary);
    } else if (dateRange === '30d') {
      const boundary = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(s => new Date(s.timestamp) >= boundary);
    }
    return result;
  }, [scans, selectedQrId, dateRange]);

  // Metric Computations (using primitive state references to stay highly reactive)
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseScans = selectedQrId === 'all' ? scans : scans.filter(s => s.qrId === selectedQrId);

    const total = baseScans.length;
    const today = baseScans.filter(s => new Date(s.timestamp) >= todayStart).length;
    const weekly = baseScans.filter(s => new Date(s.timestamp) >= sevenDaysAgo).length;
    const monthly = baseScans.filter(s => new Date(s.timestamp) >= thirtyDaysAgo).length;

    return { total, today, weekly, monthly };
  }, [scans, selectedQrId]);

  // Time Series Distribution Data
  const timeChartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const now = new Date();

    if (dateRange === '24h') {
      // Create hourly entries for past 24 hours
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = d.getHours().toString().padStart(2, '0') + ':00';
        dataMap[hourStr] = 0;
      }

      filteredScans.forEach(s => {
        const d = new Date(s.timestamp);
        const hourStr = d.getHours().toString().padStart(2, '0') + ':00';
        if (dataMap[hourStr] !== undefined) {
          dataMap[hourStr]++;
        }
      });
    } else {
      // Create daily entries for past 7 or 30 days
      const days = dateRange === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        dataMap[dayStr] = 0;
      }

      filteredScans.forEach(s => {
        const d = new Date(s.timestamp);
        const dayStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (dataMap[dayStr] !== undefined) {
          dataMap[dayStr]++;
        }
      });
    }

    return Object.keys(dataMap).map(name => ({
      name,
      Scans: dataMap[name]
    }));
  }, [filteredScans, dateRange]);

  // Heatmap Aggregator (Mon-Sun rows x 24h columns)
  const heatMapGrid = useMemo(() => {
    const grid: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    const daysMap = [1, 2, 3, 4, 5, 6, 0]; // Monday (0) to Sunday (6) in our layout

    filteredScans.forEach(s => {
      const d = new Date(s.timestamp);
      const rawDay = d.getDay();
      const rowIdx = daysMap.indexOf(rawDay);
      const colIdx = d.getHours();
      if (rowIdx !== -1 && colIdx >= 0 && colIdx < 24) {
        grid[rowIdx][colIdx]++;
      }
    });

    return grid;
  }, [filteredScans]);

  // Distributions calculators
  const countryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const c = s.country || 'Unknown';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map).map(code => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      value: map[code]
    })).sort((a, b) => b.value - a.value);
  }, [filteredScans]);

  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const c = s.city || 'Unknown';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filteredScans]);

  const deviceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const d = s.device || 'Mobile';
      map[d] = (map[d] || 0) + 1;
    });
    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    })).sort((a, b) => b.value - a.value);
  }, [filteredScans]);

  const osData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const os = s.os || 'Other';
      map[os] = (map[os] || 0) + 1;
    });
    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    })).sort((a, b) => b.value - a.value);
  }, [filteredScans]);

  const browserData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const b = s.browser || 'Other';
      map[b] = (map[b] || 0) + 1;
    });
    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    })).sort((a, b) => b.value - a.value);
  }, [filteredScans]);

  const referrerData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredScans.forEach(s => {
      const r = s.referrer || 'Direct';
      map[r] = (map[r] || 0) + 1;
    });
    return Object.keys(map).map(name => ({
      name,
      value: map[name]
    })).sort((a, b) => b.value - a.value);
  }, [filteredScans]);

  // Top QRs Ranking
  const topQRs = useMemo(() => {
    return qrs.map(qr => {
      const qrScans = scans.filter(s => s.qrId === qr.id);
      const count = qrScans.length;
      const lastScan = qrScans.length > 0 ? qrScans[0].timestamp : qr.analytics?.lastScannedAt || null;
      return {
        ...qr,
        scanCount: count,
        lastScannedAt: lastScan
      };
    }).sort((a, b) => b.scanCount - a.scanCount);
  }, [qrs, scans]);

  // Simulator Execution
  const handleTriggerSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQrId) return;

    setIsSimulating(true);
    setSimSuccessMsg(null);

    const targetQr = qrs.find(q => q.id === simQrId);
    const qrName = targetQr ? targetQr.name : 'Selected QR';

    // Construct timestamp
    let targetTimestamp = new Date().toISOString();
    if (simDateType === 'past') {
      const past = new Date();
      past.setDate(past.getDate() - simPastDays);
      past.setHours(simPastHour, Math.floor(Math.random() * 60), 0, 0);
      targetTimestamp = past.toISOString();
    }

    const payload: Omit<DynamicQRScanLog, 'id' | 'timestamp'> = {
      qrId: simQrId,
      device: simDevice,
      browser: simBrowser,
      country: simCountry,
      city: simCity,
      os: simOs,
      referrer: simReferrer
    };

    try {
      if (user) {
        // Authenticated Firestore Logging
        await logDynamicQRScan(simQrId, payload);
        
        // Refetch everything
        await fetchData(user.uid);
      } else {
        // Local Storage Flow
        const newScan: DynamicQRScanLog = {
          ...payload,
          id: `sim-scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: targetTimestamp
        };

        const updatedScans = [newScan, ...scans];
        localStorage.setItem('demo_dynamic_qr_scans', JSON.stringify(updatedScans));
        setScans(updatedScans);

        // Also increment aggregate analytics on the QR config
        const updatedQrs = qrs.map(q => {
          if (q.id === simQrId) {
            const ana = q.analytics || { scanCount: 0, uniqueScans: 0, lastScannedAt: null, deviceBreakdown: {}, countryBreakdown: {} };
            const devKey = simDevice;
            const cntKey = simCountry;
            return {
              ...q,
              analytics: {
                ...ana,
                scanCount: (ana.scanCount || 0) + 1,
                lastScannedAt: targetTimestamp,
                deviceBreakdown: {
                  ...(ana.deviceBreakdown || {}),
                  [devKey]: ((ana.deviceBreakdown?.[devKey]) || 0) + 1
                },
                countryBreakdown: {
                  ...(ana.countryBreakdown || {}),
                  [cntKey]: ((ana.countryBreakdown?.[cntKey]) || 0) + 1
                }
              }
            };
          }
          return q;
        });
        localStorage.setItem('demo_dynamic_qrs', JSON.stringify(updatedQrs));
        setQrs(updatedQrs);
      }

      setSimSuccessMsg(`Successfully logged a simulated scan for "${qrName}"!`);
      setTimeout(() => setSimSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Simulation logging failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const getDayLabel = (idx: number) => {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx];
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase animate-pulse">Analyzing platform scans...</p>
      </div>
    );
  }

  return (
    <div id="marketing-analytics-dashboard" className="space-y-6">
      {/* Module Title / Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-sm">Dynamic Redirection Telemetry</span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Dynamic QR Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Track redirects, geolocations, physical devices, browser families, and active referrers in real-time.</p>
        </div>

        {/* Filters Panel & Simulator Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* QR Selection Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedQrId}
              onChange={(e) => setSelectedQrId(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Dynamic QRs</option>
              {qrs.map(qr => (
                <option key={qr.id} value={qr.id}>{qr.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  dateRange === range 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center"
            title="Refresh Scan Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Test Simulator Button */}
          <button
            onClick={() => setIsSimulateOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Activity className="w-3.5 h-3.5" />
            Simulate Scan
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {simSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 flex items-start gap-2.5 shadow-3xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 font-semibold">{simSuccessMsg}</p>
        </div>
      )}

      {/* Analytics Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Scans Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Scans</span>
            <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stats.total.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">All recorded redirects</p>
        </div>

        {/* Today's Scans Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Scans</span>
            <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stats.today.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Since 12:00 AM local time</p>
        </div>

        {/* Weekly Scans Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Volume</span>
            <div className="p-1 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stats.weekly.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Past 7 days running window</p>
        </div>

        {/* Monthly Scans Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Volume</span>
            <div className="p-1 bg-violet-50 text-violet-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stats.monthly.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Past 30 days running window</p>
        </div>
      </div>

      {/* Main Graph Grid (Time Graph & Top QR Codes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Graph */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                Time Graph
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Scan density spikes chronologically.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm uppercase">
              {dateRange === '24h' ? 'Hourly View' : 'Daily View'}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Scans" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top QR Codes Ranking Table */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Play className="w-4 h-4 text-emerald-500 rotate-90" />
              Top QR Codes
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Best performing links ranked by scan volume.</p>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {topQRs.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-xs">No active dynamic QRs found.</p>
                </div>
              ) : (
                topQRs.map((qr, index) => (
                  <div key={qr.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{qr.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider truncate mt-0.5">
                          {qr.campaign || 'No Campaign'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs font-black text-slate-900">{qr.scanCount} scans</p>
                      <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
                        {qr.lastScannedAt ? new Date(qr.lastScannedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Never'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center justify-between mt-4">
            <span>Total Tracked Codes: {qrs.length}</span>
            <span className="text-indigo-600 font-bold flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => setSelectedQrId('all')}>
              Clear Filter <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Engagement Heat Map */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            Hourly Engagement Heat Map
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Identify peak days and hour blocks for targeted marketing drops.</p>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[760px] pb-2">
            {/* Heatmap column headers */}
            <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1.5 text-center">
              <div></div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-[8px] font-black text-slate-400 uppercase">
                  {h === 0 ? '12a' : h === 12 ? '12p' : h % 4 === 0 ? (h > 12 ? `${h-12}p` : `${h}a`) : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            <div className="space-y-1">
              {heatMapGrid.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 items-center">
                  <div className="text-[10px] font-bold text-slate-500 text-left pr-2">
                    {getDayLabel(rIdx).slice(0, 3)}
                  </div>
                  {row.map((val, cIdx) => {
                    let intensityClass = 'bg-slate-50 hover:bg-slate-100 border-slate-100';
                    if (val > 0 && val <= 2) intensityClass = 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100/50';
                    else if (val > 2 && val <= 5) intensityClass = 'bg-indigo-200 hover:bg-indigo-300 border-indigo-200';
                    else if (val > 5 && val <= 10) intensityClass = 'bg-indigo-400 hover:bg-indigo-500 border-indigo-300';
                    else if (val > 10) intensityClass = 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white';

                    return (
                      <div
                        key={cIdx}
                        className={`h-7 rounded-sm border flex items-center justify-center text-[9px] font-bold transition-all relative group cursor-help ${intensityClass}`}
                      >
                        {val > 0 ? val : ''}
                        {/* Custom tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-slate-900 text-white text-[9px] py-1 px-2 rounded-lg whitespace-nowrap shadow-md">
                          {getDayLabel(rIdx)}, {cIdx.toString().padStart(2, '0')}:00 — <span className="font-extrabold">{val} scans</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-4 mt-4 text-[9px] font-semibold text-slate-400 justify-end border-t border-slate-100 pt-3">
          <span>Scan Density:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-slate-50 border border-slate-150 rounded-sm" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-50 border border-indigo-100 rounded-sm" />
            <span>1-2</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-200 border border-indigo-200 rounded-sm" />
            <span>3-5</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-400 border border-indigo-300 rounded-sm" />
            <span>6-10</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-indigo-600 border border-indigo-500 rounded-sm" />
            <span>11+</span>
          </div>
        </div>
      </div>

      {/* Distributions (Countries, Cities, Referrers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countries Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Globe className="w-4 h-4 text-indigo-500" />
            Countries
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Scan distribution by nation origin.</p>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 overflow-y-auto max-h-40 pr-1">
            {countryData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No country logs yet.</p>
            ) : (
              countryData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 truncate">{entry.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-900 font-bold">{entry.value} scans</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      ({Math.round((entry.value / stats.total) * 100) || 0}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cities Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Cities
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Top micro-geolocations of scans.</p>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {cityData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No city logs yet.</p>
            ) : (
              cityData.map((entry, idx) => {
                const pct = Math.round((entry.value / stats.total) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{entry.name}</span>
                      <span className="text-slate-950">{entry.value} ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Referrers Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Compass className="w-4 h-4 text-amber-500" />
            Referrers
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Traffic sources redirecting to your destination.</p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={referrerData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {referrerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 overflow-y-auto max-h-40 pr-1">
            {referrerData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No referral logs yet.</p>
            ) : (
              referrerData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }} />
                    <span className="text-slate-600 truncate">{entry.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-900 font-bold">{entry.value} scans</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">
                      ({Math.round((entry.value / stats.total) * 100) || 0}%)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hardware Distribution Devices, OS, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hardware Devices Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            Devices
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Client hardware form factor analysis.</p>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {deviceData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No device logs yet.</p>
            ) : (
              deviceData.map((entry, idx) => {
                const pct = Math.round((entry.value / stats.total) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{entry.name}</span>
                      <span className="text-slate-950">{entry.value} ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operating Systems Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Server className="w-4 h-4 text-emerald-500" />
            Operating Systems
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Core software platform distribution.</p>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {osData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No OS logs yet.</p>
            ) : (
              osData.map((entry, idx) => {
                const pct = Math.round((entry.value / stats.total) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{entry.name}</span>
                      <span className="text-slate-950">{entry.value} ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Browsers Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Eye className="w-4 h-4 text-amber-500" />
            Browsers
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Web browser client application metrics.</p>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {browserData.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-12">No browser logs yet.</p>
            ) : (
              browserData.map((entry, idx) => {
                const pct = Math.round((entry.value / stats.total) * 100) || 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-700">{entry.name}</span>
                      <span className="text-slate-950">{entry.value} ({pct}%)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Simulator Modal Drawer */}
      {isSimulateOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          {/* Backdrop Dismiss */}
          <div className="absolute inset-0" onClick={() => setIsSimulateOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in-right z-10 border-l border-slate-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Activity className="text-indigo-600 w-4 h-4" />
                  Trigger Telemetry Simulator
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Generate customized scan events to test your tracking logs.</p>
              </div>
              <button 
                onClick={() => setIsSimulateOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <Clock className="w-4 h-4 rotate-45" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleTriggerSimulation} className="flex-1 overflow-y-auto p-5 space-y-4">
              {qrs.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs space-y-1.5">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    No Active QR Codes
                  </p>
                  <p>You must create at least one Dynamic QR Code in the "Dynamic QR" module before you can simulate scans.</p>
                </div>
              ) : (
                <>
                  {/* Select Target QR */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target QR Code</label>
                    <select
                      value={simQrId}
                      onChange={(e) => setSimQrId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {qrs.map(qr => (
                        <option key={qr.id} value={qr.id}>{qr.name} ({qr.status})</option>
                      ))}
                    </select>
                  </div>

                  {/* Device Form Factor */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Hardware</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DEVICES.map(dev => (
                        <button
                          key={dev}
                          type="button"
                          onClick={() => setSimDevice(dev)}
                          className={`py-2 text-xs font-bold rounded-xl border text-center cursor-pointer transition-all ${
                            simDevice === dev
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {dev}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hardware OS & Browser */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating System</label>
                      <select
                        value={simOs}
                        onChange={(e) => setSimOs(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {(OS_BY_DEVICE[simDevice] || []).map(os => (
                          <option key={os} value={os}>{os}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Web Browser</label>
                      <select
                        value={simBrowser}
                        onChange={(e) => setSimBrowser(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {(BROWSERS_BY_OS[simOs] || []).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location (Country & City) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
                      <select
                        value={simCountry}
                        onChange={(e) => setSimCountry(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                      <select
                        value={simCity}
                        onChange={(e) => setSimCity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {(CITIES_BY_COUNTRY[simCountry] || []).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Referrer Source */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referral Source</label>
                    <select
                      value={simReferrer}
                      onChange={(e) => setSimReferrer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      {REFERRERS.map(ref => (
                        <option key={ref.code} value={ref.code}>{ref.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Simulated Timestamp Control */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Scan Timestamp</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="simDateType"
                          checked={simDateType === 'now'}
                          onChange={() => setSimDateType('now')}
                          className="accent-indigo-600"
                        />
                        <span>Current Time (Just Now)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="simDateType"
                          checked={simDateType === 'past'}
                          onChange={() => setSimDateType('past')}
                          className="accent-indigo-600"
                        />
                        <span>Past History Entry</span>
                      </label>
                    </div>

                    {simDateType === 'past' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-150 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Days Ago</label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={simPastDays}
                            onChange={(e) => setSimPastDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Hour (0-23)</label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={simPastHour}
                            onChange={(e) => setSimPastHour(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-150 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSimulateOpen(false)}
                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={qrs.length === 0 || isSimulating}
                onClick={handleTriggerSimulation}
                className="flex-1 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
