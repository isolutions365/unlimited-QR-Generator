import React, { useState, useEffect, Suspense, useRef } from 'react';
import { 
  ArrowLeft, LayoutDashboard, Megaphone, QrCode, BarChart3, 
  Smartphone, Contact, Utensils, FileText, ClipboardList, 
  Settings, FileBarChart2, Menu, X, HelpCircle, ShieldCheck, Zap,
  Send, Bot, User, Loader2
} from 'lucide-react';
import { useTranslation } from '../../utils/i18n';

// Lazy load modules
const DashboardModule = React.lazy(() => import('./modules/Dashboard/DashboardModule'));
const CampaignsModule = React.lazy(() => import('./modules/Campaigns/CampaignsModule'));
const DynamicQRModule = React.lazy(() => import('./modules/DynamicQR/DynamicQRModule'));
const AnalyticsModule = React.lazy(() => import('./modules/Analytics/AnalyticsModule'));
const LandingPagesModule = React.lazy(() => import('./modules/LandingPages/LandingPagesModule'));
const BusinessCardsModule = React.lazy(() => import('./modules/BusinessCards/BusinessCardsModule'));
const RestaurantMenusModule = React.lazy(() => import('./modules/RestaurantMenus/RestaurantMenusModule'));
const PDFSharingModule = React.lazy(() => import('./modules/PDFSharing/PDFSharingModule'));
const FormsModule = React.lazy(() => import('./modules/Forms/FormsModule'));
const SettingsModule = React.lazy(() => import('./modules/Settings/SettingsModule'));
const ReportsModule = React.lazy(() => import('./modules/Reports/ReportsModule'));

type ModuleId = 
  | 'dashboard' | 'campaigns' | 'dynamic-qr' | 'analytics' 
  | 'landing-pages' | 'business-cards' | 'restaurant-menus' 
  | 'pdf-sharing' | 'forms' | 'settings' | 'reports';

interface NavigationItem {
  id: ModuleId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'dynamic-qr', label: 'Dynamic QR', icon: QrCode },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'landing-pages', label: 'Landing Pages', icon: Smartphone },
  { id: 'business-cards', label: 'Business Cards', icon: Contact },
  { id: 'restaurant-menus', label: 'Restaurant Menus', icon: Utensils },
  { id: 'pdf-sharing', label: 'PDF Sharing', icon: FileText },
  { id: 'forms', label: 'Forms', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
];

interface QRMarketingPlatformProps {
  onBack: () => void;
}

function LoadingFallback() {
  return (
    <div className="h-96 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs text-slate-500 font-bold tracking-wider uppercase animate-pulse">Loading module details...</p>
    </div>
  );
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export default function QRMarketingPlatform({ onBack }: QRMarketingPlatformProps) {
  const { t } = useTranslation();
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AI Co-Pilot State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      sender: 'assistant', 
      text: "Hello! I am your AI Co-Pilot. I can help you create restaurant menus, business cards, landing pages, campaigns, or PDF shares in seconds. Try typing a command or choose one of the options below!" 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleAssistantSubmit = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Add user message
    const userMsg = { id: `msg-${Date.now()}`, sender: 'user' as const, text: promptText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setLoadingStep('Analyzing brand query...');

    // Loading step simulation
    const steps = [
      'Formatting optimal module parameters...',
      'Injecting assets into database state...',
      'Completing high-contrast visual optimizations...'
    ];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 1200);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await response.json();
      clearInterval(interval);

      if (data && data.category && data.payload) {
        const category = data.category;
        const payload = data.payload;

        // Save generated payload to respective localStorage
        if (category === 'restaurant-menus') {
          const current = localStorage.getItem('qr-marketing-restaurant-menus');
          const parsed = current ? JSON.parse(current) : [];
          localStorage.setItem('qr-marketing-restaurant-menus', JSON.stringify([payload, ...parsed]));
        } else if (category === 'business-cards') {
          const current = localStorage.getItem('qr-marketing-business-cards');
          const parsed = current ? JSON.parse(current) : [];
          localStorage.setItem('qr-marketing-business-cards', JSON.stringify([payload, ...parsed]));
        } else if (category === 'pdf-sharing') {
          const current = localStorage.getItem('qr-marketing-pdf-shares');
          const parsed = current ? JSON.parse(current) : [];
          localStorage.setItem('qr-marketing-pdf-shares', JSON.stringify([payload, ...parsed]));
        } else if (category === 'campaigns') {
          const current = localStorage.getItem('qr-marketing-campaigns');
          const parsed = current ? JSON.parse(current) : [];
          localStorage.setItem('qr-marketing-campaigns', JSON.stringify([payload, ...parsed]));
        } else if (category === 'landing-pages') {
          const current = localStorage.getItem('guest_landing_pages');
          const parsed = current ? JSON.parse(current) : [];
          localStorage.setItem('guest_landing_pages', JSON.stringify([payload, ...parsed]));
        }

        // Trigger global data refresh across all open components
        window.dispatchEvent(new Event('qr-marketing-data-updated'));

        // Smoothly navigate active view to that module tab
        setActiveModule(category as ModuleId);

        // Add assistant message
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: data.assistantMessage || `I've successfully created your resource and automatically navigated you to the corresponding tab.`
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: "I analyzed your request but couldn't generate a valid module. Please try again with a specific command like 'Create Restaurant Menu'."
        }]);
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an error connecting to my AI core. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'campaigns':
        return <CampaignsModule />;
      case 'dynamic-qr':
        return <DynamicQRModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'landing-pages':
        return <LandingPagesModule />;
      case 'business-cards':
        return <BusinessCardsModule />;
      case 'restaurant-menus':
        return <RestaurantMenusModule />;
      case 'pdf-sharing':
        return <PDFSharingModule />;
      case 'forms':
        return <FormsModule />;
      case 'settings':
        return <SettingsModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div id="qr-marketing-platform-container" className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col relative overflow-hidden">
      {/* Platform Header */}
      <header className="sticky top-0 z-45 bg-white border-b border-slate-150 px-4 md:px-8 py-4 flex items-center justify-between shadow-3xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
            title="Return to Generator"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">Enterprise Features</span>
            <h1 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
              QR Marketing Platform
              <Zap className="w-4 h-4 text-amber-500" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Co-Pilot Header Button */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="hidden md:flex py-1.5 px-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-150 rounded-xl text-[11px] font-bold text-indigo-700 items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            AI Co-Pilot
          </button>

          {/* Mobile Sidebar Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Grid Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar Left Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-150 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0 pt-20' : '-translate-x-full md:pt-0'}
        `}>
          <div className="p-4 space-y-1 h-[calc(100vh-140px)] overflow-y-auto">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-2">Platform Modules</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer text-left
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-150 absolute bottom-0 w-full bg-white space-y-2">
            <div className="bg-emerald-50 text-emerald-800 text-[10px] p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Sandbox Dev Mode</span>
                Your platform configurations and custom domains are fully functional.
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* Master Component Main Window */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <Suspense fallback={<LoadingFallback />}>
            {renderModule()}
          </Suspense>
        </main>
      </div>

      {/* Floating AI Co-Pilot Trigger Button (Positioned vertically above AI Assistant) */}
      <div className="ai-copilot-floating-container" id="ai-copilot-floating-wrapper">
        <button 
          onClick={() => setIsAssistantOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group cursor-pointer"
          id="ai-copilot-floating-btn"
        >
          <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase pr-1">{t('ai.coPilot', 'AI Co-Pilot')}</span>
        </button>
      </div>

      {/* Sliding AI Co-Pilot Panel */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Drawer backdrop overlay */}
          <div 
            onClick={() => setIsAssistantOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer main window */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-150">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900">{t('ai.coPilot', 'AI Co-Pilot')} {t('ai.assistant', 'Assistant')}</h2>
                  <p className="text-[10px] text-slate-500 font-semibold">{t('ai.workspaceSubtitle', 'Powered by Gemini AI • Real-time Intelligent Assistant')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isAss = m.sender === 'assistant';
                return (
                  <div key={m.id} className={`flex items-start gap-3 ${!isAss ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-xl shrink-0 ${isAss ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      {isAss ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-2xl p-3 text-xs leading-relaxed max-w-[80%] ${
                      isAss ? 'bg-indigo-50/50 border border-indigo-100 text-slate-800' : 'bg-indigo-600 text-white font-semibold'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-center gap-3 w-[80%]">
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                    <span className="text-[11px] text-slate-500 font-bold tracking-wide uppercase animate-pulse">{loadingStep}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Chips Section */}
            {!isLoading && (
              <div className="px-4 py-2 border-t border-slate-100 space-y-1.5 bg-slate-50/50">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Suggested Campaigns</span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {[
                    "Create Restaurant Campaign",
                    "Create Business Card",
                    "Create Landing Page",
                    "Create Event",
                    "Create PDF Share"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleAssistantSubmit(chip)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-[10px] font-bold text-slate-600 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input Box */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAssistantSubmit(inputValue);
              }}
              className="p-4 border-t border-slate-150 flex items-center gap-2 bg-slate-50"
            >
              <input 
                type="text" 
                placeholder={isLoading ? "AI is processing..." : "Type custom parameters (e.g. 'Create menu for Chef's Table')..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:border-indigo-500 disabled:opacity-50 transition-colors font-semibold"
              />
              <button 
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
