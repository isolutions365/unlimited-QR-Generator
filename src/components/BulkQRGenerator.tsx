import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Upload, 
  Download, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  FileSpreadsheet, 
  FileArchive, 
  RotateCcw,
  Zap,
  PlayCircle,
  HelpCircle,
  X,
  Edit2
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { isRtlLocale } from '../utils/translations';
import { renderStyledQR } from '../utils/qrRenderer';
import { FrameStyle } from '../types';
import BulkFormatHelpModal from './BulkFormatHelpModal';

interface BulkEntry {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  errorMsg?: string;
}

export default function BulkQRGenerator() {
  const { t, locale } = useTranslation();
  const isRtl = isRtlLocale(locale);
  
  const [entries, setEntries] = useState<BulkEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Custom manual insertion input
  const [manualName, setManualName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  
  // Inline editing row
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingUrl, setEditingUrl] = useState('');

  // Design Presets for the bulk package
  const [bulkDesign, setBulkDesign] = useState<{
    fgColor: string;
    bgColor: string;
    dotStyle: 'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond';
    eyeStyle: 'square' | 'rounded' | 'circle' | 'leaf';
    frameStyle: FrameStyle;
    frameText: string;
  }>({
    fgColor: '#4f46e5',
    bgColor: '#ffffff',
    dotStyle: 'rounded',
    eyeStyle: 'rounded',
    frameStyle: 'none',
    frameText: 'SCAN ME'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const maxLimit = 50;

  // Simple, robust client-side CSV parsing
  const parseCSV = (text: string): { name: string; url: string }[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    // Read clean line segments
    const cleanLines = lines.map(l => l.trim()).filter(l => l.length > 0);
    if (cleanLines.length === 0) return [];

    // Detect header index
    const firstLine = cleanLines[0];
    const columns = firstLine.split(',').map(c => c.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    
    const nameIdx = columns.indexOf('name');
    const urlIdx = columns.indexOf('url') !== -1 ? columns.indexOf('url') : columns.indexOf('data');

    const hasHeaders = nameIdx !== -1 || urlIdx !== -1;
    const startIndex = hasHeaders ? 1 : 0;

    const result: { name: string; url: string }[] = [];

    for (let i = startIndex; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim().replace(/^["']|["']$/g, ''));

      let name = '';
      let url = '';

      if (hasHeaders) {
        name = nameIdx !== -1 ? cols[nameIdx] || '' : '';
        url = urlIdx !== -1 ? cols[urlIdx] || '' : '';
      } else {
        name = cols[0] || '';
        url = cols[1] || '';
      }

      // Safe cleanups & fallbacks
      if (!url && name) {
        if (name.startsWith('http://') || name.startsWith('https://') || name.includes('.')) {
          url = name;
          name = `QR-${i}`;
        } else {
          url = name;
        }
      }

      if (name || url) {
        // Remove special characters that are invalid in file names
        const cleanName = (name || `QR-Code-${i}`)
          .trim()
          .replace(/[/\\?%*:|"<>\s]/g, '_');
        
        result.push({
          name: cleanName || `QR-Code-${i}`,
          url: url || name
        });
      }
    }

    return result;
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setErrorMessage(t('bulk.errorNoData', 'Could not extract valid rows. Make sure CSV has "name" and "url" columns.'));
        return;
      }

      let targetRows = parsed;
      let truncated = false;

      if (parsed.length > maxLimit) {
        targetRows = parsed.slice(0, maxLimit);
        truncated = true;
      }

      const mappedEntries: BulkEntry[] = targetRows.map((item, index) => ({
        id: `row-${Date.now()}-${index}`,
        name: item.name,
        url: item.url,
        status: 'pending'
      }));

      setEntries(mappedEntries);
      setStatus('idle');
      setProgress(0);
      setErrorMessage(truncated ? t('bulk.warningTruncated', 'Batch limited to first 50 entries (Free Tier limit).') : '');
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "name,url\n" +
      "Google,https://google.com\n" +
      "WiFi-Guest,WIFI:S:Guest-Network;T:WPA;P:SuperSecretPass;;\n" +
      "Order-Table-5,https://menu.freeqrbarcodes.com/table-5\n" +
      "App-Download,https://apps.apple.com/app/id123456789\n" +
      "Portfolio-Url,https://www.freeqrbarcodes.com\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_bulk_qr_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    if (entries.length >= maxLimit) {
      setErrorMessage(t('bulk.errorLimitReached', 'Maximum of 50 QR codes can be processed per batch.'));
      return;
    }

    const safeName = (manualName.trim() || `Manual-QR-${entries.length + 1}`).replace(/[/\\?%*:|"<>\s]/g, '_');
    const newEntry: BulkEntry = {
      id: `manual-${Date.now()}`,
      name: safeName,
      url: manualUrl.trim(),
      status: 'pending'
    };

    setEntries([...entries, newEntry]);
    setManualName('');
    setManualUrl('');
    setErrorMessage('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const clearAll = () => {
    setEntries([]);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
  };

  const startInlineEdit = (entry: BulkEntry) => {
    setEditingId(entry.id);
    setEditingName(entry.name);
    setEditingUrl(entry.url);
  };

  const saveInlineEdit = () => {
    if (!editingUrl.trim()) return;
    const safeName = editingName.trim().replace(/[/\\?%*:|"<>\s]/g, '_');
    setEntries(entries.map(e => {
      if (e.id === editingId) {
        return { ...e, name: safeName, url: editingUrl.trim() };
      }
      return e;
    }));
    setEditingId(null);
  };

  const startGeneration = async () => {
    if (entries.length === 0) return;
    
    setStatus('generating');
    setProgress(0);
    setErrorMessage('');

    const zip = new JSZip();
    const updated = [...entries];

    // Reset statuses to generating
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'pending' };
    }
    setEntries(updated);

    const canvas = hiddenCanvasRef.current;
    if (!canvas) {
      setStatus('error');
      setErrorMessage(t('bulk.errorCanvas', 'Canvas rendering error. Please try again.'));
      return;
    }

    // Process each entry sequentially to give browser breathing room
    for (let i = 0; i < updated.length; i++) {
      const entry = updated[i];
      updated[i] = { ...entry, status: 'generating' };
      setEntries([...updated]);

      try {
        // Construct standard style object based on state configurations
        await renderStyledQR(canvas, entry.url, {
          fgColor: bulkDesign.fgColor,
          bgColor: bulkDesign.bgColor,
          gradientType: 'none',
          gradientColor: bulkDesign.fgColor,
          dotStyle: bulkDesign.dotStyle,
          eyeStyle: bulkDesign.eyeStyle,
          frameStyle: bulkDesign.frameStyle,
          frameText: entry.name.toUpperCase().replace(/_/g, ' ') || bulkDesign.frameText,
          frameColor: bulkDesign.fgColor,
          frameTextColor: '#ffffff',
          frameFontSize: 20,
          frameTextPosition: 'bottom',
          margin: 15
        });

        // Convert canvas image to PNG base64
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        
        // Add file to zip
        zip.file(`${entry.name}.png`, base64Data, { base64: true });
        
        updated[i] = { ...updated[i], status: 'success' };
      } catch (err) {
        console.error(`Error rendering row ${entry.name}:`, err);
        updated[i] = { ...updated[i], status: 'error', errorMsg: t('bulk.errorRenderRow', 'Failed to render.') };
      }

      setProgress(Math.round(((i + 1) / updated.length) * 100));
      setEntries([...updated]);
      // Tiny delay to allow state changes to paint
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    try {
      // Generate Zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bulk-qr-codes-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('success');
    } catch (err) {
      console.error('Error compiling zip archive:', err);
      setStatus('error');
      setErrorMessage(t('bulk.errorZip', 'Failed to generate ZIP archive file.'));
    }
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5.5 h-5.5 text-indigo-600 shrink-0" />
            {t('bulk.title', 'Bulk QR Code Generator')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('bulk.subtitle', 'Upload a CSV list, style your template, and download an organized ZIP archive of ready-to-print codes.')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            {t('bulk.formatGuideBtn', 'CSV & Excel Format Guide')}
          </button>

          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="px-3 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl transition-all border border-indigo-200/50 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t('bulk.downloadTemplate', 'Download Sample CSV')}
          </button>
          
          {entries.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              disabled={status === 'generating'}
              className="px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('bulk.clearAll', 'Reset Batch')}
            </button>
          )}
        </div>
      </div>

      {/* CSV / Excel Formatting Quick Hint Card */}
      <div className="bg-linear-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{t('bulk.quickHintTitle', 'File Formatting Requirements')}</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] rounded-md font-mono">.csv</span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {t('bulk.quickHintDesc', 'Your spreadsheet must include 2 columns: ')}
              <code className="font-mono font-bold text-indigo-700 bg-indigo-100/60 px-1 py-0.2 rounded">name</code> ({t('bulk.hintName', 'file name')}) {t('common.and', 'and')} <code className="font-mono font-bold text-indigo-700 bg-indigo-100/60 px-1 py-0.2 rounded">url</code> ({t('bulk.hintUrl', 'destination link / content')}).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-white hover:bg-indigo-50/80 border border-indigo-200/80 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('bulk.viewFullGuide', 'View Instructions')}</span>
          </button>
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('bulk.sampleCsv', 'Sample CSV')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Upload & List Config */}
        <div className="lg:col-span-8 space-y-5">
          {/* Uploader Card */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50/20' 
                : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 border border-indigo-100">
                <Upload className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{t('bulk.uploadPrompt', 'Click or drag-and-drop CSV here')}</h3>
              <p className="text-[11px] text-gray-500 mt-1 max-w-sm">
                {t('bulk.uploadDesc', 'Supports UTF-8 CSV with "name" and "url" headers. Limit 50 rows per generation.')}
              </p>
            </div>
          </div>

          {/* Quick Alert Banner */}
          {errorMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Table Container / Manual Inputs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                {t('bulk.batchList', 'Batch List')} 
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded-full font-mono font-bold">
                  {entries.length}/{maxLimit}
                </span>
              </h3>
              
              {/* Form to insert quick manual entry */}
              <form onSubmit={addManualEntry} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder={t('bulk.namePlaceholder', 'e.g. Code-1')}
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[120px]"
                />
                <input
                  type="text"
                  placeholder={t('bulk.urlPlaceholder', 'URL or data text')}
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[170px]"
                />
                <button
                  type="submit"
                  disabled={!manualUrl.trim()}
                  className="px-2.5 py-1 text-[10.5px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-45 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('bulk.add', 'Add Row')}
                </button>
              </form>
            </div>

            {entries.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileSpreadsheet className="w-12 h-12 mx-auto stroke-[1.2] opacity-40 mb-2" />
                <p className="text-xs font-medium">{t('bulk.noDataYet', 'Your batch queue is empty. Upload a file or add rows above.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-4 w-[60px] text-start">{t('bulk.index', '#')}</th>
                      <th className="py-2.5 px-3 min-w-[140px] text-start">{t('bulk.fileName', 'File Name (.png)')}</th>
                      <th className="py-2.5 px-3 min-w-[200px] text-start">{t('bulk.payloadData', 'QR Encoded Content')}</th>
                      <th className="py-2.5 px-3 w-[110px] text-center">{t('bulk.status', 'Status')}</th>
                      <th className="py-2.5 px-4 w-[100px] text-end">{t('bulk.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.map((entry, idx) => {
                      const isEditing = editingId === entry.id;
                      
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-4 font-mono font-semibold text-slate-400 text-start">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-900 text-start">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                className="px-2 py-0.5 border border-slate-200 rounded-md focus:outline-none w-full text-xs font-normal"
                              />
                            ) : (
                              <span className="truncate block max-w-[180px]">{entry.name}.png</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[10.5px] text-start">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingUrl}
                                onChange={e => setEditingUrl(e.target.value)}
                                className="px-2 py-0.5 border border-slate-200 rounded-md focus:outline-none w-full text-xs font-normal"
                              />
                            ) : (
                              <span className="truncate block max-w-[280px]" title={entry.url}>
                                {entry.url}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {entry.status === 'pending' && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                {t('bulk.ready', 'Ready')}
                              </span>
                            )}
                            {entry.status === 'generating' && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 animate-pulse">
                                {t('bulk.rendering', 'Rendering...')}
                              </span>
                            )}
                            {entry.status === 'success' && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center justify-center gap-0.5 w-max mx-auto">
                                <Check className="w-3 h-3" />
                                {t('bulk.done', 'Done')}
                              </span>
                            )}
                            {entry.status === 'error' && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700" title={entry.errorMsg}>
                                {t('bulk.failed', 'Error')}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={saveInlineEdit}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 text-slate-400 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startInlineEdit(entry)}
                                    disabled={status === 'generating'}
                                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteEntry(entry.id)}
                                    disabled={status === 'generating'}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Template Settings & Export */}
        <div className="lg:col-span-4 space-y-5">
          {/* Style Presets Card */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              {t('bulk.templateConfig', 'Batch Template Styles')}
            </h3>
            
            <div className="space-y-3.5 text-xs">
              {/* Foreground Color picker */}
              <div>
                <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1.5">
                  {t('bulk.qrForegroundColor', 'QR Fore Color')}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-7 h-7 rounded-md cursor-pointer border border-gray-200 p-0.5"
                    value={bulkDesign.fgColor}
                    onChange={e => setBulkDesign({ ...bulkDesign, fgColor: e.target.value })}
                  />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{bulkDesign.fgColor}</span>
                </div>
              </div>

              {/* Background Color picker */}
              <div>
                <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1.5">
                  {t('bulk.backgroundColor', 'QR Back Color')}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-7 h-7 rounded-md cursor-pointer border border-gray-200 p-0.5"
                    value={bulkDesign.bgColor}
                    onChange={e => setBulkDesign({ ...bulkDesign, bgColor: e.target.value })}
                  />
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{bulkDesign.bgColor}</span>
                </div>
              </div>

              {/* Dot Shape style */}
              <div>
                <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1">
                  {t('bulk.dotStyle', 'Matrix Dots')}
                </span>
                <select
                  value={bulkDesign.dotStyle}
                  onChange={e => setBulkDesign({ ...bulkDesign, dotStyle: e.target.value as any })}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="square">{t('bulk.dotSquare', 'Square')}</option>
                  <option value="rounded">{t('bulk.dotRounded', 'Rounded Blocks')}</option>
                  <option value="dots">{t('bulk.dotDots', 'Circular Dots')}</option>
                  <option value="leaf">{t('bulk.dotLeaf', 'Organic Leaf')}</option>
                  <option value="diamond">{t('bulk.dotDiamond', 'Crisp Diamond')}</option>
                  <option value="classy">{t('bulk.dotClassy', 'Classy Retro')}</option>
                </select>
              </div>

              {/* Eye Shape style */}
              <div>
                <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1">
                  {t('bulk.eyeStyle', 'Corner Eye Frames')}
                </span>
                <select
                  value={bulkDesign.eyeStyle}
                  onChange={e => setBulkDesign({ ...bulkDesign, eyeStyle: e.target.value as any })}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="square">{t('bulk.eyeSquare', 'Square Frame')}</option>
                  <option value="rounded">{t('bulk.eyeRounded', 'Smooth Rounded')}</option>
                  <option value="circle">{t('bulk.eyeCircle', 'Clean Circle')}</option>
                  <option value="leaf">{t('bulk.eyeLeaf', 'Aesthetic Leaf')}</option>
                </select>
              </div>

              {/* Outer Edge Frame style */}
              <div>
                <span className="text-[10px] font-bold text-gray-900 tracking-wider uppercase block mb-1">
                  {t('bulk.outerEdgeLabelFrame', 'CTA Label Frame')}
                </span>
                <select
                  value={bulkDesign.frameStyle}
                  onChange={e => setBulkDesign({ ...bulkDesign, frameStyle: e.target.value as any })}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">{t('bulk.frameNone', 'No Frame (Clean Matrix)')}</option>
                  <option value="scan-me">{t('bulk.frameScanMe', 'Scan Me Frame')}</option>
                  <option value="menu">{t('bulk.frameMenu', 'Menu / View Menu Frame')}</option>
                  <option value="website">{t('bulk.frameWebsite', 'Website / Visit Website Frame')}</option>
                  <option value="wifi">{t('bulk.frameWifi', 'Connect WiFi Frame')}</option>
                  <option value="download-app">{t('bulk.frameDownloadApp', 'Download App Frame')}</option>
                  <option value="order-now">{t('bulk.frameOrderNow', 'Order Now Frame')}</option>
                  <option value="pay-here">{t('bulk.framePayHere', 'Pay Here Frame')}</option>
                  <option value="follow-us">{t('bulk.frameFollowUs', 'Follow Us Frame')}</option>
                  <option value="save-contact">{t('bulk.frameSaveContact', 'Save Contact Frame')}</option>
                  <option value="rate-us">{t('bulk.frameRateUs', 'Rate & Review Frame')}</option>
                </select>
                <p className="text-[9.5px] text-gray-400 mt-1 leading-tight">
                  {t('bulk.frameNote', '* Note: Frame labels will automatically display the respective row file name to keep your physical scans distinguished!')}
                </p>
              </div>
            </div>
          </div>

          {/* Generator Export Control */}
          <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 rounded-2xl text-slate-800 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 text-indigo-700">
              <FileArchive className="w-4 h-4 text-indigo-600" />
              {t('bulk.generationTitle', 'Export ZIP Package')}
            </h3>

            {status === 'generating' ? (
              <div className="space-y-3 py-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-700 animate-pulse font-medium">
                    {t('bulk.renderingBatch', 'Rendering Batch...')}
                  </span>
                  <span className="font-mono text-indigo-700 font-bold">{progress}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-150 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 text-center italic">
                  {t('bulk.compilingZip', 'Compiling, wrapping files and building ZIP package folder...')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('bulk.readyToCompile', 'Ready to compile {count} styled QR codes inside a high-contrast package.', { count: entries.length })}
                </p>

                <button
                  type="button"
                  onClick={startGeneration}
                  disabled={entries.length === 0}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4.5 h-4.5" />
                  {t('bulk.generateAll', 'Generate & Download ZIP')}
                </button>
              </div>
            )}
            
            {status === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-900">{t('bulk.zipDownloaded', 'ZIP Package Downloaded!')}</h4>
                  <p className="text-emerald-700 text-[11px] mt-0.5">{t('bulk.zipDownloadedDesc', 'Check your downloads folder for the ready-to-use PNG bundle.')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for sequential rendering of QR codes */}
      <div className="hidden">
        <canvas ref={hiddenCanvasRef} />
      </div>

      {/* CSV & Excel File Format Instructions Modal */}
      <BulkFormatHelpModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
        onDownloadTemplate={downloadSampleTemplate} 
      />

      {/* Genuinely Helpful Educational Guide (Anti-Slop, Clean, Non-Nested layout) */}
      <div className="mt-12 border-t border-slate-200/80 pt-10 space-y-12 select-none">
        {/* Section 1: How to Use */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('bulk.guide.howToTitle', 'How to Use the Bulk QR Code Generator')}
            </h3>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Generating hundreds of customized QR codes at once doesn\'t require complex programming. Follow our professional, browser-based pipeline to compile your custom package:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 01</span>
              <h4 className="text-sm font-bold text-slate-900">{t('bulk.guide.step1Title', 'Prepare Spreadsheet')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create a spreadsheet (using Excel or Google Sheets) with exactly two headers in the first row: "name" and "url". Fill in your target filenames and links, then export as a .CSV file.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 02</span>
              <h4 className="text-sm font-bold text-slate-900">{t('bulk.guide.step2Title', 'Upload or Paste')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drag and drop your exported .CSV file into our secure container, or paste rows manually into the input sandbox. The system parses and displays each record instantly.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 03</span>
              <h4 className="text-sm font-bold text-slate-900">{t('bulk.guide.step3Title', 'Design Template')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your global visual style—including colors, pixel patterns, and optional framing accents. Every code in the batch inherits these brand assets seamlessly.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest block">Step 04</span>
              <h4 className="text-sm font-bold text-slate-900">{t('bulk.guide.step4Title', 'Export ZIP Archive')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click "Generate & Download ZIP". Our client-side rendering engine packages each styled code as a crisp, individually named PNG file into a single structured ZIP directory.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Best Practices */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('bulk.guide.practicesTitle', 'Spreadsheet Formatting & Best Practices')}
            </h3>
          </div>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Maintain compliance and prevent formatting anomalies by executing these clean preparation workflows:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Ensure Valid URL Protocols</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every destination link in your sheet must begin with either "https://" or "http://" to ensure standard web redirect compliance across all smartphone models and legacy camera systems.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Sanitize Filenames</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keep "name" cells alphanumeric. Avoid complex special characters (like /, \, :, *, ?, ", &lt;, &gt;, |) which can cause file extraction errors or operating system folder compliance flags.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Maintain Contrast Standards</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When batch printing hundreds of codes (such as product hang-tags or inventory badges), preserve high contrast (like dark navy or black on a white background) to guarantee fast read rates.
              </p>
            </div>
            <div className="space-y-1 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Run a Single-Item Scan Test</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prior to printing massive batch runs, extract your downloaded ZIP folder, print a single representative physical sample, and verify that your target scanner hardware decodes the matrix correctly.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: FAQs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {t('bulk.guide.faqsTitle', 'Bulk QR Code Generation FAQs')}
            </h3>
          </div>
          <div className="divide-y divide-slate-150 text-sm">
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">Is there an upload limit to the number of rows I can process?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                To guarantee optimal browser performance, we limit bulk batches to 50 active items per session. This prevents client-side tab freezes and allows instant rendering without sending sensitive customer links to remote servers.
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">Are the generated bulk QR codes static or dynamic?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The bulk tool generates standard static web QR codes by default. This means the target links are encoded directly inside the matrix, ensuring they remain active forever with zero subscription fees or expiration dates.
              </p>
            </div>
            <div className="py-4 space-y-1.5">
              <h4 className="font-bold text-slate-900">How are the output files organized inside the downloaded ZIP package?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each file is named precisely according to the matching value in your "name" column (e.g., "Product-A.png", "Table-12.png"). This makes physical matching and sticker application extremely simple.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
