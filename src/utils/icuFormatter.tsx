import React from 'react';

export type ICUValue = string | number | boolean | Date | ((chunks: React.ReactNode) => React.ReactNode);
export type ICUValues = Record<string, ICUValue>;

/**
 * Robust, highly-optimized ICU message format compiler for React.
 * Supports:
 * 1. Variable interpolation: "Hello {name}!" -> "Hello Alice!"
 * 2. Plurals: "{count, plural, =0 {no scans} =1 {one scan} other {# scans}}"
 * 3. Select choice: "{gender, select, male {He} female {She} other {They}}"
 * 4. Rich-text tags: "Agree to <link>Terms</link>" -> with custom element replacement
 */
export function formatICU(
  message: string,
  values: ICUValues = {},
  locale: string = 'en'
): React.ReactNode {
  if (!message) return '';

  // Convert double curly braces {{variable}} to single curly braces {variable} for standard ICU compatibility
  let normalizedMessage = message;
  if (message.includes('{{')) {
    normalizedMessage = message.replace(/\{\{/g, '{').replace(/\}\}/g, '}');
  }

  // Fast path: if there are no brackets or tags, return raw text
  if (!normalizedMessage.includes('{') && !normalizedMessage.includes('<')) {
    return normalizedMessage;
  }

  try {
    return parseAndRender(normalizedMessage, values, locale);
  } catch (error) {
    console.error('ICU parsing failed for message:', message, error);
    return message; // Graceful degradation
  }
}

/**
 * Parses and renders an ICU pattern recursively.
 */
function parseAndRender(
  pattern: string,
  values: ICUValues,
  locale: string
): React.ReactNode {
  let result: React.ReactNode[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === '{') {
      // Find the matching closing bracket taking nested brackets into account
      let braceCount = 1;
      let j = i + 1;
      while (j < pattern.length && braceCount > 0) {
        if (pattern[j] === '{') braceCount++;
        else if (pattern[j] === '}') braceCount--;
        j++;
      }

      if (braceCount === 0) {
        const block = pattern.substring(i + 1, j - 1);
        result.push(renderICUBlock(block, values, locale));
        i = j;
        continue;
      }
    }

    if (char === '<') {
      // Find matching tag block
      const closeTagIdx = pattern.indexOf('>', i);
      if (closeTagIdx !== -1) {
        const tagHeader = pattern.substring(i + 1, closeTagIdx);
        const isClosing = tagHeader.startsWith('/');
        if (!isClosing) {
          const tagName = ((val) => (val || '').trim())(tagHeader);
          const closingTag = `</${tagName}>`;
          const closingTagIdx = pattern.indexOf(closingTag, closeTagIdx);
          
          if (closingTagIdx !== -1) {
            const innerContent = pattern.substring(closeTagIdx + 1, closingTagIdx);
            const renderedInner = parseAndRender(innerContent, values, locale);
            
            // Check if tag formatter exists in values
            const formatter = values[tagName];
            if (typeof formatter === 'function') {
              result.push(<React.Fragment key={i}>{formatter(renderedInner)}</React.Fragment>);
            } else {
              // Standard default tag renderers
              if (tagName === 'bold' || tagName === 'b') {
                result.push(<strong key={i} className="font-bold text-slate-900 dark:text-white">{renderedInner}</strong>);
              } else if (tagName === 'italic' || tagName === 'i') {
                result.push(<em key={i} className="italic text-slate-700 dark:text-slate-300">{renderedInner}</em>);
              } else if (tagName === 'link' || tagName === 'a') {
                result.push(<span key={i} className="text-indigo-600 hover:underline font-semibold cursor-pointer">{renderedInner}</span>);
              } else if (tagName === 'code') {
                result.push(<code key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-pink-600">{renderedInner}</code>);
              } else {
                result.push(<span key={i}>{renderedInner}</span>);
              }
            }
            i = closingTagIdx + closingTag.length;
            continue;
          }
        }
      }
    }

    // Regular character
    let nextBrace = pattern.indexOf('{', i);
    let nextTag = pattern.indexOf('<', i);
    let nextStop = pattern.length;
    
    if (nextBrace !== -1 && nextBrace < nextStop) nextStop = nextBrace;
    if (nextTag !== -1 && nextTag < nextStop) nextStop = nextTag;

    result.push(pattern.substring(i, nextStop));
    i = nextStop;
  }

  // Simplify results: if single string, return string
  if (result.length === 1 && typeof result[0] === 'string') {
    return result[0];
  }

  // If all elements are strings, join them into a single string to avoid rendering React elements/arrays in place of strings
  const allStrings = result.every(node => typeof node === 'string');
  if (allStrings) {
    return result.join('');
  }
  
  return result.map((node, index) => (
    <React.Fragment key={index}>{node}</React.Fragment>
  ));
}

/**
 * Handles block content like:
 * - "name"
 * - "count, plural, =0 {no scans} =1 {one scan} other {# scans}"
 * - "gender, select, male {He} female {She} other {They}"
 */
function renderICUBlock(
  block: string,
  values: ICUValues,
  locale: string
): React.ReactNode {
  const parts = block.split(',').map(s => ((val) => (val || '').trim())(s));
  const variable = parts[0];

  if (!(variable in values)) {
    return `{${block}}`; // Return raw block if variable value is missing
  }

  const val = values[variable];

  if (parts.length === 1) {
    // Standard interpolation
    return String(val);
  }

  const formatType = parts[1];
  const choiceStr = ((val) => (val || '').trim())(parts.slice(2).join(','));

  if (formatType === 'plural') {
    return resolvePlural(Number(val), choiceStr, values, locale);
  }

  if (formatType === 'select') {
    return resolveSelect(String(val), choiceStr, values, locale);
  }

  return String(val);
}

/**
 * Resolves plural rules like:
 * "=0 {Zero scans} =1 {One scan} other {# scans}"
 */
function resolvePlural(
  value: number,
  choices: string,
  values: ICUValues,
  locale: string
): React.ReactNode {
  // Parse subchoices
  const parsed = parseChoices(choices);
  const valueKey = `=${value}`;

  let selectedSubPattern = '';
  if (valueKey in parsed) {
    selectedSubPattern = parsed[valueKey];
  } else {
    // Fallback to standard cardinal rules (one, other)
    const rule = getPluralCardinalRule(value, locale);
    if (rule in parsed) {
      selectedSubPattern = parsed[rule];
    } else if ('other' in parsed) {
      selectedSubPattern = parsed['other'];
    }
  }

  // Substitute '#' with formatted value
  const finalPattern = selectedSubPattern.replace(/#/g, String(value));
  return parseAndRender(finalPattern, values, locale);
}

/**
 * Resolves select rules like:
 * "male {his profile} female {her profile} other {their profile}"
 */
function resolveSelect(
  value: string,
  choices: string,
  values: ICUValues,
  locale: string
): React.ReactNode {
  const parsed = parseChoices(choices);
  let selectedPattern = '';

  if (value in parsed) {
    selectedPattern = parsed[value];
  } else if ('other' in parsed) {
    selectedPattern = parsed['other'];
  }

  return parseAndRender(selectedPattern, values, locale);
}

/**
 * Parses options list e.g. "=0 {text} =1 {text} other {text}" or "male {text} other {text}"
 */
function parseChoices(choicesStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  let i = 0;

  while (i < choicesStr.length) {
    // Find key name
    while (i < choicesStr.length && /\s/.test(choicesStr[i])) i++;
    if (i >= choicesStr.length) break;

    let keyStart = i;
    while (i < choicesStr.length && !/\s/.test(choicesStr[i]) && choicesStr[i] !== '{') i++;
    const key = ((val) => (val || '').trim())(choicesStr.substring(keyStart, i));

    // Find opening bracket
    while (i < choicesStr.length && choicesStr[i] !== '{') i++;
    if (i >= choicesStr.length) break;

    // Find closing bracket
    let braceCount = 1;
    let valStart = i + 1;
    i++;
    while (i < choicesStr.length && braceCount > 0) {
      if (choicesStr[i] === '{') braceCount++;
      else if (choicesStr[i] === '}') braceCount--;
      i++;
    }

    const value = choicesStr.substring(valStart, i - 1);
    result[key] = value;
  }

  return result;
}

/**
 * Helper to resolve plural cardinal rules for standard locales
 */
function getPluralCardinalRule(val: number, locale: string): 'zero' | 'one' | 'two' | 'few' | 'many' | 'other' {
  try {
    // Check if Intl.PluralRules is available
    const pr = new Intl.PluralRules(locale);
    return pr.select(val);
  } catch {
    // Simple fallback
    if (val === 1) return 'one';
    return 'other';
  }
}
