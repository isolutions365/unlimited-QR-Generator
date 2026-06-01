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
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] sm:text-xs font-medium">Total Scan Counts</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{totalScans}</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Grid className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] sm:text-xs font-medium">Tracked QR Codes</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{activeTrackedQRs}</span>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Globe className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] sm:text-xs font-medium">Approx Countries</span>
          </div>
          <span className="text-lg sm:text-2xl font-bold font-mono text-gray-900">{uniqueLocations || 0}</span>
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
