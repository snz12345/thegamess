import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, MilitaryBranchId } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney, formatPercent } from '@/game/utils';

interface Props {
  lang: Lang;
  state: GameState;
  onRecruit: (branchId: MilitaryBranchId) => void;
  onUpgrade: (branchId: MilitaryBranchId) => void;
  onBorderOps: () => void;
  onPeacekeeping: () => void;
}

const BRANCH_ICONS: Record<MilitaryBranchId, keyof typeof Icons> = {
  land: 'Shield',
  air: 'Plane',
  naval: 'Ship',
};

function MilitaryViewInner({ lang, state, onRecruit, onUpgrade, onBorderOps, onPeacekeeping }: Props) {
  const recruitCost = 15;
  const upgradeCost = 60;

  const handleRecruit = useCallback((id: MilitaryBranchId) => {
    if (state.funds < recruitCost) return;
    onRecruit(id);
  }, [state.funds, onRecruit]);

  const handleUpgrade = useCallback((id: MilitaryBranchId) => {
    if (state.funds < upgradeCost) return;
    onUpgrade(id);
  }, [state.funds, onUpgrade]);

  return (
    <div className="space-y-4 p-3 pb-24 animate-slide-up">
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Icons.Swords className="w-5 h-5 text-error-400" />
            {t('militaryPower', lang)}
          </h2>
          <span className="text-2xl font-bold text-error-400">{formatPercent(state.military)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {state.branches.map((branch) => {
          const IconName = BRANCH_ICONS[branch.id];
          const Icon = Icons[IconName] as React.ComponentType<{ className?: string }>;
          const canRecruit = state.funds >= recruitCost;
          const canUpgrade = state.funds >= upgradeCost && branch.tier < branch.maxTier;

          return (
            <div key={branch.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-error-950/40 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-error-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">{branch.name[lang]}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{t('tier', lang)}: <span className="text-accent-400 font-bold">{branch.tier}/{branch.maxTier}</span></span>
                    <span>{t('units', lang)}: <span className="text-white font-bold">{branch.units}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRecruit(branch.id)}
                  disabled={!canRecruit}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    canRecruit ? 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {t('recruit', lang)} ({formatMoney(recruitCost)})
                </button>
                <button
                  onClick={() => handleUpgrade(branch.id)}
                  disabled={!canUpgrade}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    canUpgrade ? 'bg-accent-600 text-white hover:bg-accent-500 active:scale-95' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {t('upgrade', lang)} ({formatMoney(upgradeCost)})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-bold text-white px-1 pt-2">{t('strategicActions', lang)}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onBorderOps}
          className="bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-error-500 transition-colors text-left active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Icons.Crosshair className="w-5 h-5 text-error-400" />
            <h3 className="font-bold text-white text-sm">{t('borderOps', lang)}</h3>
          </div>
          <p className="text-xs text-slate-400">{t('borderOpsDesc', lang)}</p>
        </button>
        <button
          onClick={onPeacekeeping}
          className="bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-primary-500 transition-colors text-left active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 mb-1">
            <Icons.ShieldPlus className="w-5 h-5 text-primary-400" />
            <h3 className="font-bold text-white text-sm">{t('peacekeeping', lang)}</h3>
          </div>
          <p className="text-xs text-slate-400">{t('peacekeepingDesc', lang)}</p>
        </button>
      </div>
    </div>
  );
}

export const MilitaryView = memo(MilitaryViewInner);
