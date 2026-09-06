import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState } from '@/game/types';
import { t } from '@/game/i18n';
import { formatPercent, formatMoney } from '@/game/utils';
import { ELECTION_INTERVAL } from '@/game/data';

interface Props {
  lang: Lang;
  state: GameState;
  onRally: () => void;
  onPropaganda: () => void;
}

function PoliticsViewInner({ lang, state, onRally, onPropaganda }: Props) {
  const turnsLeft = ELECTION_INTERVAL - state.electionTimer;
  const electionSoon = turnsLeft <= 3;

  const handleRally = useCallback(() => {
    if (state.funds < 10) return;
    onRally();
  }, [state.funds, onRally]);

  const handlePropaganda = useCallback(() => {
    if (state.funds < 5) return;
    onPropaganda();
  }, [state.funds, onPropaganda]);

  return (
    <div className="space-y-4 p-3 pb-24 animate-slide-up">
      <div className={`rounded-2xl p-4 border transition-colors ${
        electionSoon ? 'bg-error-950/30 border-error-700 animate-pulse-glow' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Icons.Vote className="w-5 h-5 text-accent-400" />
          <h2 className="text-lg font-bold text-white">{t('electionCycle', lang)}</h2>
        </div>
        <p className="text-xs text-slate-400 mb-3">{t('electionInfo', lang)}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">
            {t('electionIn', lang)} <span className={`font-bold ${electionSoon ? 'text-error-400' : 'text-white'}`}>{turnsLeft}</span> {t('turns', lang)}
          </span>
          {electionSoon && (
            <span className="text-xs font-bold text-error-400 flex items-center gap-1">
              <Icons.AlertTriangle className="w-4 h-4" />
              {t('electionSoon', lang)}
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">{t('approvalRating', lang)} vs {t('oppositionSupport', lang)}</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-primary-400 font-semibold">{t('approval', lang)}</span>
              <span className="text-white font-bold">{formatPercent(state.approval)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${state.approval}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-orange-400 font-semibold">{t('opposition', lang)}</span>
              <span className="text-white font-bold">{formatPercent(state.opposition)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-orange-600 rounded-full transition-all duration-500" style={{ width: `${state.opposition}%` }} />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white px-1 pt-1">{t('campaignActions', lang)}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleRally}
          disabled={state.funds < 10}
          className={`bg-slate-900 rounded-2xl p-4 border text-left transition-all active:scale-[0.98] ${
            state.funds < 10 ? 'border-slate-800 opacity-50' : 'border-slate-800 hover:border-primary-500'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icons.Megaphone className="w-5 h-5 text-primary-400" />
            <h3 className="font-bold text-white text-sm">{t('rally', lang)}</h3>
          </div>
          <p className="text-xs text-slate-400">{t('rallyDesc', lang)}</p>
        </button>

        <button
          onClick={handlePropaganda}
          disabled={state.funds < 5}
          className={`bg-slate-900 rounded-2xl p-4 border text-left transition-all active:scale-[0.98] ${
            state.funds < 5 ? 'border-slate-800 opacity-50' : 'border-slate-800 hover:border-accent-500'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icons.Newspaper className="w-5 h-5 text-accent-400" />
            <h3 className="font-bold text-white text-sm">{t('propaganda', lang)}</h3>
          </div>
          <p className="text-xs text-slate-400">{t('propagandaDesc', lang)}</p>
        </button>
      </div>
    </div>
  );
}

export const PoliticsView = memo(PoliticsViewInner);
