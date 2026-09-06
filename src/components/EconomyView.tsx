import { memo, useCallback, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, Infrastructure, ResourceId, ProcessedGoodId } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney } from '@/game/utils';
import {
  INFRA_PRESETS,
  RESOURCE_IDS,
  RESOURCE_NAMES,
  RESOURCE_ICONS,
  PROCESSED_GOOD_NAMES,
  PROCESSED_GOOD_ICONS,
  FACTORY_DEFS,
} from '@/game/data';

interface Props {
  lang: Lang;
  state: GameState;
  onBuild: (infra: Infrastructure) => void;
}

type Tab = 'infrastructure' | 'resources';

function ResourceStockpileCard({
  resourceId,
  state,
  lang,
}: {
  resourceId: ResourceId;
  state: GameState;
  lang: Lang;
}) {
  const res = state.resources[resourceId];
  const pct = Math.min(100, (res.stockpile / res.storageCap) * 100);
  const netFlow = res.monthlyProduction - res.monthlyConsumption;

  return (
    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{RESOURCE_ICONS[resourceId]}</span>
          <span className="text-xs font-bold text-white">{RESOURCE_NAMES[resourceId][lang]}</span>
        </div>
        <span className={`text-[10px] font-bold ${netFlow > 0 ? 'text-success-400' : netFlow < 0 ? 'text-error-400' : 'text-slate-500'}`}>
          {netFlow > 0 ? '+' : ''}{netFlow.toFixed(1)}{t('per_month', lang)}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
        <span>{t('stockpile', lang)}: <span className="text-slate-300 font-bold">{res.stockpile.toFixed(0)}</span> / {res.storageCap}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-success-500' : pct > 40 ? 'bg-primary-500' : 'bg-accent-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProcessedStockpileCard({
  goodId,
  state,
  lang,
}: {
  goodId: ProcessedGoodId;
  state: GameState;
  lang: Lang;
}) {
  const good = state.processedGoods[goodId];
  const pct = Math.min(100, (good.stockpile / good.storageCap) * 100);

  return (
    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{PROCESSED_GOOD_ICONS[goodId]}</span>
          <span className="text-xs font-bold text-white">{PROCESSED_GOOD_NAMES[goodId][lang]}</span>
        </div>
        <span className={`text-[10px] font-bold ${good.monthlyProduction > 0 ? 'text-success-400' : 'text-slate-500'}`}>
          +{good.monthlyProduction.toFixed(1)}{t('per_month', lang)}
        </span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
        <span>{t('stockpile', lang)}: <span className="text-slate-300 font-bold">{good.stockpile.toFixed(0)}</span> / {good.storageCap}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EconomyViewInner({ lang, state, onBuild }: Props) {
  const [tab, setTab] = useState<Tab>('infrastructure');

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

      <div className="flex gap-1 bg-slate-900 rounded-xl p-1 border border-slate-800">
        <button
          onClick={() => setTab('infrastructure')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'infrastructure'
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icons.Building2 className="w-4 h-4" />
          {t('tab_infrastructure', lang)}
        </button>
        <button
          onClick={() => setTab('resources')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === 'resources'
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icons.Boxes className="w-4 h-4" />
          {t('tab_resources', lang)}
        </button>
      </div>

      {tab === 'infrastructure' && (
        <>
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
        </>
      )}

      {tab === 'resources' && (
        <>
          <div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Icons.Boxes className="w-5 h-5 text-primary-400" />
              {t('raw_materials', lang)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESOURCE_IDS.map((id) => (
                <ResourceStockpileCard key={id} resourceId={id} state={state} lang={lang} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Icons.Cpu className="w-4 h-4 text-accent-400" />
              {t('processed_goods', lang)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(PROCESSED_GOOD_NAMES) as ProcessedGoodId[]).map((id) => (
                <ProcessedStockpileCard key={id} goodId={id} state={state} lang={lang} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Icons.Factory className="w-4 h-4 text-accent-400" />
              {t('factory_summary', lang)}
            </h3>
            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
              {FACTORY_DEFS.map((f) => {
                const owned = state.factories.find((fac) => fac.id === f.id)?.count ?? 0;
                const isResource = f.output in RESOURCE_NAMES;
                const outputName = isResource
                  ? RESOURCE_NAMES[f.output as ResourceId][lang]
                  : PROCESSED_GOOD_NAMES[f.output as ProcessedGoodId][lang];
                const outputIcon = isResource
                  ? RESOURCE_ICONS[f.output as ResourceId]
                  : PROCESSED_GOOD_ICONS[f.output as ProcessedGoodId];
                return (
                  <div key={f.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${f.type === 'extraction' ? 'bg-primary-500' : 'bg-accent-500'}`} />
                      <span className="text-slate-300 font-semibold">{f.name[lang]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {f.id === 'defense_complex' ? (
                        <span className="text-slate-500 text-[10px]">⚔️ {t('militaryPower', lang)}</span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">{outputIcon} {outputName}</span>
                      )}
                      <span className={`font-bold ${owned > 0 ? 'text-success-400' : 'text-slate-600'}`}>×{owned}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export const EconomyView = memo(EconomyViewInner);
