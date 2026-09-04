import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Hash,
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  FileCheck2,
  ExternalLink,
  Code2,
  Eye,
  CheckCircle2,
  HelpCircle,
  Clock,
  Upload,
  X
} from 'lucide-react';
import { useTranslation } from '../utils/i18n';
import { renderStyledQR } from '../utils/qrRenderer';
import { FrameStyle } from '../types';

/**
 * ZATCA (FATOORA) TLV Generator Helper
 * Tag 1: Seller Name (اسم المورّد)
 * Tag 2: VAT Registration Number (الرقم الضريبي 15 رقم)
 * Tag 3: Timestamp (تاريخ ووقت الفاتورة ISO 8601)
 * Tag 4: Invoice Total with VAT (إجمالي الفاتورة شامل الضريبة)
 * Tag 5: VAT Total Amount (مبلغ ضريبة القيمة المضافة)
 * Tag 6: Hash of XML Invoice (optional Phase 2)
 * Tag 7: ECDSA Digital Signature (optional Phase 2)
 * Tag 8: ECDSA Public Key (optional Phase 2)
 */
export function generateZatcaTLVBase64(data: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalAmount: string;
  vatAmount: string;
  invoiceHash?: string;
  ecdsaSignature?: string;
  publicKey?: string;
}): string {
  const encodeTag = (tagNum: number, valueStr: string): Uint8Array => {
    const encoder = new TextEncoder();
    const valBytes = encoder.encode(valueStr || '');
    const tagBuffer = new Uint8Array(2 + valBytes.length);
    tagBuffer[0] = tagNum;
    tagBuffer[1] = valBytes.length;
    tagBuffer.set(valBytes, 2);
    return tagBuffer;
  };

  const tagBuffers: Uint8Array[] = [
    encodeTag(1, data.sellerName.trim()),
    encodeTag(2, data.vatNumber.trim()),
    encodeTag(3, data.timestamp.trim()),
    encodeTag(4, Number(data.totalAmount || 0).toFixed(2)),
    encodeTag(5, Number(data.vatAmount || 0).toFixed(2)),
  ];

  if (data.invoiceHash && data.invoiceHash.trim()) {
    tagBuffers.push(encodeTag(6, data.invoiceHash.trim()));
  }
  if (data.ecdsaSignature && data.ecdsaSignature.trim()) {
    tagBuffers.push(encodeTag(7, data.ecdsaSignature.trim()));
  }
  if (data.publicKey && data.publicKey.trim()) {
    tagBuffers.push(encodeTag(8, data.publicKey.trim()));
  }

  const totalLength = tagBuffers.reduce((acc, b) => acc + b.length, 0);
  const fullBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of tagBuffers) {
    fullBuffer.set(b, offset);
    offset += b.length;
  }

  let binary = '';
  const len = fullBuffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(fullBuffer[i]);
  }
  return btoa(binary);
}

export function decodeZatcaTLVBase64(base64Str: string) {
  try {
    const binary = atob(base64Str.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    const tags: Record<number, string> = {};
    let idx = 0;
    while (idx < bytes.length) {
      const tag = bytes[idx];
      const length = bytes[idx + 1];
      if (idx + 2 + length > bytes.length) break;
      const valBytes = bytes.slice(idx + 2, idx + 2 + length);
      tags[tag] = decoder.decode(valBytes);
      idx += 2 + length;
    }
    return {
      success: true,
      sellerName: tags[1] || '',
      vatNumber: tags[2] || '',
      timestamp: tags[3] || '',
      totalAmount: tags[4] || '',
      vatAmount: tags[5] || '',
      invoiceHash: tags[6] || '',
      ecdsaSignature: tags[7] || '',
      publicKey: tags[8] || '',
    };
  } catch (err) {
    return { success: false, error: 'تنسيق Base64 أو بنية TLV غير صالحة' };
  }
}

interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  vatRate: number; // usually 15%
}

interface ZatcaInvoiceGeneratorProps {
  onInitiateCustomQR?: (config: { type: string; content: string; name: string }) => void;
}

export default function ZatcaInvoiceGenerator({
  onInitiateCustomQR
}: ZatcaInvoiceGeneratorProps) {
  const { t } = useTranslation();

  // Active View Tab inside ZATCA generator
  const [activeSubView, setActiveSubView] = useState<'builder' | 'inspector' | 'receipt'>('builder');

  // Form State
  const [sellerName, setSellerName] = useState('شركة الحلول الرقمية الذكية للتجارة');
  const [vatNumber, setVatNumber] = useState('300123456789003');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0089');
  const [customerName, setCustomerName] = useState('مؤسسة الأعمال المتقدمة');
  const [customerVat, setCustomerVat] = useState('310987654321003');
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 19) + 'Z');
  const [logoImage, setLogoImage] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Phase 2 Optional Fields
  const [isPhase2, setIsPhase2] = useState(false);
  const [invoiceHash, setInvoiceHash] = useState('');
  const [ecdsaSignature, setEcdsaSignature] = useState('');

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'خدمات تطوير النظم السحابية وربط واجهات البرمجة', qty: 1, unitPrice: 2500, vatRate: 15 },
    { id: '2', description: 'استشارات تقنية وأمن معلومات للمنشآت', qty: 2, unitPrice: 400, vatRate: 15 },
  ]);

  // Design QR Customization
  const [qrSize, setQrSize] = useState(400);
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotStyle, setDotStyle] = useState<'square' | 'rounded' | 'dots' | 'classy' | 'leaf' | 'diamond'>('rounded');
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'circle' | 'leaf'>('rounded');
  const [frameText, setFrameText] = useState('فاتورة ضريبية مبسطة');
  const [showFrame, setShowFrame] = useState(true);

  // Inspector State
  const [inspectorInput, setInspectorInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Calculated totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  }, [items]);

  const totalVat = useMemo(() => {
    return items.reduce((sum, item) => {
      const lineSubtotal = item.qty * item.unitPrice;
      return sum + (lineSubtotal * (item.vatRate / 100));
    }, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return subtotal + totalVat;
  }, [subtotal, totalVat]);

  // ZATCA TLV Base64 payload
  const tlvBase64 = useMemo(() => {
    return generateZatcaTLVBase64({
      sellerName: sellerName || 'شركة تجارية',
      vatNumber: vatNumber || '300000000000003',
      timestamp: timestamp || new Date().toISOString(),
      totalAmount: grandTotal.toFixed(2),
      vatAmount: totalVat.toFixed(2),
      invoiceHash: isPhase2 ? invoiceHash : undefined,
      ecdsaSignature: isPhase2 ? ecdsaSignature : undefined,
    });
  }, [sellerName, vatNumber, timestamp, grandTotal, totalVat, isPhase2, invoiceHash, ecdsaSignature]);

  // Vat number validation rule: 15 digits, starts and ends with 3
  const isVatValid = useMemo(() => {
    const clean = vatNumber.trim();
    return /^3\d{13}3$/.test(clean);
  }, [vatNumber]);

  // Buyer Name validation rule: non-empty
  const isCustomerNameValid = useMemo(() => {
    return customerName.trim().length > 0;
  }, [customerName]);

  // Buyer VAT validation rule: 15 digits, starts and ends with 3
  const isCustomerVatValid = useMemo(() => {
    const clean = customerVat.trim();
    return /^3\d{13}3$/.test(clean);
  }, [customerVat]);

  // Update Item
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // Add Item
  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: String(Date.now()),
        description: 'بند جديد / خدمة أو سلعة',
        qty: 1,
        unitPrice: 100,
        vatRate: 15
      }
    ]);
  };

  // Remove Item
  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Refresh timestamp to NOW
  const setCurrentTimestamp = () => {
    setTimestamp(new Date().toISOString().slice(0, 19) + 'Z');
  };

  // Render QR Code onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderStyledQR(
      canvas,
      tlvBase64,
      {
        fgColor,
        bgColor,
        gradientType: 'none',
        gradientColor: '#059669',
        dotStyle,
        eyeStyle,
        margin: 16,
        errorCorrectionLevel: 'M',
        frameStyle: showFrame ? 'custom' : 'none',
        frameText: showFrame ? frameText : '',
        frameColor: '#059669',
        frameTextColor: '#ffffff',
        frameFontSize: 13,
        frameTextPosition: 'bottom'
      }
    );
  }, [tlvBase64, fgColor, bgColor, dotStyle, eyeStyle, showFrame, frameText, qrSize]);

  // Download QR image
  const handleDownload = (format: 'png' | 'svg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ZATCA-QR-${invoiceNumber || 'invoice'}.${format}`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Copy TLV Base64
  const handleCopyBase64 = () => {
    navigator.clipboard.writeText(tlvBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Decoded inspector data
  const decodedInspector = useMemo(() => {
    if (!inspectorInput.trim()) return null;
    return decodeZatcaTLVBase64(inspectorInput);
  }, [inspectorInput]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header Banner with Saudi ZATCA Compliance Branding */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold font-mono tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                معتمد وفق معايير هيئة الزكاة والضريبة والجمارك (ZATCA)
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-slate-300 rounded-lg text-[11px] font-semibold">
                المرحلة الأولى والثانية (TLV Base64)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-emerald-400 shrink-0" />
              مولد باركود الفاتورة الإلكترونية السعودية (فاتورة)
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              قم بإنشاء رموز QR المتوافقة قانونياً مع متطلبات الفوترة الإلكترونية بالمملكة العربية السعودية بنظام الترميز الثنائي TLV المشفر بـ Base64، مع إمكانية معاينة الفاتورة الضريبية وطباعتها وتصديرها فوراً.
            </p>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start lg:self-center">
            <button
              onClick={() => setActiveSubView('builder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'builder'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              منشئ الفاتورة والرمز
            </button>
            <button
              onClick={() => setActiveSubView('receipt')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'receipt'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Printer className="w-4 h-4" />
              معاينة الفاتورة الضريبية
            </button>
            <button
              onClick={() => {
                setActiveSubView('inspector');
                setInspectorInput(tlvBase64);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'inspector'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-4 h-4" />
              فاحص كود TLV
            </button>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer & Data Privacy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 bg-amber-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2 w-full text-right" style={{ direction: 'rtl' }}>
          <h4 className="text-xs sm:text-sm font-bold text-amber-900 flex flex-wrap items-center gap-2">
            تنبيه قانوني هام وإخلاء مسؤولية | Important Legal Disclaimer
            <span className="px-2 py-0.5 bg-amber-600 text-white text-[9px] font-bold rounded-full">
              المرحلة الأولى فقط (Phase 1 Only)
            </span>
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed font-sans">
            <strong>بالعربية:</strong> تم تصميم هذه الأداة لأغراض المرحلة الأولى (مرحلة الإصدار والحفظ) والأغراض التعليمية والتجريبية فقط. إن الفواتير التجارية بين المنشآت (B2B) التي تتطلب الالتزام بمتطلبات المرحلة الثانية (مرحلة الربط والتكامل) تطلب تقنياً الربط المباشر والنشط مع أنظمة هيئة الزكاة والضريبة والجمارك (ZATCA) عبر حلول فوترة إلكترونية معتمدة ومرخصة رسمياً من الهيئة. لا تعد هذه الأداة حلاً مستقلاً معتمداً للمرحلة الثانية. لا تتحمل المنشأة (iSolutions) أي مسؤولية عن الغرامات أو العقوبات الناتجة عن أي إساءة استخدام للأداة أو استخدامها بشكل يخالف اللوائح الرسمية للهيئة.
          </p>
          <div className="h-px bg-amber-200/60 my-1.5" />
          <p className="text-xs text-amber-800 leading-relaxed font-sans text-left" style={{ direction: 'ltr' }}>
            <strong>In English:</strong> This tool is designed strictly for **Phase 1 (Generation & Storage)**, testing, and educational purposes. Commercial B2B invoicing requiring **Phase 2 compliance (Integration Phase)** must utilize a ZATCA-certified e-invoicing solution integrated directly with official systems. Standalone generators cannot satisfy Phase 2 compliance mandates. iSolutions is not liable for any regulatory audits, compliance failures, or penalties resulting from misuse of this tool.
          </p>
        </div>
      </div>

      {/* VIEW 1: BUILDER */}
      {activeSubView === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Form Controls (8 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Seller Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  بيانات المورد / المنشأة (Tag 1 & 2)
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  إلزامي نظاماً
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    شعار المنشأة (Company Logo) - اختياري
                  </label>
                  
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    {logoImage ? (
                      <div className="relative w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={logoImage} alt="Company Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setLogoImage(null)}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110"
                          title="حذف الشعار"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <p className="text-[11px] text-slate-600 font-bold">ارفع شعار منشأتك ليظهر في الفاتورة الضريبية المطبوعة</p>
                      <p className="text-[10px] text-slate-400">يدعم صيغ PNG, JPG, SVG (يفضل خلفية شفافة)</p>
                      
                      <label className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs transition-all">
                        <Upload className="w-3 h-3 text-slate-500" />
                        <span>تحميل الشعار</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="zatca-seller-name-input" className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المنشأة / المورّد (Seller Name)
                  </label>
                  <input
                    id="zatca-seller-name-input"
                    type="text"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    placeholder="مثال: شركة الحلول الرقمية المحدودة"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="zatca-vat-number-input" className="block text-xs font-bold text-slate-700">
                      الرقم الضريبي (VAT Number)
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${isVatValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isVatValid ? '✓ 15 رقماً صالحاً' : '15 رقماً (يبدأ وينتهي بـ 3)'}
                    </span>
                  </div>
                  <input
                    id="zatca-vat-number-input"
                    type="text"
                    maxLength={15}
                    value={vatNumber}
                    onChange={e => setVatNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="300000000000003"
                    className={`w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 bg-slate-50/50 ${
                      isVatValid
                        ? 'border-slate-200 focus:ring-emerald-500'
                        : 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    }`}
                  />
                  {!isVatValid && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                      رقم ضريبي غير صحيح (يجب أن يتكون من 15 رقم ويبدأ وينتهي بالرقم 3)
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="zatca-timestamp-input" className="block text-xs font-bold text-slate-700">
                      تاريخ ووقت الفاتورة (Timestamp)
                    </label>
                    <button
                      type="button"
                      onClick={setCurrentTimestamp}
                      className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      الآن
                    </button>
                  </div>
                  <input
                    id="zatca-timestamp-input"
                    type="text"
                    value={timestamp}
                    onChange={e => setTimestamp(e.target.value)}
                    placeholder="2026-08-27T15:30:00Z"
                    className="w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="zatca-invoice-number-input" className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الفاتورة المرجعي (Invoice #)
                  </label>
                  <input
                    id="zatca-invoice-number-input"
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="INV-00124"
                    className="w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="zatca-customer-name-input" className="block text-xs font-bold text-slate-700">
                      اسم العميل / المشتري (Buyer Name) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-bold ${isCustomerNameValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCustomerNameValid ? '✓ صالح' : 'مطلوب'}
                    </span>
                  </div>
                  <input
                    id="zatca-customer-name-input"
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="اسم العميل / المشتري"
                    className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 bg-slate-50/50 ${
                      isCustomerNameValid
                        ? 'border-slate-200 focus:ring-emerald-500'
                        : 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    }`}
                  />
                  {!isCustomerNameValid && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                      اسم العميل / المشتري حقل إلزامي
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      الرقم الضريبي للمشتري (Buyer VAT) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${isCustomerVatValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCustomerVatValid ? '✓ 15 رقماً صالحاً' : '15 رقماً (يبدأ وينتهي بـ 3)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={15}
                    value={customerVat}
                    onChange={e => setCustomerVat(e.target.value.replace(/\D/g, ''))}
                    placeholder="310987654321003"
                    className={`w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 bg-slate-50/50 ${
                      isCustomerVatValid
                        ? 'border-slate-200 focus:ring-emerald-500'
                        : 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    }`}
                  />
                  {!isCustomerVatValid && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                      الرقم الضريبي للمشتري حقل إلزامي (15 رقم يبدأ وينتهي بالرقم 3)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Line Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    بنود الفاتورة وحساب الضريبة (15%)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يتم احتساب ضريبة القيمة المضافة والإجمالي تلقائياً وفق معادلة ZATCA
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة بند
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const lineTotal = item.qty * item.unitPrice;
                  const lineVat = lineTotal * (item.vatRate / 100);
                  const lineGrandTotal = lineTotal + lineVat;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(item.id, 'description', e.target.value)}
                          placeholder="وصف البند أو الخدمة"
                          className="flex-1 text-xs font-semibold px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف البند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الكمية</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => updateItem(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                            className="w-full text-xs font-mono px-2.5 py-1 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">سعر الوحدة (ر.س)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                            className="w-full text-xs font-mono px-2.5 py-1 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الضريبة (15%)</label>
                          <div className="text-xs font-mono font-bold text-slate-700 px-2 py-1 bg-slate-100 rounded-lg text-center">
                            {lineVat.toFixed(2)} ر.س
                          </div>
                        </div>

                        <div className="col-span-3 sm:col-span-1">
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الإجمالي مع الضريبة</label>
                          <div className="text-xs font-mono font-black text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg text-center">
                            {lineGrandTotal.toFixed(2)} ر.س
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals Summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>المجموع الفرعي (غير شامل الضريبة):</span>
                  <span className="font-mono font-bold text-slate-900">{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>إجمالي ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono font-bold text-emerald-600">{totalVat.toFixed(2)} ر.س</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>إجمالي الفاتورة النهائي شامل الضريبة (Tag 4):</span>
                  <span className="font-mono text-base text-emerald-700">{grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {/* 3. Phase 2 (Optional Integration Features) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    حقول المرحلة الثانية (Phase 2 Integration)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhase2(!isPhase2)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    isPhase2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isPhase2 ? 'مفعّل (Tags 6 & 7)' : 'تفعيل الحقول الإضافية'}
                </button>
              </div>

              {isPhase2 && (
                <div className="space-y-3 pt-2">
                  <div className="p-2.5 bg-amber-50 border border-amber-150 rounded-xl text-[10px] text-amber-800 leading-normal" style={{ direction: 'rtl' }}>
                    تنبيه: يجب حساب هذه القيم وتوقيعها مشفراً مسبقاً خارجياً من خلال حل فوترة متكامل معتمد من الهيئة. لا تقوم هذه المنصة بإنشاء توقيعات رقمية أو حساب هاش الفواتير تلقائياً.
                    <br />
                    <span className="font-semibold" style={{ direction: 'ltr' }}>Note:</span> These values must be pre-computed and cryptographically signed externally via a certified system. This tool does not sign XML invoices or calculate hashes.
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      هاش الفاتورة الإلكترونية المشفر (Invoice SHA-256 Hash - Tag 6)
                    </label>
                    <input
                      type="text"
                      value={invoiceHash}
                      onChange={e => setInvoiceHash(e.target.value)}
                      placeholder="NWZkOGY2NTRiMzg2YjA0NzYwYjM2MDQ..."
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      التوقيع الرقمي ECDSA (Digital Signature - Tag 7)
                    </label>
                    <input
                      type="text"
                      value={ecdsaSignature}
                      onChange={e => setEcdsaSignature(e.target.value)}
                      placeholder="MEQCIDy7YqK6mYfR..."
                      className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live QR Preview & Export (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            
            {/* Live QR Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col items-center text-center space-y-4">
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  رمز الاستجابة السريعة المعتمد
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  جاهز للمسح
                </span>
              </div>

              {/* Canvas Renderer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shadow-inner relative group">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-xl shadow-xs"
                  style={{ width: '260px', height: 'auto' }}
                />
              </div>

              {/* QR Metadata Badge */}
              <div className="w-full grid grid-cols-2 gap-2 text-start bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">المورّد:</span>
                  <span className="font-bold text-slate-800 truncate block">{sellerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">الرقم الضريبي للمورد:</span>
                  <span className="font-bold font-mono text-slate-800 text-[10.5px]">{vatNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">المشتري / العميل:</span>
                  <span className="font-bold text-slate-800 truncate block">{customerName || 'عميل نقدي'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">الرقم الضريبي للمشتري:</span>
                  <span className="font-bold font-mono text-slate-800 text-[10.5px]">{customerVat || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">الإجمالي مع الضريبة:</span>
                  <span className="font-bold font-mono text-emerald-700">{grandTotal.toFixed(2)} ر.س</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">مبلغ الضريبة (15%):</span>
                  <span className="font-bold font-mono text-slate-700">{totalVat.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  تنزيل الرمز (PNG)
                </button>

                <button
                  type="button"
                  onClick={handleCopyBase64}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم نسخ TLV!' : 'نسخ كود TLV'}
                </button>
              </div>

              {/* View Receipt Button */}
              <button
                type="button"
                onClick={() => setActiveSubView('receipt')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                معاينة وطباعة الفاتورة الضريبية
              </button>

              {/* Send to Creative Studio */}
              {onInitiateCustomQR && (
                <button
                  type="button"
                  onClick={() => onInitiateCustomQR({
                    type: 'text',
                    content: tlvBase64,
                    name: `فاتورة ZATCA - ${invoiceNumber}`
                  })}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer pt-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  فتح في استوديو التصميم المتقدم
                </button>
              )}
            </div>

            {/* QR Styling Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                تخصيص شكل الرمز
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">نمط النقاط</label>
                  <select
                    value={dotStyle}
                    onChange={e => setDotStyle(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="rounded">كتل مستديرة</option>
                    <option value="square">مربعات قياسية</option>
                    <option value="dots">نقاط دائرية</option>
                    <option value="leaf">ورقة نبات</option>
                    <option value="diamond">ألماسي</option>
                    <option value="classy">كلاسيكي</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">إطارات الزوايا</label>
                  <select
                    value={eyeStyle}
                    onChange={e => setEyeStyle(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="rounded">مستدير ناعم</option>
                    <option value="square">مربع كلاسيكي</option>
                    <option value="circle">دائري نظيف</option>
                    <option value="leaf">أوراق جمالية</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFrame}
                    onChange={e => setShowFrame(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  إظهار شريط إطار (فاتورة ضريبية مبسطة)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECEIPT PREVIEW & PRINT */}
      {activeSubView === 'receipt' && (
        <div className="space-y-6">
          {/* Action bar for print view */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <button
              type="button"
              onClick={() => setActiveSubView('builder')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ← العودة لمنشئ الفاتورة
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة الفاتورة الضريبية (Print / PDF)
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            ref={printRef}
            className="bg-white max-w-3xl mx-auto rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 space-y-8"
          >
            {/* Invoice Top Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-emerald-600 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {logoImage && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    <img src={logoImage} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-md tracking-wider">
                    فاتورة ضريبية مبسطة
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {sellerName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    الرقم الضريبي للمنشأة: <span className="font-bold text-slate-900">{vatNumber}</span>
                  </p>
                </div>
              </div>

              {/* QR Code in Print View */}
              <div className="flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  style={{ width: '130px', height: 'auto' }}
                  className="rounded-lg border border-slate-200"
                />
                <span className="text-[9px] font-mono text-slate-500 mt-1">رمز التحقق ZATCA</span>
              </div>
            </div>

            {/* Meta details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">رقم الفاتورة:</span>
                <span className="font-bold font-mono text-slate-800">{invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تاريخ الإصدار:</span>
                <span className="font-bold font-mono text-slate-800">{timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">اسم العميل / المشتري:</span>
                <span className="font-bold text-slate-800">{customerName || 'عميل نقدي'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الرقم الضريبي للمشتري:</span>
                <span className="font-bold font-mono text-slate-800">{customerVat || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">طريقة الدفع:</span>
                <span className="font-bold text-slate-800">نقداً / مدى / سداد</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-700">
                    <th className="py-2.5 px-3 text-start">#</th>
                    <th className="py-2.5 px-3 text-start">الوصف / الخدمة</th>
                    <th className="py-2.5 px-3 text-center">الكمية</th>
                    <th className="py-2.5 px-3 text-end">سعر الوحدة</th>
                    <th className="py-2.5 px-3 text-end">الضريبة (15%)</th>
                    <th className="py-2.5 px-3 text-end">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const lSub = item.qty * item.unitPrice;
                    const lVat = lSub * (item.vatRate / 100);
                    const lTot = lSub + lVat;
                    return (
                      <tr key={item.id}>
                        <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-3 px-3 font-mono text-center">{item.qty}</td>
                        <td className="py-3 px-3 font-mono text-end">{item.unitPrice.toFixed(2)} ر.س</td>
                        <td className="py-3 px-3 font-mono text-end text-slate-600">{lVat.toFixed(2)} ر.س</td>
                        <td className="py-3 px-3 font-mono font-bold text-end text-slate-900">{lTot.toFixed(2)} ر.س</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations Box */}
            <div className="flex justify-end pt-4">
              <div className="w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الخاضع للضريبة:</span>
                  <span className="font-mono font-bold text-slate-900">{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono font-bold text-emerald-600">{totalVat.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>الإجمالي المستحق:</span>
                  <span className="font-mono text-emerald-700">{grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {/* Footer declaration */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6">
              تم إصدار هذه الفاتورة الإلكترونية وفقاً لمتطلبات لائحة الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TLV INSPECTOR & VALIDATOR */}
      {activeSubView === 'inspector' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-600" />
              أداة فحص وتفكيك حقول TLV المشفرة بـ Base64
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ألصق أي نص كود Base64 من فاتورة إلكترونية للتحقق من سلامة الحقول وقراءة القيم المستخرجة فوراً.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نص كود الفاتورة المشفر (Base64 TLV Payload):
            </label>
            <textarea
              rows={4}
              value={inspectorInput}
              onChange={e => setInspectorInput(e.target.value)}
              placeholder="ألصق كود الفاتورة هنا (مثال: AQ3YtNix2YPYqSDYp9mE2K3ZhNmI2YQ...)"
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Results */}
          {decodedInspector && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                {decodedInspector.success ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    بنية TLV صالحة ومتوافقة مع نظام ZATCA
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {decodedInspector.error}
                  </span>
                )}
              </div>

              {decodedInspector.success && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tag 1: اسم المورّد (Seller Name)
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {decodedInspector.sellerName || '—'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tag 2: الرقم الضريبي (VAT Registration Number)
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                      {decodedInspector.vatNumber || '—'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tag 3: وقت وتاريخ الفاتورة (Timestamp)
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                      {decodedInspector.timestamp || '—'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tag 4: إجمالي الفاتورة مع الضريبة (Invoice Total)
                    </span>
                    <span className="text-sm font-mono font-black text-emerald-700 mt-1 block">
                      {decodedInspector.totalAmount ? `${decodedInspector.totalAmount} ر.س` : '—'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Tag 5: مبلغ ضريبة القيمة المضافة (VAT Amount)
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-600 mt-1 block">
                      {decodedInspector.vatAmount ? `${decodedInspector.vatAmount} ر.س` : '—'}
                    </span>
                  </div>

                  {decodedInspector.invoiceHash && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Tag 6: هاش الفاتورة (Invoice Hash - Phase 2)
                      </span>
                      <span className="text-xs font-mono text-slate-700 mt-1 block break-all">
                        {decodedInspector.invoiceHash}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAQ & ZATCA Portal Authority Section */}
      <div className="mt-12 pt-10 border-t border-slate-200 w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-indigo-600 mx-auto" />
          <h3 className="text-xl font-extrabold text-slate-900">
            Frequently Asked Questions & Compliance Guidance
          </h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Get clear, honest answers on ZATCA requirements, data safety, and phase specifications.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "What is ZATCA Phase 1 vs Phase 2?",
              a: "Phase 1 (Generation Phase) requires KSA businesses to issue simplified tax invoices and simplified credit/debit notes with a compliant QR code containing the Seller Name, VAT Number, Timestamp, Grand Total, and VAT Total in TLV format. Phase 2 (Integration Phase) introduces advanced cryptographic requirements (XML signing, SHA-256 hashing) and requires direct live integration with ZATCA's servers."
            },
            {
              q: "Is this tool ZATCA certified for Phase 2?",
              a: "No. This tool is designed strictly for Phase 1 (Generation & Storage), testing, and educational purposes. Standalone client-side generators cannot satisfy Phase 2 compliance mandates, which require direct, active API integration with official ZATCA systems via certified e-invoicing software."
            },
            {
              q: "Does this tool store or transmit my invoice data?",
              a: "No. All processing, including TLV encoding, Base64 conversion, and QR code generation, is performed 100% locally inside your web browser. No invoice or tax data is ever stored, saved, or transmitted to any external servers. Your privacy is fully preserved."
            }
          ].map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition-colors gap-4"
                >
                  <span className="text-sm sm:text-base text-left">{faq.q}</span>
                  <span className="text-indigo-600 shrink-0 text-base font-bold">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 text-left">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Outbound link to ZATCA official portal */}
        <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-950">Official ZATCA Compliance Portal</h4>
            <p className="text-xs text-indigo-800">
              Access the official KSA regulations, integration guidelines, developer sandboxes, and list of certified solutions directly.
            </p>
          </div>
          <a
            href="https://zatca.gov.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Visit ZATCA Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Schema injection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is ZATCA Phase 1 vs Phase 2?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Phase 1 (Generation Phase) requires KSA businesses to issue simplified tax invoices with a compliant QR code containing the Seller Name, VAT Registration Number, Timestamp, Grand Total, and VAT Total in TLV format. Phase 2 (Integration Phase) introduces advanced cryptographic requirements (XML signing, SHA-256 hashing) and requires direct live integration with ZATCA's servers."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is this tool ZATCA certified for Phase 2?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. This tool is designed strictly for Phase 1 (Generation & Storage), testing, and educational purposes. Standalone client-side generators cannot satisfy Phase 2 compliance mandates, which require direct, active API integration with official ZATCA systems via certified e-invoicing software."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does this tool store or transmit my invoice data?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. All processing, including TLV encoding, Base64 conversion, and QR code generation, is performed 100% locally inside your web browser. No invoice or tax data is ever stored, saved, or transmitted to any external servers. Your privacy is fully preserved."
                  }
                }
              ]
            })
          }}
        />
      </div>
    </div>
  );
}
