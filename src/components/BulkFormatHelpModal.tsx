import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  HelpCircle, 
  Download, 
  Copy, 
  Check, 
  X, 
  CheckCircle2, 
  ArrowRight,
  FileCode,
  Sparkles,
  Info
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { isRtlLocale } from '../utils/translations';

interface BulkFormatHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate?: () => void;
  onGoToBulkTab?: () => void;
}

export const BulkFormatHelpModal: React.FC<BulkFormatHelpModalProps> = ({
  isOpen,
  onClose,
  onDownloadTemplate,
  onGoToBulkTab,
}) => {
  const { t, locale } = useTranslation();
  const isRtl = isRtlLocale(locale);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleCsv = `name,url
Menu-Table-1,https://example.com/menu/1
WiFi-Guest,WIFI:S:Guest-Network;T:WPA;P:SuperSecretPass;;
Order-Table-5,https://example.com/orders/5
App-Download,https://apps.apple.com/app/id123456789
Business-Card,https://www.freeqrbarcodes.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    } else {
      const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'sample_bulk_qr_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('bulk.formatGuideTitle', 'CSV & Excel Formatting Guide')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('bulk.formatGuideSubtitle', 'How to format your spreadsheets for batch QR generation')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Step 1: Column Header Requirements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              {t('bulk.columnRequirements', 'Required Columns & Headers')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">name</span>
                  <span className="text-[11px] text-indigo-900 font-semibold">{t('bulk.colNameHeader', 'Column 1')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('bulk.colNameDesc', 'The title and file name for each QR image in the downloaded ZIP archive (e.g. "Table-01", "Product-A").')}
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-bold">url</span>
                  <span className="text-[11px] text-indigo-900 font-semibold">{t('bulk.colUrlHeader', 'Column 2')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('bulk.colUrlDesc', 'The QR payload: website link, WiFi credentials, plain text, or phone number to be encoded.')}
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Code Snippet Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                {t('bulk.exampleFormat', 'Sample CSV Structure')}
              </h4>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy Sample')}</span>
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-3.5 text-slate-200 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <pre className="whitespace-pre">{sampleCsv}</pre>
            </div>
          </div>

          {/* Step 3: Excel & Google Sheets Export Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
              {t('bulk.exportInstructions', 'How to Export from Excel / Google Sheets')}
            </h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900">Microsoft Excel:</strong>{' '}
                  <span>Go to <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">File &gt; Save As</code> and select <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">CSV UTF-8 (Comma delimited) (*.csv)</code>.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900">Google Sheets:</strong>{' '}
                  <span>Go to <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">File &gt; Download &gt; Comma Separated Values (.csv)</code>.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900">Apple Numbers:</strong>{' '}
                  <span>Go to <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">File &gt; Export To &gt; CSV...</code></span>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{t('bulk.batchTip', 'Pro Tip:')}</strong> {t('bulk.batchTipDesc', 'You can generate up to 50 custom-styled vector and PNG QR codes in a single batch, complete with custom colors, frame styles, and logos packaged in a single ZIP.')}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10 backdrop-blur-xs">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            {t('bulk.downloadSampleFile', 'Download Sample CSV Template')}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onGoToBulkTab && (
              <button
                type="button"
                onClick={() => {
                  onGoToBulkTab();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>{t('bulk.openGenerator', 'Open Bulk Generator')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkFormatHelpModal;
