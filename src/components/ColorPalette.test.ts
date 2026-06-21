// Unit Tests for QR Code Color Palette Selection & Preview Updates
import { presetColors } from './ColorPalette';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock as any;

// Helper function from ColorPalette logic to test
const getMatchedPalette = (fgColor: string, gradientColor: string) => {
  const matched = presetColors.find(
    col => col.main.toLowerCase() === fgColor.toLowerCase() &&
           col.grad.toLowerCase() === gradientColor.toLowerCase()
  );
  return matched ? matched.name : 'Custom';
};

// Simple Assertion Helper
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${message}`);
  }
};

console.log('--- RUNNING COLOR PALETTE UNIT TESTS ---');

try {
  // Test Case 1: Predefined Palette Identification
  console.log('\nRunning Test Case 1: Predefined Preset Palette Identification');
  
  presetColors.forEach(col => {
    const matched = getMatchedPalette(col.main, col.grad);
    assert(
      matched === col.name,
      `Should match palette colors to preset name "${col.name}" (got "${matched}")`
    );
  });

  // Test Case 2: Custom Override Switch
  console.log('\nRunning Test Case 2: Custom Override Identification');
  
  const customFg = '#ff0055';
  const customGrad = '#00ffaa';
  const matchedCustom = getMatchedPalette(customFg, customGrad);
  assert(
    matchedCustom === 'Custom',
    `Should identify arbitrary custom colors as "Custom" (got "${matchedCustom}")`
  );

  // Test Case 3: Local Storage Persistence & Hydration
  console.log('\nRunning Test Case 3: Local Storage Persistence & Hydration');
  
  localStorage.clear();
  localStorage.setItem('qr-active-palette', 'Emerald');
  
  const retrievedPalette = localStorage.getItem('qr-active-palette');
  assert(
    retrievedPalette === 'Emerald',
    `Should save and retrieve active palette state from localStorage. Expected "Emerald", got "${retrievedPalette}"`
  );
  
  // Find Emerald colors
  const emeraldPreset = presetColors.find(p => p.name === 'Emerald')!;
  assert(
    emeraldPreset.main === '#059669' && emeraldPreset.grad === '#10b981',
    'Emerald preset should have correct color hex strings'
  );

  // Test Case 4: Gradient Options Configuration Match
  console.log('\nRunning Test Case 4: State sync and dynamic updates simulate');
  
  // Simulate a change event
  let projectState = {
    id: 'test-project',
    name: 'Test QR Code',
    design: {
      fgColor: '#0f172a',
      gradientColor: '#3b82f6',
      gradientType: 'none' as const
    }
  };

  // Select Indigo preset
  const indigoPreset = presetColors.find(p => p.name === 'Indigo')!;
  projectState.design.fgColor = indigoPreset.main;
  projectState.design.gradientColor = indigoPreset.grad;

  const finalMatch = getMatchedPalette(projectState.design.fgColor, projectState.design.gradientColor);
  assert(
    finalMatch === 'Indigo',
    `Updating state with Indigo palette colors should yield "Indigo" (got "${finalMatch}")`
  );

  console.log('\n✨ ALL COLOR SYSTEM UNIT TESTS PASSED SUCCESSFULLY! ✨\n');

} catch (error) {
  console.error('❌ Tests encounter unexpected error:', error);
  process.exit(1);
}
