import React from 'react';
import { Settings, Shield, Globe, Key, Bell, HelpCircle } from 'lucide-react';

export default function SettingsModule() {
  return (
    <div id="marketing-settings-root" className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">Configure advanced custom vanity short domains, tracking pixels, API keys, and notification triggers.</p>
      </div>

      <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs divide-y divide-slate-100">
        {/* Custom Domains */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-500" />
              Custom Short Domains
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Brand your links completely by mapping your own custom short subdomain (e.g. <code>qr.yourbrand.com</code>).
            </p>
          </div>
          <button className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-xl cursor-pointer">
            Configure CNAME
          </button>
        </div>

        {/* Tracking Pixels */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-500" />
              Retargeting & Pixel Triggers
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Inject Meta Pixel, Google Tag Manager, or ByteDance tracking codes into your dynamic QR landing pages automatically.
            </p>
          </div>
          <button className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-xl cursor-pointer">
            Add Pixel ID
          </button>
        </div>

        {/* Webhooks & API */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-500" />
              API Key & Webhook Delivery
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Integrate real-time scanner statistics and telemetry data directly with your internal CRM, Zapier, or slack streams.
            </p>
          </div>
          <button className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-xl cursor-pointer">
            Create API Key
          </button>
        </div>
      </div>
    </div>
  );
}
