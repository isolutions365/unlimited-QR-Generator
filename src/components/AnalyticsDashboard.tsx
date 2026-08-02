import React from 'react';
import { useTranslation } from '../utils/i18n';

import { ScanLog, QRProject } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { BarChart3, Globe, Tablet, Users, Grid, GitCompare, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import D3WorldHeatmap from './D3WorldHeatmap';

const PROJECT_COLORS = [
  '#4f46e5', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

interface AnalyticsDashboardProps {
  scans: ScanLog[];
  projects: QRProject[];
  onPurgeAll?: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  type?: 'mini' | 'timeline' | 'trends' | 'compare' | 'pie' | 'bar';
}

const CustomChartTooltip = ({ active, payload, label, type }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const fullTimestamp = dataPoint?.fullTimestamp || label || '';

  if (type === 'mini') {
    const scanVal = payload[0]?.value || 0;
    return (
      <div className="bg-slate-900/95 text-white px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-700/60 text-[11px] backdrop-blur-xs font-sans">
        <div className="text-slate-400 text-[10px]">{fullTimestamp}</div>
        <div className="font-semibold text-indigo-300 font-mono">
          {scanVal} {scanVal === 1 ? 'scan' : 'scans'}
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    const scanVal = payload[0]?.value || 0;
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/70 text-xs backdrop-blur-md min-w-[180px] font-sans">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Timestamp / Date</span>
          <span className="font-mono text-indigo-300 text-[11px] font-medium">{fullTimestamp}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30" />
            <span className="font-medium">Total Scans:</span>
          </div>
          <span className="font-mono font-bold text-white text-sm">{scanVal} {scanVal === 1 ? 'scan' : 'scans'}</span>
        </div>
      </div>
    );
  }

  if (type === 'trends') {
    const totalForDate = payload.reduce((acc: number, item: any) => acc + (typeof item.value === 'number' ? item.value : 0), 0);
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/70 text-xs backdrop-blur-md min-w-[220px] font-sans">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Timestamp / Date</span>
          <span className="font-mono text-indigo-300 text-[11px] font-medium">{fullTimestamp}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, idx: number) => {
            const count = typeof entry.value === 'number' ? entry.value : 0;
            const pct = totalForDate > 0 ? Math.round((count / totalForDate) * 100) : 0;
            return (
              <div key={entry.dataKey || idx} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.stroke }} />
                  <span className="text-slate-200 truncate font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono shrink-0">
                  <span className="font-bold text-white">{count} {count === 1 ? 'scan' : 'scans'}</span>
                  <span className="text-[10px] text-slate-400">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
        {payload.length > 1 && (
          <div className="border-t border-slate-800/80 mt-2 pt-1.5 flex justify-between text-[11px] font-medium text-slate-400">
            <span>Daily Total:</span>
            <span className="font-mono font-bold text-indigo-300">{totalForDate} {totalForDate === 1 ? 'scan' : 'scans'}</span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'compare') {
    const itemA = payload.find((p: any) => p.dataKey === 'scansA');
    const itemB = payload.find((p: any) => p.dataKey === 'scansB');
    const scansA = itemA?.value || 0;
    const scansB = itemB?.value || 0;
    const projAName = itemA?.name || 'Project A';
    const projBName = itemB?.name || 'Project B';
    const diff = scansA - scansB;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/70 text-xs backdrop-blur-md min-w-[220px] font-sans">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Timestamp / Date</span>
          <span className="font-mono text-indigo-300 text-[11px] font-medium">{fullTimestamp}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-slate-200 font-medium truncate">{projAName}:</span>
            </div>
            <span className="font-mono font-bold text-indigo-300">{scansA} {scansA === 1 ? 'scan' : 'scans'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-200 font-medium truncate">{projBName}:</span>
            </div>
            <span className="font-mono font-bold text-emerald-300">{scansB} {scansB === 1 ? 'scan' : 'scans'}</span>
          </div>
        </div>
        <div className="border-t border-slate-800/80 mt-2 pt-1.5 flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Difference:</span>
          <span className={diff > 0 ? 'text-indigo-400 font-semibold' : diff < 0 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            {diff > 0 ? `+${diff} for A` : diff < 0 ? `+${Math.abs(diff)} for B` : 'Equal'}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const item = payload[0];
    const val = item?.value || 0;
    const name = item?.name || '';
    const color = item?.payload?.color || item?.fill || '#4f46e5';
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/70 text-xs backdrop-blur-md font-sans min-w-[140px]">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold text-slate-200">{name}</span>
        </div>
        <div className="font-mono text-slate-300 text-[11px] flex justify-between gap-3">
          <span>Scan Count:</span>
          <span className="font-bold text-white">{val} {val === 1 ? 'scan' : 'scans'}</span>
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    const item = payload[0];
    const val = item?.value || 0;
    const name = item?.payload?.name || item?.name || '';
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/70 text-xs backdrop-blur-md font-sans min-w-[140px]">
        <div className="font-semibold text-emerald-400 mb-0.5">{name}</div>
        <div className="font-mono text-slate-300 text-[11px] flex justify-between gap-3">
          <span>Scan Count:</span>
          <span className="font-bold text-white">{val} {val === 1 ? 'scan' : 'scans'}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default function AnalyticsDashboard({
   scans, projects, onPurgeAll }: AnalyticsDashboardProps) {
  const { t } = useTranslation();

  const [hoveredCountry, setHoveredCountry] = React.useState<{ name: string; count: number; code: string } | null>(null);

  // Project selection state for side-by-side comparison
  const [compareProjectAId, setCompareProjectAId] = React.useState<string>('');
  const [compareProjectBId, setCompareProjectBId] = React.useState<string>('');

  // Date range picker states for side-by-side comparison
  const [compareRangeType, setCompareRangeType] = React.useState<'7days' | '30days' | 'custom'>('7days');
  const [compareStartDate, setCompareStartDate] = React.useState<string>('2026-06-22');
  const [compareEndDate, setCompareEndDate] = React.useState<string>('2026-06-29');

  // Time-range filter states for scan count and trend graphs
  const [timelineDays, setTimelineDays] = React.useState<7 | 30>(7);
  const [trendsDays, setTrendsDays] = React.useState<7 | 30>(30);

  // Sync selected compare projects with actual list
  React.useEffect(() => {
    if (projects && projects.length > 0) {
      if (!compareProjectAId || !projects.find(p => p.id === compareProjectAId)) {
        setCompareProjectAId(projects[0].id);
      }
      if (!compareProjectBId || !projects.find(p => p.id === compareProjectBId)) {
        setCompareProjectBId(projects[1]?.id || projects[0].id);
      }
    }
  }, [projects, compareProjectAId, compareProjectBId]);

  const projectA = projects.find(p => p.id === compareProjectAId);
  const projectB = projects.find(p => p.id === compareProjectBId);

  // Timeframe filter function for comparison data
  const filteredScansByTimeframe = React.useMemo(() => {
    const now = new Date('2026-06-29T23:59:59'); // Base on current user session metadata date

    let startMs = 0;
    let endMs = Infinity;

    if (compareRangeType === '7days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      startMs = d.getTime();
      endMs = now.getTime();
    } else if (compareRangeType === '30days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      startMs = d.getTime();
      endMs = now.getTime();
    } else if (compareRangeType === 'custom') {
      if (compareStartDate) {
        const dStart = new Date(compareStartDate + 'T00:00:00');
        startMs = dStart.getTime();
      } else {
        startMs = 0;
      }
      if (compareEndDate) {
        const dEnd = new Date(compareEndDate + 'T23:59:59');
        endMs = dEnd.getTime();
      } else {
        endMs = Infinity;
      }
    }

    return (projectScans: ScanLog[]) => {
      return projectScans.filter(s => {
        const t = new Date(s.timestamp).getTime();
        return t >= startMs && t <= endMs;
      });
    };
  }, [compareRangeType, compareStartDate, compareEndDate]);

  const rawScansA = React.useMemo(() => scans.filter(s => s.projectId === compareProjectAId), [scans, compareProjectAId]);
  const rawScansB = React.useMemo(() => scans.filter(s => s.projectId === compareProjectBId), [scans, compareProjectBId]);

  const scansA = React.useMemo(() => filteredScansByTimeframe(rawScansA), [rawScansA, filteredScansByTimeframe]);
  const scansB = React.useMemo(() => filteredScansByTimeframe(rawScansB), [rawScansB, filteredScansByTimeframe]);

  // Aggregate locations count
  const locsA = React.useMemo(() => new Set(scansA.map(s => s.approxLocation).filter(Boolean)).size, [scansA]);
  const locsB = React.useMemo(() => new Set(scansB.map(s => s.approxLocation).filter(Boolean)).size, [scansB]);

  // Aggregate top browser
  const getTopBrowser = (filteredScans: ScanLog[]) => {
    if (filteredScans.length === 0) return String(t('common.none', 'None'));
    const browsers: { [key: string]: number } = {};
    filteredScans.forEach(s => {
      const b = s.browser || 'Chrome';
      browsers[b] = (browsers[b] || 0) + 1;
    });
    return Object.keys(browsers).reduce((a, b) => browsers[a] > browsers[b] ? a : b, String(t('common.unknown', 'Unknown')));
  };
  const topBrowserA = React.useMemo(() => getTopBrowser(scansA), [scansA]);
  const topBrowserB = React.useMemo(() => getTopBrowser(scansB), [scansB]);

  // Combine daily timeline data for overlay
  const getCompareTimelineData = () => {
    const dates: { [key: string]: { date: string; fullTimestamp: string; scansA: number; scansB: number } } = {};
    const daysList: string[] = [];

    let numDays = 7;
    let startDateObj = new Date('2026-06-29T23:59:59');

    if (compareRangeType === '7days') {
      numDays = 7;
      startDateObj.setDate(startDateObj.getDate() - 6);
    } else if (compareRangeType === '30days') {
      numDays = 30;
      startDateObj.setDate(startDateObj.getDate() - 29);
    } else if (compareRangeType === 'custom') {
      const dStart = new Date(compareStartDate + 'T00:00:00');
      const dEnd = new Date(compareEndDate + 'T23:59:59');
      const diffTime = Math.abs(dEnd.getTime() - dStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      numDays = Math.min(Math.max(diffDays, 1), 180); // Clamp between 1 day and 180 days to avoid UI crash
      startDateObj = dStart;
    }

    // Initialize all daily keys
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDateObj);
      d.setDate(startDateObj.getDate() + i);
      const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const fullTimestamp = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      if (!dates[dayString]) {
        dates[dayString] = { date: dayString, fullTimestamp, scansA: 0, scansB: 0 };
        daysList.push(dayString);
      }
    }

    scansA.forEach(s => {
      try {
        const d = new Date(s.timestamp);
        const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dayString] !== undefined) {
          dates[dayString].scansA++;
        }
      } catch {}
    });

    scansB.forEach(s => {
      try {
        const d = new Date(s.timestamp);
        const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dayString] !== undefined) {
          dates[dayString].scansB++;
        }
      } catch {}
    });

    return daysList.map(dayString => dates[dayString]);
  };

  const compareTimelineData = React.useMemo(() => getCompareTimelineData(), [scansA, scansB, compareRangeType, compareStartDate, compareEndDate]);

  // Normalize location strings for heatmap coordination mapping
  const normalizeCountry = (loc: string): string => {
    if (!loc) return 'Global';
    const l = ((val) => (val || '').trim())(loc.toLowerCase());
    if (l.includes('united states') || l === 'us' || l === 'usa') return 'United States';
    if (l.includes('united kingdom') || l === 'uk' || l === 'gb' || l === 'great britain') return 'United Kingdom';
    if (l.includes('germany') || l === 'de') return 'Germany';
    if (l.includes('france') || l === 'fr') return 'France';
    if (l.includes('ireland') || l === 'ie') return 'Ireland';
    if (l.includes('japan') || l === 'jp') return 'Japan';
    if (l.includes('canada') || l === 'ca') return 'Canada';
    if (l.includes('australia') || l === 'au') return 'Australia';
    if (l.includes('india') || l === 'in') return 'India';
    if (l.includes('china') || l === 'cn') return 'China';
    if (l.includes('brazil') || l === 'br') return 'Brazil';
    if (l.includes('south africa') || l === 'za') return 'South Africa';
    return 'Global';
  };

  // Geographical heatmap aggregation
  const getGeographicalData = () => {
    const counts: { [key: string]: number } = {};
    scans.forEach(s => {
      const country = normalizeCountry(s.approxLocation);
      counts[country] = (counts[country] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    const countryCoordinates: { [key: string]: { x: number; y: number; code: string } } = {
      'Canada': { x: 160, y: 100, code: 'CA' },
      'United States': { x: 150, y: 150, code: 'US' },
      'Brazil': { x: 170, y: 310, code: 'BR' },
      'Ireland': { x: 395, y: 120, code: 'IE' },
      'United Kingdom': { x: 410, y: 120, code: 'UK' },
      'France': { x: 415, y: 145, code: 'FR' },
      'Germany': { x: 435, y: 135, code: 'DE' },
      'South Africa': { x: 440, y: 370, code: 'ZA' },
      'India': { x: 570, y: 210, code: 'IN' },
      'China': { x: 650, y: 165, code: 'CN' },
      'Japan': { x: 720, y: 155, code: 'JP' },
      'Australia': { x: 710, y: 345, code: 'AU' },
      'Global': { x: 500, y: 280, code: 'GL' }
    };

    return Object.keys(counts).map(name => {
      const coords = countryCoordinates[name] || countryCoordinates['Global'];
      const count = counts[name];
      const intensity = count / maxCount;
      return {
        name,
        count,
        intensity,
        x: coords.x,
        y: coords.y,
        code: coords.code
      };
    }).sort((a, b) => b.count - a.count);
  };

  // 1. Daily Scan Timeline aggregation
  const getTimelineData = () => {
    const dates: { [key: string]: { date: string; fullTimestamp: string; scans: number } } = {};
    // Populate last timelineDays of dates initialized to 0
    for (let i = timelineDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const fullTimestamp = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      dates[dayString] = { date: dayString, fullTimestamp, scans: 0 };
    }

    scans.forEach(s => {
      try {
        const d = new Date(s.timestamp);
        const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dayString] !== undefined) {
          dates[dayString].scans++;
        }
      } catch {}
    });

    return Object.values(dates);
  };

  // 2. Device Breakdown aggregation
  const getDeviceData = () => {
    const devices: { [key: string]: number } = { Mobile: 0, Desktop: 0, Tablet: 0, Others: 0 };
    scans.forEach(s => {
      const dev = s.deviceType || 'Desktop';
      if (devices[dev] !== undefined) {
        devices[dev]++;
      } else {
        devices.Others++;
      }
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#6b7280'];
    return Object.keys(devices).map((name, i) => ({
      name,
      value: devices[name],
      color: colors[i]
    })).filter(d => d.value > 0);
  };

  // 3. Browser Breakdown aggregation
  const getBrowserData = () => {
    const browsers: { [key: string]: number } = {};
    scans.forEach(s => {
      const b = s.browser || 'Unknown';
      browsers[b] = (browsers[b] || 0) + 1;
    });

    return Object.keys(browsers).map(name => ({
      name,
      value: browsers[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5);
  };

  // Aggregated totals
  const totalScans = scans.length;
  const activeTrackedQRs = projects.filter(p => p.trackingEnabled).length;
  const uniqueLocations = Array.from(new Set(scans.map(s => s.approxLocation).filter(Boolean))).length;

  const timelineData = getTimelineData();
  const deviceData = getDeviceData();
  const browserData = getBrowserData();
  const geoData = getGeographicalData();

  // Selected project IDs for the 30-day trend line chart
  const [selectedTrendProjectIds, setSelectedTrendProjectIds] = React.useState<string[]>([]);

  // Initialize selectedTrendProjectIds with all project IDs on load or change
  React.useEffect(() => {
    if (projects && projects.length > 0 && selectedTrendProjectIds.length === 0) {
      setSelectedTrendProjectIds(projects.slice(0, 4).map(p => p.id));
    }
  }, [projects, selectedTrendProjectIds.length]);

  const activeTrendProjectIds = React.useMemo(() => {
    return selectedTrendProjectIds.filter(id => projects.some(p => p.id === id));
  }, [selectedTrendProjectIds, projects]);

  const trendsData = React.useMemo(() => {
    const dates: { [key: string]: { dateLabel: string; fullTimestamp: string; [projectId: string]: number | string } } = {};
    const daysList: string[] = [];

    // Populate last trendsDays of dates initialized to 0
    for (let i = trendsDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const fullTimestamp = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      
      dates[dayLabel] = {
        dateLabel: dayLabel,
        fullTimestamp,
      };
      
      // Initialize counts to 0 for all projects
      projects.forEach(p => {
        dates[dayLabel][p.id] = 0;
      });
      
      daysList.push(dayLabel);
    }

    // Populate counts from scans
    scans.forEach(s => {
      try {
        if (!s.timestamp || !s.projectId) return;
        const d = new Date(s.timestamp);
        const dayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        if (dates[dayLabel] !== undefined) {
          if (typeof dates[dayLabel][s.projectId] === 'number') {
            (dates[dayLabel][s.projectId] as number)++;
          }
        }
      } catch {}
    });

    return daysList.map(label => dates[label]);
  }, [scans, projects, trendsDays]);

  const getProjectColor = (index: number) => {
    return PROJECT_COLORS[index % PROJECT_COLORS.length];
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            {t('analytics.title', 'Real-Time QR Scan Analytics')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{t('analytics.desc', 'Live tracking telemetry, browser client data, and location logs.')}</p>
        </div>
        {onPurgeAll && scans.length > 0 && (
          <button
            type="button"
            onClick={onPurgeAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            {t('analytics.clearLog', 'Clear Analytics Log')}
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] sm:text-xs font-medium">{t('analytics.statScans', 'Total Scan Counts')}</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{totalScans}</span>
          </div>
          <div className="h-7 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="miniColorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  wrapperStyle={{ outline: 'none' }}
                  content={(props: any) => <CustomChartTooltip {...props} type="mini" />}
                />
                <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={1.5} fillOpacity={1} fill="url(#miniColorScans)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        >
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Grid className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] sm:text-xs font-medium">{t('analytics.statDistinct', 'Tracked QR Codes')}</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{activeTrackedQRs}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('analytics.trackingEnabled', 'Real-time tracking enabled')}</span>
          </div>
        </motion.div>

        <motion.div 
          className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        >
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Globe className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs font-medium">{t('analytics.approxCountries', 'Approx Countries')}</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{uniqueLocations || 0}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 font-medium">
            <span>{t('analytics.telemetryResolved', 'Locations resolved via client telemetry')}</span>
          </div>
        </motion.div>
      </div>

      {/* Analytics empty fallback */}
      {totalScans === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-100 rounded-xl bg-slate-50/20">
          <Tablet className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-gray-700">{t('analytics.noLogs', 'No Analytics Telemetry Yet')}</h3>
          <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto">
            {t('analytics.noLogsDesc', 'Scan your active QR codes to start receiving live tracking telemetry and analytics.')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Timeline Chart Card */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">{t('analytics.clickScanMetrics', 'Click Scan Metrics')}</h3>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/40 shrink-0">
                <button
                  type="button"
                  id="btn-timeline-7"
                  onClick={() => setTimelineDays(7)}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ timelineDays === 7 ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700' }`}
                >
                  {t('analytics.last7Days', 'Last 7 Days')}
                </button>
                <button
                  type="button"
                  id="btn-timeline-30"
                  onClick={() => setTimelineDays(30)}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ timelineDays === 30 ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700' }`}
                >
                  {t('analytics.last30Days', 'Last 30 Days')}
                </button>
              </div>
            </div>
            <motion.div 
              className="h-48 w-full"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickLine={false} style={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} width={20} style={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} content={(props: any) => <CustomChartTooltip {...props} type="timeline" />} />
                  <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Daily Scan Trends per Selected Project */}
          <motion.div 
            className="p-5 rounded-xl border border-gray-100 bg-white flex flex-col gap-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">{t('analytics.dailyScanTrends', 'Daily Scan Trends')}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t('analytics.dailyTrendsDesc', 'Toggle projects to compare active trends and daily trajectories over the last {days} days.', { days: trendsDays })}</p>
                </div>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/40 shrink-0">
                <button
                  type="button"
                  id="btn-trends-7"
                  onClick={() => setTrendsDays(7)}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ trendsDays === 7 ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700' }`}
                >
                  {t('analytics.last7Days', 'Last 7 Days')}
                </button>
                <button
                  type="button"
                  id="btn-trends-30"
                  onClick={() => setTrendsDays(30)}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ trendsDays === 30 ? 'bg-white text-indigo-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700' }`}
                >
                  {t('analytics.last30Days', 'Last 30 Days')}
                </button>
              </div>
            </div>

            {/* Toggle Project Pills */}
            <div className="flex flex-wrap gap-2">
              {projects.map((proj, idx) => {
                const isSelected = activeTrendProjectIds.includes(proj.id);
                const color = getProjectColor(idx);
                
                return (
                  <motion.button
                    key={proj.id}
                    type="button"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.25 + idx * 0.04, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isSelected) {
                        if (activeTrendProjectIds.length > 1) {
                          setSelectedTrendProjectIds(prev => prev.filter(id => id !== proj.id));
                        }
                      } else {
                        setSelectedTrendProjectIds(prev => [...prev, proj.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isSelected 
                        ? 'shadow-xs border-transparent' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    style={isSelected ? {
                      backgroundColor: `${color}15`, // ~8% opacity
                      borderColor: color,
                      color: color,
                    } : undefined}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span>{proj.name || t('common.untitled', 'Untitled')}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Recharts Line Chart */}
            <motion.div 
              className="h-64 w-full"
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dateLabel" tickLine={false} style={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} style={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    wrapperStyle={{ outline: 'none' }} 
                    content={(props: any) => <CustomChartTooltip {...props} type="trends" />} 
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  {activeTrendProjectIds.map((projectId, idx) => {
                    const proj = projects.find(p => p.id === projectId);
                    if (!proj) return null;
                    return (
                      <Line
                        key={projectId}
                        type="monotone"
                        name={proj.name || t('common.untitled', 'Untitled')}
                        dataKey={projectId}
                        stroke={getProjectColor(idx)}
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>

          {/* Side-by-Side QR Project Comparison Overlay */}
          <div className="p-5 rounded-xl border border-gray-100 bg-white flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">{t('analytics.sideBySideTitle', 'Side-by-Side Project Performance')}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t('analytics.sideBySideDesc', 'Select and overlay two different QR projects to cross-examine telemetry trends.')}</p>
                </div>
              </div>

              {projects.length >= 2 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Selector A */}
                  <select
                    id="compare-project-a"
                    value={compareProjectAId}
                    onChange={(e) => setCompareProjectAId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="">{p.name || t('common.untitled', 'Untitled')}</option>
                    ))}
                  </select>

                  <span className="text-[10px] font-bold text-slate-400 uppercase px-1">{t('analytics.vs', 'VS')}</span>

                  {/* Selector B */}
                  <select
                    id="compare-project-b"
                    value={compareProjectBId}
                    onChange={(e) => setCompareProjectBId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-gray-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="">{p.name || t('common.untitled', 'Untitled')}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* Timeframe selector controls */}
            {projects.length >= 2 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-50/50 border border-slate-100/80 rounded-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {t('analytics.timeframe', 'Timeframe:')}
                  </span>
                  
                  {/* Presets */}
                  <div className="flex bg-slate-200/50 rounded-lg p-0.5 border border-slate-200/40">
                    <button
                      type="button"
                      id="btn-range-7days"
                      onClick={() => setCompareRangeType('7days')}
                      className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ compareRangeType === '7days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 ' }`}
                    >
                      {t('analytics.range7Days', '7 Days')}
                    </button>
                    <button
                      type="button"
                      id="btn-range-30days"
                      onClick={() => setCompareRangeType('30days')}
                      className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ compareRangeType === '30days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 ' }`}
                    >
                      {t('analytics.range30Days', '30 Days')}
                    </button>
                    <button
                      type="button"
                      id="btn-range-custom"
                      onClick={() => setCompareRangeType('custom')}
                      className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-md transition-all cursor-pointer ${ compareRangeType === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 ' }`}
                    >
                      {t('analytics.customRange', 'Custom Range')}
                    </button>
                  </div>
                </div>

                {/* Custom Date Picker Inputs */}
                {compareRangeType === 'custom' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{t('analytics.start', 'Start')}</span>
                      <input
                        type="date"
                        id="compare-start-date"
                        value={compareStartDate}
                        onChange={(e) => setCompareStartDate(e.target.value)}
                        max={compareEndDate || '2026-06-29'}
                        className="text-xs text-slate-700 font-medium focus:outline-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-semibold">{t('analytics.to', 'to')}</span>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{t('analytics.end', 'End')}</span>
                      <input
                        type="date"
                        id="compare-end-date"
                        value={compareEndDate}
                        onChange={(e) => setCompareEndDate(e.target.value)}
                        min={compareStartDate}
                        max="2026-06-29"
                        className="text-xs text-slate-700 font-medium focus:outline-none bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {projects.length < 2 ? (
              <div className="py-6 px-4 bg-amber-50/50 border border-amber-100/80 rounded-xl flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 animate-pulse shrink-0" />
                <div className="text-xs">
                  <h4 className="font-semibold text-amber-800">{t('analytics.overlayRequires2', 'Overlay Comparison Requires 2+ Projects')}</h4>
                  <p className="text-amber-700/85 mt-1 leading-relaxed">
                    {t('analytics.overlayRequires2Desc', 'This module allows you to view multi-project trends on a single interactive chart. Please create at least two different QR projects to unlock this live cross-analysis tool.')}
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${compareProjectAId}-${compareProjectBId}-${compareRangeType}-${compareStartDate}-${compareEndDate}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Chart Overlay (7 columns) */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {compareRangeType === '7days' && t('analytics.overlay7Day', '7-Day Scan Volume Overlay')}
                        {compareRangeType === '30days' && t('analytics.overlay30Day', '30-Day Scan Volume Overlay')}
                        {compareRangeType === 'custom' && t('analytics.overlayCustom', 'Custom Scan Volume Overlay')}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] font-medium font-mono">
                        <span className="flex items-center gap-1.5 text-indigo-600">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          {projectA?.name || t('analytics.projectA', 'Project A')}
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {projectB?.name || t('analytics.projectB', 'Project B')}
                        </span>
                      </div>
                    </div>

                    <div className="h-56 w-full border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={compareTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScansA" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorScansB" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" tickLine={false} style={{ fontSize: 9, fill: '#64748b' }} />
                          <YAxis tickLine={false} style={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
                          <Tooltip 
                            wrapperStyle={{ outline: 'none' }} 
                            content={(props: any) => <CustomChartTooltip {...props} type="compare" />} 
                          />
                          <Area type="monotone" name={projectA?.name || t('analytics.projectA', 'Project A')} dataKey="scansA" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScansA)" />
                          <Area type="monotone" name={projectB?.name || t('analytics.projectB', 'Project B')} dataKey="scansB" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScansB)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* KPI Side-by-side Table / Progress Breakdown (5 columns) */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('analytics.metricBreakdown', 'Metric Breakdown Comparison')}</span>
                    
                    <div className="flex flex-col gap-4 flex-1">
                      {/* KPI 1: Total Scans */}
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{t('analytics.totalScans', 'Total Scans')}</span>
                          <div className="flex gap-4 font-mono">
                            <span className="text-indigo-600">{scansA.length}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-emerald-500">{scansB.length}</span>
                          </div>
                        </div>
                        {/* Side-by-side visual gauge bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          {scansA.length + scansB.length > 0 ? (
                            <>
                              <motion.div 
                                className="bg-indigo-600 h-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(scansA.length / (scansA.length + scansB.length)) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                              <motion.div 
                                className="bg-emerald-500 h-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(scansB.length / (scansA.length + scansB.length)) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </>
                          ) : (
                            <div className="bg-slate-200 w-full h-full" />
                          )}
                        </div>
                      </div>

                      {/* KPI 2: Geographical Reach */}
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{t('analytics.approxLocationsReach', 'Approx Locations Reach')}</span>
                          <div className="flex gap-4 font-mono">
                            <span className="text-indigo-600">{locsA}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-emerald-500">{locsB}</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          {locsA + locsB > 0 ? (
                            <>
                              <motion.div 
                                className="bg-indigo-400 h-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(locsA / (locsA + locsB)) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                              <motion.div 
                                className="bg-emerald-400 h-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${(locsB / (locsA + locsB)) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </>
                          ) : (
                            <div className="bg-slate-200 w-full h-full" />
                          )}
                        </div>
                      </div>

                      {/* KPI 3: Top Browser */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <motion.div 
                          className="p-3 rounded-xl border border-indigo-100/50 bg-indigo-50/20 flex flex-col gap-0.5"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                        >
                          <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">{t('analytics.topBrowserA', 'Top Browser A')}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">{topBrowserA}</span>
                        </motion.div>
                        <motion.div 
                          className="p-3 rounded-xl border border-emerald-100/50 bg-emerald-50/20 flex flex-col gap-0.5"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.3 }}
                        >
                          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">{t('analytics.topBrowserB', 'Top Browser B')}</span>
                          <span className="text-xs font-bold text-slate-800 truncate">{topBrowserB}</span>
                        </motion.div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      * {t('analytics.selectedVs', 'Selected: {projA} vs {projB}.', { projA: projectA?.name || t('common.none', 'None'), projB: projectB?.name || t('common.none', 'None') })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Geographical Heatmap Card */}
          <div className="p-5 rounded-xl border border-gray-100 bg-white flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600 animate-pulse" />
                    {t('analytics.heatmapTitle', 'Geographical Scan Heatmap')}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t('analytics.heatmapDesc', 'Interactive visual distribution of scan concentrations globally.')}</p>
                </div>
                {hoveredCountry && (
                  <div className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-medium font-mono">
                    {hoveredCountry.name} ({hoveredCountry.code}): {t('analytics.scansCount', '{count} scans', { count: hoveredCountry.count })}
                  </div>
                )}
              </div>

              {/* World Map SVG Canvas */}
              <div className="relative w-full border border-gray-100 bg-slate-50/50 rounded-xl overflow-hidden aspect-[2/1] select-none flex items-center justify-center">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                <D3WorldHeatmap
                  scans={scans}
                  onHoverCountry={setHoveredCountry}
                  hoveredCountryName={hoveredCountry?.name}
                />
              </div>
            </div>

            {/* Heatmap Leaderboard List */}
            <div className="w-full lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 tracking-wide uppercase mb-3">{t('analytics.leaderboardTitle', 'Concentration Index')}</h4>
                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {geoData.map((g, index) => {
                    const percent = totalScans > 0 ? Math.round((g.count / totalScans) * 100) : 0;
                    const heatBarColor = 
                      g.intensity > 0.7 ? 'bg-red-500' :
                      g.intensity > 0.4 ? 'bg-orange-500' :
                      'bg-indigo-600';

                    const isHovered = hoveredCountry?.name === g.name;

                    return (
                      <div
                        key={g.name}
                        className={`flex flex-col gap-1 text-xs cursor-pointer p-1 rounded-lg transition-colors ${isHovered ? 'bg-slate-50 ' : ''}`}
                        onMouseEnter={() => setHoveredCountry({ name: g.name, count: g.count, code: g.code })}
                        onMouseLeave={() => setHoveredCountry(null)}
                      >
                        <div className="flex items-center justify-between text-gray-600 font-medium">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="text-[10px] text-gray-400 font-mono w-4">#{index + 1}</span>
                            <span className={`font-semibold ${isHovered ? 'text-indigo-600 ' : 'text-gray-800 '}`}>{g.name}</span>
                          </span>
                          <span className="font-mono text-gray-500 text-[11px]">
                            {g.count} <span className="text-gray-400">({percent}%)</span>
                          </span>
                        </div>
                        {/* Progress heat-bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${heatBarColor}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend Summary */}
              <div className="border-t border-gray-50 pt-3 mt-4 text-[10px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {t('analytics.highHeat', 'High (>70%)')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {t('analytics.moderateHeat', 'Moderate (40-70%)')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {t('analytics.lowHeat', 'Low (<40%)')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device types Distribution */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase mb-4 self-start">{t('analytics.platformsTitle', 'Active Client Devices')}</h3>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={(props: any) => <CustomChartTooltip {...props} type="pie" />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser Types Bar */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase mb-4">{t('analytics.browsersTitle', 'Leading Mobile Browsers')}</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tickLine={false} style={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip content={(props: any) => <CustomChartTooltip {...props} type="bar" />} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Logs Ledger Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">{t('analytics.streamTitle', 'Click Logs Record History')}</h3>
            </div>
            <div className="max-h-[180px] overflow-y-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    <th className="py-2.5 px-3">{t('analytics.colDatetime', 'Date')}</th>
                    <th className="py-2.5 px-3">{t('analytics.colLocation', 'Country')}</th>
                    <th className="py-2.5 px-3">{t('analytics.colPlatform', 'Hardware')}</th>
                    <th className="py-2.5 px-3">{t('analytics.colBrowser', 'Browser')}</th>
                    <th className="py-2.5 px-3 text-right pr-6">{t('analytics.colIp', 'IP Address')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-gray-600 text-[11px]">
                  {scans.slice().reverse().map(s => {
                    const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleTimeString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : String(t('common.unknown', 'Unknown'));
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 text-slate-400">{dateStr}</td>
                        <td className="py-2 px-3 font-sans text-gray-800 font-semibold">{s.approxLocation || t('common.global', 'Global')}</td>
                        <td className="py-2 px-3 font-sans text-indigo-600">{s.deviceType || 'Desktop'}</td>
                        <td className="py-2 px-3 text-slate-500">{s.browser || 'Chrome'}</td>
                        <td className="py-2 px-3 text-right pr-6 uppercase tracking-wider">{s.ip || '127.0.0.1'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
