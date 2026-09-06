import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, RelationStatus } from '@/game/types';
import { t } from '@/game/i18n';
import { formatMoney } from '@/game/utils';

interface Props {
  lang: Lang;
  state: GameState;
  onAction: (nationId: string, action: 'trade' | 'humanitarian' | 'alliance' | 'sanction') => void;
}

const RELATION_COLORS: Record<RelationStatus, string> = {
  allied: 'text-success-400 bg-success-950/40',
  friendly: 'text-primary-400 bg-primary-950/40',
  neutral: 'text-slate-400 bg-slate-800',
  hostile: 'text-error-400 bg-error-950/40',
};

function DiplomacyViewInner({ lang, state, onAction }: Props) {
  const handleAction = useCallback((nationId: string, action: 'trade' | 'humanitarian' | 'alliance' | 'sanction') => {
    onAction(nationId, action);
  }, [onAction]);

  return (
    <div className="space-y-3 p-3 pb-24 animate-slide-up">
      <h2 className="text-lg font-bold text-white px-1 flex items-center gap-2">
        <Icons.Globe className="w-5 h-5 text-primary-400" />
        {t('foreignRelations', lang)}
      </h2>

      {state.foreign.map((nation) => (
        <div key={nation.id} className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nation.flag}</span>
              <h3 className="font-bold text-white text-sm">{nation.name[lang]}</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${RELATION_COLORS[nation.relation]}`}>
              {t(nation.relation, lang)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction(nation.id, 'trade')}
              disabled={nation.tradeDeal || nation.sanction}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg text-xs transition-all ${
                nation.tradeDeal
                  ? 'bg-success-950/40 text-success-400 cursor-default'
                  : nation.sanction
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Icons.Handshake className="w-3.5 h-3.5" />
                {nation.tradeDeal ? `✓ ${t('active', lang)}` : t('tradeDeal', lang)}
              </span>
              <span className="text-slate-400">{t('tradeDealDesc', lang)}</span>
            </button>

            <button
              onClick={() => handleAction(nation.id, 'humanitarian')}
              disabled={state.funds < 15 || nation.sanction}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg text-xs transition-all ${
                state.funds < 15 || nation.sanction
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Icons.HeartHandshake className="w-3.5 h-3.5" />
                {t('humanitarian', lang)}
              </span>
              <span className="text-slate-400">{t('humanitarianDesc', lang)}</span>
            </button>

            <button
              onClick={() => handleAction(nation.id, 'alliance')}
              disabled={nation.relation === 'allied' || nation.sanction}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg text-xs transition-all ${
                nation.relation === 'allied'
                  ? 'bg-success-950/40 text-success-400 cursor-default'
                  : nation.sanction
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Icons.ShieldCheck className="w-3.5 h-3.5" />
                {nation.relation === 'allied' ? `✓ ${t('allied', lang)}` : t('militaryAlliance', lang)}
              </span>
              <span className="text-slate-400">{t('militaryAllianceDesc', lang)}</span>
            </button>

            <button
              onClick={() => handleAction(nation.id, 'sanction')}
              disabled={nation.sanction || nation.relation === 'allied'}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg text-xs transition-all ${
                nation.sanction
                  ? 'bg-error-950/40 text-error-400 cursor-default'
                  : nation.relation === 'allied'
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-200 hover:bg-error-900/40 active:scale-95'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                <Icons.Ban className="w-3.5 h-3.5" />
                {nation.sanction ? `✓ ${t('active', lang)}` : t('sanctions', lang)}
              </span>
              <span className="text-slate-400">{t('sanctionsDesc', lang)}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export const DiplomacyView = memo(DiplomacyViewInner);
