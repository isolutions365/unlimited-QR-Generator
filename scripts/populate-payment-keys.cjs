const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const files = fs.readdirSync(localesDir);

const defaultEnPaymentKeys = {
  "control.paymentWalletSetup": "Mobile Wallet & Payment Setup",
  "control.paymentWalletDesc": "Create instant payment QR codes for popular global and regional mobile wallets.",
  "control.paymentWalletGuideTitle": "Payment & Wallet QR Guide",
  "control.paymentWalletGuideDesc": "Generate payment QRs for instant mobile transfers. Scan and pay instantly without manually typing phone numbers or account IDs.",
  "control.paymentPrimaryUses": "Primary Uses:",
  "control.shopCheckouts": "Shop Checkouts:",
  "control.shopCheckoutsDesc": "Place on counters for fast contactless sales.",
  "control.freelanceBilling": "Freelance & Billing:",
  "control.freelanceBillingDesc": "Add to digital invoices for instant client payout.",
  "control.tipsDonations": "Tips & Donations:",
  "control.tipsDonationsDesc": "Accept customer tips or charity donations seamlessly.",
  "control.p2pTransfers": "P2P Transfers:",
  "control.p2pTransfersDesc": "Share with friends/family to split dinner bills easily.",
  "control.paymentHowToCreate": "How to Create:",
  "control.stepSelectWallet": "Select your wallet/network (e.g. UPI, PayPal, JazzCash).",
  "control.stepInputAccount": "Input your account ID, handle, or mobile number.",
  "control.stepPresetAmount": "Optional: Set a preset request amount & note.",
  "control.stepDownloadQr": "Customize colors/logos, then download the QR!",
  "control.regionalWalletsTitle": "🇵🇰 Pakistan, 🇮🇳 India & 🇸🇦 Gulf Wallets:",
  "control.regionalWalletsDesc": "India supports any UPI app (GPay, Paytm, PhonePe). Pakistan supports direct scanning via JazzCash & EasyPaisa. Saudi Arabia integrates Mada IBAN & STC Pay.",
  "control.selectPaymentMethod": "Select Region & Payment Wallet",
  "control.optPakistan": "🇵🇰 Pakistan",
  "control.payOptionJazzcash": "JazzCash (Pakistan) — Mobile Account",
  "control.payOptionEasypaisa": "EasyPaisa (Pakistan) — Mobile Account",
  "control.optSaudiArabia": "🇸🇦 Saudi Arabia & Gulf",
  "control.payOptionStcpay": "STC Pay (Saudi Arabia) — Mobile Wallet",
  "control.payOptionMada": "Mada (Saudi Arabia) — IBAN / Payment Link",
  "control.payOptionSadad": "Sadad (Saudi Arabia) — Biller / Account Reference",
  "control.optGlobalPayment": "🌐 Global Payment Methods",
  "control.payOptionPaypal": "PayPal (Global) — PayPal.me / Handle",
  "control.payOptionCustom": "Custom Wallet Link (Universal Payment URI)",
  "control.optIndia": "🇮🇳 India",
  "control.payOptionUpi": "UPI / GPay / PhonePe / Paytm (India) — Virtual Payment Address",
  "control.optUnitedStates": "🇺🇸 United States",
  "control.payOptionVenmo": "Venmo (USA) — @username & memo",
  "control.payOptionCashapp": "Cash App (USA) — $cashtag & amount",
  "control.optChina": "🇨🇳 China",
  "control.payOptionAlipay": "Alipay (China) — Alipay QR Link",
  "control.payOptionWechat": "WeChat Pay (China) — WeChat Pay Payload (wxp://)",
  "control.optBrazil": "🇧🇷 Brazil",
  "control.payOptionPix": "PIX (Brazil) — Key / CPF / CNPJ / Email / Phone",
  "control.optSoutheastAsia": "🌏 Southeast Asia",
  "control.payOptionGrabpay": "GrabPay (Singapore, Malaysia, Philippines)",
  "control.optAfrica": "🌍 Africa",
  "control.payOptionMpesa": "M-Pesa (Kenya, Tanzania) — Till / Paybill / Phone",

  "control.payPaypalHandleLabel": "PayPal Username, Email, or PayPal.me Handle",
  "control.payRequestedAmount": "Requested Amount (Optional)",
  "control.payCurrencyCode": "Currency Code",
  "control.payVenmoHandleLabel": "Venmo @username",
  "control.payVenmoNoteLabel": "Payment Note / Memo (Optional)",
  "control.payCashappHandleLabel": "Cash App $Cashtag",
  "control.payUpiIdLabel": "UPI VPA ID (Virtual Payment Address)",
  "control.payPayeeNameLabel": "Payee Name (Optional)",
  "control.payUpiAmountLabel": "Amount (₹ INR) (Optional)",
  "control.payTxnNoteLabel": "Transaction Note (Optional)",
  "control.payAlipayLabel": "Alipay Account ID / Payee QR Link",
  "control.payWechatLabel": "WeChat Pay Payload Code or Link (wxp://)",
  "control.payPixKeyLabel": "PIX Key (CPF / CNPJ / Email / Phone / Random Key)",
  "control.payReceiverNameLabel": "Receiver Name",
  "control.payCityLabel": "City",
  "control.payPixAmountLabel": "Amount (BRL R$)",
  "control.payGrabLinkLabel": "GrabPay Payment Link or Phone Number",
  "control.payTillLabel": "Till Number",
  "control.payPaybillLabel": "Paybill Number (Optional)",
  "control.payMpesaAccountLabel": "Paybill Account Number",
  "control.payJazzAccountLabel": "JazzCash Account / Mobile Number",
  "control.payJazzAmountLabel": "Amount (PKR) (Optional)",
  "control.payEasyAccountLabel": "EasyPaisa Account / Mobile Number",
  "control.payStcPhoneLabel": "STC Pay Mobile Number",
  "control.payStcAmountLabel": "Amount (SAR ر.س) (Optional)",
  "control.payMadaIbanLabel": "Mada IBAN or Payment Link",
  "control.paySadadBillerLabel": "Sadad Biller / Account ID",
  "control.payCustomUrlLabel": "Payment Link / Wallet URL",
  "control.generatedQrPayload": "Encoded Payment Payload:"
};

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(localesDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let modified = false;
      for (const [k, v] of Object.entries(defaultEnPaymentKeys)) {
        if (!content[k]) {
          content[k] = v;
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`Updated missing payment i18n keys in ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
});
