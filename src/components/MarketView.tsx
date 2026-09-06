import { memo, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, ResourceId, TradeOrderType } from '@/game/types';
import { t } from '@/game/i18n';
import {
  RESOURCE_IDS, RESOURCE_NAMES, RESOURCE_ICONS, BASE_PRICES,
  PROCESSED_GOOD_NAMES, PROCESSED_GOOD_ICONS, FACTORY_DEFS,
} from '@/game/data';
import { uid } from '@/game/utils';

interface Props {
  lang: Lang;
  state: GameState;
  onBuildFactory: (factoryId: string) => void;
  onAddTradeOrder: (resourceId: ResourceId, type: TradeOrderType, amount: number) => void;
  onRemoveTradeOrder: (orderId: string) => void;
}

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0.5) return <Icons.TrendingUp className="w-3.5 h-3.5 text-success-400" />;
  if (trend < -0.5) return <Icons.TrendingDown className="w-3.5 h-3.5 text-error-400" />;
  return <Icons.Minus className="w-3.5 h-3.5 text-slate-500" />;
}

function ResourceCard({
  resourceId,
  state,
  lang,
}: {
  resourceId: ResourceId;
  state: GameState;
  lang: Lang;
}) {
  const res = state.resources[resourceId];
  const price = state.marketPrices[resourceId];
  const pct = Math.min(100, (res.stockpile / res.storageCap) * 100);
  const netFlow = res.monthlyProduction - res.monthlyConsumption;
  const isStalled = res.monthlyProduction > 0 && res.monthlyConsumption >= res.monthlyProduction;

  return (
    <div className={`bg-slate-900 rounded-xl p-3 border ${isStalled ? 'border-error-500/40' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{RESOURCE_ICONS[resourceId]}</span>
          <span className="text-xs font-bold text-white">{RESOURCE_NAMES[resourceId][lang]}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">${price.price.toFixed(1)}</span>
          <TrendIcon trend={price.trend} />
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
        <span>{t('stockpile', lang)}: <span className="text-slate-300 font-bold">{res.stockpile.toFixed(0)}</span> / {res.storageCap}</span>
        <span className={netFlow > 0 ? 'text-success-400' : netFlow < 0 ? 'text-error-400' : 'text-slate-500'}>
          {netFlow > 0 ? '+' : ''}{netFlow.toFixed(1)} {t('per_month', lang)}
        </span>
      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-success-500' : pct > 40 ? 'bg-primary-500' : 'bg-accent-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isStalled && (
        <p className="text-[10px] text-error-400 mt-1 flex items-center gap-1">
          <Icons.AlertTriangle className="w-2.5 h-2.5" />
          {t('production_stalled', lang)}
        </p>
      )}
    </div>
  );
}

function ProcessedGoodCard({
  goodId,
  state,
  lang,
}: {
  goodId: keyof typeof PROCESSED_GOOD_NAMES;
  state: GameState;
  lang: Lang;
}) {
  const good = state.processedGoods[goodId];
  const pct = Math.min(100, (good.stockpile / good.storageCap) * 100);

  return (
    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{PROCESSED_GOOD_ICONS[goodId]}</span>
        <span className="text-xs font-bold text-white">{PROCESSED_GOOD_NAMES[goodId][lang]}</span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
        <span>{t('stockpile', lang)}: <span className="text-slate-300 font-bold">{good.stockpile.toFixed(0)}</span> / {good.storageCap}</span>
        <span className={good.monthlyProduction > 0 ? 'text-success-400' : 'text-slate-500'}>
          +{good.monthlyProduction.toFixed(1)} {t('per_month', lang)}
        </span>
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

function FactoryCard({
  factoryDef,
  count,
  funds,
  lang,
  onBuild,
}: {
  factoryDef: typeof FACTORY_DEFS[0];
  count: number;
  funds: number;
  lang: Lang;
  onBuild: () => void;
}) {
  const canAfford = funds >= factoryDef.cost;
  const outputName = factoryDef.output in RESOURCE_NAMES
    ? RESOURCE_NAMES[factoryDef.output as ResourceId][lang]
    : PROCESSED_GOOD_NAMES[factoryDef.output as keyof typeof PROCESSED_GOOD_NAMES][lang];

  return (
    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <h4 className="text-xs font-bold text-white">{factoryDef.name[lang]}</h4>
          <span className="text-[10px] text-slate-500">{t('factory_owned', lang)}: {count}</span>
        </div>
        <button
          onClick={onBuild}
          disabled={!canAfford}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all active:scale-95 ${
            canAfford
              ? 'bg-primary-600 text-white hover:bg-primary-500'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          ${factoryDef.cost}M
        </button>
      </div>

      <div className="text-[10px] text-slate-400 space-y-0.5">
        <div className="flex items-center gap-1">
          <Icons.PackagePlus className="w-2.5 h-2.5 text-success-400" />
          {t('output', lang)}: +{factoryDef.outputAmount} {outputName} {t('per_month', lang)}
        </div>
        {factoryDef.inputs && factoryDef.inputs.map((inp) => {
          const inpName = inp.resource in RESOURCE_NAMES
            ? RESOURCE_NAMES[inp.resource as ResourceId][lang]
            : PROCESSED_GOOD_NAMES[inp.resource as keyof typeof PROCESSED_GOOD_NAMES][lang];
          return (
            <div key={inp.resource} className="flex items-center gap-1">
              <Icons.PackageMinus className="w-2.5 h-2.5 text-error-400" />
              -{inp.amount} {inpName} {t('per_month', lang)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketViewInner({ lang, state, onBuildFactory, onAddTradeOrder, onRemoveTradeOrder }: Props) {
  const [orderResource, setOrderResource] = useState<ResourceId>('oil');
  const [orderType, setOrderType] = useState<TradeOrderType>('buy');
  const [orderAmount, setOrderAmount] = useState(5);

  const handleAddOrder = useCallback(() => {
    onAddTradeOrder(orderResource, orderType, orderAmount);
  }, [orderResource, orderType, orderAmount, onAddTradeOrder]);

  return (
    <div className="space-y-5 p-3 pb-24 animate-slide-up">
      {/* Trade Balance */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.Scale className="w-4 h-4 text-accent-400" />
          {t('trade_balance', lang)}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {state.tradeBalance >= 0 ? t('trade_surplus', lang) : t('trade_deficit', lang)}
          </span>
          <span className={`text-lg font-bold ${state.tradeBalance >= 0 ? 'text-success-400' : 'text-error-400'}`}>
            {state.tradeBalance >= 0 ? '+' : ''}${state.tradeBalance.toFixed(1)}M {t('per_month', lang)}
          </span>
        </div>
      </div>

      {/* Resource Dashboard */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Icons.Boxes className="w-5 h-5 text-primary-400" />
          {t('resource_dashboard', lang)}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RESOURCE_IDS.map((id) => (
            <ResourceCard key={id} resourceId={id} state={state} lang={lang} />
          ))}
        </div>
      </div>

      {/* Processed Goods */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.Cpu className="w-4 h-4 text-accent-400" />
          {t('processed_goods', lang)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PROCESSED_GOOD_NAMES) as (keyof typeof PROCESSED_GOOD_NAMES)[]).map((id) => (
            <ProcessedGoodCard key={id} goodId={id} state={state} lang={lang} />
          ))}
        </div>
      </div>

      {/* Global Prices */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.DollarSign className="w-4 h-4 text-success-400" />
          {t('global_prices', lang)}
        </h3>
        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RESOURCE_IDS.map((id) => {
              const price = state.marketPrices[id];
              return (
                <div key={id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{RESOURCE_ICONS[id]}</span>
                  <span className="text-white font-bold">${price.price.toFixed(1)}</span>
                  <TrendIcon trend={price.trend} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Import / Export */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.ArrowLeftRight className="w-4 h-4 text-primary-400" />
          {t('import_export', lang)}
        </h3>

        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 mb-3">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={orderResource}
              onChange={(e) => setOrderResource(e.target.value as ResourceId)}
              className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 border border-slate-700"
            >
              {RESOURCE_IDS.map((id) => (
                <option key={id} value={id}>{RESOURCE_ICONS[id]} {RESOURCE_NAMES[id][lang]}</option>
              ))}
            </select>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as TradeOrderType)}
              className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 border border-slate-700"
            >
              <option value="buy">{t('buy_order', lang)}</option>
              <option value="sell">{t('sell_order', lang)}</option>
            </select>
            <input
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 border border-slate-700 w-16"
            />
            <button
              onClick={handleAddOrder}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 ${
                orderType === 'buy'
                  ? 'bg-success-600 text-white hover:bg-success-500'
                  : 'bg-primary-600 text-white hover:bg-primary-500'
              }`}
            >
              {orderType === 'buy' ? t('add_buy', lang) : t('add_sell', lang)}
            </button>
          </div>
        </div>

        {/* Active Orders */}
        <div className="space-y-2">
          {state.tradeOrders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3">{t('no_orders', lang)}</p>
          ) : (
            state.tradeOrders.map((order) => {
              const price = state.marketPrices[order.resourceId].price;
              const totalCost = order.amount * price;
              return (
                <div key={order.id} className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{RESOURCE_ICONS[order.resourceId]}</span>
                    <div>
                      <span className={`text-xs font-bold ${order.type === 'buy' ? 'text-success-400' : 'text-primary-400'}`}>
                        {order.type === 'buy' ? t('buy_order', lang) : t('sell_order', lang)}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {order.amount}x {RESOURCE_NAMES[order.resourceId][lang]} @ ${price.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-bold">
                      {order.type === 'buy' ? '-' : '+'}${totalCost.toFixed(1)}M
                    </span>
                    <button
                      onClick={() => onRemoveTradeOrder(order.id)}
                      className="text-slate-500 hover:text-error-400 transition-colors"
                    >
                      <Icons.Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Factories */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Icons.Factory className="w-4 h-4 text-accent-400" />
          {t('factories', lang)}
        </h3>

        {/* Extraction */}
        <p className="text-xs text-slate-500 mb-1.5">{t('extraction_buildings', lang)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {FACTORY_DEFS.filter((f) => f.type === 'extraction').map((f) => {
            const owned = state.factories.find((fac) => fac.id === f.id)?.count ?? 0;
            return (
              <FactoryCard
                key={f.id}
                factoryDef={f}
                count={owned}
                funds={state.funds}
                lang={lang}
                onBuild={() => onBuildFactory(f.id)}
              />
            );
          })}
        </div>

        {/* Processing */}
        <p className="text-xs text-slate-500 mb-1.5">{t('processing_factories', lang)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FACTORY_DEFS.filter((f) => f.type === 'processing').map((f) => {
            const owned = state.factories.find((fac) => fac.id === f.id)?.count ?? 0;
            return (
              <FactoryCard
                key={f.id}
                factoryDef={f}
                count={owned}
                funds={state.funds}
                lang={lang}
                onBuild={() => onBuildFactory(f.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const MarketView = memo(MarketViewInner);
