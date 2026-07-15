import fs from 'fs';
import path from 'path';

const enPath = './src/locales/en.json';
const controlPanelPath = './src/components/ControlPanel.tsx';

if (!fs.existsSync(enPath)) {
  console.error(`en.json not found`);
  process.exit(1);
}
if (!fs.existsSync(controlPanelPath)) {
  console.error(`ControlPanel.tsx not found`);
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const controlPanelContent = fs.readFileSync(controlPanelPath, 'utf8');

// Extraction of t('key', 'default') calls
// Pattern: t('key', 'defaultText') or t("key", "defaultText") or t(`key`, `defaultText`)
// Since default text can contain quotes or variables, let's write a robust parser using a regex for simple strings
// We also extract keys matching t('key', ...) and manually parse their arguments if needed.
// A safe way: search for t( with string literal key as first argument, and then parse the next string argument
const tCallsRegex = /t\(\s*(['"`])([a-zA-Z0-9._-]+)\1\s*,\s*(['"`])([\s\S]*?)\3/g;
let match;
const extractedKeys = {};

while ((match = tCallsRegex.exec(controlPanelContent)) !== null) {
  const key = match[2];
  let defaultText = match[4];
  // Clean up escapes
  defaultText = defaultText.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\n/g, '\n');
  extractedKeys[key] = defaultText;
}

console.log(`Extracted ${Object.keys(extractedKeys).length} static key-value pairs from ControlPanel.tsx`);

// Inject dynamic key-value pairs
const dynamicKeys = {
  // Types
  'control.type.url': 'URL',
  'control.type.text': 'Text',
  'control.type.wifi': 'WiFi',
  'control.type.email': 'Email',
  'control.type.card': 'Card',
  'control.type.phone': 'Phone',
  'control.type.sms': 'SMS',
  'control.type.social': 'Social',
  'control.type.app': 'App Store',
  'control.type.crypto': 'Crypto',
  'control.type.geo': 'Location',

  // Presets
  'control.preset.StealthSlate': 'Stealth Slate',
  'control.presetDesc.StealthSlate': 'Ultra-clean off-black standard design',
  'control.preset.NeonEclipse': 'Neon Eclipse',
  'control.presetDesc.NeonEclipse': 'Sleek violet-pink gradient with rounded frame',
  'control.preset.ForestLeaf': 'Forest Leaf',
  'control.presetDesc.ForestLeaf': 'Relaxing emerald theme with elegant leaves',
  'control.preset.OceanicPulse': 'Oceanic Pulse',
  'control.presetDesc.OceanicPulse': 'Dynamic cyan gradient with classy dots',
  'control.preset.SunsetGlow': 'Sunset Glow',
  'control.presetDesc.SunsetGlow': 'Vivid orange red with smooth circles',
  'control.preset.ImperialPlum': 'Imperial Plum',
  'control.presetDesc.ImperialPlum': 'Sophisticated violet gradient with circular dots',

  // Frame Presets
  'control.framePreset.none': 'No Frame',
  'control.framePreset.scan-me': 'Scan Me',
  'control.framePreset.visit-website': 'Visit Website',
  'control.framePreset.wifi-password': 'WiFi Password',
  'control.framePreset.download-app': 'Download App',
  'control.framePreset.follow-us': 'Follow Us',
  'control.framePreset.join-wifi': 'Join WiFi',
  'control.framePreset.custom': 'Custom Text',
  'control.framePresetDesc.none': 'Sleek & clean',
  'control.framePresetDesc.scan-me': 'Default action',
  'control.framePresetDesc.visit-website': 'Great for URLs',
  'control.framePresetDesc.wifi-password': 'For network setups',
  'control.framePresetDesc.download-app': 'App store links',
  'control.framePresetDesc.follow-us': 'Stay connected',
  'control.framePresetDesc.join-wifi': 'Direct network scan',
  'control.framePresetDesc.custom': 'Fully custom label',

  // Materials
  'control.material.paperScreens': 'Paper & Screens',
  'control.materialDesc.paperScreens': 'Digital or smooth paper',
  'control.material.texturedPaper': 'Textured Paper',
  'control.materialDesc.texturedPaper': 'Kraft, cardboard, textured',
  'control.material.glossyMetal': 'Glossy & Metal',
  'control.materialDesc.glossyMetal': 'Reflective, metallic prints',
  'control.material.fabricApparel': 'Fabric & Apparel',
  'control.materialDesc.fabricApparel': 'Folds, stretchable surfaces',

  // Categories
  'control.category.clientA': 'Client A',
  'control.category.marketing': 'Marketing',
  'control.category.personal': 'Personal'
};

// Merge extracted and dynamic keys
const allNewKeys = { ...extractedKeys, ...dynamicKeys };

// Merge into existing en.json data
let addedCount = 0;
for (const [key, val] of Object.entries(allNewKeys)) {
  if (enData[key] === undefined) {
    enData[key] = val;
    addedCount++;
  }
}

console.log(`Added ${addedCount} new translation keys to en.json`);

// Sort en.json alphabetically
const sortedEnData = {};
Object.keys(enData).sort().forEach(key => {
  sortedEnData[key] = enData[key];
});

// Write back to en.json
fs.writeFileSync(enPath, JSON.stringify(sortedEnData, null, 2), 'utf8');
console.log(`Successfully updated and synchronized en.json!`);
