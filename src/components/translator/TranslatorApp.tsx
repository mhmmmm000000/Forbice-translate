'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';
import { LANGUAGES, THEMES, type ThemeName } from '@/lib/translator';
import { useTranslatorStore } from '@/stores/translator-store';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

/* ── Suggestion examples ── */
const SUGGESTIONS = [
  'The river flows gently through the ancient forest',
  'What should we do about this strange situation',
  'She sells seashells by the shimmering seashore',
  'The quick brown fox jumps over the lazy dog',
  'Good morning sunshine, the world awaits your smile',
  'A brave knight rode through the enchanted valley',
  'Stars shine bright above the quiet sleeping village',
  'I found a mysterious treasure hidden in the garden',
];

/* ── Theme Switcher ── */
function ThemeSwitcher() {
  const theme = useTranslatorStore((s) => s.theme);
  const setTheme = useTranslatorStore((s) => s.setTheme);
  const viewState = useTranslatorStore((s) => s.viewState);

  return (
    <motion.div
      className="fixed top-5 right-5 z-30 flex items-center gap-1 p-1 rounded-full border-2"
      style={{
        borderColor: THEMES[theme].ink,
        background: THEMES[theme].paperAlt,
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: viewState !== 'selected' ? 1 : 0.4, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      {(['cream', 'ink', 'void'] as ThemeName[]).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer"
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px',
            letterSpacing: '0.12em',
            background: theme === t ? THEMES[theme].ink : 'transparent',
            color: theme === t ? THEMES[theme].paper : THEMES[theme].mutedBright,
          }}
        >
          {t}
        </button>
      ))}
    </motion.div>
  );
}

/* ── Title / Brand ── */
function BrandTitle() {
  const theme = useTranslatorStore((s) => s.theme);
  const viewState = useTranslatorStore((s) => s.viewState);

  return (
    <motion.div
      className="fixed top-5 left-5 z-30"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: viewState !== 'selected' ? 1 : 0.3, x: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <div
        className="px-3 py-1.5 rounded-full border-2 inline-flex items-center gap-2"
        style={{
          borderColor: THEMES[theme].ink,
          background: THEMES[theme].ink,
          color: THEMES[theme].paper,
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: THEMES[theme].accent,
            animation: 'blink 1.6s ease infinite',
          }}
        />
        Translator Hub
      </div>
    </motion.div>
  );
}

/* ── Instructions ── */
function Instructions() {
  const viewState = useTranslatorStore((s) => s.viewState);
  const hasInteracted = useTranslatorStore((s) => s.hasInteracted);
  const theme = useTranslatorStore((s) => s.theme);
  const setHasInteracted = useTranslatorStore((s) => s.setHasInteracted);

  const text = viewState === 'cluster' ? 'Scroll to explore the tongues' : 'Click a tongue to translate';

  if (hasInteracted && viewState !== 'cluster') return null;

  return (
    <motion.div
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 0.7, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <div
        className="px-5 py-2.5 rounded-full border"
        style={{
          borderColor: `${THEMES[theme].muted}40`,
          background: `${THEMES[theme].paperAlt}cc`,
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: THEMES[theme].mutedBright,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

/* ── Typing Overlay ── */
function TypingOverlay() {
  const viewState = useTranslatorStore((s) => s.viewState);
  const selectedLanguage = useTranslatorStore((s) => s.selectedLanguage);
  const inputText = useTranslatorStore((s) => s.inputText);
  const translatedText = useTranslatorStore((s) => s.translatedText);
  const setInputText = useTranslatorStore((s) => s.setInputText);
  const theme = useTranslatorStore((s) => s.theme);
  const triggerKeystroke = useTranslatorStore((s) => s.triggerKeystroke);
  const resetSelection = useTranslatorStore((s) => s.resetSelection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const lang = LANGUAGES.find((l) => l.id === selectedLanguage);
  const tc = THEMES[theme];

  // Auto-focus textarea
  useEffect(() => {
    if (viewState === 'selected' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [viewState]);

  // Trigger keystroke ripple on input
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
      triggerKeystroke();
    },
    [setInputText, triggerKeystroke]
  );

  // Handle suggestion click
  const handleSuggestion = useCallback(
    (text: string) => {
      setInputText(text);
      triggerKeystroke();
      setTimeout(() => textareaRef.current?.focus(), 100);
    },
    [setInputText, triggerKeystroke]
  );

  // Copy translated text
  const handleCopy = useCallback(async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = translatedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [translatedText]);

  // Handle close
  const handleClose = useCallback(() => {
    resetSelection();
  }, [resetSelection]);

  if (viewState !== 'selected' || !lang) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Backdrop blur */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `${tc.bg}60`,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full max-w-lg mx-4 rounded-2xl border-2 overflow-hidden flex flex-col max-h-[90vh]"
          style={{
            borderColor: tc.ink,
            background: tc.paper,
            boxShadow: `6px 6px 0 ${tc.ink}`,
          }}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b-2 shrink-0"
            style={{
              borderColor: tc.ink,
              background: tc.paperAlt,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <div
                  className="text-lg font-bold"
                  style={{ color: tc.ink, letterSpacing: '-0.02em' }}
                >
                  {lang.name}
                </div>
                <div
                  className="text-xs uppercase tracking-wider"
                  style={{
                    color: tc.mutedBright,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    letterSpacing: '0.12em',
                  }}
                >
                  {lang.subtitle}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-150 cursor-pointer hover:scale-110"
              style={{
                borderColor: tc.ink,
                background: tc.paper,
                color: tc.ink,
              }}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
            {/* Rules */}
            <div className="flex flex-wrap gap-1.5 px-5 py-3" style={{ background: `${tc.paperAlt}50` }}>
              {lang.rules.map((rule, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-transform duration-150 hover:-translate-y-0.5"
                  style={{
                    border: `1.5px solid ${tc.ink}`,
                    background: tc.paper,
                    color: tc.ink,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '11px',
                  }}
                >
                  {rule}
                </span>
              ))}
            </div>

            {/* Input area */}
            <div className="px-5 pt-4 pb-2">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInput}
                placeholder="Write something..."
                className="w-full min-h-[100px] resize-none outline-none"
                style={{
                  background: 'transparent',
                  color: tc.ink,
                  fontSize: '17px',
                  lineHeight: '1.6',
                  fontWeight: 500,
                }}
              />
            </div>

            {/* Divider */}
            <div className="mx-5 border-t" style={{ borderColor: `${tc.ink}30` }} />

            {/* Translated output */}
            <div className="px-5 py-4 min-h-[80px]">
              <div
                className="leading-relaxed break-words"
                style={{
                  color: translatedText ? tc.ink : `${tc.mutedBright}60`,
                  fontSize: '16px',
                  fontWeight: translatedText ? 600 : 400,
                  fontStyle: translatedText ? 'normal' : 'italic',
                }}
              >
                {translatedText || 'translated words will appear here...'}
              </div>
            </div>

            {/* Try These Suggestions */}
            {!inputText && (
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles size={14} style={{ color: tc.accent }} />
                  <span
                    className="font-semibold"
                    style={{
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: tc.accent,
                    }}
                  >
                    Try these suggestions
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-left px-3 py-2 rounded-lg border transition-all duration-150 cursor-pointer hover:-translate-y-0.5"
                      style={{
                        borderColor: `${tc.ink}40`,
                        background: `${tc.paperAlt}80`,
                        color: tc.ink,
                        fontSize: '13px',
                        lineHeight: '1.4',
                        fontWeight: 500,
                      }}
                    >
                      &ldquo;{suggestion}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div
            className="flex items-center justify-between px-4 py-3 border-t-2 shrink-0"
            style={{
              borderColor: tc.ink,
              background: tc.paperAlt,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: tc.ink,
                  color: tc.paper,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '10px',
                  minWidth: '28px',
                  textAlign: 'center',
                }}
              >
                {inputText.length}
              </span>
              <span
                style={{
                  color: tc.mutedBright,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                chars
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputText('')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-150 cursor-pointer"
                style={{
                  borderColor: tc.ink,
                  background: tc.paper,
                  color: tc.ink,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                }}
              >
                <span className="flex items-center gap-1">
                  <RotateCcw size={10} />
                  Clear
                </span>
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-150 cursor-pointer"
                style={{
                  borderColor: tc.ink,
                  background: copied ? tc.accent : tc.paper,
                  color: copied ? tc.accentInk : tc.ink,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                }}
              >
                <span className="flex items-center gap-1">
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main App ── */
export default function TranslatorApp() {
  const theme = useTranslatorStore((s) => s.theme);
  const viewState = useTranslatorStore((s) => s.viewState);
  const setViewState = useTranslatorStore((s) => s.setViewState);
  const addToCarouselRotation = useTranslatorStore((s) => s.addToCarouselRotation);
  const setHasInteracted = useTranslatorStore((s) => s.setHasInteracted);
  const containerRef = useRef<HTMLDivElement>(null);

  const tc = THEMES[theme];

  // Handle wheel events
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const store = useTranslatorStore.getState();
      store.setHasInteracted();

      if (store.viewState === 'cluster') {
        store.setViewState('carousel');
      } else if (store.viewState === 'carousel') {
        store.addToCarouselRotation(e.deltaY * 0.003);
      }
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col"
      style={{
        background: tc.bg,
        color: tc.ink,
        transition: 'background 0.5s ease, color 0.5s ease',
      }}
    >
      {/* 3D Scene */}
      <div
        className="fixed inset-0 w-full h-full transition-all duration-500"
        style={{
          filter: viewState === 'selected' ? 'blur(4px) brightness(0.6)' : 'none',
        }}
      >
        <Scene3D />
      </div>

      {/* UI Overlays */}
      <BrandTitle />
      <ThemeSwitcher />
      <Instructions />
      <TypingOverlay />

      {/* Footer */}
      <footer
        className="relative z-20 mt-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-wider"
        style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: tc.mutedBright,
          opacity: viewState === 'selected' ? 0 : 0.7,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div>
          <span className="font-bold" style={{ color: tc.ink }}>
            Translator Hub
          </span>{' '}
          &middot; Eight tongues, one workshop
        </div>
        <div>Scroll &middot; Click &middot; Type</div>
      </footer>
    </div>
  );
}
