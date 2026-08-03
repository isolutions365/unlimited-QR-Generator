import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Eye, ListTodo, Clipboard, CheckSquare } from 'lucide-react';

interface CustomForm {
  id: string;
  title: string;
  responsesCount: number;
  status: 'active' | 'closed';
  updatedAt: string;
}

export default function FormsModule() {
  const [forms] = useState<CustomForm[]>([
    { id: '1', title: 'Restaurant Dining Experience Survey', responsesCount: 312, status: 'active', updatedAt: 'Aug 02, 2026' },
    { id: '2', title: 'Product Launch Lead Capture Form', responsesCount: 1420, status: 'active', updatedAt: 'Jul 29, 2026' },
  ]);

  return (
    <div id="marketing-forms-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">QR Lead Forms & Surveys</h1>
          <p className="text-xs text-slate-500 mt-1">Design mobile-friendly lead collection forms, question flows, and Net Promoter Score surveys.</p>
        </div>
        <button className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit">
          <Plus className="w-4 h-4" />
          Create Custom Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((f) => (
          <div key={f.id} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Clipboard className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  f.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {f.status}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{f.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Last response: <strong>{f.updatedAt}</strong></p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <strong>{f.responsesCount.toLocaleString()}</strong> Responses
              </span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Export CSV
                </button>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer">
                  <ListTodo className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
