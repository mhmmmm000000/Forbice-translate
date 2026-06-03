import { create } from 'zustand';
import { translate } from '@/lib/translator';
import type { ThemeName } from '@/lib/translator';

export type ViewState = 'cluster' | 'carousel' | 'selected';

interface TranslatorState {
  viewState: ViewState;
  selectedLanguage: string | null;
  inputText: string;
  translatedText: string;
  theme: ThemeName;
  carouselRotation: number;
  hoveredTile: string | null;
  keystrokeTime: number;
  hasInteracted: boolean;

  setViewState: (state: ViewState) => void;
  selectLanguage: (id: string | null) => void;
  setInputText: (text: string) => void;
  setTheme: (theme: ThemeName) => void;
  addToCarouselRotation: (delta: number) => void;
  setHoveredTile: (id: string | null) => void;
  triggerKeystroke: () => void;
  setHasInteracted: () => void;
  resetSelection: () => void;
}

export const useTranslatorStore = create<TranslatorState>((set, get) => ({
  viewState: 'cluster',
  selectedLanguage: null,
  inputText: '',
  translatedText: '',
  theme: 'cream',
  carouselRotation: 0,
  hoveredTile: null,
  keystrokeTime: 0,
  hasInteracted: false,

  setViewState: (viewState) => set({ viewState }),

  selectLanguage: (selectedLanguage) => {
    const state = get();
    const translated = selectedLanguage
      ? translate(state.inputText, selectedLanguage, 'fwd')
      : '';
    set({ selectedLanguage, translatedText: translated });
  },

  setInputText: (inputText) => {
    const state = get();
    const translated = state.selectedLanguage
      ? translate(inputText, state.selectedLanguage, 'fwd')
      : '';
    set({ inputText, translatedText: translated });
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem('th-theme', theme);
    } catch {}
    set({ theme });
  },

  addToCarouselRotation: (delta) =>
    set((s) => ({ carouselRotation: s.carouselRotation + delta })),

  setHoveredTile: (hoveredTile) => set({ hoveredTile }),

  triggerKeystroke: () => set({ keystrokeTime: Date.now() }),

  setHasInteracted: () => set({ hasInteracted: true }),

  resetSelection: () => {
    set((s) => ({
      viewState: 'carousel',
      selectedLanguage: null,
      inputText: '',
      translatedText: '',
    }));
  },
}));

// Initialize theme from localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('th-theme') as ThemeName | null;
    if (saved && ['cream', 'ink', 'void'].includes(saved)) {
      useTranslatorStore.getState().setTheme(saved);
    }
  } catch {}
}
