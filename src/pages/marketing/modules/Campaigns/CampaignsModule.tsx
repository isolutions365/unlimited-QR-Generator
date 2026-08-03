import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Filter, Tag, ArrowRight, X, Check } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'ended';
  type: string;
  scans: number;
  startDate: string;
  budget: string;
}

export default function CampaignsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampType, setNewCampType] = useState('RSVP Event');
  const [newCampBudget, setNewCampBudget] = useState('$1,000');

  const loadCampaigns = () => {
    const local = localStorage.getItem('qr-marketing-campaigns');
    if (local) {
      try {
        setCampaigns(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    // Default fallback campaigns
    const defaults: Campaign[] = [
      { id: '1', name: 'Summer Retail Discount QR', status: 'active', type: 'Coupon Landing', scans: 4320, startDate: 'Jun 15, 2026', budget: '$1,200' },
      { id: '2', name: 'Restaurant Menu Back-to-School', status: 'active', type: 'Digital Menu', scans: 1980, startDate: 'Jul 01, 2026', budget: '$450' },
      { id: '3', name: 'Autumn Apparel Launch Launchpad', status: 'scheduled', type: 'Product Pre-order', scans: 0, startDate: 'Sep 01, 2026', budget: '$3,000' },
      { id: '4', name: 'App Download QR Banner Campaign', status: 'active', type: 'App Store Link', scans: 8750, startDate: 'May 10, 2026', budget: '$2,500' },
    ];
    setCampaigns(defaults);
    localStorage.setItem('qr-marketing-campaigns', JSON.stringify(defaults));
  };

  useEffect(() => {
    loadCampaigns();

    const handleUpdate = () => {
      loadCampaigns();
    };

    window.addEventListener('qr-marketing-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-marketing-data-updated', handleUpdate);
    };
  }, []);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampName.trim(),
      status: 'active',
      type: newCampType,
      scans: 0,
      startDate: today,
      budget: newCampBudget.trim() || '$500',
    };

    const updated = [newCamp, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem('qr-marketing-campaigns', JSON.stringify(updated));

    // Reset Form
    setNewCampName('');
    setNewCampType('RSVP Event');
    setNewCampBudget('$1,000');
    setIsModalOpen(false);

    // Notify other components
    window.dispatchEvent(new Event('qr-marketing-data-updated'));
  };

  return (
    <div id="marketing-campaigns-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Marketing Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">Organize QR codes under unified campaign tags to track bulk ROI and budgets.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns by name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer">
            <Tag className="w-3.5 h-3.5" />
            Tags
          </button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns
          .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.type.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((c) => (
            <div key={c.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-3xs hover:border-indigo-200 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    c.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-slate-150 text-slate-500'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Started {c.startDate}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{c.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Platform Category: <strong>{c.type}</strong></p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Scans</span>
                  <span className="text-base font-black text-slate-900">{c.scans.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Budget</span>
                  <span className="text-xs font-bold text-slate-800">{c.budget}</span>
                </div>
                <button className="p-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Launch New Campaign
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campaign / Event Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Grand Opening RSVP Event"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Category</label>
                  <select 
                    value={newCampType}
                    onChange={(e) => setNewCampType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  >
                    <option value="RSVP Event">RSVP Event</option>
                    <option value="Coupon Landing">Coupon Landing</option>
                    <option value="Digital Menu">Digital Menu</option>
                    <option value="Product Pre-order">Product Pre-order</option>
                    <option value="App Store Link">App Store Link</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Budget</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $1,200"
                    value={newCampBudget}
                    onChange={(e) => setNewCampBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Launch Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
