import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Send, Bot, User, Loader2, HelpCircle, ArrowRight,
  Utensils, Contact, Smartphone, Megaphone, FileText, CheckCircle2
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { playAudioSound } from '../utils/audioFeedback';

interface AIAssistantWidgetProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onNavigate: (path: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  status?: 'loading' | 'success' | 'error';
  category?: string;
}

const QUICK_COMMANDS = [
  { label: 'Create Restaurant Campaign', desc: 'Generate a digital, multi-language QR menu layout', icon: Utensils, category: 'restaurant-menus' },
  { label: 'Create Business Card', desc: 'Design a sleek digital vCard profile with action links', icon: Contact, category: 'business-cards' },
  { label: 'Create Landing Page', desc: 'Generate a gorgeous, mobile-responsive promo page', icon: Smartphone, category: 'landing-pages' },
  { label: 'Create Event', desc: 'Build an RSVP campaign tracker with scanning analytics', icon: Megaphone, category: 'campaigns' },
  { label: 'Create PDF Share', desc: 'Upload and configure a tracking QR download page', icon: FileText, category: 'pdf-sharing' }
];

export default function AIAssistantWidget({ activeTab, setActiveTab, onNavigate }: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your AI Co-Pilot Assistant. I can build campaigns, business cards, landing pages, and interactive PDFs in real time. Simply click a quick command below or type your custom branding prompt!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const saveGeneratedPayload = async (category: string, payload: any) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {
        console.warn('Anon auth notice:', e);
      }
    }

    if (userId) {
      try {
        if (category === 'restaurant-menus') {
          await setDoc(doc(db, 'restaurant_menus', payload.id), { ...payload, userId });
        } else if (category === 'business-cards') {
          await setDoc(doc(db, 'business_cards', payload.id), { ...payload, userId });
        } else if (category === 'pdf-sharing') {
          await setDoc(doc(db, 'pdf_shares', payload.id), { ...payload, userId });
        } else if (category === 'campaigns') {
          await setDoc(doc(db, 'projects', payload.id), {
            id: payload.id,
            name: payload.name,
            type: 'url',
            content: 'https://freeqrgen.pro',
            trackingEnabled: true,
            createdAt: new Date().toISOString(),
            userId
          });
        } else if (category === 'landing-pages') {
          await setDoc(doc(db, 'landingPages', payload.id), { ...payload, userId });
        }
      } catch (err) {
        console.error('Error saving AI generated payload to Firestore:', err);
      }
    }

    // Dispatch global sync event to update other components' state
    window.dispatchEvent(new Event('qr-marketing-data-updated'));
    window.dispatchEvent(new Event('projects-changed'));
  };

  const handleCommandSubmit = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Play visual feedback sound
    playAudioSound('preview');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setCurrentStep('Analyzing campaign requirements...');

    const generationSteps = [
      'Applying premium brand palettes...',
      'Structuring layout and visual blocks...',
      'Deploying secure schema routing...',
      'Finalizing high-contrast asset configurations...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < generationSteps.length) {
        setCurrentStep(generationSteps[stepIndex]);
        stepIndex++;
      }
    }, 1100);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          userId: auth.currentUser?.uid || '',
          locale: 'en'
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (data && data.category && data.payload) {
        const { category, payload, assistantMessage } = data;

        // Save generated resource locally/Firestore
        await saveGeneratedPayload(category, payload);

        // Success audio cue
        playAudioSound('generate');

        // Add success assistant message
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: assistantMessage || `Perfect! Your campaign has been automatically generated in your workspace.`,
          status: 'success',
          category
        }]);

        // Provide smart automatic routing
        setTimeout(() => {
          if (category === 'restaurant-menus') {
            setActiveTab('menu');
          } else if (category === 'business-cards') {
            setActiveTab('card');
          } else if (category === 'pdf-sharing') {
            setActiveTab('pdf');
          } else if (category === 'landing-pages' || category === 'campaigns') {
            onNavigate('/marketing-platform');
          }
        }, 1500);

      } else {
        throw new Error('Invalid schema format received');
      }

    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setMessages(prev => [...prev, {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        text: "I analyzed your request but encountered an error. Let me help you anyway! Please make sure your server is online, or select one of the core modules directly.",
        status: 'error'
      }]);
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="ai-assistant-floating-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl font-bold text-xs tracking-wide transition-all cursor-pointer border border-indigo-500"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>AI Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-drawer-container"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[380px] sm:w-[420px] h-[580px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800"
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-150 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-slate-500">Global Co-Pilot</h3>
                  <h2 className="text-sm font-extrabold text-slate-900">AI Campaign Assistant</h2>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black
                      ${msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }
                    `}>
                      {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-1">
                      <div className={`p-3 rounded-xl text-xs leading-relaxed font-medium shadow-3xs
                        ${msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'
                        }
                      `}>
                        {msg.text}

                        {msg.status === 'success' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Ready! Navigating you to the workspace...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-150 p-3 rounded-xl text-xs shadow-3xs text-slate-500 italic flex flex-col gap-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-600 not-italic">AI Co-Pilot is working</span>
                      <span>{currentStep || 'Synthesizing layout structures...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions / Quick Command Chips */}
              {messages.length === 1 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Actions</span>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_COMMANDS.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.label}
                          onClick={() => handleCommandSubmit(cmd.label)}
                          className="flex items-start gap-3 p-2.5 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all text-left group cursor-pointer"
                        >
                          <div className="p-1.5 bg-slate-50 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 rounded-lg transition-colors mt-0.5 border border-slate-150">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 block">{cmd.label}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{cmd.desc}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 self-center transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommandSubmit(inputValue);
              }}
              className="bg-white border-t border-slate-150 p-3.5 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Ask Co-Pilot (e.g. 'Create Restaurant Campaign')"
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white text-xs font-medium px-3.5 py-2.5 rounded-xl outline-hidden transition-all text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer border border-transparent shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
