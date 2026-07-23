import fs from 'fs';
import path from 'path';

const translations = {
  'en': 'AI Gateway',
  'ar': 'بوابة الذكاء الاصطناعي',
  'de': 'KI-Gateway',
  'es': 'Pasarela de IA',
  'fr': 'Passerelle IA',
  'hi': 'एआई गेटवे',
  'id': 'Gerbang AI',
  'it': 'Gateway AI',
  'ja': 'AIゲートウェイ',
  'ko': 'AI 게이트웨이',
  'pt': 'Gateway de IA',
  'tr': 'Yapay Zeka Ağ Geçidi',
  'ur': 'اے آئی گیٹ وے',
  'zh': 'AI 网关'
};

const dir = './src/locales';
for (const [lang, text] of Object.entries(translations)) {
  const filePath = path.join(dir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data['nav.aiGateway'] = text;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${lang}.json with nav.aiGateway: ${text}`);
  }
}
