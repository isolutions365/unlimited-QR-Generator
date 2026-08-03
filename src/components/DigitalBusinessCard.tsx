import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Contact, Mail, Phone, MapPin, Globe, Share2, Download, Save, 
  QrCode, ExternalLink, Trash2, Plus, CheckCircle2, Copy, 
  Sparkles, ShieldCheck, Smartphone, Eye, UploadCloud, ChevronRight, Check,
  Briefcase, Landmark, Info
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { playAudioSound } from '../utils/audioFeedback';

// Interfaces
interface SocialLink {
  id: string;
  platform: 'LinkedIn' | 'Twitter/X' | 'Instagram' | 'GitHub' | 'Facebook' | 'YouTube' | 'Custom';
  url: string;
}

interface DigitalCardData {
  id: string;
  name: string;
  photoUrl: string; // Base64 or absolute image link
  logoUrl: string; // Base64 or absolute image link
  company: string;
  title: string;
  email: string;
  phone: string;
  whatsApp: string;
  address: string;
  website: string;
  socialLinks: SocialLink[];
  theme: 'executive' | 'obsidian' | 'tech' | 'terracotta';
  layout: 'standard' | 'minimal' | 'executive';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

const PRESET_LOGOS = [
  '⚡ ApexCorp',
  '🍃 BioSphere',
  '🛡️ Sentinel',
  '🌌 NebulaTech'
];

export default function DigitalBusinessCard() {
  const [cardData, setCardData] = useState<DigitalCardData>({
    id: 'card-' + Math.random().toString(36).substring(2, 9),
    name: 'Sarah Jenkins',
    photoUrl: PRESET_AVATARS[0],
    logoUrl: '',
    company: 'Apex Digital Solutions',
    title: 'Chief Design Officer',
    email: 'sarah.jenkins@apexcorp.io',
    phone: '+1 (555) 234-5678',
    whatsApp: '+15552345678',
    address: '100 Pine Street, San Francisco, CA 94111',
    website: 'https://apexcorp.io',
    socialLinks: [
      { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/sarah-jenkins-design' },
      { id: '2', platform: 'Twitter/X', url: 'https://x.com/sarahj_design' }
    ],
    theme: 'executive',
    layout: 'standard'
  });

  const [savedCards, setSavedCards] = useState<DigitalCardData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrMode, setQrMode] = useState<'vcard' | 'web'>('vcard');
  const [selectedWalletTab, setSelectedWalletTab] = useState<'apple' | 'google'>('apple');
  const [activePresetLogoIndex, setActivePresetLogoIndex] = useState<number | null>(null);

  // Load Saved Cards
  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        const q = query(collection(db, 'business_cards'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: DigitalCardData[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as DigitalCardData);
        });
        setSavedCards(list);
      } catch (err) {
        console.error('Error fetching business cards from Firestore:', err);
      }
    } else {
      // LocalStorage fallback for guests
      const cached = localStorage.getItem('guest_business_cards');
      if (cached) {
        try {
          setSavedCards(JSON.parse(cached));
        } catch (e) {
          console.warn('Error reading local business cards', e);
        }
      }
    }
  };

  // Base64 File Readers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, logoUrl: reader.result as string }));
        setActivePresetLogoIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add & Delete Social Links
  const addSocialLink = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setCardData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: newId, platform: 'LinkedIn', url: '' }]
    }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (id: string) => {
    setCardData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link.id !== id)
    }));
  };

  // Generate vCard payload
  const generateVCard = () => {
    const socialText = cardData.socialLinks
      .map(link => `X-SOCIALPROFILE;type=${link.platform}:${link.url}`)
      .join('\n');

    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${cardData.name}`,
      `ORG:${cardData.company}`,
      `TITLE:${cardData.title}`,
      `EMAIL;TYPE=PREF,INTERNET:${cardData.email}`,
      `TEL;TYPE=CELL,VOICE:${cardData.phone}`,
      cardData.whatsApp ? `TEL;TYPE=WORK,MSG:${cardData.whatsApp}` : '',
      `ADR;TYPE=WORK,POSTAL:${cardData.address}`,
      `URL:${cardData.website}`,
      socialText,
      `REV:${new Date().toISOString()}`,
      'END:VCARD'
    ].filter(Boolean).join('\n');
  };

  // Download VCF Contact Card
  const downloadVCF = () => {
    const vcard = generateVCard();
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cardData.name.replace(/\s+/g, '_')}_contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('preview');
  };

  // Save Card to Firestore
  const handleSaveCard = async () => {
    setIsSaving(true);
    const userId = auth.currentUser?.uid;
    const currentCard = { ...cardData, updatedAt: new Date().toISOString() };

    if (userId) {
      try {
        await setDoc(doc(db, 'business_cards', currentCard.id), {
          ...currentCard,
          userId
        });
        playAudioSound('generate');
      } catch (err) {
        console.error('Firestore save failed', err);
      }
    } else {
      // LocalStorage backup for guests
      const updatedList = [
        currentCard,
        ...savedCards.filter(c => c.id !== currentCard.id)
      ];
      localStorage.setItem('guest_business_cards', JSON.stringify(updatedList));
      playAudioSound('generate');
    }

    await loadSavedCards();
    setIsSaving(false);
  };

  const handleDeleteCard = async (id: string) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      try {
        await deleteDoc(doc(db, 'business_cards', id));
        playAudioSound('preview');
      } catch (err) {
        console.error('Firestore delete failed', err);
      }
    } else {
      const updatedList = savedCards.filter(c => c.id !== id);
      localStorage.setItem('guest_business_cards', JSON.stringify(updatedList));
      playAudioSound('preview');
    }
    await loadSavedCards();
  };

  const handleSelectCard = (selected: DigitalCardData) => {
    setCardData(selected);
    playAudioSound('preview');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/card-preview?name=${encodeURIComponent(cardData.name)}&title=${encodeURIComponent(cardData.title)}&company=${encodeURIComponent(cardData.company)}&email=${encodeURIComponent(cardData.email)}&phone=${encodeURIComponent(cardData.phone)}&website=${encodeURIComponent(cardData.website)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.name} - Digital Business Card`,
          text: `Connect with ${cardData.name} (${cardData.title} at ${cardData.company})`,
          url: shareUrl
        });
        playAudioSound('generate');
      } catch (err) {
        console.warn('Share cancelled or failed', err);
      }
    } else {
      copyToClipboard(shareUrl, 'Share Link');
    }
  };

  // QR Code Content URL (direct vcard download payload or public redirect link)
  const getQRContent = () => {
    if (qrMode === 'vcard') {
      return generateVCard();
    }
    // Web Mode link formulation
    return `${window.location.origin}/card-preview?id=${cardData.id}&name=${encodeURIComponent(cardData.name)}&company=${encodeURIComponent(cardData.company)}`;
  };

  // QR Code Image Generator API Endpoint
  const getQRImageSrc = () => {
    const content = encodeURIComponent(getQRContent());
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${content}&color=0f172a&bgcolor=ffffff&margin=10`;
  };

  // Apple Wallet Ready Manifest Generator (pass.json)
  const getAppleWalletPassJSON = () => {
    return JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: "pass.com.freeqrgen.digitalcard",
      serialNumber: cardData.id,
      teamIdentifier: "ABC123XYZ7",
      organizationName: cardData.company || "FreeQRGen Ltd",
      description: `Digital Business Card for ${cardData.name}`,
      foregroundColor: cardData.theme === 'obsidian' ? "rgb(245, 158, 11)" : "rgb(15, 23, 42)",
      backgroundColor: cardData.theme === 'obsidian' ? "rgb(15, 23, 42)" : "rgb(255, 255, 255)",
      labelColor: "rgb(100, 116, 139)",
      logoText: cardData.company || "Digital Pass",
      generic: {
        headerFields: [
          {
            key: "role",
            label: "DESIGNATION",
            value: cardData.title || "Consultant"
          }
        ],
        primaryFields: [
          {
            key: "name",
            label: "FULL NAME",
            value: cardData.name
          }
        ],
        secondaryFields: [
          {
            key: "company",
            label: "ORGANIZATION",
            value: cardData.company || "Independent"
          },
          {
            key: "email",
            label: "EMAIL ADDRESS",
            value: cardData.email
          }
        ],
        backFields: [
          {
            key: "phone",
            label: "Direct Phone",
            value: cardData.phone
          },
          {
            key: "address",
            label: "Work Address",
            value: cardData.address || "N/A"
          },
          {
            key: "website",
            label: "Official Website",
            value: cardData.website
          }
        ]
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: getQRContent(),
          messageEncoding: "iso-8859-1"
        }
      ]
    }, null, 2);
  };

  // Google Wallet Ready Save JWT Generator (Class and Object definitions)
  const getGoogleWalletJSON = () => {
    return JSON.stringify({
      issuerId: "3388000000022345678",
      classId: "3388000000022345678.digital_business_card_class",
      objectPayload: {
        id: `3388000000022345678.${cardData.id}`,
        classId: "3388000000022345678.digital_business_card_class",
        state: "ACTIVE",
        cardTitle: {
          defaultValue: {
            language: "en-US",
            value: cardData.company || "Independent"
          }
        },
        subheader: {
          defaultValue: {
            language: "en-US",
            value: cardData.title || "Executive"
          }
        },
        header: {
          defaultValue: {
            language: "en-US",
            value: cardData.name
          }
        },
        textModulesData: [
          {
            header: "CONTACT EMAIL",
            body: cardData.email,
            id: "email"
          },
          {
            header: "PHONE NUMBER",
            body: cardData.phone,
            id: "phone"
          },
          {
            header: "OFFICIAL WEBSITE",
            body: cardData.website,
            id: "website"
          }
        ],
        barcode: {
          type: "QR_CODE",
          value: getQRContent(),
          alternateText: cardData.name
        }
      }
    }, null, 2);
  };

  const downloadWalletJSON = (walletType: 'apple' | 'google') => {
    const payload = walletType === 'apple' ? getAppleWalletPassJSON() : getGoogleWalletJSON();
    const filename = walletType === 'apple' ? 'pass.json' : 'google_wallet_payload.json';
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playAudioSound('generate');
  };

  // Color mappings for themes
  const themeStyles = {
    executive: {
      card: 'bg-white text-slate-900 border-gray-100 shadow-xl shadow-slate-200/50',
      badge: 'bg-indigo-50 text-indigo-700',
      accent: 'indigo-600',
      highlight: 'indigo'
    },
    obsidian: {
      card: 'bg-slate-950 text-amber-100 border-amber-900/40 shadow-2xl shadow-amber-950/20',
      badge: 'bg-amber-950/45 text-amber-400 border border-amber-900/30',
      accent: 'amber-500',
      highlight: 'amber'
    },
    tech: {
      card: 'bg-slate-900 text-cyan-100 border-cyan-500/20 shadow-xl shadow-cyan-950/10',
      badge: 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/20',
      accent: 'cyan-500',
      highlight: 'cyan'
    },
    terracotta: {
      card: 'bg-[#faf6f0] text-amber-950 border-orange-100 shadow-xl shadow-orange-900/5',
      badge: 'bg-orange-50 text-orange-800',
      accent: 'orange-700',
      highlight: 'orange'
    }
  };

  const selectedTheme = themeStyles[cardData.theme];

  return (
    <div id="digital-business-card-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Contact className="w-8 h-8 text-indigo-600 animate-pulse" />
            Digital Business Cards
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Create, custom-style, and persistent-store luxury contact sheets. Fully compatible with Apple Wallet and Google Wallet distribution channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCardData({
                id: 'card-' + Math.random().toString(36).substring(2, 9),
                name: 'Sarah Jenkins',
                photoUrl: PRESET_AVATARS[0],
                logoUrl: '',
                company: 'Apex Digital Solutions',
                title: 'Chief Design Officer',
                email: 'sarah.jenkins@apexcorp.io',
                phone: '+1 (555) 234-5678',
                whatsApp: '+15552345678',
                address: '100 Pine Street, San Francisco, CA 94111',
                website: 'https://apexcorp.io',
                socialLinks: [
                  { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/sarah-jenkins-design' }
                ],
                theme: 'executive',
                layout: 'standard'
              });
              playAudioSound('preview');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Create New Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input form controls */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
          
          {/* Card Meta & Saving info */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Card Credentials & Info</h3>
            <button
              onClick={handleSaveCard}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Pass'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={cardData.name}
                onChange={e => setCardData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title / Designation</label>
              <input
                type="text"
                value={cardData.title}
                onChange={e => setCardData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Chief Design Officer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={cardData.company}
                onChange={e => setCardData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g. Apex Digital Solutions"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Website</label>
              <input
                type="text"
                value={cardData.website}
                onChange={e => setCardData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g. https://apexcorp.io"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={cardData.email}
                onChange={e => setCardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. sarah@apexcorp.io"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={cardData.phone}
                onChange={e => setCardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +1 (555) 234-5678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Chat Link (Or Number)</label>
              <input
                type="text"
                value={cardData.whatsApp}
                onChange={e => setCardData(prev => ({ ...prev, whatsApp: e.target.value }))}
                placeholder="e.g. +15552345678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Office/Postal Address</label>
              <input
                type="text"
                value={cardData.address}
                onChange={e => setCardData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. 100 Pine Street, San Francisco, CA"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Asset uploads: Photo & Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Profile Photo (Self-Contained)</label>
              
              <div className="flex items-center gap-3">
                <img
                  src={cardData.photoUrl || PRESET_AVATARS[1]}
                  alt="Profile Preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-50"
                />
                <div className="flex-1">
                  <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors cursor-pointer text-center text-xs text-slate-600 gap-1.5 font-semibold">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Preset avatars choice */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                <span className="text-[10px] text-slate-400 shrink-0 font-semibold">Presets:</span>
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCardData(prev => ({ ...prev, photoUrl: url }));
                      playAudioSound('preview');
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 ${cardData.photoUrl === url ? 'border-indigo-500 scale-105' : 'border-transparent opacity-85 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`Avatar Preset ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Company Emblem / Brand Logo</label>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 overflow-hidden text-xs">
                  {cardData.logoUrl ? (
                    <img src={cardData.logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  ) : (
                    <Landmark className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors cursor-pointer text-center text-xs text-slate-600 gap-1.5 font-semibold">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    Upload Brand Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Preset logo labels choice */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                <span className="text-[10px] text-slate-400 shrink-0 font-semibold">Texts:</span>
                {PRESET_LOGOS.map((emblem, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePresetLogoIndex(i);
                      // Custom string-to-visual embedding placeholder
                      setCardData(prev => ({ ...prev, company: emblem.substring(3), logoUrl: '' }));
                      playAudioSound('preview');
                    }}
                    className={`text-[10px] px-2 py-1 rounded-md border shrink-0 transition-colors ${activePresetLogoIndex === i ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {emblem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links List */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Dynamic Social Integrations</h4>
                <p className="text-[10px] text-slate-400">Append custom profiles links (LinkedIn, YouTube, X, etc.)</p>
              </div>
              <button
                type="button"
                onClick={addSocialLink}
                className="py-1 px-3 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>

            <div className="space-y-3">
              {cardData.socialLinks.map((link, idx) => (
                <div key={link.id} className="flex items-center gap-3">
                  <select
                    value={link.platform}
                    onChange={e => updateSocialLink(link.id, 'platform', e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="Instagram">Instagram</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Facebook">Facebook</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <input
                    type="text"
                    value={link.url}
                    onChange={e => updateSocialLink(link.id, 'url', e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/username"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {cardData.socialLinks.length === 0 && (
                <div className="text-center py-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-[11px] text-slate-400">No active social links. Click "Add Link" to integrate networks.</p>
                </div>
              )}
            </div>
          </div>

          {/* Style Customizer */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">Visual Theme & Layout</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'executive', label: 'Executive Minimal', desc: 'White & Blue', bg: 'bg-white border-slate-200' },
                { id: 'obsidian', label: 'Sleek Obsidian', desc: 'Dark & Amber Gold', bg: 'bg-slate-900 border-amber-900/40 text-amber-200' },
                { id: 'tech', label: 'Tech Slate', desc: 'Sleek Cyan Neon', bg: 'bg-slate-800 border-cyan-500/30 text-cyan-200' },
                { id: 'terracotta', label: 'Warm Craft', desc: 'Organic Clay Cream', bg: 'bg-[#faf6f0] border-orange-200 text-amber-950' }
              ].map(themeItem => (
                <button
                  key={themeItem.id}
                  onClick={() => {
                    setCardData(prev => ({ ...prev, theme: themeItem.id as any }));
                    playAudioSound('preview');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${cardData.theme === themeItem.id ? 'ring-2 ring-indigo-500 border-transparent shadow-sm scale-[1.02]' : 'hover:bg-slate-50 border-slate-200/80'}`}
                >
                  <div className={`w-4 h-4 rounded-full ${themeItem.bg} mb-2 border`} />
                  <p className="text-[10px] font-bold leading-tight truncate">{themeItem.label}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">{themeItem.desc}</p>
                  {cardData.theme === themeItem.id && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Database & saved cards listing */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Saved Cards on Account / Cache</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedCards.map(saved => (
                <div
                  key={saved.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${cardData.id === saved.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectCard(saved)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-xs font-bold text-slate-800 truncate">{saved.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{saved.title} | {saved.company}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(saved.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {savedCards.length === 0 && (
                <div className="col-span-full py-6 text-center text-[11px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl">
                  No saved passes found. Click "Save Pass" above to register and secure your business card!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realtime visual mockup, flippable card, QR, Wallet Ready Architectures */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {/* Section 1: Visual Interactive 3D/Flippable Card Mockup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Double-Sided Live Mockup</span>
              <button
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playAudioSound('preview');
                }}
                className="py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                Flip Card (View {isFlipped ? 'Front' : 'Back'})
              </button>
            </div>

            {/* Simulated 3D Card container */}
            <div className="relative w-full h-64 [perspective:1000px]">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full h-full relative [transform-style:preserve-3d] cursor-pointer"
                onClick={() => {
                  setIsFlipped(!isFlipped);
                  playAudioSound('preview');
                }}
              >
                {/* FRONT SIDE */}
                <div 
                  className={`absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl border flex flex-col justify-between [backface-visibility:hidden] ${selectedTheme.card}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Visual header */}
                    <div>
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${selectedTheme.badge}`}>
                        {cardData.company || 'INDEPENDENT'}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black tracking-tight mt-2 leading-tight">
                        {cardData.name || 'Anonymous User'}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        {cardData.title || 'Product Developer'}
                      </p>
                    </div>

                    {/* Logo/Emblem placeholder */}
                    <div className="w-12 h-12 shrink-0 bg-slate-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/20 text-xs font-bold">
                      {cardData.logoUrl ? (
                        <img src={cardData.logoUrl} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                      ) : (
                        <span>Logo</span>
                      )}
                    </div>
                  </div>

                  {/* Front Footer */}
                  <div className="flex items-center gap-4 border-t border-slate-500/15 pt-4">
                    <img
                      src={cardData.photoUrl || PRESET_AVATARS[1]}
                      alt="Avatar Photo"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 bg-slate-100 shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Contact Channels</p>
                      <p className="text-xs font-bold truncate opacity-90">{cardData.email}</p>
                      <p className="text-[11px] truncate opacity-85 mt-0.5">{cardData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  className={`absolute inset-0 w-full h-full p-6 rounded-2xl border flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] ${selectedTheme.card}`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center h-full">
                    {/* Info fields */}
                    <div className="col-span-8 space-y-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase block">Personal QR ID</span>
                        <p className="text-xs font-black truncate">{cardData.name}</p>
                      </div>

                      {cardData.address && (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] font-semibold opacity-90 leading-normal">{cardData.address}</p>
                        </div>
                      )}

                      {cardData.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                          <p className="text-[9px] font-semibold opacity-90 truncate">{cardData.website.replace(/^https?:\/\//i, '')}</p>
                        </div>
                      )}

                      {/* Social chips list */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cardData.socialLinks.map(link => (
                          <span
                            key={link.id}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${selectedTheme.badge}`}
                          >
                            {link.platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* QR Code back-side preview */}
                    <div className="col-span-4 flex flex-col items-center justify-center gap-1">
                      <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-xs max-w-[85px]">
                        <img
                          src={getQRImageSrc()}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center">Scan to Connect</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Section 2: QR Code Preview, Copy & Export Panel */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600" />
                Interact & Share
              </h4>
              <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex">
                <button
                  onClick={() => {
                    setQrMode('vcard');
                    playAudioSound('preview');
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md ${qrMode === 'vcard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Direct vCard
                </button>
                <button
                  onClick={() => {
                    setQrMode('web');
                    playAudioSound('preview');
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md ${qrMode === 'web' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Web Profile
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="w-28 h-28 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <img
                  src={getQRImageSrc()}
                  alt="Full QR Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    {qrMode === 'vcard' ? 'VCARD GENERATOR DATA' : 'WEB REDIRECT MODULE'}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">
                    {qrMode === 'vcard' 
                      ? 'Encodes Name, Address, Email, Phone, Logo & Website inside the QR matrix.'
                      : 'Creates a simulated, interactive digital business profile on scan.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={downloadVCF}
                    className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .VCF Card
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                    {copiedField === 'Share Link' ? 'Copied!' : 'Share Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Apple & Google Wallet Ready Architectures */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Wallet Ready Distribution Engines
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspect architecture scripts and generate fully formatted JSON payloads required to register passes for Apple and Google devices.
              </p>
            </div>

            {/* Tabs for choosing Apple / Google */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-1 flex">
              <button
                onClick={() => {
                  setSelectedWalletTab('apple');
                  playAudioSound('preview');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${selectedWalletTab === 'apple' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                 Apple Wallet Ready
              </button>
              <button
                onClick={() => {
                  setSelectedWalletTab('google');
                  playAudioSound('preview');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${selectedWalletTab === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
              >
                🤖 Google Wallet Ready
              </button>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {selectedWalletTab === 'apple' ? (
                <motion.div
                  key="apple-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* Apple Wallet visual pass mockup */}
                  <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden shadow-lg shadow-slate-950/10">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl"></span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Apple Wallet Pass</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{cardData.company || 'MEMBER'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Designation</span>
                        <span className="text-xs font-bold text-slate-200">{cardData.title}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">Full Name</span>
                        <span className="text-xs font-bold text-slate-200">{cardData.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] text-slate-500 font-bold block">WALLET ATTACHMENT</span>
                        <span className="text-[10px] text-slate-300 font-mono block">pass.json compiled</span>
                      </div>
                      <div className="w-12 h-12 bg-white p-0.5 rounded-sm">
                        <img src={getQRImageSrc()} alt="Pass QR" className="w-full h-full" />
                      </div>
                    </div>
                  </div>

                  {/* Architecture spec */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Architecture spec (pass.json)</span>
                      <button
                        onClick={() => copyToClipboard(getAppleWalletPassJSON(), 'Apple JSON')}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'Apple JSON' ? 'Copied' : 'Copy JSON'}
                      </button>
                    </div>
                    <pre className="text-[9px] text-slate-600 font-mono bg-white border border-slate-100 p-2.5 rounded-lg overflow-x-auto max-h-36">
                      {getAppleWalletPassJSON()}
                    </pre>
                    <div className="flex items-start gap-1.5 pt-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-[9.5px] text-slate-400 leading-normal">
                        Ready to be bundled into a <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold font-mono">.pkpass</code> archive signed with your Apple Developer Certificate and distributed via email or Safari.
                      </p>
                    </div>

                    <button
                      onClick={() => downloadWalletJSON('apple')}
                      className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      Download pass.json Blueprint
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="google-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  {/* Google Wallet visual pass mockup */}
                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden shadow-lg shadow-slate-900/10">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google Wallet Pass</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{cardData.company || 'AFFILIATE'}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block tracking-widest">Card Holder</span>
                        <h5 className="text-base font-bold text-slate-100">{cardData.name}</h5>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block tracking-widest">Email Address</span>
                          <span className="text-xs font-bold text-slate-200">{cardData.email}</span>
                        </div>
                        <div className="w-14 h-14 bg-white p-0.5 rounded-sm">
                          <img src={getQRImageSrc()} alt="Pass QR" className="w-full h-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Architecture spec */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">REST API Class & Object Structure</span>
                      <button
                        onClick={() => copyToClipboard(getGoogleWalletJSON(), 'Google JSON')}
                        className="text-[10px] text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedField === 'Google JSON' ? 'Copied' : 'Copy JSON'}
                      </button>
                    </div>
                    <pre className="text-[9px] text-slate-600 font-mono bg-white border border-slate-100 p-2.5 rounded-lg overflow-x-auto max-h-36">
                      {getGoogleWalletJSON()}
                    </pre>
                    <div className="flex items-start gap-1.5 pt-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-[9.5px] text-slate-400 leading-normal">
                        Ready to be serialized into a signed JWT and transmitted via standard Google Pay API button <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold font-mono">saveToAndroid</code> redirects.
                      </p>
                    </div>

                    <button
                      onClick={() => downloadWalletJSON('google')}
                      className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      Download Google Wallet JSON
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
