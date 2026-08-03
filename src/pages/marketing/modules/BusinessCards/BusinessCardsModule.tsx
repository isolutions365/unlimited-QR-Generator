import React, { useState, useEffect } from 'react';
import { Contact, Plus, Eye, Share2, Mail, Phone, X, Check } from 'lucide-react';

interface CardProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  views: number;
  phone: string;
  email: string;
}

export default function BusinessCardsModule() {
  const [profiles, setProfiles] = useState<CardProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const loadProfiles = () => {
    const local = localStorage.getItem('qr-marketing-business-cards');
    if (local) {
      try {
        setProfiles(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    // Default fallback profiles
    const defaults: CardProfile[] = [
      { id: '1', name: 'John Doe', role: 'VP Marketing', company: 'Apex Global Corp', views: 820, phone: '+1 555-019-2831', email: 'john.doe@apexglobal.com' },
      { id: '2', name: 'Jane Smith', role: 'Lead Creative Strategist', company: 'NextGen Designs', views: 1402, phone: '+1 555-012-9844', email: 'jane@nextgendesign.io' },
    ];
    setProfiles(defaults);
    localStorage.setItem('qr-marketing-business-cards', JSON.stringify(defaults));
  };

  useEffect(() => {
    loadProfiles();

    const handleUpdate = () => {
      loadProfiles();
    };

    window.addEventListener('qr-marketing-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-marketing-data-updated', handleUpdate);
    };
  }, []);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newProfile: CardProfile = {
      id: `card-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Professional Partner',
      company: newCompany.trim() || 'Independent Consulting',
      views: 0,
      phone: newPhone.trim() || '+1 (555) 012-3456',
      email: newEmail.trim(),
    };

    const updated = [newProfile, ...profiles];
    setProfiles(updated);
    localStorage.setItem('qr-marketing-business-cards', JSON.stringify(updated));

    // Reset Form
    setNewName('');
    setNewRole('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
    setIsModalOpen(false);

    // Notify other components
    window.dispatchEvent(new Event('qr-marketing-data-updated'));
  };

  return (
    <div id="marketing-businesscards-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Smart Digital vCards</h1>
          <p className="text-xs text-slate-500 mt-1">Generate dynamic contact cards that let clients save your full profile, portfolio, and socials with one scan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          New Digital Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((p) => (
          <div key={p.id} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm uppercase">
                  {p.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-[11px] text-slate-500">{p.role} at <strong>{p.company}</strong></p>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                <strong>{p.views}</strong> Scans
              </span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Download vCard
                </button>
                <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
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
                <Contact className="w-4 h-4 text-indigo-600" />
                Create Digital Business Card
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alex Rivera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Professional Role</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Principal Consultant"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apex Strategy Group"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. alex@apexgroup.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. +1 (555) 014-9382"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Build Digital Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
