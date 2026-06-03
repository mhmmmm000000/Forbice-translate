export interface LanguageMeta {
  id: string;
  name: string;
  flag: string;
  tag: string;
  subtitle: string;
  rules: string[];
  color: string;
  symbols: string;
}

export const LANGUAGES: LanguageMeta[] = [
  {
    id: 'all',
    name: 'All',
    flag: '🌍',
    tag: 'unified',
    subtitle: 'all tongues at once',
    rules: ['applies every tongue', 'to each word in sequence', '7 transforms layered'],
    color: '#D9FF3A',
    symbols: '★ ☆ ✦ ✧ ❋ ❊ ✺',
  },
  {
    id: 'eis',
    name: 'Eis',
    flag: '❄️',
    tag: 'phonetic',
    subtitle: 'phonetic erosion',
    rules: ['what → ani les', 'sh → s', 'ch → ts', 'j / soft-g → dz'],
    color: '#88ccff',
    symbols: 'ä ö ü ß ∞ α β',
  },
  {
    id: 'buwgeh',
    name: 'Buwgeh',
    flag: '👌',
    tag: 'rhotic',
    subtitle: 'rhotic drift',
    rules: ['r (final) → h', 'r (elsewhere) → w', 'river → wiveh'],
    color: '#ff9966',
    symbols: 'ʁ ʁ ʟ ɪ ð þ ɓ',
  },
  {
    id: 'toothie',
    name: 'Toothie',
    flag: '🦷',
    tag: 'dental',
    subtitle: 'universal dental',
    rules: ['every word + th', 'hello → helloth'],
    color: '#aaffaa',
    symbols: 'θ þ ʒ ʃ ʒ ʦ ʦ',
  },
  {
    id: 'thighs',
    name: 'Thighs',
    flag: '🦵',
    tag: 'sibilant',
    subtitle: 'sibilant shift',
    rules: ['trailing s → th', 'yes → yeth', 'cats → catth'],
    color: '#ffaa99',
    symbols: 's ʃ ʞ § ʒ ɐ ɜ',
  },
  {
    id: 'nuss',
    name: 'Nuss',
    flag: '🥜',
    tag: 'bisection',
    subtitle: 'bisection',
    rules: ['½(word) + nuss', 'stuff → stnuss', 'banana → bannuss'],
    color: '#ddbb88',
    symbols: '½ ¼ ÷ × ∞ π ε',
  },
  {
    id: 'agh',
    name: 'Agh',
    flag: '😩',
    tag: 'wail',
    subtitle: 'the long wail',
    rules: ['every word + aghhhhh', 'hello → helloaghhhhh'],
    color: '#cc88ff',
    symbols: 'ɦ ɪ ʊ æ ƒ ʒ ǝ',
  },
  {
    id: 'aynanana',
    name: 'Aynanana',
    flag: '🎵',
    tag: 'chant',
    subtitle: 'the chant',
    rules: ['every word + aynanana', 'hello → helloaynanana'],
    color: '#ffdd66',
    symbols: '♪ ♫ ♩ ♬ α β γ',
  },
];

const INDIVIDUAL_LANG_IDS = ['eis', 'buwgeh', 'toothie', 'thighs', 'nuss', 'agh', 'aynanana'];

type TranslatorFns = {
  fwd: (t: string) => string;
  rev: (t: string) => string;
};

const T: Record<string, TranslatorFns> = {
  eis: {
    fwd(t: string) {
      t = t.replace(/\bwhat\b/gi, (m) => (m[0] === 'W' ? 'Ani les' : 'ani les'));
      t = t.replace(/g(?=[eiy])/g, 'dz').replace(/G(?=[eiyEIY])/g, 'Dz');
      t = t.replace(/j/g, 'dz').replace(/J/g, 'Dz');
      t = t.replace(/ch/g, 'ts').replace(/Ch/g, 'Ts').replace(/CH/g, 'TS');
      t = t.replace(/ti(?=[oa]n|al)/gi, (m) => (m[0] === 'T' ? 'Si' : 'si'));
      t = t.replace(/sh/g, 's').replace(/Sh/g, 'S').replace(/SH/g, 'S');
      return t;
    },
    rev(t: string) {
      t = t.replace(/\bani les\b/gi, (m) => (m[0] === 'A' ? 'What' : 'what'));
      t = t.replace(/dz/g, 'j').replace(/Dz/g, 'J');
      t = t.replace(/ts/g, 'ch').replace(/Ts/g, 'Ch');
      return t;
    },
  },
  buwgeh: {
    fwd(t: string) {
      t = t.replace(/r\b/g, 'h').replace(/R\b/g, 'H');
      t = t.replace(/r/g, 'w').replace(/R/g, 'W');
      return t;
    },
    rev(t: string) {
      return t.replace(/w/g, 'r').replace(/W/g, 'R');
    },
  },
  toothie: {
    fwd(t: string) {
      return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
        if (m.length > 1 && m === m.toUpperCase()) return m + 'TH';
        return m + 'th';
      });
    },
    rev(t: string) {
      return t.replace(/\b([A-Za-z]+?)(TH|th)\b/g, (_m, b, s) =>
        s === 'TH' ? b.toUpperCase() : b
      );
    },
  },
  thighs: {
    fwd(t: string) {
      return t
        .replace(/\b([A-Z][a-zA-Z]*?)S\b/g, '$1TH')
        .replace(/\b([a-zA-Z]*?)s\b/g, '$1th');
    },
    rev(t: string) {
      return t
        .replace(/\b([A-Z][a-zA-Z]*?)TH\b/g, '$1S')
        .replace(/\b([a-zA-Z]*?)th\b/g, '$1s');
    },
  },
  nuss: {
    fwd(t: string) {
      return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
        if (m.length <= 1) return m;
        const half = Math.floor(m.length / 2);
        const first = m.slice(0, half);
        return m === m.toUpperCase() ? first + 'NUSS' : first + 'nuss';
      });
    },
    rev(t: string) {
      return t.replace(/\b([A-Za-z]+?)(NUSS|nuss)\b/g, (_m, b, s) => {
        const d = b + b;
        return s === 'NUSS' ? d.toUpperCase() : d;
      });
    },
  },
  agh: {
    fwd(t: string) {
      return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
        if (m.length > 1 && m === m.toUpperCase()) return m + 'AGHHHHH';
        return m + 'aghhhhh';
      });
    },
    rev(t: string) {
      return t.replace(/\b([A-Za-z]+?)(AGHHHHH|aghhhhh)\b/g, (_m, b, s) =>
        s === 'AGHHHHH' ? b.toUpperCase() : b
      );
    },
  },
  aynanana: {
    fwd(t: string) {
      return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
        if (m.length > 1 && m === m.toUpperCase()) return m + 'AYNANANA';
        return m + 'aynanana';
      });
    },
    rev(t: string) {
      return t.replace(/\b([A-Za-z]+?)(AYNANANA|aynanana)\b/g, (_m, b, s) =>
        s === 'AYNANANA' ? b.toUpperCase() : b
      );
    },
  },
  all: {
    fwd(t: string) {
      let result = t;
      for (const langId of INDIVIDUAL_LANG_IDS) {
        result = T[langId].fwd(result);
      }
      return result;
    },
    rev(t: string) {
      let result = t;
      for (const langId of [...INDIVIDUAL_LANG_IDS].reverse()) {
        result = T[langId].rev(result);
      }
      return result;
    },
  },
};

export function translate(
  text: string,
  languageId: string,
  direction: 'fwd' | 'rev' = 'fwd'
): string {
  const translator = T[languageId];
  if (!translator || !text.trim()) return '';
  return direction === 'fwd' ? translator.fwd(text) : translator.rev(text);
}

export const TILE_COUNT = LANGUAGES.length; // 8

export type ThemeName = 'cream' | 'ink' | 'void';

export interface ThemeConfig {
  bg: string;
  ink: string;
  paper: string;
  paperAlt: string;
  accent: string;
  accentInk: string;
  muted: string;
  particle: string;
  aura: string;
  fog: string;
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  cream: {
    bg: '#F1EDE3',
    ink: '#141414',
    paper: '#F1EDE3',
    paperAlt: '#E8E2D4',
    accent: '#D9FF3A',
    accentInk: '#141414',
    muted: '#6b6358',
    particle: '#8a857a',
    aura: '#d4c9a8',
    fog: '#F1EDE3',
  },
  ink: {
    bg: '#161616',
    ink: '#F1EDE3',
    paper: '#222222',
    paperAlt: '#2d2d2d',
    accent: '#D9FF3A',
    accentInk: '#141414',
    muted: '#a09888',
    particle: '#8a8278',
    aura: '#3a3528',
    fog: '#161616',
  },
  void: {
    bg: '#050505',
    ink: '#F1EDE3',
    paper: '#111111',
    paperAlt: '#1a1a1a',
    accent: '#D9FF3A',
    accentInk: '#000000',
    muted: '#b0a898',
    particle: '#7a7268',
    aura: '#201c15',
    fog: '#050505',
  },
};
