import { GoogleGenAI } from '@google/genai';
import { templatePages } from './src/data/templatePagesData.ts';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function flattenTemplatePage(slug: string, page: any): Record<string, string> {
  const flat: Record<string, string> = {};
  
  if (page.title) flat[`templates.item.${slug}.title`] = page.title;
  if (page.heading) flat[`templates.item.${slug}.heading`] = page.heading;
  if (page.subheading) flat[`templates.item.${slug}.subheading`] = page.subheading;
  if (page.intro) flat[`templates.item.${slug}.intro`] = page.intro;
  
  if (Array.isArray(page.useCases)) {
    page.useCases.forEach((uc: any, i: number) => {
      if (uc.title) flat[`templates.item.${slug}.useCases.${i}.title`] = uc.title;
      if (uc.desc) flat[`templates.item.${slug}.useCases.${i}.desc`] = uc.desc;
    });
  }
  
  if (Array.isArray(page.benefits)) {
    page.benefits.forEach((b: any, i: number) => {
      if (b.title) flat[`templates.item.${slug}.benefits.${i}.title`] = b.title;
      if (b.desc) flat[`templates.item.${slug}.benefits.${i}.desc`] = b.desc;
    });
  }
  
  if (Array.isArray(page.steps)) {
    page.steps.forEach((s: any, i: number) => {
      if (s.title) flat[`templates.item.${slug}.steps.${i}.title`] = s.title;
      if (s.desc) flat[`templates.item.${slug}.steps.${i}.desc`] = s.desc;
    });
  }
  
  if (Array.isArray(page.bestPractices)) {
    page.bestPractices.forEach((bp: string, i: number) => {
      flat[`templates.item.${slug}.bestPractices.${i}`] = bp;
    });
  }
  
  if (Array.isArray(page.commonMistakes)) {
    page.commonMistakes.forEach((cm: string, i: number) => {
      flat[`templates.item.${slug}.commonMistakes.${i}`] = cm;
    });
  }
  
  if (Array.isArray(page.faqs)) {
    page.faqs.forEach((f: any, i: number) => {
      if (f.q) flat[`templates.item.${slug}.faqs.${i}.q`] = f.q;
      if (f.a) flat[`templates.item.${slug}.faqs.${i}.a`] = f.a;
    });
  }
  
  if (Array.isArray(page.keyTakeaways)) {
    page.keyTakeaways.forEach((kt: string, i: number) => {
      flat[`templates.item.${slug}.keyTakeaways.${i}`] = kt;
    });
  }
  
  if (page.aiSummaryBox) {
    if (page.aiSummaryBox.entityType) flat[`templates.item.${slug}.aiSummaryBox.entityType`] = page.aiSummaryBox.entityType;
    if (page.aiSummaryBox.protocolStandard) flat[`templates.item.${slug}.aiSummaryBox.protocolStandard`] = page.aiSummaryBox.protocolStandard;
    if (page.aiSummaryBox.clientCompatibility) flat[`templates.item.${slug}.aiSummaryBox.clientCompatibility`] = page.aiSummaryBox.clientCompatibility;
    if (page.aiSummaryBox.primaryUseCase) flat[`templates.item.${slug}.aiSummaryBox.primaryUseCase`] = page.aiSummaryBox.primaryUseCase;
    if (page.aiSummaryBox.offlineCapability) flat[`templates.item.${slug}.aiSummaryBox.offlineCapability`] = page.aiSummaryBox.offlineCapability;
  }
  
  return flat;
}

const PRESETS = [
  {
    id: 'minimalist',
    name: 'Classic Minimalist',
    description: 'Crisp slate grey pixels on a pure clean background. Ultimate readability and corporate modesty.',
    badge: 'Clean & Safe'
  },
  {
    id: 'vibrant',
    name: 'Neon Vibrant',
    description: 'Exciting candy pink-to-orange diagonal gradient dots resting on eye-friendly light pink.',
    badge: 'Trending'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Tech',
    description: 'Luminous cyan-to-magenta radial matrix sitting on premium deep indigo. Perfect for tech cards.',
    badge: 'Sci-Fi Vibe'
  },
  {
    id: 'emerald',
    name: 'Emerald Breeze',
    description: 'Natural soothing green gradients with organic leafy corner eyes on soft garden mint.',
    badge: 'Eco & Eco'
  },
  {
    id: 'royal',
    name: 'Royal Champagne',
    description: 'Majestic bronze-gold gradients and custom starburst dot style on premium ivory paper layout.',
    badge: 'Luxury Style'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Sunset',
    description: 'Mesmerizing deep purple-to-pink space sunset on a soft white cloud quiet zone.',
    badge: 'Editorial'
  },
  {
    id: 'tokyo',
    name: 'Tokyo Arcade',
    description: 'Dazzling violet-rose retro grid on deep indigo skies. Highly contrasted terminal elements.',
    badge: 'Synthesized'
  },
  {
    id: 'corporate',
    name: 'Charcoal Ice',
    description: 'Cold professional graphite grey on freeze-dry blue paper. Strictly tailored for formal use.',
    badge: 'B2B Classic'
  }
];

const PRESETS_GENERAL = {
  'templates.title': 'Polished Design Templates',
  'templates.description': 'Instantly apply professional stylistic directions crafted by our design system in one click.',
  'templates.palette': 'Palette:',
  'templates.dotsLabel': 'Dots:',
  'templates.eyesLabel': '• Eyes:',
  'templates.tipLabel': 'Tip:',
  'templates.tipDesc': 'After applying any template, you can jump back to the Creative Station tab anytime to perform precision edits, add custom center logos, or adjust the quiet zone spacing to match your unique brand requirements.'
};

async function main() {
  const localePath = path.resolve('src/locales/ur.json');
  let urJson: Record<string, string> = {};
  if (fs.existsSync(localePath)) {
    urJson = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  }

  // 1. Prepare preset-specific keys
  const generalToTranslate: Record<string, string> = {};
  for (const [key, val] of Object.entries(PRESETS_GENERAL)) {
    if (!urJson[key]) {
      generalToTranslate[key] = val;
    }
  }

  for (const p of PRESETS) {
    if (!urJson[`templates.name.${p.id}`]) generalToTranslate[`templates.name.${p.id}`] = p.name;
    if (!urJson[`templates.desc.${p.id}`]) generalToTranslate[`templates.desc.${p.id}`] = p.description;
    if (!urJson[`templates.badge.${p.id}`]) generalToTranslate[`templates.badge.${p.id}`] = p.badge;
  }

  if (Object.keys(generalToTranslate).length > 0) {
    console.log(`Translating general template design preset keys...`);
    const presetPrompt = `Translate the following English strings for a QR code design template customizer panel into highly natural, professionally polished Urdu suitable for options and cards.
Keep the JSON keys exactly the same. Only translate the values.
Keep brand/style names like 'Cyberpunk', 'Classic Minimalist', 'Tokyo Arcade', 'Charcoal Ice' or 'Emerald' in a readable phonetic Urdu translation or Urdu form that sounds extremely professional.

Here is the JSON of English strings:
${JSON.stringify(generalToTranslate, null, 2)}`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: presetPrompt,
        config: { responseMimeType: 'application/json' }
      });
      let cleanText = resp.text || '{}';
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanText);
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === 'string') {
          urJson[key] = val;
        }
      }
      fs.writeFileSync(localePath, JSON.stringify(urJson, null, 2), 'utf-8');
      console.log('Successfully saved general template presets to ur.json.');
    } catch (e) {
      console.error('Error translating general preset metadata:', e);
    }
  }

  // 2. Gather templates pages
  const pages = templatePages;
  console.log(`Found ${pages.length} template pages to process.`);

  // We run in batches of 5 to avoid rate-limiting and maximize speed
  const batchSize = 5;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} (${batch.map(p => p.slug).join(', ')})`);

    const promises = batch.map(async (page) => {
      const slug = page.slug;
      const flat = flattenTemplatePage(slug, page);
      const toTranslate: Record<string, string> = {};
      for (const [key, value] of Object.entries(flat)) {
        if (!urJson[key]) {
          toTranslate[key] = value;
        }
      }

      const count = Object.keys(toTranslate).length;
      if (count === 0) {
        console.log(`[${slug}] Already fully translated.`);
        return;
      }

      console.log(`[${slug}] Translating ${count} missing strings...`);

      const prompt = `Translate the following English strings from a QR code template website into highly natural, professionally polished Urdu suitable for buttons, headings, descriptions, and FAQs.
The strings are for the specific template page: "${slug}".
Keep the JSON keys exactly the same. Only translate the values.
Ensure correct grammatical terminology in Urdu (e.g., use standard translation terms like 'کیو آر کوڈ' for 'QR Code', 'ٹیبل ٹینٹس' for 'Table Tents', 'وی کارڈ' for 'vCard', etc.). Keep brand names like 'FreeQRGen.pro' unchanged.
Make sure placeholders are kept exactly as is.

Here is the JSON of English strings:
${JSON.stringify(toTranslate, null, 2)}`;

      try {
        const resp = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        let cleanText = resp.text || '{}';
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsedTranslations = JSON.parse(cleanText);
        
        let merged = 0;
        for (const [key, val] of Object.entries(parsedTranslations)) {
          if (typeof val === 'string') {
            urJson[key] = val;
            merged++;
          }
        }
        console.log(`[${slug}] Successfully merged ${merged} translated keys.`);
      } catch (err) {
        console.error(`[${slug}] Error:`, err);
      }
    });

    await Promise.all(promises);

    // Save batch progress
    fs.writeFileSync(localePath, JSON.stringify(urJson, null, 2), 'utf-8');
    console.log(`Saved progress for batch ${Math.floor(i / batchSize) + 1}.`);
  }

  console.log('\nAll done! Template translations fully updated in src/locales/ur.json');
}

main().catch(console.error);
