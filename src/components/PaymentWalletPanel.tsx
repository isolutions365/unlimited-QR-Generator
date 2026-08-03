import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/i18n';
import { Wallet, QrCode, Info, HelpCircle, CheckCircle2, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

export function computePaymentContent(method: string, fields: Record<string, string>): string {
  const h = (fields.handle || '').trim();
  const upi = (fields.upiId || '').trim();
  const name = (fields.payeeName || '').trim();
  const amt = (fields.amount || '').trim();
  const curr = (fields.currency || 'USD').trim().toUpperCase();
  const noteStr = (fields.note || '').trim();
  const acc = (fields.account || '').trim();
  const ph = (fields.phone || '').trim();
  const pix = (fields.pixKey || '').trim();
  const cityStr = (fields.city || '').trim();
  const tillNum = (fields.till || '').trim();
  const paybillNum = (fields.paybill || '').trim();
  const ibanStr = (fields.iban || '').trim();
  const biller = (fields.billerId || '').trim();
  const custom = (fields.customUrl || '').trim();

  switch (method) {
    case 'paypal': {
      const clean = h.replace(/^https?:\/\//i, '').replace(/^paypal\.me\//i, '').replace(/^@/, '');
      if (!clean) return 'https://paypal.me/';
      if (amt && !isNaN(Number(amt))) return `https://paypal.me/${clean}/${amt}${curr}`;
      return `https://paypal.me/${clean}`;
    }
    case 'venmo': {
      const clean = h.replace(/^@/, '').replace(/^https?:\/\/(www\.)?venmo\.com\/(u\/)?/i, '');
      if (!clean) return 'https://venmo.com/';
      if (amt || noteStr) {
        const p = new URLSearchParams();
        p.append('txn', 'pay');
        if (amt) p.append('amount', amt);
        if (noteStr) p.append('note', noteStr);
        return `https://venmo.com/${clean}?${p.toString()}`;
      }
      return `https://venmo.com/u/${clean}`;
    }
    case 'cashapp': {
      let clean = h;
      if (!clean) return 'https://cash.app/';
      clean = clean.startsWith('$') ? clean : `$${clean}`;
      if (amt && !isNaN(Number(amt))) return `https://cash.app/${clean}/${amt}`;
      return `https://cash.app/${clean}`;
    }
    case 'upi': {
      if (!upi) return 'upi://pay';
      const p = new URLSearchParams();
      p.append('pa', upi);
      if (name) p.append('pn', name);
      if (amt) {
        p.append('am', amt);
        p.append('cu', 'INR');
      }
      if (noteStr) p.append('tn', noteStr);
      return `upi://pay?${p.toString()}`;
    }
    case 'alipay': {
      if (!acc) return 'https://qr.alipay.com/';
      if (acc.startsWith('http://') || acc.startsWith('https://') || acc.startsWith('alipayqr://')) return acc;
      return `https://qr.alipay.com/${acc}`;
    }
    case 'wechat': {
      if (!acc) return 'wxp://';
      return acc;
    }
    case 'pix': {
      if (!pix) return 'https://pix.bcb.gov.br/';
      if (pix.startsWith('000201') || pix.startsWith('http://') || pix.startsWith('https://')) return pix;
      const payeeName = (name || 'PAYEE').substring(0, 25);
      const city = (cityStr || 'SAO PAULO').substring(0, 15);
      if (amt) {
        return `https://pix.bcb.gov.br/qr/${encodeURIComponent(pix)}?name=${encodeURIComponent(payeeName)}&city=${encodeURIComponent(city)}&amount=${amt}`;
      }
      return `https://pix.bcb.gov.br/qr/${encodeURIComponent(pix)}`;
    }
    case 'grabpay': {
      if (!ph && !acc) return 'https://grab.com/pay/';
      const target = ph || acc;
      if (target.startsWith('http://') || target.startsWith('https://')) return target;
      return `https://grab.com/pay/${target}`;
    }
    case 'mpesa': {
      if (paybillNum) {
        return `M-PESA Paybill: ${paybillNum}${acc ? ` Account: ${acc}` : ''}`;
      }
      if (tillNum) {
        return `mpesa://pay?till=${tillNum}`;
      }
      if (ph) {
        return `tel:${ph}`;
      }
      return 'mpesa://pay';
    }
    case 'jazzcash': {
      if (!acc && !ph) return 'https://jazzcash.com.pk/pay';
      const target = acc || ph;
      if (amt) return `https://jazzcash.com.pk/pay?account=${encodeURIComponent(target)}&amount=${amt}`;
      return `https://jazzcash.com.pk/pay?account=${encodeURIComponent(target)}`;
    }
    case 'easypaisa': {
      if (!acc && !ph) return 'https://easypaisa.com.pk/pay';
      const target = acc || ph;
      if (amt) return `https://easypaisa.com.pk/pay?account=${encodeURIComponent(target)}&amount=${amt}`;
      return `https://easypaisa.com.pk/pay?account=${encodeURIComponent(target)}`;
    }
    case 'stcpay': {
      if (!ph) return 'https://stcpay.com.sa/pay';
      if (amt) return `https://stcpay.com.sa/pay?phone=${encodeURIComponent(ph)}&amount=${amt}`;
      return `https://stcpay.com.sa/pay?phone=${encodeURIComponent(ph)}`;
    }
    case 'mada': {
      if (!ibanStr) return 'https://mada.com.sa/pay';
      if (ibanStr.startsWith('http://') || ibanStr.startsWith('https://')) return ibanStr;
      if (ibanStr.toUpperCase().startsWith('SA') || ibanStr.length >= 20) return `iban:${ibanStr.toUpperCase()}`;
      return `https://mada.com.sa/pay?iban=${ibanStr}`;
    }
    case 'sadad': {
      if (!biller) return 'sadad://pay';
      return `sadad://pay?biller=${encodeURIComponent(biller)}`;
    }
    case 'custom':
    default: {
      if (!custom) return 'https://';
      if (custom.startsWith('http://') || custom.startsWith('https://') || custom.includes('://')) return custom;
      return `https://${custom}`;
    }
  }
}

interface PaymentWalletPanelProps {
  content: string;
  onChangeContent: (newContent: string) => void;
}

export default function PaymentWalletPanel({ content, onChangeContent }: PaymentWalletPanelProps) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [paymentFields, setPaymentFields] = useState<Record<string, string>>({
    handle: '',
    upiId: '',
    payeeName: '',
    amount: '',
    currency: 'USD',
    note: '',
    account: '',
    phone: '',
    pixKey: '',
    city: '',
    till: '',
    paybill: '',
    accountTitle: '',
    iban: '',
    billerId: '',
    customUrl: ''
  });

  const lastParsedContent = useRef<string>('');

  useEffect(() => {
    if (!content || content === lastParsedContent.current) return;
    lastParsedContent.current = content;

    let detectedMethod = 'paypal';
    const fields: Record<string, string> = {
      handle: '',
      upiId: '',
      payeeName: '',
      amount: '',
      currency: 'USD',
      note: '',
      account: '',
      phone: '',
      pixKey: '',
      city: '',
      till: '',
      paybill: '',
      accountTitle: '',
      iban: '',
      billerId: '',
      customUrl: ''
    };

    if (content.startsWith('upi://pay')) {
      detectedMethod = 'upi';
      try {
        const url = new URL(content.replace('upi://pay', 'http://upi-dummy'));
        fields.upiId = url.searchParams.get('pa') || '';
        fields.payeeName = url.searchParams.get('pn') || '';
        fields.amount = url.searchParams.get('am') || '';
        fields.note = url.searchParams.get('tn') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.upiId = params.get('pa') || '';
        fields.payeeName = params.get('pn') || '';
        fields.amount = params.get('am') || '';
        fields.note = params.get('tn') || '';
      }
    } else if (content.startsWith('https://paypal.me/')) {
      detectedMethod = 'paypal';
      const clean = content.replace('https://paypal.me/', '');
      const parts = clean.split('/');
      fields.handle = parts[0] || '';
      if (parts[1]) {
        const amtMatch = parts[1].match(/^([\d.]+)([A-Z]{3})?$/i);
        if (amtMatch) {
          fields.amount = amtMatch[1];
          if (amtMatch[2]) fields.currency = amtMatch[2].toUpperCase();
        } else {
          fields.amount = parts[1];
        }
      }
    } else if (content.startsWith('https://venmo.com/')) {
      detectedMethod = 'venmo';
      const clean = content.replace('https://venmo.com/', '');
      if (clean.includes('?')) {
        const [pathPart, queryPart] = clean.split('?');
        fields.handle = pathPart.replace(/^u\//, '').replace(/\/$/, '');
        const params = new URLSearchParams(queryPart);
        fields.amount = params.get('amount') || '';
        fields.note = params.get('note') || '';
      } else {
        fields.handle = clean.replace(/^u\//, '').replace(/\/$/, '');
      }
    } else if (content.startsWith('https://cash.app/')) {
      detectedMethod = 'cashapp';
      const clean = content.replace('https://cash.app/', '');
      const parts = clean.split('/');
      fields.handle = parts[0] || '';
      if (parts[1]) {
        fields.amount = parts[1];
      }
    } else if (content.startsWith('https://pix.bcb.gov.br/qr/')) {
      detectedMethod = 'pix';
      const clean = content.replace('https://pix.bcb.gov.br/qr/', '');
      if (clean.includes('?')) {
        const [keyPart, queryPart] = clean.split('?');
        fields.pixKey = decodeURIComponent(keyPart);
        const params = new URLSearchParams(queryPart);
        fields.payeeName = params.get('name') || '';
        fields.city = params.get('city') || '';
        fields.amount = params.get('amount') || '';
      } else {
        fields.pixKey = decodeURIComponent(clean);
      }
    } else if (content.startsWith('https://grab.com/pay/')) {
      detectedMethod = 'grabpay';
      fields.phone = content.replace('https://grab.com/pay/', '');
    } else if (content.startsWith('M-PESA Paybill:')) {
      detectedMethod = 'mpesa';
      const match = content.match(/M-PESA Paybill:\s*(\S+)(?:\s+Account:\s*(.+))?/i);
      if (match) {
        fields.paybill = match[1];
        fields.account = match[2] || '';
      }
    } else if (content.startsWith('mpesa://pay?till=')) {
      detectedMethod = 'mpesa';
      fields.till = content.replace('mpesa://pay?till=', '');
    } else if (content.startsWith('tel:') && content.includes('mpesa')) {
      detectedMethod = 'mpesa';
      fields.phone = content.replace('tel:', '');
    } else if (content.startsWith('https://jazzcash.com.pk/pay')) {
      detectedMethod = 'jazzcash';
      try {
        const url = new URL(content);
        fields.account = url.searchParams.get('account') || '';
        fields.amount = url.searchParams.get('amount') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.account = params.get('account') || '';
        fields.amount = params.get('amount') || '';
      }
    } else if (content.startsWith('https://easypaisa.com.pk/pay')) {
      detectedMethod = 'easypaisa';
      try {
        const url = new URL(content);
        fields.account = url.searchParams.get('account') || '';
        fields.amount = url.searchParams.get('amount') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.account = params.get('account') || '';
        fields.amount = params.get('amount') || '';
      }
    } else if (content.startsWith('https://stcpay.com.sa/pay')) {
      detectedMethod = 'stcpay';
      try {
        const url = new URL(content);
        fields.phone = url.searchParams.get('phone') || '';
        fields.amount = url.searchParams.get('amount') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.phone = params.get('phone') || '';
        fields.amount = params.get('amount') || '';
      }
    } else if (content.startsWith('iban:')) {
      detectedMethod = 'mada';
      fields.iban = content.replace('iban:', '');
    } else if (content.startsWith('https://mada.com.sa/pay')) {
      detectedMethod = 'mada';
      try {
        const url = new URL(content);
        fields.iban = url.searchParams.get('iban') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.iban = params.get('iban') || '';
      }
    } else if (content.startsWith('sadad://pay')) {
      detectedMethod = 'sadad';
      try {
        const url = new URL(content);
        fields.billerId = url.searchParams.get('biller') || '';
      } catch (e) {
        const query = content.split('?')[1] || '';
        const params = new URLSearchParams(query);
        fields.billerId = params.get('biller') || '';
      }
    } else if (content.startsWith('https://') || content.startsWith('http://')) {
      detectedMethod = 'custom';
      fields.customUrl = content;
    }

    setPaymentMethod(detectedMethod);
    setPaymentFields(fields);
  }, [content]);

  const handleFieldChange = (field: string, value: string) => {
    const updatedFields = { ...paymentFields, [field]: value };
    setPaymentFields(updatedFields);
    const newPayload = computePaymentContent(paymentMethod, updatedFields);
    lastParsedContent.current = newPayload;
    onChangeContent(newPayload);
  };

  const handleMethodChange = (newMethod: string) => {
    setPaymentMethod(newMethod);
    const newPayload = computePaymentContent(newMethod, paymentFields);
    lastParsedContent.current = newPayload;
    onChangeContent(newPayload);
  };

  return (
    <div className="p-3.5 bg-gray-50 rounded-xl space-y-3.5 border border-gray-100 shadow-2xs" id="payment-wallet-panel">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-850 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" />
            {t('control.paymentWalletSetup', 'Mobile Wallet & Payment Setup')}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t('control.paymentWalletDesc', 'Create instant payment QR codes for popular global and regional mobile wallets.')}
          </p>
        </div>
      </div>

      {/* Educational & Helpful Info Section / معلومات اور استعمال */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs text-slate-700 space-y-2.5">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h5 className="font-bold text-slate-950 text-[11px] uppercase tracking-wider flex items-center gap-1">
              Payment & Wallet QR Guide | ادائیگی اور والٹ گائیڈ
            </h5>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Generate payment QRs for instant mobile transfers. Scan and pay instantly without manually typing phone numbers or account IDs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
          {/* Column 1: Uses / استعمالات */}
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-50 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Primary Uses / عام استعمالات:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li><strong>Shop Checkouts:</strong> Place on counters for fast contactless sales.</li>
              <li><strong>Freelance & Billing:</strong> Add to digital invoices for instant client payout.</li>
              <li><strong>Tips & Donations:</strong> Accept customer tips or charity donations seamlessly.</li>
              <li><strong>P2P Transfers:</strong> Share with friends/family to split dinner bills easily.</li>
            </ul>
          </div>

          {/* Column 2: How to Create / کیسے بنائیں */}
          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-50 space-y-1.5">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              How to Create / بنانے کا طریقہ:
            </span>
            <ul className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Select your wallet/network (e.g. UPI, PayPal, JazzCash).</li>
              <li>Input your account ID, handle, or mobile number.</li>
              <li>Optional: Set a preset request amount & note.</li>
              <li>Customize colors/logos, then download the QR!</li>
            </ul>
          </div>
        </div>

        {/* Localized note for Pakistan/India/Gulf */}
        <div className="bg-emerald-600/5 text-emerald-800 rounded-lg p-2 text-[10px] leading-relaxed border border-emerald-600/10 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">🇵🇰 Pakistan, 🇮🇳 India & 🇸🇦 Gulf Wallets:</span>
            India supports any UPI app (GPay, Paytm, PhonePe). Pakistan supports direct scanning via JazzCash & EasyPaisa. Saudi Arabia integrates Mada IBAN & STC Pay.
          </div>
        </div>
      </div>

      {/* Provider / Method Selector */}
      <div>
        <label htmlFor="payment-method-select" className="block text-[10px] font-semibold text-slate-800 uppercase tracking-wider mb-1">
          {t('control.selectPaymentMethod', 'Select Region & Payment Wallet')}
        </label>
        <select
          id="payment-method-select"
          className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          value={paymentMethod}
          onChange={e => handleMethodChange(e.target.value)}
        >
          <optgroup label="🌐 Global Payment Methods">
            <option value="paypal">PayPal (Global) — PayPal.me / Handle</option>
            <option value="custom">Custom Wallet Link (Universal Payment URI)</option>
          </optgroup>
          <optgroup label="🇺🇸 United States">
            <option value="venmo">Venmo (USA) — @username & memo</option>
            <option value="cashapp">Cash App (USA) — $cashtag & amount</option>
          </optgroup>
          <optgroup label="🇮🇳 India">
            <option value="upi">UPI / GPay / PhonePe / Paytm (India) — Virtual Payment Address</option>
          </optgroup>
          <optgroup label="🇨🇳 China">
            <option value="alipay">Alipay (China) — Alipay QR Link</option>
            <option value="wechat">WeChat Pay (China) — WeChat Pay Payload (wxp://)</option>
          </optgroup>
          <optgroup label="🇧🇷 Brazil">
            <option value="pix">PIX (Brazil) — Key / CPF / CNPJ / Email / Phone</option>
          </optgroup>
          <optgroup label="🌏 Southeast Asia">
            <option value="grabpay">GrabPay (Singapore, Malaysia, Philippines)</option>
          </optgroup>
          <optgroup label="🌍 Africa">
            <option value="mpesa">M-Pesa (Kenya, Tanzania) — Till / Paybill / Phone</option>
          </optgroup>
          <optgroup label="🇵🇰 Pakistan">
            <option value="jazzcash">JazzCash (Pakistan) — Mobile Account</option>
            <option value="easypaisa">EasyPaisa (Pakistan) — Mobile Account</option>
          </optgroup>
          <optgroup label="🇸🇦 Saudi Arabia">
            <option value="stcpay">STC Pay (Saudi Arabia) — Mobile Wallet</option>
            <option value="mada">Mada (Saudi Arabia) — IBAN / Payment Link</option>
            <option value="sadad">Sadad (Saudi Arabia) — Biller / Account Reference</option>
          </optgroup>
        </select>
      </div>

      {/* Dynamic Form Input Fields per Method */}
      {paymentMethod === 'paypal' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-paypal-handle" className="block text-[10px] font-semibold text-slate-700 mb-1">
              PayPal Username, Email, or PayPal.me Handle <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-paypal-handle"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. john_doe or paypal.me/john_doe"
              value={paymentFields.handle}
              onChange={e => handleFieldChange('handle', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="pay-paypal-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Requested Amount (Optional)
              </label>
              <input
                id="pay-paypal-amount"
                type="number"
                step="any"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. 25.00"
                value={paymentFields.amount}
                onChange={e => handleFieldChange('amount', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-paypal-currency" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Currency Code
              </label>
              <select
                id="pay-paypal-currency"
                className="w-full text-xs px-2 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                value={paymentFields.currency}
                onChange={e => handleFieldChange('currency', e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="SAR">SAR (ر.س)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'venmo' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-venmo-handle" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Venmo @username <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-venmo-handle"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. @john_doe"
              value={paymentFields.handle}
              onChange={e => handleFieldChange('handle', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="pay-venmo-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Amount ($) (Optional)
              </label>
              <input
                id="pay-venmo-amount"
                type="number"
                step="any"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. 15.00"
                value={paymentFields.amount}
                onChange={e => handleFieldChange('amount', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-venmo-note" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Payment Note / Memo (Optional)
              </label>
              <input
                id="pay-venmo-note"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. Coffee"
                value={paymentFields.note}
                onChange={e => handleFieldChange('note', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'cashapp' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-cashapp-tag" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Cash App $Cashtag <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-cashapp-tag"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. $john_doe"
              value={paymentFields.handle}
              onChange={e => handleFieldChange('handle', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pay-cashapp-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Requested Amount ($) (Optional)
            </label>
            <input
              id="pay-cashapp-amount"
              type="number"
              step="any"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. 20"
              value={paymentFields.amount}
              onChange={e => handleFieldChange('amount', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-upi-id" className="block text-[10px] font-semibold text-slate-700 mb-1">
              UPI VPA ID (Virtual Payment Address) <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-upi-id"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. name@upi or 9876543210@paytm"
              value={paymentFields.upiId}
              onChange={e => handleFieldChange('upiId', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="pay-upi-name" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Payee Name (Optional)
              </label>
              <input
                id="pay-upi-name"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. John Doe"
                value={paymentFields.payeeName}
                onChange={e => handleFieldChange('payeeName', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-upi-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Amount (₹ INR) (Optional)
              </label>
              <input
                id="pay-upi-amount"
                type="number"
                step="any"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. 500"
                value={paymentFields.amount}
                onChange={e => handleFieldChange('amount', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="pay-upi-note" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Transaction Note (Optional)
            </label>
            <input
              id="pay-upi-note"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. Invoice #1024"
              value={paymentFields.note}
              onChange={e => handleFieldChange('note', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'alipay' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-alipay-account" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Alipay Account ID / Payee QR Link <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-alipay-account"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. https://qr.alipay.com/bax0123456... or account_id"
              value={paymentFields.account}
              onChange={e => handleFieldChange('account', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'wechat' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-wechat-url" className="block text-[10px] font-semibold text-slate-700 mb-1">
              WeChat Pay Payload Code or Link (wxp://) <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-wechat-url"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. wxp://f2f012345678..."
              value={paymentFields.account}
              onChange={e => handleFieldChange('account', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'pix' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-pix-key" className="block text-[10px] font-semibold text-slate-700 mb-1">
              PIX Key (CPF / CNPJ / Email / Phone / Random Key) <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-pix-key"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. maria@empresa.com.br or 123.456.789-00"
              value={paymentFields.pixKey}
              onChange={e => handleFieldChange('pixKey', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="pay-pix-name" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Receiver Name
              </label>
              <input
                id="pay-pix-name"
                type="text"
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. Maria Silva"
                value={paymentFields.payeeName}
                onChange={e => handleFieldChange('payeeName', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-pix-city" className="block text-[10px] font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                id="pay-pix-city"
                type="text"
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. SAO PAULO"
                value={paymentFields.city}
                onChange={e => handleFieldChange('city', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-pix-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Amount (BRL R$)
              </label>
              <input
                id="pay-pix-amount"
                type="number"
                step="any"
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
                placeholder="e.g. 50.00"
                value={paymentFields.amount}
                onChange={e => handleFieldChange('amount', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'grabpay' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-grab-link" className="block text-[10px] font-semibold text-slate-700 mb-1">
              GrabPay Payment Link or Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-grab-link"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. https://grab.com/pay/... or +6591234567"
              value={paymentFields.phone}
              onChange={e => handleFieldChange('phone', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'mpesa' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="pay-mpesa-till" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Till Number
              </label>
              <input
                id="pay-mpesa-till"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
                placeholder="e.g. 123456"
                value={paymentFields.till}
                onChange={e => handleFieldChange('till', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pay-mpesa-paybill" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Paybill Number (Optional)
              </label>
              <input
                id="pay-mpesa-paybill"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
                placeholder="e.g. 400200"
                value={paymentFields.paybill}
                onChange={e => handleFieldChange('paybill', e.target.value)}
              />
            </div>
          </div>
          {paymentFields.paybill && (
            <div>
              <label htmlFor="pay-mpesa-account" className="block text-[10px] font-semibold text-slate-700 mb-1">
                Paybill Account Number
              </label>
              <input
                id="pay-mpesa-account"
                type="text"
                className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
                placeholder="e.g. Acc-908"
                value={paymentFields.account}
                onChange={e => handleFieldChange('account', e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {paymentMethod === 'jazzcash' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-jazz-acc" className="block text-[10px] font-semibold text-slate-700 mb-1">
              JazzCash Account / Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-jazz-acc"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. 03001234567"
              value={paymentFields.account}
              onChange={e => handleFieldChange('account', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pay-jazz-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Amount (PKR) (Optional)
            </label>
            <input
              id="pay-jazz-amount"
              type="number"
              step="any"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. 1000"
              value={paymentFields.amount}
              onChange={e => handleFieldChange('amount', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'easypaisa' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-easy-acc" className="block text-[10px] font-semibold text-slate-700 mb-1">
              EasyPaisa Account / Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-easy-acc"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. 03451234567"
              value={paymentFields.account}
              onChange={e => handleFieldChange('account', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pay-easy-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Amount (PKR) (Optional)
            </label>
            <input
              id="pay-easy-amount"
              type="number"
              step="any"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. 1000"
              value={paymentFields.amount}
              onChange={e => handleFieldChange('amount', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'stcpay' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-stc-phone" className="block text-[10px] font-semibold text-slate-700 mb-1">
              STC Pay Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-stc-phone"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. +966501234567 or 0501234567"
              value={paymentFields.phone}
              onChange={e => handleFieldChange('phone', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pay-stc-amount" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Amount (SAR ر.س) (Optional)
            </label>
            <input
              id="pay-stc-amount"
              type="number"
              step="any"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white"
              placeholder="e.g. 100"
              value={paymentFields.amount}
              onChange={e => handleFieldChange('amount', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'mada' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-mada-iban" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Mada IBAN or Payment Link <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-mada-iban"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono uppercase"
              placeholder="e.g. SA0380000000608010167519"
              value={paymentFields.iban}
              onChange={e => handleFieldChange('iban', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'sadad' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-sadad-biller" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Sadad Biller / Account ID <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-sadad-biller"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. 001-12345678"
              value={paymentFields.billerId}
              onChange={e => handleFieldChange('billerId', e.target.value)}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'custom' && (
        <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200/80">
          <div>
            <label htmlFor="pay-custom-url" className="block text-[10px] font-semibold text-slate-700 mb-1">
              Payment Link / Wallet URL <span className="text-red-500">*</span>
            </label>
            <input
              id="pay-custom-url"
              type="text"
              className="w-full text-xs px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50/50 text-slate-800 focus:bg-white font-mono"
              placeholder="e.g. https://mywallet.com/pay/123"
              value={paymentFields.customUrl}
              onChange={e => handleFieldChange('customUrl', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Live Payload Preview */}
      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-[11px] text-emerald-900 flex flex-col gap-1">
        <span className="font-semibold text-[10px] uppercase tracking-wider text-emerald-800 flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          {t('control.generatedQrPayload', 'Encoded Payment Payload:')}
        </span>
        <code className="bg-white/80 px-2 py-1 rounded text-[10px] font-mono border border-emerald-200/70 text-slate-800 break-all select-all">
          {content || 'https://paypal.me/'}
        </code>
      </div>
    </div>
  );
}
