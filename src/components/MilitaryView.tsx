import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, MilitaryBranchId } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney, formatPercent } from '@/game/utils';
import {
  RECRUIT_MATERIAL_COSTS,
  UPGRADE_MATERIAL_COSTS,
  UPGRADE_MONEY_COSTS,
  PROCESSED_GOOD_ICONS,
  RESOURCE_ICONS,
} from '@/game/data';

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

type MatCost = { steel: number; microchips: number; titanium: number };

function hasMaterials(state: GameState, cost: MatCost): boolean {
  return state.processedGoods.steel.stockpile >= cost.steel
    && state.processedGoods.microchips.stockpile >= cost.microchips
    && state.resources.titanium.stockpile >= cost.titanium;
}

function MaterialBadges({ cost, available }: { cost: MatCost; available: boolean }) {
  const parts: { icon: string; amount: number }[] = [];
  if (cost.steel > 0) parts.push({ icon: PROCESSED_GOOD_ICONS.steel, amount: cost.steel });
  if (cost.microchips > 0) parts.push({ icon: PROCESSED_GOOD_ICONS.microchips, amount: cost.microchips });
  if (cost.titanium > 0) parts.push({ icon: RESOURCE_ICONS.titanium, amount: cost.titanium });
  if (parts.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-[10px] ${available ? 'text-slate-400' : 'text-error-400'}`}>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {p.icon} {p.amount}
        </span>
      ))}
    </div>
  );
}

function MilitaryViewInner({ lang, state, onRecruit, onUpgrade, onBorderOps, onPeacekeeping }: Props) {
  const handleRecruit = useCallback((id: MilitaryBranchId) => {
    const branch = state.branches.find((b) => b.id === id);
    if (!branch) return;
    const cost = 15;
    const matCost = RECRUIT_MATERIAL_COSTS[branch.tier] ?? { steel: 0, microchips: 0, titanium: 0 };
    if (state.funds < cost || !hasMaterials(state, matCost)) return;
    onRecruit(id);
  }, [state, onRecruit]);

  const handleUpgrade = useCallback((id: MilitaryBranchId) => {
    const branch = state.branches.find((b) => b.id === id);
    if (!branch || branch.tier >= branch.maxTier) return;
    const targetTier = branch.tier + 1;
    const cost = UPGRADE_MONEY_COSTS[targetTier] ?? 60;
    const matCost = UPGRADE_MATERIAL_COSTS[targetTier] ?? { steel: 0, microchips: 0, titanium: 0 };
    if (state.funds < cost || !hasMaterials(state, matCost)) return;
    onUpgrade(id);
  }, [state, onUpgrade]);

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

          const recruitCost = 15;
          const recruitMatCost = RECRUIT_MATERIAL_COSTS[branch.tier] ?? { steel: 0, microchips: 0, titanium: 0 };
          const recruitMatAvailable = hasMaterials(state, recruitMatCost);
          const canRecruit = state.funds >= recruitCost && recruitMatAvailable;
          const recruitNeedsMats = recruitMatCost.steel > 0 || recruitMatCost.microchips > 0 || recruitMatCost.titanium > 0;

          const targetTier = branch.tier + 1;
          const upgradeCost = UPGRADE_MONEY_COSTS[targetTier] ?? 60;
          const upgradeMatCost = UPGRADE_MATERIAL_COSTS[targetTier] ?? { steel: 0, microchips: 0, titanium: 0 };
          const upgradeMatAvailable = hasMaterials(state, upgradeMatCost);
          const canUpgrade = state.funds >= upgradeCost && upgradeMatAvailable && branch.tier < branch.maxTier;
          const upgradeNeedsMats = upgradeMatCost.steel > 0 || upgradeMatCost.microchips > 0 || upgradeMatCost.titanium > 0;

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

              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => handleRecruit(branch.id)}
                    disabled={!canRecruit}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      canRecruit ? 'bg-primary-600 text-white hover:bg-primary-500 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Icons.UserPlus className="w-3.5 h-3.5" />
                    {t('recruit', lang)} ({formatMoney(recruitCost)})
                  </button>
                  {recruitNeedsMats && (
                    <div className={`flex items-center gap-1.5 mt-1 ${recruitMatAvailable ? '' : 'text-error-400'}`}>
                      {!recruitMatAvailable && <Icons.AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                      <MaterialBadges cost={recruitMatCost} available={recruitMatAvailable} />
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleUpgrade(branch.id)}
                    disabled={!canUpgrade}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      canUpgrade ? 'bg-accent-600 text-white hover:bg-accent-500 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Icons.ChevronUp className="w-3.5 h-3.5" />
                    {t('upgrade', lang)} ({formatMoney(upgradeCost)})
                  </button>
                  {upgradeNeedsMats && branch.tier < branch.maxTier && (
                    <div className={`flex items-center gap-1.5 mt-1 ${upgradeMatAvailable ? '' : 'text-error-400'}`}>
                      {!upgradeMatAvailable && <Icons.AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                      <MaterialBadges cost={upgradeMatCost} available={upgradeMatAvailable} />
                    </div>
                  )}
                </div>
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
