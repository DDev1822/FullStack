'use strict';

const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  preserveCase(source, replacement) {
    if (!/[A-Za-z]/.test(source)) return replacement;
    if (source === source.toUpperCase()) return replacement.toUpperCase();
    if (/^[A-Z]/.test(source) && /^[a-z]/.test(replacement)) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  buildLexicon(locale) {
    const map = new Map();

    if (locale === 'american-to-british') {
      for (const [source, target] of Object.entries(americanToBritishSpelling)) {
        map.set(source.toLowerCase(), target);
      }
      for (const [source, target] of Object.entries(americanOnly)) {
        if (!map.has(source.toLowerCase())) map.set(source.toLowerCase(), target);
      }
    } else if (locale === 'british-to-american') {
      for (const [american, british] of Object.entries(americanToBritishSpelling)) {
        if (!map.has(british.toLowerCase())) map.set(british.toLowerCase(), american);
      }
      for (const [source, target] of Object.entries(britishOnly)) {
        if (!map.has(source.toLowerCase())) map.set(source.toLowerCase(), target);
      }
    }

    return map;
  }

  replaceFromMap(text, map, highlight = false) {
    const terms = [...map.keys()].sort((a, b) => b.length - a.length);
    if (!terms.length) return text;

    const pattern = terms.map((term) => this.escapeRegExp(term)).join('|');
    const regex = new RegExp(`(^|[^\\w-])(${pattern})(?=$|[^\\w-])`, 'gi');

    return text.replace(regex, (whole, prefix, matchedTerm) => {
      const target = map.get(matchedTerm.toLowerCase());
      const replacement = this.preserveCase(matchedTerm, target);
      return prefix + (highlight
        ? `<span class="highlight">${replacement}</span>`
        : replacement);
    });
  }

  replaceTitles(text, locale, highlight = false) {
    let entries;

    if (locale === 'american-to-british') {
      entries = Object.entries(americanToBritishTitles);
    } else if (locale === 'british-to-american') {
      entries = Object.entries(americanToBritishTitles).map(([american, british]) => [british, american]);
    } else {
      return text;
    }

    const map = new Map(entries.map(([source, target]) => [source.toLowerCase(), target]));
    const pattern = [...map.keys()]
      .sort((a, b) => b.length - a.length)
      .map((term) => this.escapeRegExp(term))
      .join('|');

    const dotGuard = locale === 'british-to-american' ? '(?!\\.)' : '';
    const regex = new RegExp(`(^|[^\\w-])(${pattern})${dotGuard}(?=$|[^\\w-])`, 'gi');

    return text.replace(regex, (whole, prefix, matchedTitle) => {
      let replacement = map.get(matchedTitle.toLowerCase());
      replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
      return prefix + (highlight
        ? `<span class="highlight">${replacement}</span>`
        : replacement);
    });
  }

  replaceTime(text, locale, highlight = false) {
    const wrap = (value) => highlight
      ? `<span class="highlight">${value}</span>`
      : value;

    if (locale === 'american-to-british') {
      return text.replace(/\b(\d{1,2}):([0-5]\d)\b/g, (match, hour, minutes) => wrap(`${hour}.${minutes}`));
    }

    if (locale === 'british-to-american') {
      return text.replace(/\b(\d{1,2})\.([0-5]\d)\b/g, (match, hour, minutes) => wrap(`${hour}:${minutes}`));
    }

    return text;
  }

  convert(text, locale, highlight = false) {
    let result = String(text);
    result = this.replaceTitles(result, locale, highlight);
    result = this.replaceFromMap(result, this.buildLexicon(locale), highlight);
    result = this.replaceTime(result, locale, highlight);
    return result;
  }

  translate(text, locale) {
    return this.convert(text, locale, false);
  }

  translateAndHighlight(text, locale) {
    return this.convert(text, locale, true);
  }
}

module.exports = Translator;
