export interface LanguageMeta {
  id: string;
  name: string;
  flag: string;
  tag: string;
  subtitle: string;
  rules: string[];
  color: string;
  colorAlt: string;
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
    colorAlt: '#B8E63A',
    symbols: '★ ☆ ✦ ✧ ❋ ❊ ✺',
  },
  {
    id: 'eis',
    name: 'Eis',
    flag: '❄️',
    tag: 'phonetic',
    subtitle: 'phonetic erosion',
    rules: ['what → ani les', 'sh → s', 'ch → ts', 'j / soft-g → dz'],
    color: '#44bbff',
    colorAlt: '#22ddff',
    symbols: 'ä ö ü ß ∞ α β',
  },
  {
    id: 'buwgeh',
    name: 'Buwgeh',
    flag: '👌',
    tag: 'rhotic',
    subtitle: 'rhotic drift',
    rules: ['r (final) → h', 'r (elsewhere) → w', 'river → wiveh'],
    color: '#ff7744',
    colorAlt: '#ff9955',
    symbols: 'ʁ ʁ ʟ ɪ ð þ ɓ',
  },
  {
    id: 'toothie',
    name: 'Toothie',
    flag: '🦷',
    tag: 'dental',
    subtitle: 'universal dental',
    rules: ['every word + th', 'hello → helloth'],
    color: '#44ff88',
    colorAlt: '#66ffaa',
    symbols: 'θ þ ʒ ʃ ʒ ʦ ʦ',
  },
  {
    id: 'thighs',
    name: 'Thighs',
    flag: '🦵',
    tag: 'sibilant',
    subtitle: 'sibilant shift',
    rules: ['trailing s → th', 'yes → yeth', 'cats → catth'],
    color: '#ff6688',
    colorAlt: '#ff4466',
    symbols: 's ʃ ʞ § ʒ ɐ ɜ',
  },
  {
    id: 'nuss',
    name: 'Nuss',
    flag: '🥜',
    tag: 'bisection',
    subtitle: 'bisection',
    rules: ['½(word) + nuss', 'stuff → stnuss', 'banana → bannuss'],
    color: '#ffaa33',
    colorAlt: '#eecc44',
    symbols: '½ ¼ ÷ × ∞ π ε',
  },
  {
    id: 'agh',
    name: 'Agh',
    flag: '😩',
    tag: 'wail',
    subtitle: 'the long wail',
    rules: ['every word + aghhhhh', 'hello → helloaghhhhh'],
    color: '#bb55ff',
    colorAlt: '#dd77ff',
    symbols: 'ɦ ɪ ʊ æ ƒ ʒ ǝ',
  },
  {
    id: 'aynanana',
    name: 'Aynanana',
    flag: '🎵',
    tag: 'chant',
    subtitle: 'the chant',
    rules: ['every word + aynanana', 'hello → helloaynanana'],
    color: '#ffcc00',
    colorAlt: '#ffee44',
    symbols: '♪ ♫ ♩ ♬ α β γ',
  },
];

const INDIVIDUAL_LANG_IDS = ['eis', 'buwgeh', 'toothie', 'thighs', 'nuss', 'agh', 'aynanana'];

/* ── Agh per-word (with 20% a-gate for "all" mode) ── */
function aghFwdWord(word: string): string {
  if (word.length > 1 && word === word.toUpperCase()) return word + 'AGHHHHH';
  return word + 'aghhhhh';
}

function aghFwd(t: string, inAll: boolean): string {
  if (!inAll) return t.replace(/\b([A-Za-z]+)\b/g, (m) => aghFwdWord(m));
  return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
    if (!/[aA]/.test(m)) return m;           // skip if no 'a'
    if (Math.random() < 0.8) return m;       // 80% skip → only 20% apply
    return aghFwdWord(m);
  });
}

function aghRev(t: string): string {
  return t.replace(/\b([A-Za-z]+?)(AGHHHHH|aghhhhh)\b/g, (_m, b, s) =>
    s === 'AGHHHHH' ? b.toUpperCase() : b
  );
}

/* ── Nuss per-word (with 20% a-gate for "all" mode) ── */
function nussFwdWord(word: string): string {
  if (word.length <= 1) return word;
  const half = Math.floor(word.length / 2);
  const first = word.slice(0, half);
  return word === word.toUpperCase() ? first + 'NUSS' : first + 'nuss';
}

function nussFwd(t: string, inAll: boolean): string {
  if (!inAll) return t.replace(/\b([A-Za-z]+)\b/g, (m) => nussFwdWord(m));
  return t.replace(/\b([A-Za-z]+)\b/g, (m) => {
    if (!/[aA]/.test(m)) return m;
    if (Math.random() < 0.8) return m;
    return nussFwdWord(m);
  });
}

function nussRev(t: string): string {
  return t.replace(/\b([A-Za-z]+?)(NUSS|nuss)\b/g, (_m, b, s) => {
    const d = b + b;
    return s === 'NUSS' ? d.toUpperCase() : d;
  });
}

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
    fwd(t: string) { return nussFwd(t, false); },
    rev(t: string) { return nussRev(t); },
  },
  agh: {
    fwd(t: string) { return aghFwd(t, false); },
    rev(t: string) { return aghRev(t); },
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
      // Order: eis → buwgeh → toothie → thighs → nuss(20%) → agh(20%) → aynanana
      result = T['eis'].fwd(result);
      result = T['buwgeh'].fwd(result);
      result = T['toothie'].fwd(result);
      result = T['thighs'].fwd(result);
      result = nussFwd(result, true);   // 20% only if word has 'a'
      result = aghFwd(result, true);    // 20% only if word has 'a'
      result = T['aynanana'].fwd(result);
      return result;
    },
    rev(t: string) {
      let result = t;
      // Reverse order
      result = T['aynanana'].rev(result);
      result = aghRev(result);
      result = nussRev(result);
      result = T['thighs'].rev(result);
      result = T['toothie'].rev(result);
      result = T['buwgeh'].rev(result);
      result = T['eis'].rev(result);
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
  mutedBright: string;
  particle: string;
  aura: string;
  fog: string;
  textOutline: string;
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
    mutedBright: '#5a5348',
    particle: '#8a857a',
    aura: '#d4c9a8',
    fog: '#F1EDE3',
    textOutline: '#F1EDE3',
  },
  ink: {
    bg: '#1c1410',
    ink: '#F5E6D0',
    paper: '#2a2018',
    paperAlt: '#382c20',
    accent: '#FF8844',
    accentInk: '#1c1410',
    muted: '#c0a888',
    mutedBright: '#d8c0a0',
    particle: '#b09870',
    aura: '#3d2a18',
    fog: '#1c1410',
    textOutline: '#1c1410',
  },
  void: {
    bg: '#020208',
    ink: '#E0E8FF',
    paper: '#0a0a18',
    paperAlt: '#12122a',
    accent: '#00FFAA',
    accentInk: '#020208',
    muted: '#a0a8d0',
    mutedBright: '#c0c8f0',
    particle: '#7080b0',
    aura: '#0a1030',
    fog: '#020208',
    textOutline: '#020208',
  },
};
