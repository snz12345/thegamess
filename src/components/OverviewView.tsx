import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, CountryPreset } from '@/game/types';
import { t } from '@/game/i18n';
import { formatPercent } from '@/game/utils';
import { ELECTION_INTERVAL } from '@/game/data';

interface Props {
  lang: Lang;
  state: GameState;
  country: CountryPreset;
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{formatPercent(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function OverviewViewInner({ lang, state, country }: Props) {
  const turnsLeft = ELECTION_INTERVAL - state.electionTimer;

  return (
    <div className="space-y-4 p-3 pb-24 animate-slide-up">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icons.BarChart3 className="w-5 h-5 text-primary-400" />
          {t('overview', lang)}
        </h2>
        <div className="space-y-3">
          <MetricBar label={t('approval', lang)} value={state.approval} color="bg-primary-500" />
          <MetricBar label={t('stability', lang)} value={state.stability} color="bg-accent-500" />
          <MetricBar label={t('inflation', lang)} value={state.inflation} color="bg-error-500" />
          <MetricBar label={t('military', lang)} value={state.military} color="bg-red-600" />
          <MetricBar label={t('infrastructure', lang)} value={state.infrastructure} color="bg-primary-400" />
          <MetricBar label={t('softPower', lang)} value={state.softPower} color="bg-teal-500" />
          <MetricBar label={t('opposition', lang)} value={state.opposition} color="bg-orange-600" />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Icons.ScrollText className="w-5 h-5 text-accent-400" />
          {t('eventLog', lang)}
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {state.log.length === 0 ? (
            <p className="text-sm text-slate-500">{t('noEvents', lang)}</p>
          ) : (
            state.log.slice().reverse().map((entry, i) => (
              <div key={i} className="text-xs text-slate-300 flex gap-2">
                <span className="text-slate-500 shrink-0">T{entry.turn}</span>
                <span>{entry.text[lang]}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export const OverviewView = memo(OverviewViewInner);
