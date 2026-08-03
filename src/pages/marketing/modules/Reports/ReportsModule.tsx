import React from 'react';
import { FileText, Plus, Calendar, Download, RefreshCw, BarChart2 } from 'lucide-react';

export default function ReportsModule() {
  return (
    <div id="marketing-reports-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Executive QR Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Compile and schedule beautifully designed PDF summaries for your stakeholders and clients.</p>
        </div>
        <button className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit">
          <Plus className="w-4 h-4" />
          Schedule New Report
        </button>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Generated Executive Reports</span>
          <span className="text-[10px] text-slate-400 font-semibold">Updated weekly</span>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">July 2026 Monthly Summary Report</h3>
              <p className="text-[11px] text-slate-500">Includes complete dynamic redirects, geo-locations, and mobile OS conversion statistics.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Aug 01, 2026
              </span>
              <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold border border-indigo-100 flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">Q2 Executive Marketing Presentation</h3>
              <p className="text-[11px] text-slate-500">Corporate deck overviewing multi-channel physical-to-digital retail engagement growth.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Jul 05, 2026
              </span>
              <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[10px] font-bold border border-indigo-100 flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
