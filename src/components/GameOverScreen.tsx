import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, CountryPreset } from '@/game/types';
import { t } from '@/game/i18n';

interface Props {
  lang: Lang;
  state: GameState;
  country: CountryPreset;
  onRestart: () => void;
}

function GameOverScreenInner({ lang, state, country, onRestart }: Props) {
  const handleRestart = useCallback(() => onRestart(), [onRestart]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-error-950/50 flex items-center justify-center mx-auto mb-6">
          <Icons.Skull className="w-10 h-10 text-error-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">{t('gameOver', lang)}</h1>
        <p className="text-slate-400 mb-2">{state.gameOverReason?.[lang] ?? ''}</p>
        <div className="flex items-center justify-center gap-2 mb-8 text-slate-500">
          <span className="text-2xl">{country.flag}</span>
          <span className="text-sm">{country.name[lang]}</span>
          <span>•</span>
          <span className="text-sm">{t('turn', lang)} {state.turn}</span>
        </div>
        <button
          onClick={handleRestart}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-lg shadow-primary-500/30 hover:scale-[1.03] active:scale-95 transition-all"
        >
          {t('playAgain', lang)}
        </button>
      </div>
    </div>
  );
}

export const GameOverScreen = memo(GameOverScreenInner);
