import { GoogleGenAI } from '@google/genai';
import { industriesData, fallbackIndustries, getBespokeProfile } from './src/data/programmaticSEOData.ts';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function flattenIndustryProfile(slug: string, profile: any): Record<string, string> {
  const flat: Record<string, string> = {};
  
  flat[`programmatic.item.${slug}.title`] = profile.name;
  flat[`programmatic.item.${slug}.desc`] = profile.metaDesc;
  
  flat[`programmatic.industry.${slug}.name`] = profile.name;
  flat[`programmatic.industry.${slug}.badge`] = profile.badge;
  flat[`programmatic.industry.${slug}.metaTitle`] = profile.metaTitle;
  flat[`programmatic.industry.${slug}.metaDesc`] = profile.metaDesc;
  flat[`programmatic.industry.${slug}.whyQRHelps`] = profile.whyQRHelps;
  
  if (Array.isArray(profile.challenges)) {
    profile.challenges.forEach((c: string, i: number) => {
      flat[`programmatic.industry.${slug}.challenges.${i}`] = c;
    });
  }
  
  if (Array.isArray(profile.workflow)) {
    profile.workflow.forEach((w: string, i: number) => {
      flat[`programmatic.industry.${slug}.workflow.${i}`] = w;
    });
  }
  
  if (Array.isArray(profile.practices)) {
    profile.practices.forEach((p: string, i: number) => {
      flat[`programmatic.industry.${slug}.practices.${i}`] = p;
    });
  }
  
  if (Array.isArray(profile.mistakes)) {
    profile.mistakes.forEach((m: string, i: number) => {
      flat[`programmatic.industry.${slug}.mistakes.${i}`] = m;
    });
  }
  
  if (Array.isArray(profile.faq)) {
    profile.faq.forEach((f: any, i: number) => {
      if (f.q) flat[`programmatic.industry.${slug}.faq.${i}.q`] = f.q;
      if (f.a) flat[`programmatic.industry.${slug}.faq.${i}.a`] = f.a;
    });
  }
  
  if (profile.caseStudy) {
    if (profile.caseStudy.title) flat[`programmatic.industry.${slug}.caseStudy.title`] = profile.caseStudy.title;
    if (profile.caseStudy.metric) flat[`programmatic.industry.${slug}.caseStudy.metric`] = profile.caseStudy.metric;
    if (profile.caseStudy.result) flat[`programmatic.industry.${slug}.caseStudy.result`] = profile.caseStudy.result;
  }
  
  return flat;
}

const PROGRAMMATIC_GENERAL = {
  'programmatic.tabAll': 'All',
  'programmatic.tabHospitality': 'Hospitality',
  'programmatic.tabMedical': 'Medical',
  'programmatic.tabEducation': 'Education',
  'programmatic.tabProfessional': 'Professional',
  'programmatic.tabIndustrial': 'Industrial',
  'programmatic.recommendedQrConfigurations': 'Recommended QR configurations',
  'programmatic.dynamicUrlBarcode': 'Dynamic URL Barcode',
  'programmatic.dynamicUrlBarcodeDesc': 'Enables price editing, metrics telemetry tracking, and dynamic link expirations instantly.',
  'programmatic.customCenterpieceLogo': 'Custom Centerpiece Logo',
  'programmatic.customCenterpieceLogoDesc': 'Build user-trust by overlaying a branded logo inside the center of the barcode grid layout.',
  'programmatic.relatedKnowledgeGuides': 'Related Knowledge guides',
  'programmatic.guidesTagWithTime': 'GUIDES // {{time}}',
  'programmatic.printableTemplates': 'Printable Templates',
  'programmatic.home': 'Home',
  'programmatic.solutionsDirectory': 'Solutions Directory',
  'programmatic.useCasesDirectory': 'Use Cases Directory',
  'programmatic.industriesDirectory': 'Industries Directory',
  'programmatic.hubBadge': 'Programmatic Hub // Topical Network',
  'programmatic.professionalQrCodeTitle': 'Professional QR Code {{type}}',
  'programmatic.solutions': 'Solutions',
  'programmatic.useCases': 'Use Cases',
  'programmatic.industries': 'Industries',
  'programmatic.directorySubtitle': 'Browse highly authoritative, technical frameworks and physical printing guides designed to eliminate contactless service friction.',
  'programmatic.searchPlaceholder': 'Search {{section}}...',
  'programmatic.noDirectoryItemFound': 'No directory item found',
  'programmatic.noMatchesFound': 'We couldn\'t find matches for "{{query}}". Try searching general keywords like "Hospitality" or "Retail".',
  'programmatic.exploreAuthorityFile': 'Explore Authority File',
  'programmatic.sector': '{{name}} sector',
  'programmatic.challenge1': 'Organizations struggle with manual process handovers, paper waste, and data transcription errors.',
  'programmatic.challenge2': 'Physical customer interaction barriers that slow down checkouts and digital sign-ups.',
  'programmatic.challenge3': 'Zero analytics coverage or user-consent triggers on physical print media.',
  'programmatic.whyQRHelpsSolutions': 'Deploying our customized contactless {{name}} enables teams to instantly bridge physical touchpoints to secure online portals, elevating service velocity and capturing telemetry safely.',
  'programmatic.workflowStep1': 'Diner, client, or attendee notices the labeled dynamic QR barcode.',
  'programmatic.workflowStep2': 'They scan with a native camera, opening direct portals or automated vCards.',
  'programmatic.workflowStep3': 'The administrator monitors scanning locations, browsers, and timeline graphs in the app dashboard.',
  'programmatic.practicesStep1': 'Insert clear visual call-to-action rings around your QR code.',
  'programmatic.practicesStep2': 'Download vector formats like SVG or PDF to enable flawless high-resolution printing.',
  'programmatic.practicesStep3': 'Ensure the target destination URL is optimized for fast mobile rendering.',
  'programmatic.mistakesStep1': 'Relying on direct heavy PDF files instead of smart dynamic redirects.',
  'programmatic.mistakesStep2': 'Using low-contrast light foreground colors like yellow or silver.',
  'programmatic.mistakesStep3': 'Placing printed codes in low-lighting or highly reflective areas.',
  'programmatic.faqQ1Solutions': 'What is the scanning limit for this {{name}} QR code?',
  'programmatic.faqA1Solutions': 'All QR codes generated on FreeQRGen.pro feature infinite scans and do not carry hidden expirations or click caps.',
  'programmatic.faqQ2Solutions': 'Can I swap the target URL after printing the code?',
  'programmatic.faqA2Solutions': 'Yes. If you save the design with dynamic tracking active, you can redirect visitors to updated links instantly without changing the matrix layout.',
  'programmatic.caseStudyTitleSolutions': '{{name}} Enterprise Deployment',
  'programmatic.caseStudyMetricSolutions': '41% increase in visitor conversions',
  'programmatic.caseStudyResultSolutions': 'Replacing old offline friction steps with responsive barcode shortcuts automated onboarding, raising client metrics.',
  'programmatic.badge.hospitality': 'Hospitality',
  'programmatic.badge.retail': 'Retail',
  'programmatic.badge.medical': 'Medical',
  'programmatic.badge.professional': 'Professional',
  'programmatic.badge.seo': 'SEO',
  'programmatic.badge.utilities': 'Utilities',
  'programmatic.badge.events': 'Events',
  'programmatic.badge.marketing': 'Marketing',
  'programmatic.badge.property': 'Property',
  'programmatic.badge.e-commerce': 'E-commerce',
  'programmatic.badge.corporate': 'Corporate',
  'programmatic.badge.ticketing': 'Ticketing',
  'programmatic.badge.engagement': 'Engagement',
  'programmatic.auto': 'AUTO'
};

async function main() {
  const localePath = path.resolve('src/locales/ur.json');
  let urJson: Record<string, string> = {};
  if (fs.existsSync(localePath)) {
    urJson = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  }

  // 1. Prepare general programmatic keys
  const generalToTranslate: Record<string, string> = {};
  for (const [key, val] of Object.entries(PROGRAMMATIC_GENERAL)) {
    if (!urJson[key]) {
      generalToTranslate[key] = val;
    }
  }

  if (Object.keys(generalToTranslate).length > 0) {
    console.log(`Translating general programmatic hub keys...`);
    const generalPrompt = `Translate the following English strings for a QR code solutions directory website into highly natural, professionally polished Urdu suitable for headings, tabs, and buttons.
Keep the JSON keys exactly the same. Only translate the values.
Keep placeholders like {{name}}, {{type}}, {{query}}, or {{time}} exactly as is.
Ensure correct grammatical terminology in Urdu (e.g., use 'کیو آر کوڈ' for 'QR Code', 'سلوشنز ڈائریکٹری' for 'Solutions Directory', 'انڈسٹریز ڈائریکٹری' for 'Industries Directory', etc.).

Here is the JSON of English strings:
${JSON.stringify(generalToTranslate, null, 2)}`;

    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: generalPrompt,
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
      console.log('Successfully saved general programmatic keys to ur.json.');
    } catch (e) {
      console.error('Error translating general programmatic metadata:', e);
    }
  }

  // 2. Gather all 40 industry profiles
  const profiles = [...industriesData];
  const structuredSlugs = industriesData.map(i => i.slug);
  
  fallbackIndustries.forEach(name => {
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
    if (!structuredSlugs.includes(slug)) {
      profiles.push(getBespokeProfile(slug));
    }
  });

  console.log(`Found ${profiles.length} industry profiles to process.`);

  // Process in batches of 5
  const batchSize = 5;
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} (${batch.map(p => p.slug).join(', ')})`);

    const promises = batch.map(async (profile) => {
      const slug = profile.slug;
      const flat = flattenIndustryProfile(slug, profile);
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

      const prompt = `Translate the following English strings from a QR code solutions directory website into highly natural, professionally polished Urdu suitable for headings, descriptions, and FAQs.
The strings are for the specific industry page: "${slug}".
Keep the JSON keys exactly the same. Only translate the values.
Ensure correct grammatical terminology in Urdu (e.g., use standard translation terms like 'کیو آر کوڈ' for 'QR Code', 'بزنس کارڈ' for 'Business Card', etc.). Keep brand names like 'FreeQRGen.pro' unchanged.
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

  console.log('\nAll done! Industry translations fully updated in src/locales/ur.json');
}

main().catch(console.error);
