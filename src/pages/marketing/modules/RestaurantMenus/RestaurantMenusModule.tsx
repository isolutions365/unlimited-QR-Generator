import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Eye, Grid, X, Check, Coffee, ShieldAlert } from 'lucide-react';

interface Menu {
  id: string;
  name: string;
  itemsCount: number;
  status: 'active' | 'draft';
  scans: number;
  currency: string;
}

export default function RestaurantMenusModule() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCurrency, setNewMenuCurrency] = useState('USD');
  const [newMenuItemsCount, setNewMenuItemsCount] = useState(10);

  const loadMenus = () => {
    const local = localStorage.getItem('qr-marketing-restaurant-menus');
    if (local) {
      try {
        setMenus(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    // Default fallback list
    const defaults: Menu[] = [
      { id: '1', name: 'Summer Bistro Dinner Menu', itemsCount: 42, status: 'active', scans: 1980, currency: 'USD' },
      { id: '2', name: 'Premium Craft Cocktail & Wine List', itemsCount: 24, status: 'active', scans: 1420, currency: 'USD' },
    ];
    setMenus(defaults);
    localStorage.setItem('qr-marketing-restaurant-menus', JSON.stringify(defaults));
  };

  useEffect(() => {
    loadMenus();

    const handleUpdate = () => {
      loadMenus();
    };

    window.addEventListener('qr-marketing-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-marketing-data-updated', handleUpdate);
    };
  }, []);

  const handleCreateMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const newMenu: Menu = {
      id: `menu-${Date.now()}`,
      name: newMenuName.trim(),
      itemsCount: Number(newMenuItemsCount) || 12,
      status: 'active',
      scans: 0,
      currency: newMenuCurrency,
    };

    const updated = [newMenu, ...menus];
    setMenus(updated);
    localStorage.setItem('qr-marketing-restaurant-menus', JSON.stringify(updated));

    // Reset Form
    setNewMenuName('');
    setNewMenuCurrency('USD');
    setNewMenuItemsCount(10);
    setIsModalOpen(false);

    // Notify other components
    window.dispatchEvent(new Event('qr-marketing-data-updated'));
  };

  return (
    <div id="marketing-restaurantmenus-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">QR Restaurant Menus</h1>
          <p className="text-xs text-slate-500 mt-1">Design beautiful visual digital menus with price selectors, allergens, and high-res imagery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          Create Digital Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menus.map((m) => (
          <div key={m.id} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {m.status}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{m.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1">Items Included: <strong>{m.itemsCount}</strong> | Default Currency: <strong>{m.currency}</strong></p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                <strong>{m.scans.toLocaleString()}</strong> Menu Views
              </span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Customize Menu
                </button>
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer">
                  <Grid className="w-3.5 h-3.5" />
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
                <Utensils className="w-4 h-4 text-indigo-600" />
                Create New Digital Menu
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menu / Campaign Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bella Italia Gourmet Pizza Menu"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Currency</label>
                  <select 
                    value={newMenuCurrency}
                    onChange={(e) => setNewMenuCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Initial Items Count</label>
                  <input 
                    type="number"
                    value={newMenuItemsCount}
                    onChange={(e) => setNewMenuItemsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                    min="1"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Build Digital Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
