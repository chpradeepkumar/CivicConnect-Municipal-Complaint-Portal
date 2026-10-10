import { Minus, Plus, Languages, Phone } from 'lucide-react';
import { useUi } from '../context/UiContext.jsx';
import { SITE } from '../config/site.js';

export function GovTopBar() {
  const { t, fontSize, setFontSize, lang, toggleLang } = useUi();

  const fontBtn =
    'flex h-6 w-6 items-center justify-center rounded border border-navy-700 text-navy-200 hover:bg-navy-800 hover:text-white disabled:opacity-40';

  return (
    <div className="bg-navy-950 text-navy-200">
      <div className="container-page flex h-9 items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden font-medium tracking-wide sm:inline">{t('top.state')}</span>
          <span className="hidden text-navy-600 sm:inline">|</span>
          <span className="truncate text-navy-300">{lang === 'hi' ? SITE.stateNameHi : SITE.stateName}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href={`tel:${SITE.helpline}`}
            className="hidden items-center gap-1.5 text-navy-200 hover:text-white md:flex"
          >
            <Phone className="h-3.5 w-3.5 text-saffron-400" />
            <span className="font-medium">{t('top.helpline')}: {SITE.helpline}</span>
          </a>

          <div className="hidden items-center gap-1 sm:flex" title={t('top.fontSize')}>
            <span className="mr-1 text-navy-400">{t('top.fontSize')}</span>
            <button
              type="button"
              className={fontBtn}
              onClick={() => setFontSize('sm')}
              disabled={fontSize === 'sm'}
              aria-label="Decrease font size"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              className={fontBtn}
              onClick={() => setFontSize('md')}
              disabled={fontSize === 'md'}
              aria-label="Normal font size"
            >
              <span className="text-[10px] font-bold">A</span>
            </button>
            <button
              type="button"
              className={fontBtn}
              onClick={() => setFontSize('lg')}
              disabled={fontSize === 'lg'}
              aria-label="Increase font size"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded border border-navy-700 px-2 py-1 font-medium hover:bg-navy-800 hover:text-white"
            aria-label={t('top.language')}
          >
            <Languages className="h-3.5 w-3.5 text-saffron-400" />
            {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GovTopBar;
