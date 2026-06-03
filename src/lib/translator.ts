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
    id: 'eis',
    name: 'Eis',
    flag: '\u2744',
    tag: 'phonetic',
    subtitle: 'phonetic erosion',
    rules: ['what \u2192 ani les', 'sh \u2192 s', 'ch \u2192 ts', 'j / soft-g \u2192 dz'],
    color: '#88ccff',
    symbols: '\u00E4 \u00F6 \u00FC \u00DF \u221E \u03B1 \u03B2',
  },
  {
    id: 'buwgeh',
    name: 'Buwgeh',
    flag: '\uD83D\uDC4C',
    tag: 'rhotic',
    subtitle: 'rhotic drift',
    rules: ['r (final) \u2192 h', 'r (elsewhere) \u2192 w', 'river \u2192 wiveh'],
    color: '#ff9966',
    symbols: '\u0280 \u0281 \u029C \u026A \u00F0 \u00FE \u0253',
  },
  {
    id: 'toothie',
    name: 'Toothie',
    flag: '\uD83E\uDDB7',
    tag: 'dental',
    subtitle: 'universal dental',
    rules: ['every word + th', 'hello \u2192 helloth'],
    color: '#aaffaa',
    symbols: '\u03B8 \u00FE \u0293 \u0283 \u0292 \u02A7 \u02A6',
  },
  {
    id: 'thighs',
    name: 'Thighs',
    flag: '\uD83E\uDDC5',
    tag: 'sibilant',
    subtitle: 'sibilant shift',
    rules: ['trailing s \u2192 th', 'yes \u2192 yeth', 'cats \u2192 catth'],
    color: '#ffaa99',
    symbols: '\u0073 \u0283 \u029B \u00A7 \u0292 \u0290 \u025C',
  },
  {
    id: 'nuss',
    name: 'Nuss',
    flag: '\uD83E\uDD5C',
    tag: 'bisection',
    subtitle: 'bisection',
    rules: ['\u00BD(word) + nuss', 'stuff \u2192 stnuss', 'banana \u2192 bannuss'],
    color: '#ddbb88',
    symbols: '\u00BD \u00BC \u00F7 \u00D7 \u221E \u03C0 \u03B5',
  },
  {
    id: 'agh',
    name: 'Agh',
    flag: '\uD83D\uDE29',
    tag: 'wail',
    subtitle: 'the long wail',
    rules: ['every word + aghhhhh', 'hello \u2192 helloaghhhhh'],
    color: '#cc88ff',
    symbols: '\u0266 \u026A \u028A \u00E6 \u0192 \u0292 \u01DD',
  },
  {
    id: 'aynanana',
    name: 'Aynanana',
    flag: '\uD83C\uDFB6',
    tag: 'chant',
    subtitle: 'the chant',
    rules: ['every word + aynanana', 'hello \u2192 helloaynanana'],
    color: '#ffdd66',
    symbols: '\u266A \u266B \u2669 \u266C \u03B1 \u03B2 \u03B3',
  },
];

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
    muted: '#8a857a',
    particle: '#8a857a',
    aura: '#d4c9a8',
    fog: '#F1EDE3',
  },
  ink: {
    bg: '#161616',
    ink: '#F1EDE3',
    paper: '#1f1f1f',
    paperAlt: '#2a2a2a',
    accent: '#D9FF3A',
    accentInk: '#141414',
    muted: '#6b675c',
    particle: '#6b675c',
    aura: '#2a2820',
    fog: '#161616',
  },
  void: {
    bg: '#000000',
    ink: '#F1EDE3',
    paper: '#0a0a0a',
    paperAlt: '#111111',
    accent: '#D9FF3A',
    accentInk: '#000000',
    muted: '#5a574e',
    particle: '#5a574e',
    aura: '#1a1a15',
    fog: '#000000',
  },
};
