import { memo, useCallback, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, CountryPreset } from '@/game/types';
import { COUNTRIES } from '@/game/data';
import { t } from '@/game/i18n';

interface Props {
  lang: Lang;
  onStart: (country: CountryPreset) => void;
  onToggleLang: () => void;
}

function NationSelectInner({ lang, onStart, onToggleLang }: Props) {
  const [selected, setSelected] = useState<string>('tr');

  const handleStart = useCallback(() => {
    const country = COUNTRIES.find((c) => c.id === selected);
    if (country) onStart(country);
  }, [selected, onStart]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 safe-top safe-bottom overflow-x-hidden">
      <div className="absolute top-4 right-4 safe-right">
        <button
          onClick={onToggleLang}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          {lang === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </button>
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-3">
          {t('chooseNation', lang)}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
          {t('selectPrompt', lang)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl mb-8">
        {COUNTRIES.map((country) => {
          const isSelected = selected === country.id;
          return (
            <button
              key={country.id}
              onClick={() => setSelected(country.id)}
              className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary-500 bg-primary-950/40 scale-[1.02] shadow-lg shadow-primary-500/20'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h3 className="font-bold text-lg text-white">{country.name[lang]}</h3>
                  <p className="text-xs text-accent-400 font-semibold">
                    {t('startingFunds', lang)}: ${country.startingFunds}M
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-400">
                <Icons.Sparkles className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>{country.perk[lang]}</span>
              </div>
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Icons.CheckCircle className="w-5 h-5 text-primary-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleStart}
        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.03] active:scale-95 transition-all duration-200"
      >
        {t('startGame', lang)}
      </button>
    </div>
  );
}

export const NationSelect = memo(NationSelectInner);
