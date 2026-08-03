import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Upload, QrCode, Eye, Download, Shield, Clock, 
  Trash2, FileUp, Settings, BarChart2, RefreshCw, Key, 
  Calendar, Check, Copy, HardDrive, History, FileCheck, 
  Sparkles, ExternalLink, HelpCircle, Lock, LockOpen, Info,
  Search, ShieldAlert, ArrowRight, Share2, Plus, Sliders, Smartphone
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { api } from '../lib/api';
import { playAudioSound } from '../utils/audioFeedback';

// Interfaces
interface PdfVersion {
  versionId: string;
  fileName: string;
  fileSize: string; // e.g. "1.4 MB"
  uploadedAt: string;
  base64Data?: string; // Stored locally to allow actual simulated previewing/downloading
}

interface PdfShareConfig {
  id: string;
  title: string;
  description: string;
  activeFileName: string;
  activeFileSize: string;
  activeFileUrl: string; // Simulated link or base64 data URI
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  // Security & Expiry
  password?: string;
  expiryDate?: string; // ISO string or null
  maxDownloads?: number; // Unlimited if null/0
  // Version history
  versions: PdfVersion[];
  themeColor: 'indigo' | 'emerald' | 'rose' | 'amber';
}

const PRESET_PDF_TEMPLATES = [
  { name: 'Corporate_Q2_Business_Plan.pdf', size: '2.4 MB', type: 'application/pdf', content: 'JVBERi0xLjQKJVRydXN0ZWQgQ29ycG9yYXRlIFByZXNlbnRhdGlvbiBmb3IgUXVpY2sgUXIgRG93bmxvYWQ=' },
  { name: 'Restaurant_Wine_Aesthetic_List.pdf', size: '1.8 MB', type: 'application/pdf', content: 'JVBERi0xLjQKRGVsaWNpb3VzIFdpbmUgJiBDdWxpbmFyeSBNZW51IGZvciBQRkYgU2hhcmU=' },
  { name: 'Modern_Real_Estate_Brochure.pdf', size: '4.1 MB', type: 'application/pdf', content: 'JVBERi0xLjQKUGVyc29uYWwgcmVhbCBlc3RhdGUgcG9ydGZvbGlvIHdpdGggUXIgY29kZXM=' }
];

export default function PdfSharing() {
  const [shares, setShares] = useState<PdfShareConfig[]>([]);
  const [selectedShare, setSelectedShare] = useState<PdfShareConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Storage Quota Stats
  const [totalStorageUsedMB, setTotalStorageUsedMB] = useState(8.3); // Initial simulated quota
  const storageLimitMB = 100;

  // New PDF Form Draft
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfExpiry, setPdfExpiry] = useState('');
  const [pdfMaxDownloads, setPdfMaxDownloads] = useState('');
  const [pdfThemeColor, setPdfThemeColor] = useState<'indigo' | 'emerald' | 'rose' | 'amber'>('indigo');

  // Visitor Simulation Modal States
  const [simulatedShare, setSimulatedShare] = useState<PdfShareConfig | null>(null);
  const [visitorPasswordInput, setVisitorPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [simulatedDownloadSuccess, setSimulatedDownloadSuccess] = useState(false);
  const [simulatedViewSuccess, setSimulatedViewSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved shares on mount
  useEffect(() => {
    loadSavedShares();
  }, []);

  const loadSavedShares = async () => {
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
        const q = query(collection(db, 'pdf_shares'), where('userId', '==', userId));
        const snap = await getDocs(q);
        const list: PdfShareConfig[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as PdfShareConfig);
        });
        setShares(list);
        if (list.length > 0 && !selectedShare) {
          setSelectedShare(list[0]);
        }
      } catch (err) {
        console.error('Error fetching PDF shares from Firestore:', err);
      }
    }
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        size: `${sizeInMB} MB`,
        content: (reader.result as string) || 'JVBERi0xLjQKJVRydXN0ZWQgUERGIFNoYXJl'
      });
      playAudioSound('preview');
    };
    reader.readAsDataURL(file);
  };

  const selectPresetTemplate = (idx: number) => {
    const template = PRESET_PDF_TEMPLATES[idx];
    setUploadedFile({
      name: template.name,
      size: template.size,
      content: template.content
    });
    playAudioSound('preview');
  };

  // Create new PDF Share Entry
  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile || !newTitle.trim()) return;

    setIsSaving(true);
    const shareId = 'pdf-' + Math.random().toString(36).substring(2, 9);
    
    const initialVersion: PdfVersion = {
      versionId: 'v1-' + Math.random().toString(36).substring(2, 5),
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadedAt: new Date().toISOString(),
      base64Data: uploadedFile.content
    };

    const newShare: PdfShareConfig = {
      id: shareId,
      title: newTitle,
      description: newDescription || 'Quick secure PDF sharing via dynamic, trackable QR code.',
      activeFileName: uploadedFile.name,
      activeFileSize: uploadedFile.size,
      activeFileUrl: uploadedFile.content,
      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      password: pdfPassword || undefined,
      expiryDate: pdfExpiry || undefined,
      maxDownloads: pdfMaxDownloads ? parseInt(pdfMaxDownloads) : undefined,
      versions: [initialVersion],
      themeColor: pdfThemeColor
    };

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
        await setDoc(doc(db, 'pdf_shares', shareId), {
          ...newShare,
          userId
        });
        await api.saveProject({
          id: newShare.id,
          name: newShare.title || 'PDF Share',
          type: 'pdf',
          content: `${window.location.origin}/#pdf-${newShare.id}`,
          userId: userId,
          trackingId: newShare.id
        }).catch(() => {});
        playAudioSound('generate');
      } catch (err) {
        console.error('Firestore PDF save failed', err);
      }
    }

    // Update Simulated Storage Limit
    const sizeFloat = parseFloat(uploadedFile.size) || 1.0;
    setTotalStorageUsedMB(prev => Math.min(storageLimitMB, prev + sizeFloat));

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setUploadedFile(null);
    setPdfPassword('');
    setPdfExpiry('');
    setPdfMaxDownloads('');
    
    await loadSavedShares();
    setSelectedShare(newShare);
    setIsSaving(false);
  };

  // Rollback to previous version or replace active file
  const handleReplaceFile = (file: File) => {
    if (!selectedShare) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string) || 'JVBERi0xLjQ=';
      
      const newVer: PdfVersion = {
        versionId: 'v' + (selectedShare.versions.length + 1) + '-' + Math.random().toString(36).substring(2, 5),
        fileName: file.name,
        fileSize: `${sizeInMB} MB`,
        uploadedAt: new Date().toISOString(),
        base64Data: base64
      };

      const updatedShare: PdfShareConfig = {
        ...selectedShare,
        activeFileName: file.name,
        activeFileSize: `${sizeInMB} MB`,
        activeFileUrl: base64,
        versions: [newVer, ...selectedShare.versions]
      };

      await updateShareInDb(updatedShare);
    };
    reader.readAsDataURL(file);
  };

  const handleRollbackVersion = async (ver: PdfVersion) => {
    if (!selectedShare) return;

    const updatedShare: PdfShareConfig = {
      ...selectedShare,
      activeFileName: ver.fileName,
      activeFileSize: ver.fileSize,
      activeFileUrl: ver.base64Data || selectedShare.activeFileUrl,
      // Move this to the top of the version list or keep history
    };

    await updateShareInDb(updatedShare);
    playAudioSound('generate');
  };

  const handleUpdateSecuritySettings = async (updates: Partial<PdfShareConfig>) => {
    if (!selectedShare) return;

    const updatedShare: PdfShareConfig = {
      ...selectedShare,
      ...updates
    };

    await updateShareInDb(updatedShare);
  };

  const updateShareInDb = async (updated: PdfShareConfig) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    if (userId) {
      try {
        await setDoc(doc(db, 'pdf_shares', updated.id), {
          ...updated,
          userId
        });
      } catch (err) {
        console.error('Error updating Firestore PDF config:', err);
      }
    }
    
    setSelectedShare(updated);
    await loadSavedShares();
    playAudioSound('preview');
  };

  const handleDeleteShare = async (id: string) => {
    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    const shareToDelete = shares.find(s => s.id === id);
    const deletedSize = shareToDelete ? parseFloat(shareToDelete.activeFileSize) || 1.5 : 1.5;

    if (userId) {
      try {
        await deleteDoc(doc(db, 'pdf_shares', id));
        await api.deleteProject(id).catch(() => {});
        playAudioSound('preview');
      } catch (err) {
        console.error('Firestore PDF delete failed', err);
      }
    }

    setTotalStorageUsedMB(prev => Math.max(0, prev - deletedSize));
    
    const remaining = shares.filter(s => s.id !== id);
    if (remaining.length > 0) {
      setSelectedShare(remaining[0]);
    } else {
      setSelectedShare(null);
    }
    await loadSavedShares();
  };

  // Visitor Simulation Handlers
  const openVisitorSimulation = (share: PdfShareConfig) => {
    setSimulatedShare(share);
    setVisitorPasswordInput('');
    setPasswordError(false);
    setSimulatedDownloadSuccess(false);
    setSimulatedViewSuccess(false);
    playAudioSound('preview');
  };

  const handleSimulatedPasswordSubmit = () => {
    if (!simulatedShare) return;
    if (visitorPasswordInput === simulatedShare.password) {
      setPasswordError(false);
      playAudioSound('generate');
    } else {
      setPasswordError(true);
      playAudioSound('preview');
    }
  };

  const recordSimulatedView = async () => {
    if (!simulatedShare) return;
    setSimulatedViewSuccess(true);
    
    const updated = {
      ...simulatedShare,
      viewCount: simulatedShare.viewCount + 1
    };

    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    if (userId) {
      await setDoc(doc(db, 'pdf_shares', updated.id), { ...updated, userId });
    }

    setSimulatedShare(updated);
    if (selectedShare?.id === updated.id) {
      setSelectedShare(updated);
    }
    await loadSavedShares();
    playAudioSound('generate');
  };

  const recordSimulatedDownload = async () => {
    if (!simulatedShare) return;
    
    // Check download limit
    if (simulatedShare.maxDownloads && simulatedShare.downloadCount >= simulatedShare.maxDownloads) {
      playAudioSound('preview');
      return;
    }

    setSimulatedDownloadSuccess(true);
    const updated = {
      ...simulatedShare,
      downloadCount: simulatedShare.downloadCount + 1
    };

    let userId = auth.currentUser?.uid;
    if (!userId) {
      try {
        const anon = await signInAnonymously(auth);
        userId = anon.user.uid;
      } catch (e) {}
    }
    if (userId) {
      await setDoc(doc(db, 'pdf_shares', updated.id), { ...updated, userId });
    }

    setSimulatedShare(updated);
    if (selectedShare?.id === updated.id) {
      setSelectedShare(updated);
    }
    await loadSavedShares();
    playAudioSound('generate');

    // Trigger physical text download representing the simulated PDF file
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJVRydXN0ZWQgUERGIFNoYXJl';
    link.download = simulatedShare.activeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    playAudioSound('generate');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Expiry Checker helper
  const isExpired = (share: PdfShareConfig) => {
    if (!share.expiryDate) return false;
    const expiry = new Date(share.expiryDate);
    return expiry < new Date();
  };

  // Limit checker helper
  const isLimitReached = (share: PdfShareConfig) => {
    if (!share.maxDownloads) return false;
    return share.downloadCount >= share.maxDownloads;
  };

  // Theme palettes helper
  const colorThemes = {
    indigo: {
      accent: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      border: 'border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500',
      text: 'text-indigo-700',
      badge: 'bg-indigo-50 text-indigo-800 border-indigo-100',
      lightBg: 'bg-indigo-50/40',
      progress: 'bg-indigo-600',
      hex: '4f46e5'
    },
    emerald: {
      accent: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      border: 'border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      lightBg: 'bg-emerald-50/40',
      progress: 'bg-emerald-600',
      hex: '059669'
    },
    rose: {
      accent: 'bg-rose-600 hover:bg-rose-700 text-white',
      border: 'border-rose-200 focus:ring-rose-500 focus:border-rose-500',
      text: 'text-rose-700',
      badge: 'bg-rose-50 text-rose-800 border-rose-100',
      lightBg: 'bg-rose-50/40',
      progress: 'bg-rose-600',
      hex: 'e11d48'
    },
    amber: {
      accent: 'bg-amber-600 hover:bg-amber-700 text-white',
      border: 'border-amber-200 focus:ring-amber-500 focus:border-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-100',
      lightBg: 'bg-amber-50/40',
      progress: 'bg-amber-600',
      hex: 'd97706'
    }
  };

  const selectedTheme = colorThemes[selectedShare?.themeColor || 'indigo'];

  // QR Redirect Link generator
  const getVisitorLink = (id: string) => {
    return `${window.location.origin}/share-preview?type=pdf&id=${id}`;
  };

  const getQRImageSrc = (share: PdfShareConfig) => {
    const link = encodeURIComponent(getVisitorLink(share.id));
    const qrColor = colorThemes[share.themeColor].hex;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${link}&color=${qrColor}&bgcolor=ffffff&margin=12`;
  };

  return (
    <div id="pdf-sharing-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/20">
              PDF Sharing & Hosting
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Dynamic QR PDF Sharing Hub
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Upload PDF brochures, real estate guides, or menus. Instantly generate QR codes, replace the underlying file at any time without changing the QR code, configure passwords, and track user downloads.
          </p>
        </div>

        {/* Storage Quota Meter */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl w-full md:w-64 relative z-10">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Cloud Space Used
            </span>
            <span className="text-indigo-400">{totalStorageUsedMB.toFixed(1)} / {storageLimitMB} MB</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(totalStorageUsedMB / storageLimitMB) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Guests get 100MB free persistent sandbox storage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PDF Manager list and Uploader */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Upload and Register PDF share */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <FileUp className="w-5 h-5 text-indigo-600" />
                1. Upload PDF Document
              </h3>
              <p className="text-[11px] text-slate-400">Drag & drop your PDF file or try out one of our pre-configured documents.</p>
            </div>

            <form onSubmit={handleCreateShare} className="space-y-4">
              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-600 bg-indigo-50/30' 
                    : uploadedFile 
                    ? 'border-emerald-300 bg-emerald-50/10' 
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />
                
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploadedFile ? 'bg-emerald-100' : 'bg-indigo-50'}`}>
                    {uploadedFile ? (
                      <FileCheck className="w-6 h-6 text-emerald-600 animate-bounce" />
                    ) : (
                      <Upload className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  
                  {uploadedFile ? (
                    <div>
                      <p className="text-xs font-bold text-slate-800">{uploadedFile.name}</p>
                      <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">Ready to publish ({uploadedFile.size})</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Drag & drop PDF here, or click to browse</p>
                      <p className="text-[10px] text-slate-400 mt-1">Supports standard PDF formats up to 25 MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Or Use High-Quality Culinary / Real Estate Presets</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_PDF_TEMPLATES.map((tpl, i) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => selectPresetTemplate(i)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-2 cursor-pointer ${uploadedFile?.name === tpl.name ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-[10px]">{tpl.name}</p>
                        <p className="text-[8px] text-slate-400">{tpl.size}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Metadata fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Real Estate Q4 Portfolio"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Styling Palette</label>
                  <select
                    value={pdfThemeColor}
                    onChange={e => setPdfThemeColor(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs bg-white focus:ring-1 focus:ring-indigo-400 outline-none"
                  >
                    <option value="indigo">Classic Indigo</option>
                    <option value="emerald">Organic Emerald</option>
                    <option value="rose">Elegant Rose</option>
                    <option value="amber">Autumn Saffron</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Description / Subtitle</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Brief detail shown to users scanning or downloading the PDF."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>
              </div>

              {/* Collapsible Security Settings for creation */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Security, Passwords & Expiry Limits (Optional)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Set Password Protection</label>
                    <div className="relative">
                      <Key className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="password"
                        value={pdfPassword}
                        onChange={e => setPdfPassword(e.target.value)}
                        placeholder="e.g. Vault44"
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Expiration Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="date"
                        value={pdfExpiry}
                        onChange={e => setPdfExpiry(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Max Download Limit</label>
                    <div className="relative">
                      <Download className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        value={pdfMaxDownloads}
                        onChange={e => setPdfMaxDownloads(e.target.value)}
                        placeholder="Unlimited if empty"
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-[11px] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !uploadedFile || !newTitle.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {isSaving ? 'Hosting Document...' : 'Publish & Generate QR'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Uploaded PDF shares list */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Active Hosted PDF Documents ({shares.length})
            </h3>

            <div className="space-y-3">
              {shares.map(share => {
                const isSelected = selectedShare?.id === share.id;
                const expired = isExpired(share);
                const limitReached = isLimitReached(share);
                const theme = colorThemes[share.themeColor];

                return (
                  <div
                    key={share.id}
                    onClick={() => {
                      setSelectedShare(share);
                      playAudioSound('preview');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected 
                        ? 'bg-slate-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400' 
                        : 'border-slate-200/80 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${theme.lightBg} ${theme.border}`}>
                        <FileText className={`w-5 h-5 ${theme.text}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-black text-slate-800 truncate">{share.title}</p>
                          {share.password && (
                            <span className="text-[8px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                              <Lock className="w-2.5 h-2.5" />
                              Secure
                            </span>
                          )}
                          {expired && (
                            <span className="text-[8px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-md font-bold">
                              Expired
                            </span>
                          )}
                          {limitReached && (
                            <span className="text-[8px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.5 rounded-md font-bold">
                              Limit Reached
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{share.description}</p>
                        <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <span className="font-extrabold">{share.activeFileName}</span> • <span>{share.activeFileSize}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      {/* Analytics counters badge */}
                      <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/40 text-[10px] text-slate-600 font-bold shrink-0">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {share.viewCount}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1" title="Downloads">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          {share.downloadCount}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteShare(share.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Delete Document Share"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {shares.length === 0 && (
                <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-xs text-slate-400">No hosted PDFs. Create your first file sharing above to populate database.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: The Interactive Dynamic QR and Analytics Preview */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          
          {selectedShare ? (
            <div className="space-y-6">
              
              {/* Card 1: Dynamic QR Code Generator Display */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 text-center space-y-5 relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-indigo-500 to-emerald-400`} />
                
                <div className="flex items-center justify-between text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-1">
                      <QrCode className="w-4.5 h-4.5 text-indigo-600" />
                      Dynamic QR Code
                    </h3>
                    <p className="text-[10px] text-slate-400">Point phone camera to trigger immediate secure download.</p>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedTheme.badge}`}>
                    {selectedShare.themeColor}
                  </span>
                </div>

                {/* QR Display frame */}
                <div className="mx-auto w-48 h-48 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center shadow-xs">
                  <img
                    src={getQRImageSrc(selectedShare)}
                    alt="PDF QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Simulated visitor actions / Test Redirect trigger */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => openVisitorSimulation(selectedShare)}
                    className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-indigo-100"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Simulate Mobile Scan
                  </button>

                  <button
                    onClick={() => {
                      copyToClipboard(getVisitorLink(selectedShare.id), 'visitor-link');
                    }}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    {copiedField === 'visitor-link' ? 'Copied Link!' : 'Copy Share Link'}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>ID: {selectedShare.id}</span>
                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Real-time QR tracking active
                  </span>
                </div>
              </div>

              {/* Card 2: Expiry & Security Controls Settings */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Security & Expiry Controls
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Password Toggle block */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800">Password Protection</p>
                        <p className="text-[9px] text-slate-400">Require code before file download.</p>
                      </div>
                    </div>

                    <input
                      type="password"
                      defaultValue={selectedShare.password || ''}
                      onBlur={(e) => handleUpdateSecuritySettings({ password: e.target.value || undefined })}
                      placeholder="No Password"
                      className="w-28 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 outline-none text-slate-800 bg-white"
                    />
                  </div>

                  {/* Expiry block */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800">Expiration Date</p>
                        <p className="text-[9px] text-slate-400">PDF link turns off automatically.</p>
                      </div>
                    </div>

                    <input
                      type="date"
                      defaultValue={selectedShare.expiryDate || ''}
                      onChange={(e) => handleUpdateSecuritySettings({ expiryDate: e.target.value || undefined })}
                      className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 outline-none text-slate-800 bg-white"
                    />
                  </div>

                  {/* Limit block */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800">Max Downloads</p>
                        <p className="text-[9px] text-slate-400">Stop traffic once limit is crossed.</p>
                      </div>
                    </div>

                    <input
                      type="number"
                      placeholder="Unlimited"
                      defaultValue={selectedShare.maxDownloads || ''}
                      onBlur={(e) => handleUpdateSecuritySettings({ maxDownloads: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-20 px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 outline-none text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Version Control & Real-time replacement */}
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <History className="w-4 h-4 text-amber-500" />
                    Version History & Replacement
                  </h3>

                  {/* Replacement button input */}
                  <label className="text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline flex items-center gap-0.5">
                    <Upload className="w-3.5 h-3.5" />
                    Replace File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleReplaceFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2.5">
                  {selectedShare.versions?.map((ver, vIdx) => {
                    const isActive = selectedShare.activeFileName === ver.fileName && selectedShare.activeFileSize === ver.fileSize;
                    
                    return (
                      <div key={ver.versionId} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <div className="min-w-0">
                            <p className={`font-bold truncate ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                              {ver.fileName}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {ver.fileSize} • {new Date(ver.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shrink-0">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRollbackVersion(ver)}
                            className="text-[9px] text-indigo-600 font-bold hover:underline shrink-0"
                          >
                            Activate This
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400">Select a document from list on the left or create one to launch dynamic QR tracking.</p>
            </div>
          )}

        </div>

      </div>

      {/* Visitor Mobile Simulation Frame Modal overlay */}
      <AnimatePresence>
        {simulatedShare && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 relative"
            >
              {/* Device header banner decoration */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black tracking-widest text-slate-400">MOBILE PORTAL SIMULATION</span>
                </div>
                <button
                  onClick={() => setSimulatedShare(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Close [X]
                </button>
              </div>

              {/* simulated viewport container */}
              <div className="p-6 space-y-6">
                
                {/* Brand / Logo details inside portal */}
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto border border-indigo-100">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="text-base font-black text-slate-800 mt-2">{simulatedShare.title}</h4>
                  <p className="text-xs text-slate-400">{simulatedShare.description}</p>
                </div>

                {/* Password Protection Guard */}
                {simulatedShare.password && visitorPasswordInput !== simulatedShare.password ? (
                  <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl space-y-3 text-center">
                    <Lock className="w-6 h-6 text-amber-600 mx-auto" />
                    <div>
                      <h5 className="text-xs font-black text-amber-900">Document Vault Secure Gated</h5>
                      <p className="text-[10px] text-amber-700 mt-0.5">Please provide the visitor password configured by the publisher.</p>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="password"
                        placeholder="Enter password..."
                        value={visitorPasswordInput}
                        onChange={(e) => setVisitorPasswordInput(e.target.value)}
                        className="w-full text-center py-2 px-3 text-xs bg-white rounded-xl border border-amber-200 outline-none focus:ring-1 focus:ring-amber-500 font-bold"
                      />
                      {passwordError && (
                        <p className="text-[9px] text-rose-600 font-bold">Inaccurate key. Try again.</p>
                      )}
                      <button
                        onClick={handleSimulatedPasswordSubmit}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Unlock PDF Access
                      </button>
                    </div>
                  </div>
                ) : (
                  // Gated/Unlocked Area
                  <div className="space-y-4">
                    
                    {/* Status check / limits indicators */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2 text-center text-xs">
                      <p className="text-[10px] text-slate-400 font-bold">DOCUMENT METADATA</p>
                      <p className="font-extrabold text-slate-700">{simulatedShare.activeFileName}</p>
                      <p className="text-[11px] text-indigo-600 font-black">{simulatedShare.activeFileSize}</p>

                      <div className="flex justify-center gap-1 pt-1.5">
                        {simulatedShare.maxDownloads && (
                          <span className="text-[8px] bg-indigo-50 text-indigo-800 border px-2 py-0.5 rounded-md font-bold">
                            Max downloads: {simulatedShare.maxDownloads}
                          </span>
                        )}
                        {simulatedShare.expiryDate && (
                          <span className="text-[8px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded-md font-bold">
                            Expires: {new Date(simulatedShare.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Scan Action triggers */}
                    <div className="space-y-2">
                      <button
                        onClick={recordSimulatedView}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Simulate Visitor View (Live View+1)
                      </button>

                      <button
                        onClick={recordSimulatedDownload}
                        disabled={isLimitReached(simulatedShare) || isExpired(simulatedShare)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-2xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Simulate File Download (Download+1)
                      </button>
                    </div>

                    {/* Success indicators inside modal */}
                    <AnimatePresence>
                      {simulatedViewSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 text-emerald-800 text-[10px] p-2.5 rounded-xl border border-emerald-100 font-bold text-center"
                        >
                          ✓ Simulated Page View recorded! Check the live stats.
                        </motion.div>
                      )}

                      {simulatedDownloadSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 text-emerald-800 text-[10px] p-2.5 rounded-xl border border-emerald-100 font-bold text-center"
                        >
                          ✓ Simulated File Download triggered successfully!
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )}

                <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
                  Powered by Dynamic QR Router • Instant update analytics.
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
