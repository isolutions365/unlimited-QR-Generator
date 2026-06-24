import React from 'react';
import { ScanLog, QRProject } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Globe, Tablet, Users, Grid } from 'lucide-react';

interface AnalyticsDashboardProps {
  scans: ScanLog[];
  projects: QRProject[];
  onPurgeAll?: () => void;
}

export default function AnalyticsDashboard({ scans, projects, onPurgeAll }: AnalyticsDashboardProps) {

  const [hoveredCountry, setHoveredCountry] = React.useState<{ name: string; count: number; code: string } | null>(null);

  // Normalize location strings for heatmap coordination mapping
  const normalizeCountry = (loc: string): string => {
    if (!loc) return 'Global';
    const l = loc.toLowerCase().trim();
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
    const dates: { [key: string]: number } = {};
    // Populate last 7 days of dates initialized to 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dates[dayString] = 0;
    }

    scans.forEach(s => {
      try {
        const d = new Date(s.timestamp);
        const dayString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        if (dates[dayString] !== undefined) {
          dates[dayString]++;
        }
      } catch {}
    });

    return Object.keys(dates).map(date => ({
      date,
      scans: dates[date]
    }));
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

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Real-Time QR Scan Analytics
          </h2>
          <p className="text-xs text-gray-500 mt-1">Live tracking telemetry, browser client data, and location logs.</p>
        </div>
        {onPurgeAll && scans.length > 0 && (
          <button
            type="button"
            onClick={onPurgeAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            Clear Analytics Log
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] sm:text-xs font-medium">Total Scan Counts</span>
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
                  contentStyle={{ fontSize: '10px', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={1.5} fillOpacity={1} fill="url(#miniColorScans)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Grid className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] sm:text-xs font-medium">Tracked QR Codes</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{activeTrackedQRs}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time tracking enabled</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Globe className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] sm:text-xs font-medium">Approx Countries</span>
            </div>
            <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{uniqueLocations || 0}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 font-medium">
            <span>Locations resolved via client telemetry</span>
          </div>
        </div>
      </div>

      {/* Analytics empty fallback */}
      {totalScans === 0 ? (
        <div className="py-12 text-center border border-dashed border-gray-100 rounded-xl">
          <Tablet className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-gray-700">No Analytics Telemetry Yet</h3>
          <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] mx-auto">
            Scan your active codes or use the "+ Seed clicks" fallback buttons to inspect dashboards.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Timeline Chart Card */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white">
            <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase mb-4">Click Scan Metrics (last 7 days)</h3>
            <div className="h-48 w-full">
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
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographical Heatmap Card */}
          <div className="p-5 rounded-xl border border-gray-100 bg-white flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600 animate-pulse" />
                    Geographical Scan Heatmap
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Interactive visual distribution of scan concentrations globally.</p>
                </div>
                {hoveredCountry && (
                  <div className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-medium font-mono">
                    {hoveredCountry.name} ({hoveredCountry.code}): {hoveredCountry.count} scans
                  </div>
                )}
              </div>

              {/* World Map SVG Canvas */}
              <div className="relative w-full border border-gray-100 bg-slate-50/50 rounded-xl overflow-hidden aspect-[2/1] select-none flex items-center justify-center">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                
                <svg viewBox="0 0 800 400" className="w-full h-full relative z-10">
                  {/* Styled simplified continent outlines */}
                  {/* North America */}
                  <path d="M100,80 C130,70 180,60 210,80 C230,95 240,120 230,140 C210,165 180,180 160,200 C150,210 145,225 140,240 C135,220 120,190 100,180 Z" className="fill-slate-100 stroke-slate-200/50" strokeWidth="1.5" />
                  {/* South America */}
                  <path d="M140,240 C170,240 190,260 205,290 C220,330 210,370 190,400 C180,410 170,420 165,430 C155,410 145,340 135,300 Z" className="fill-slate-100 stroke-slate-200/50" strokeWidth="1.5" />
                  {/* Africa */}
                  <path d="M360,210 C390,195 440,200 455,230 C470,260 490,290 475,320 C460,350 440,390 425,410 C420,390 415,360 405,340 C395,330 365,310 355,280 C345,260 350,230 360,210 Z" className="fill-slate-100 stroke-slate-200/50" strokeWidth="1.5" />
                  {/* Europe & Asia */}
                  <path d="M360,210 C370,180 360,140 390,110 C420,90 470,80 540,80 C600,80 680,90 730,110 C760,125 780,150 750,180 C720,210 680,240 640,250 C580,260 520,250 470,230 Z" className="fill-slate-100 stroke-slate-200/50" strokeWidth="1.5" />
                  {/* Australia */}
                  <path d="M680,310 C710,300 740,315 750,330 C760,350 740,380 710,380 C690,380 670,360 680,310 Z" className="fill-slate-100 stroke-slate-200/50" strokeWidth="1.5" />

                  {/* Lat/Long Grid Markings */}
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
                  <line x1="400" y1="0" x2="400" y2="400" stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />

                  {/* Heatmap Hotspots */}
                  {geoData.map((g) => {
                    const isHovered = hoveredCountry?.name === g.name;
                    const heatColors = 
                      g.intensity > 0.7 ? { core: '#ef4444', glow: 'rgba(239, 68, 68, 0.2)' } :
                      g.intensity > 0.4 ? { core: '#f97316', glow: 'rgba(249, 115, 22, 0.2)' } :
                      { core: '#4f46e5', glow: 'rgba(79, 70, 229, 0.2)' };

                    return (
                      <g
                        key={g.name}
                        onMouseEnter={() => setHoveredCountry({ name: g.name, count: g.count, code: g.code })}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className="cursor-pointer group transition-all"
                      >
                        {/* Interactive Invisible Large Hover Area */}
                        <circle cx={g.x} cy={g.y} r="18" fill="transparent" />

                        {/* Outer Glow Ring */}
                        <circle
                          cx={g.x}
                          cy={g.y}
                          r={isHovered ? 24 : 10 + g.intensity * 14}
                          fill={heatColors.glow}
                          className="transition-all duration-300"
                        />

                        {/* Pulsing Heat Core Ring */}
                        <circle
                          cx={g.x}
                          cy={g.y}
                          r={isHovered ? 16 : 6 + g.intensity * 8}
                          fill="none"
                          stroke={heatColors.core}
                          strokeWidth="1.5"
                          className="opacity-70 animate-ping origin-center"
                          style={{ transformOrigin: `${g.x}px ${g.y}px` }}
                        />

                        {/* Solid Inner Core */}
                        <circle
                          cx={g.x}
                          cy={g.y}
                          r={isHovered ? 8 : 4 + g.intensity * 4}
                          fill={heatColors.core}
                          className="stroke-white stroke-2 shadow-md transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Heatmap Leaderboard List */}
            <div className="w-full lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 tracking-wide uppercase mb-3">Concentration Index</h4>
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
                        className={`flex flex-col gap-1 text-xs cursor-pointer p-1 rounded-lg transition-colors ${isHovered ? 'bg-slate-50' : ''}`}
                        onMouseEnter={() => setHoveredCountry({ name: g.name, count: g.count, code: g.code })}
                        onMouseLeave={() => setHoveredCountry(null)}
                      >
                        <div className="flex items-center justify-between text-gray-600 font-medium">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="text-[10px] text-gray-400 font-mono w-4">#{index + 1}</span>
                            <span className={`font-semibold ${isHovered ? 'text-indigo-600' : 'text-gray-800'}`}>{g.name}</span>
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
                  High (&gt;70%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Moderate (40-70%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Low (&lt;40%)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device types Distribution */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase mb-4 self-start">Active Client Devices</h3>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} innerRadius={45} outerRadius={60} paddingAngle={4} dataKey="value">
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browser Types Bar */}
            <div className="p-4 rounded-xl border border-gray-100 bg-white">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase mb-4">Leading Mobile Browsers</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tickLine={false} style={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Logs Ledger Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">Click Logs Record History</h3>
            </div>
            <div className="max-h-[180px] overflow-y-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Hardware</th>
                    <th className="py-2.5 px-3">Browser</th>
                    <th className="py-2.5 px-3 text-right pr-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-gray-600 text-[11px]">
                  {scans.slice().reverse().map(s => {
                    const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleTimeString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown';
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 text-slate-400">{dateStr}</td>
                        <td className="py-2 px-3 font-sans text-gray-800 font-semibold">{s.approxLocation || 'Global'}</td>
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
