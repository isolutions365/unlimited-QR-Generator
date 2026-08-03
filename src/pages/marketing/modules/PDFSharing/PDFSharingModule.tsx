import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Download, Info, Share2, X, Check } from 'lucide-react';

interface SharedPDF {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  downloads: number;
  uploadedAt: string;
}

export default function PDFSharingModule() {
  const [pdfs, setPdfs] = useState<SharedPDF[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('2.4 MB');

  const loadPdfs = () => {
    const local = localStorage.getItem('qr-marketing-pdf-shares');
    if (local) {
      try {
        setPdfs(JSON.parse(local));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    // Default fallback PDFs
    const defaults: SharedPDF[] = [
      { id: '1', title: 'Luxury Real Estate Brochure Q3', fileName: 'estate_q3_premium.pdf', fileSize: '4.8 MB', downloads: 820, uploadedAt: 'Jul 30, 2026' },
      { id: '2', title: 'Tech Startup Pitch Deck', fileName: 'pitch_deck_final.pdf', fileSize: '12.2 MB', downloads: 350, uploadedAt: 'Jul 12, 2026' },
    ];
    setPdfs(defaults);
    localStorage.setItem('qr-marketing-pdf-shares', JSON.stringify(defaults));
  };

  useEffect(() => {
    loadPdfs();

    const handleUpdate = () => {
      loadPdfs();
    };

    window.addEventListener('qr-marketing-data-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-marketing-data-updated', handleUpdate);
    };
  }, []);

  const handleCreatePdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFileName.trim()) return;

    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newPdf: SharedPDF = {
      id: `pdf-${Date.now()}`,
      title: newTitle.trim(),
      fileName: newFileName.trim().toLowerCase().endsWith('.pdf') ? newFileName.trim() : `${newFileName.trim()}.pdf`,
      fileSize: newFileSize.trim(),
      downloads: 0,
      uploadedAt: today,
    };

    const updated = [newPdf, ...pdfs];
    setPdfs(updated);
    localStorage.setItem('qr-marketing-pdf-shares', JSON.stringify(updated));

    // Reset Form
    setNewTitle('');
    setNewFileName('');
    setNewFileSize('2.4 MB');
    setIsModalOpen(false);

    // Notify other components
    window.dispatchEvent(new Event('qr-marketing-data-updated'));
  };

  return (
    <div id="marketing-pdfsharing-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">QR PDF Sharing & Hosting</h1>
          <p className="text-xs text-slate-500 mt-1">Host catalog PDFs, booklets, and flyers on our ultra-fast CDN with integrated download tracking.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          Upload PDF File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pdfs.map((p) => (
          <div key={p.id} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs hover:border-indigo-100 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{p.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.fileName} ({p.fileSize})</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Download className="w-4 h-4 text-slate-400" />
                <strong>{p.downloads.toLocaleString()}</strong> Downloads
              </span>
              <div className="flex gap-1.5">
                <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  View Analytics
                </button>
                <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" />
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
                <FileText className="w-4 h-4 text-rose-600" />
                Configure New PDF Share
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePdf} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Autumn Fashion Catalog 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">File Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. fashion_autumn.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">File Size (e.g. MB)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3.5 MB"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500 transition-colors bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Publish PDF Share
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
