import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, QrCode, ArrowUpRight, Megaphone, 
  Calendar, Download, HardDrive, Zap, RefreshCw, Sparkles, 
  Plus, Eye, Link2, Copy, Check, FileText, Globe, Smartphone, ArrowRight,
  Utensils, Contact
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', scans: 1420, downloads: 410 },
  { name: 'Tue', scans: 1980, downloads: 680 },
  { name: 'Wed', scans: 1510, downloads: 490 },
  { name: 'Thu', scans: 2400, downloads: 820 },
  { name: 'Fri', scans: 2240, downloads: 710 },
  { name: 'Sat', scans: 3120, downloads: 990 },
  { name: 'Sun', scans: 2890, downloads: 910 },
];

interface RecentQR {
  id: string;
  name: string;
  type: 'Dynamic URL' | 'vCard' | 'PDF Flyer' | 'Restaurant Menu' | 'Lead Form';
  scans: number;
  downloads: number;
  status: 'Active' | 'Paused';
  dateCreated: string;
}

interface TopQR {
  id: string;
  name: string;
  type: string;
  scans: number;
  percentage: number;
  trend: 'up' | 'stable';
}

interface ActivityItem {
  id: string;
  event: string;
  time: string;
  location: string;
  device: string;
  color: string;
}

export default function DashboardModule() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock states with realistic values
  const [recentQRs] = useState<RecentQR[]>([
    { id: 'qr-101', name: 'Summer Bistro Dinner Menu QR', type: 'Restaurant Menu', scans: 1980, downloads: 240, status: 'Active', dateCreated: 'Aug 01, 2026' },
    { id: 'qr-102', name: 'Luxury Estate Brochure v2', type: 'PDF Flyer', scans: 1250, downloads: 820, status: 'Active', dateCreated: 'Jul 30, 2026' },
    { id: 'qr-103', name: 'VP Marketing Contact vCard', type: 'vCard', scans: 820, downloads: 650, status: 'Active', dateCreated: 'Jul 29, 2026' },
    { id: 'qr-104', name: 'Feedback & Lead Capture Form', type: 'Lead Form', scans: 430, downloads: 180, status: 'Active', dateCreated: 'Jul 25, 2026' },
    { id: 'qr-105', name: 'Autumn VIP Coupon Redirect', type: 'Dynamic URL', scans: 3450, downloads: 950, status: 'Paused', dateCreated: 'Jul 20, 2026' },
  ]);

  const [topPerforming] = useState<TopQR[]>([
    { id: 'top-1', name: 'Autumn VIP Coupon Redirect', type: 'Dynamic URL', scans: 3450, percentage: 88, trend: 'up' },
    { id: 'top-2', name: 'Summer Bistro Dinner Menu QR', type: 'Restaurant Menu', scans: 1980, percentage: 65, trend: 'up' },
    { id: 'top-3', name: 'Luxury Estate Brochure v2', type: 'PDF Flyer', scans: 1250, percentage: 48, trend: 'stable' },
  ]);

  const [activities] = useState<ActivityItem[]>([
    { id: 'act-1', event: 'Menu QR scanned', time: '2 mins ago', location: 'New York, US', device: 'iOS (Safari)', color: 'bg-emerald-500' },
    { id: 'act-2', event: 'vCard downloaded', time: '12 mins ago', location: 'London, UK', device: 'Android (Chrome)', color: 'bg-indigo-500' },
    { id: 'act-3', event: 'PDF Brochure downloaded', time: '25 mins ago', location: 'Berlin, DE', device: 'iOS (Safari)', color: 'bg-rose-500' },
    { id: 'act-4', event: 'Coupon URL scan completed', time: '1 hr ago', location: 'Tokyo, JP', device: 'Android (Firefox)', color: 'bg-amber-500' },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="marketing-dashboard-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Marketing Overview
            <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time dynamic campaign statistics, storage consumption, and traffic logs.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={handleRefresh}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Aug 2, 2026 - Aug 9, 2026</span>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scans Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Scans</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">15,024</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +14.2% vs last week
            </span>
          </div>
        </div>

        {/* Downloads Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Downloads</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-sans">4,810</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +8.7% brochure claims
            </span>
          </div>
        </div>

        {/* Dynamic Pages Visited Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Users</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 font-sans">9,820</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +11.3% click session ctr
            </span>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900">32.0%</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +4.1% action conversion
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Charts & Quick Actions & Storage Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Column */}
        <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engagements History</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Scans & document downloads comparison over the past week.</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="scans" name="QR Scans" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" />
                <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDownloads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Storage Column */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-slate-50/55 hover:bg-indigo-50 border border-slate-150 hover:border-indigo-200 rounded-xl transition-all flex flex-col items-start gap-1.5 text-left group cursor-pointer">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-bold text-slate-800">Dynamic URL</span>
                <span className="text-[9px] text-slate-400">Instantly swap targets</span>
              </button>
              <button className="p-3 bg-slate-50/55 hover:bg-rose-50 border border-slate-150 hover:border-rose-200 rounded-xl transition-all flex flex-col items-start gap-1.5 text-left group cursor-pointer">
                <FileText className="w-4 h-4 text-rose-600" />
                <span className="text-[11px] font-bold text-slate-800">Host PDF</span>
                <span className="text-[9px] text-slate-400">Flyers & booklets</span>
              </button>
              <button className="p-3 bg-slate-50/55 hover:bg-emerald-50 border border-slate-150 hover:border-emerald-200 rounded-xl transition-all flex flex-col items-start gap-1.5 text-left group cursor-pointer">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800">Digi Menu</span>
                <span className="text-[9px] text-slate-400">Cafes & bistros</span>
              </button>
              <button className="p-3 bg-slate-50/55 hover:bg-sky-50 border border-slate-150 hover:border-sky-200 rounded-xl transition-all flex flex-col items-start gap-1.5 text-left group cursor-pointer">
                <Contact className="w-4 h-4 text-sky-600" />
                <span className="text-[11px] font-bold text-slate-800">Smart vCard</span>
                <span className="text-[9px] text-slate-400">Digital contact profile</span>
              </button>
            </div>
          </div>

          {/* Storage Usage Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-slate-500" />
                Cloud File Storage
              </h3>
              <span className="text-[11px] font-bold text-indigo-600">Upgrade</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-600">PDFs, Menus & Asset Hosting</span>
                <span className="font-extrabold text-slate-900">42.8 MB / 100 MB</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '42.8%' }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] text-slate-400 font-bold">
              <div>
                <span className="block text-slate-950 font-extrabold text-[11px]">18.4 MB</span>
                PDF Media
              </div>
              <div className="border-x border-slate-100">
                <span className="block text-slate-950 font-extrabold text-[11px]">15.2 MB</span>
                Images
              </div>
              <div>
                <span className="block text-slate-950 font-extrabold text-[11px]">9.2 MB</span>
                Data Stores
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent QR Codes Table, Top Performing, and Recent Scan Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent QR Codes List */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent QR Codes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Your recently created and managed dynamic assets.</p>
            </div>
            <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 uppercase tracking-wider cursor-pointer">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-2.5">QR Asset Name</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5 text-center">Scans</th>
                  <th className="py-2.5 text-center">Downloads</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQRs.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-extrabold text-slate-900 max-w-[180px] truncate">{qr.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]">
                        {qr.type}
                      </span>
                    </td>
                    <td className="py-3 text-center font-extrabold text-slate-800">{qr.scans.toLocaleString()}</td>
                    <td className="py-3 text-center font-bold text-slate-500">{qr.downloads.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        qr.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          qr.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        {qr.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleCopy(qr.id, `https://qrf.gs/s/${qr.id}`)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Copy Redirect Link"
                      >
                        {copiedId === qr.id ? <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panels: Top Performing & Recent Activity logs */}
        <div className="space-y-6">
          {/* Top Performing Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top Performing QR</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Highest traffic channels during the current cycle.</p>
            </div>
            <div className="space-y-3.5">
              {topPerforming.map((top, idx) => (
                <div key={top.id} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-slate-900 truncate max-w-[150px]">{top.name}</span>
                    <span className="font-black text-indigo-600">{top.scans.toLocaleString()} scans</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                      style={{ width: `${top.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scan Log Activity Feed */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Scan Feed</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Simulated real-time scanner activity telemetry streams.</p>
            </div>
            <div className="space-y-3.5 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
              {activities.map((act) => (
                <div key={act.id} className="relative text-[11px]">
                  <span className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border border-white ring-4 ring-slate-50 ${act.color}`} />
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{act.event}</span>
                    <span className="text-[9px] text-slate-400">{act.time}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>📍 {act.location}</span>
                    <span>📱 {act.device}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
