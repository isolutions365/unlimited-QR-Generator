import { GoogleGenAI } from '@google/genai';
import { landingPages } from './src/pages/landing/SEODatabase.ts';
import { aeoDatabase } from './src/pages/landing/AEOData.ts';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function flattenLandingPage(slug: string, page: any): Record<string, string> {
  const flat: Record<string, string> = {};
  
  if (page.h1) flat[`seo.landing.${slug}.h1`] = page.h1;
  if (page.keyword) flat[`seo.landing.${slug}.keyword`] = page.keyword;
  if (page.seoTitle) flat[`seo.landing.${slug}.seoTitle`] = page.seoTitle;
  if (page.metaDescription) flat[`seo.landing.${slug}.metaDescription`] = page.metaDescription;
  
  if (page.intro) {
    if (page.intro.title) flat[`seo.landing.${slug}.intro.title`] = page.intro.title;
    if (page.intro.text1) flat[`seo.landing.${slug}.intro.text1`] = page.intro.text1;
    if (page.intro.text2) flat[`seo.landing.${slug}.intro.text2`] = page.intro.text2;
    if (page.intro.highlight) flat[`seo.landing.${slug}.intro.highlight`] = page.intro.highlight;
  }
  
  if (page.benefits) {
    if (page.benefits.title) flat[`seo.landing.${slug}.benefits.title`] = page.benefits.title;
    if (page.benefits.desc) flat[`seo.landing.${slug}.benefits.desc`] = page.benefits.desc;
    if (Array.isArray(page.benefits.items)) {
      page.benefits.items.forEach((item: any, i: number) => {
        if (item.title) flat[`seo.landing.${slug}.benefits.items.${i}.title`] = item.title;
        if (item.desc) flat[`seo.landing.${slug}.benefits.items.${i}.desc`] = item.desc;
      });
    }
  }
  
  if (page.features) {
    if (page.features.title) flat[`seo.landing.${slug}.features.title`] = page.features.title;
    if (page.features.desc) flat[`seo.landing.${slug}.features.desc`] = page.features.desc;
    if (Array.isArray(page.features.items)) {
      page.features.items.forEach((item: any, i: number) => {
        if (item.title) flat[`seo.landing.${slug}.features.items.${i}.title`] = item.title;
        if (item.desc) flat[`seo.landing.${slug}.features.items.${i}.desc`] = item.desc;
      });
    }
  }
  
  if (page.howItWorks) {
    if (page.howItWorks.title) flat[`seo.landing.${slug}.howItWorks.title`] = page.howItWorks.title;
    if (page.howItWorks.desc) flat[`seo.landing.${slug}.howItWorks.desc`] = page.howItWorks.desc;
    if (Array.isArray(page.howItWorks.steps)) {
      page.howItWorks.steps.forEach((step: any, i: number) => {
        if (step.title) flat[`seo.landing.${slug}.howItWorks.steps.${i}.title`] = step.title;
        if (step.desc) flat[`seo.landing.${slug}.howItWorks.steps.${i}.desc`] = step.desc;
      });
    }
  }
  
  if (page.useCases) {
    if (page.useCases.title) flat[`seo.landing.${slug}.useCases.title`] = page.useCases.title;
    if (page.useCases.desc) flat[`seo.landing.${slug}.useCases.desc`] = page.useCases.desc;
    if (Array.isArray(page.useCases.items)) {
      page.useCases.items.forEach((item: any, i: number) => {
        if (item.title) flat[`seo.landing.${slug}.useCases.items.${i}.title`] = item.title;
        if (item.desc) flat[`seo.landing.${slug}.useCases.items.${i}.desc`] = item.desc;
      });
    }
  }
  
  if (Array.isArray(page.faqs)) {
    page.faqs.forEach((faq: any, i: number) => {
      if (faq.q) flat[`seo.landing.${slug}.faqs.${i}.q`] = faq.q;
      if (faq.a) flat[`seo.landing.${slug}.faqs.${i}.a`] = faq.a;
    });
  }
  
  if (page.cta) {
    if (page.cta.title) flat[`seo.landing.${slug}.cta.title`] = page.cta.title;
    if (page.cta.subtitle) flat[`seo.landing.${slug}.cta.subtitle`] = page.cta.subtitle;
    if (page.cta.buttonText) flat[`seo.landing.${slug}.cta.buttonText`] = page.cta.buttonText;
  }
  
  return flat;
}

function flattenAEOData(slug: string, aeo: any): Record<string, string> {
  const flat: Record<string, string> = {};
  if (!aeo) return flat;
  
  if (aeo.quickDefinition) flat[`aeo.landing.${slug}.quickDefinition`] = aeo.quickDefinition;
  if (aeo.aiSummary50) flat[`aeo.landing.${slug}.aiSummary50`] = aeo.aiSummary50;
  if (aeo.whatIsIt) flat[`aeo.landing.${slug}.whatIsIt`] = aeo.whatIsIt;
  if (aeo.whenToUse) flat[`aeo.landing.${slug}.whenToUse`] = aeo.whenToUse;
  
  if (Array.isArray(aeo.benefits)) {
    aeo.benefits.forEach((b: string, i: number) => {
      flat[`aeo.landing.${slug}.benefits.${i}`] = b;
    });
  }
  
  if (Array.isArray(aeo.commonMistakes)) {
    aeo.commonMistakes.forEach((m: string, i: number) => {
      flat[`aeo.landing.${slug}.commonMistakes.${i}`] = m;
    });
  }
  
  if (Array.isArray(aeo.bestPractices)) {
    aeo.bestPractices.forEach((p: string, i: number) => {
      flat[`aeo.landing.${slug}.bestPractices.${i}`] = p;
    });
  }
  
  if (Array.isArray(aeo.faqs)) {
    aeo.faqs.forEach((faq: any, i: number) => {
      if (faq.q) flat[`aeo.landing.${slug}.faqs.${i}.q`] = faq.q;
      if (faq.a) flat[`aeo.landing.${slug}.faqs.${i}.a`] = faq.a;
    });
  }
  
  if (Array.isArray(aeo.relatedGuides)) {
    aeo.relatedGuides.forEach((g: any, i: number) => {
      if (g.title) flat[`aeo.landing.${slug}.relatedGuides.${i}.title`] = g.title;
      if (g.desc) flat[`aeo.landing.${slug}.relatedGuides.${i}.desc`] = g.desc;
    });
  }
  
  if (Array.isArray(aeo.keyTakeaways)) {
    aeo.keyTakeaways.forEach((k: string, i: number) => {
      flat[`aeo.landing.${slug}.keyTakeaways.${i}`] = k;
    });
  }
  
  if (aeo.aiSummaryBox) {
    if (aeo.aiSummaryBox.entityType) flat[`aeo.landing.${slug}.aiSummaryBox.entityType`] = aeo.aiSummaryBox.entityType;
    if (aeo.aiSummaryBox.protocolStandard) flat[`aeo.landing.${slug}.aiSummaryBox.protocolStandard`] = aeo.aiSummaryBox.protocolStandard;
    if (aeo.aiSummaryBox.clientCompatibility) flat[`aeo.landing.${slug}.aiSummaryBox.clientCompatibility`] = aeo.aiSummaryBox.clientCompatibility;
    if (aeo.aiSummaryBox.primaryUseCase) flat[`aeo.landing.${slug}.aiSummaryBox.primaryUseCase`] = aeo.aiSummaryBox.primaryUseCase;
    if (aeo.aiSummaryBox.offlineCapability) flat[`aeo.landing.${slug}.aiSummaryBox.offlineCapability`] = aeo.aiSummaryBox.offlineCapability;
  }
  
  return flat;
}

async function main() {
  const localePath = path.resolve('src/locales/ur.json');
  let urJson: Record<string, string> = {};
  if (fs.existsSync(localePath)) {
    urJson = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  }

  const slugs = Object.keys(landingPages);
  console.log(`Found ${slugs.length} landing page slugs to process.`);

  for (const slug of slugs) {
    console.log(`\n--- Processing ${slug} ---`);
    const page = landingPages[slug];
    const aeo = aeoDatabase[slug];

    const landingFlat = flattenLandingPage(slug, page);
    const aeoFlat = flattenAEOData(slug, aeo);
    const combinedFlat = { ...landingFlat, ...aeoFlat };

    const toTranslate: Record<string, string> = {};
    for (const [key, value] of Object.entries(combinedFlat)) {
      if (!urJson[key]) {
        toTranslate[key] = value;
      }
    }

    const count = Object.keys(toTranslate).length;
    if (count === 0) {
      console.log(`All ${Object.keys(combinedFlat).length} keys already translated in ur.json for ${slug}.`);
      continue;
    }

    console.log(`Translating ${count} missing strings for ${slug} using Gemini...`);

    const prompt = `Translate the following English strings from a QR code generator website into highly natural, professionally polished Urdu suitable for buttons, headings, descriptions, and FAQs.
The strings are for the specific generator page: "${slug}".
Keep the JSON keys exactly the same. Only translate the values.
Ensure correct grammatical terminology in Urdu (e.g., use standard translation terms like 'لینیئر گریڈینٹ' for 'Linear Gradient', 'کیو آر کوڈ' for 'QR Code', 'وی کارڈ' for 'vCard', 'فری کیو آر جنریٹر' for 'Free QR Generator', etc.). Keep brand names like 'FreeQRGen.pro' or 'QR Studio' or protocol parameters like WIFI:S:SSID unchanged. Do not translate code or tech schemas.
Make sure placeholders like {dotStyle} or {eyeStyle} are kept exactly as is, e.g., {dotStyle} or {eyeStyle} (do not translate the curly braces or inside keys).

Here is the JSON of English strings:
${JSON.stringify(toTranslate, null, 2)}`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      let cleanText = resp.text || '{}';
      // Strip markdown code block wrappers if present
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsedTranslations = JSON.parse(cleanText);
      console.log(`Received translations for ${slug}. Merging...`);

      let mergedCount = 0;
      for (const [key, val] of Object.entries(parsedTranslations)) {
        if (typeof val === 'string') {
          urJson[key] = val;
          mergedCount++;
        }
      }
      console.log(`Merged ${mergedCount} translated keys for ${slug}.`);

      // Save periodically in case of failure
      fs.writeFileSync(localePath, JSON.stringify(urJson, null, 2), 'utf-8');

    } catch (err) {
      console.error(`Error translating ${slug}:`, err);
    }
  }

  console.log('\nAll done! Translations fully updated in src/locales/ur.json');
}

main().catch(console.error);
