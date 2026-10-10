import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS } from '../config/site.js';

const UiContext = createContext(null);

const LANG_KEY = 'civicconnect_lang';
const FONT_KEY = 'civicconnect_font';
const FONT_SIZES = { sm: '14px', md: '16px', lg: '18px' };

function read(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function UiProvider({ children }) {
  const [lang, setLangState] = useState(() => read(LANG_KEY, 'en'));
  const [fontSize, setFontSizeState] = useState(() => read(FONT_KEY, 'md'));

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize] || FONT_SIZES.md;
    try {
      localStorage.setItem(FONT_KEY, fontSize);
    } catch {
      /* storage unavailable */
    }
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const setLang = useCallback((next) => setLangState(next === 'hi' ? 'hi' : 'en'), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === 'hi' ? 'en' : 'hi')), []);
  const setFontSize = useCallback((next) => setFontSizeState(FONT_SIZES[next] ? next : 'md'), []);

  const t = useCallback(
    (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, fontSize, setFontSize }),
    [lang, setLang, toggleLang, t, fontSize, setFontSize]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within a UiProvider');
  return ctx;
}

export default UiContext;
