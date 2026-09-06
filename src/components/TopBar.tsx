import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, CountryPreset } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney, formatPercent } from '@/game/utils';

interface Props {
  lang: Lang;
  state: GameState;
  country: CountryPreset;
  onNextTurn: () => void;
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 whitespace-nowrap">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-slate-400">{label}</span>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

function TopBarInner({ lang, state, country, onNextTurn }: Props) {
  return (
    <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 safe-top">
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700 shrink-0">
          <span className="text-2xl">{country.flag}</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-white">{country.name[lang]}</span>
            <span className="text-[10px] text-slate-400">{t('turn', lang)} {state.turn}</span>
          </div>
        </div>

        <StatPill icon={Icons.DollarSign} label={t('funds', lang)} value={formatMoney(state.funds)} color="text-success-400" />
        <StatPill icon={Icons.ThumbsUp} label={t('approval', lang)} value={formatPercent(state.approval)} color="text-primary-400" />
        <StatPill icon={Icons.Shield} label={t('stability', lang)} value={formatPercent(state.stability)} color="text-accent-400" />
        <StatPill icon={Icons.TrendingUp} label={t('inflation', lang)} value={formatPercent(state.inflation)} color="text-error-400" />
        <StatPill icon={Icons.Swords} label={t('military', lang)} value={formatPercent(state.military)} color="text-error-500" />
        <StatPill icon={Icons.Building2} label={t('infrastructure', lang)} value={formatPercent(state.infrastructure)} color="text-primary-300" />

        <div className="ml-auto shrink-0 pl-2">
          <button
            onClick={onNextTurn}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            {t('nextTurn', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export const TopBar = memo(TopBarInner);
