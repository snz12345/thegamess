import { memo, useCallback, useMemo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, Infrastructure } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney } from '@/game/utils';
import { INFRA_PRESETS } from '@/game/data';

interface Props {
  lang: Lang;
  state: GameState;
  onBuild: (infra: Infrastructure) => void;
}

function EconomyViewInner({ lang, state, onBuild }: Props) {
  const income = useMemo(() => {
    let total = 0;
    state.infrastructures.forEach((i) => {
      if (i.id === 'factory') total += 12 * i.count;
      if (i.id === 'defense') total -= 2 * i.count;
    });
    state.foreign.forEach((f) => {
      if (f.tradeDeal) total += 20;
    });
    if (state.countryId === 'br') total += 10;
    return total;
  }, [state.infrastructures, state.foreign, state.countryId]);

  const expenses = useMemo(() => {
    let total = 0;
    state.infrastructures.forEach((i) => {
      if (i.id === 'defense') total += 2 * i.count;
    });
    return total;
  }, [state.infrastructures]);

  const handleBuild = useCallback((id: string) => {
    const preset = INFRA_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const existing = state.infrastructures.find((i) => i.id === id);
    if (state.funds < preset.cost) return;
    onBuild({ ...preset, count: existing ? existing.count + 1 : 1 });
  }, [state.funds, state.infrastructures, onBuild]);

  return (
    <div className="space-y-4 p-3 pb-24 animate-slide-up">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
          <Icons.TrendingUp className="w-5 h-5 text-success-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">{t('monthlyIncome', lang)}</p>
          <p className="text-sm font-bold text-success-400">+{formatMoney(income)}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
          <Icons.TrendingDown className="w-5 h-5 text-error-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">{t('monthlyExpenses', lang)}</p>
          <p className="text-sm font-bold text-error-400">-{formatMoney(expenses)}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
          <Icons.Wallet className="w-5 h-5 text-primary-400 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">{t('netIncome', lang)}</p>
          <p className={`text-sm font-bold ${income - expenses >= 0 ? 'text-success-400' : 'text-error-400'}`}>
            {income - expenses >= 0 ? '+' : ''}{formatMoney(income - expenses)}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white px-1">{t('buildInfrastructure', lang)}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INFRA_PRESETS.map((preset) => {
          const owned = state.infrastructures.find((i) => i.id === preset.id)?.count ?? 0;
          const canAfford = state.funds >= preset.cost;
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[preset.icon] ?? Icons.Building2;

          return (
            <div
              key={preset.id}
              className="bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-950/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm">{preset.name[lang]}</h3>
                  <p className="text-xs text-slate-400">{preset.desc[lang]}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent-400">{formatMoney(preset.cost)}</span>
                  <span className="text-xs text-slate-500">• {t('owned', lang)}: {owned}</span>
                </div>
                <button
                  onClick={() => handleBuild(preset.id)}
                  disabled={!canAfford}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    canAfford
                      ? 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? t('build', lang) : t('cantAfford', lang)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const EconomyView = memo(EconomyViewInner);
