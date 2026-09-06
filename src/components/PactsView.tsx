import { memo, useCallback } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameState, Pact, UNResolution, UNVote } from '@/game/types';
import { t } from '@/game/i18n';
import { FOREIGN_PRESETS } from '@/game/data';

interface Props {
  lang: Lang;
  state: GameState;
  onJoinPact: (pactId: string) => void;
  onLeavePact: () => void;
  onFoundPact: (type: 'military' | 'economic') => void;
  onVote: (resolutionId: string, vote: UNVote) => void;
}

const PACT_TYPE_COLORS: Record<string, string> = {
  military: 'border-error-500/40 bg-error-950/30',
  economic: 'border-success-500/40 bg-success-950/30',
};

function nationName(id: string, lang: Lang): string {
  const f = FOREIGN_PRESETS.find((n) => n.id === id);
  return f ? `${f.flag} ${f.name[lang]}` : id;
}

function nationFlag(id: string): string {
  const f = FOREIGN_PRESETS.find((n) => n.id === id);
  return f ? f.flag : '🏳️';
}

function ResolutionCard({
  resolution,
  lang,
  onVote,
}: {
  resolution: UNResolution;
  lang: Lang;
  onVote: (id: string, vote: UNVote) => void;
}) {
  const targetName = resolution.targetNationId === 'all'
    ? t('all_nations', lang)
    : nationName(resolution.targetNationId, lang);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">{t(resolution.titleKey as never, lang)}</h3>
          <p className="text-xs text-slate-400 mt-1">{t(resolution.descKey as never, lang)}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
          {resolution.resolved ? (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${resolution.passed ? 'bg-success-950/40 text-success-400' : 'bg-error-950/40 text-error-400'}`}>
              {resolution.passed ? t('resolution_passed', lang) : t('resolution_failed', lang)}
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              {t('voting_in', lang)} {resolution.turnsLeft} {t('turns', lang)}
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">
        {t('target_nation', lang)}: <span className="text-slate-300 font-semibold">{targetName}</span>
      </div>

      {!resolution.resolved && (
        <div className="flex gap-2">
          {(['yes', 'no', 'abstain'] as UNVote[]).map((v) => {
            const isVoted = resolution.playerVote === v;
            const colors: Record<UNVote, string> = {
              yes: 'bg-success-600 hover:bg-success-500 text-white',
              no: 'bg-error-600 hover:bg-error-500 text-white',
              abstain: 'bg-slate-700 hover:bg-slate-600 text-white',
            };
            return (
              <button
                key={v}
                onClick={() => onVote(resolution.id, v)}
                disabled={resolution.playerVote !== null}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  isVoted ? colors[v] : resolution.playerVote !== null
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {t(`vote_${v}` as never, lang)}
              </button>
            );
          })}
        </div>
      )}

      {resolution.playerVote !== null && !resolution.resolved && (
        <p className="text-xs text-primary-400 mt-2 text-center">{t('voted', lang)}</p>
      )}
    </div>
  );
}

function PactCard({
  pact,
  lang,
  isPlayerMember,
  playerPactId,
  onJoin,
  onLeave,
  onFound,
}: {
  pact: Pact;
  lang: Lang;
  isPlayerMember: boolean;
  playerPactId: string | null;
  onJoin: (id: string) => void;
  onLeave: () => void;
  onFound: (type: 'military' | 'economic') => void;
}) {
  const isPlayerPact = playerPactId === pact.id;
  const canJoin = !isPlayerMember && playerPactId === null;

  return (
    <div className={`rounded-2xl p-4 border transition-colors ${PACT_TYPE_COLORS[pact.type] ?? 'border-slate-800 bg-slate-900'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {pact.type === 'military' ? (
            <Icons.ShieldCheck className="w-5 h-5 text-error-400" />
          ) : (
            <Icons.TrendingUp className="w-5 h-5 text-success-400" />
          )}
          <h3 className="font-bold text-white text-sm">{pact.name[lang]}</h3>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pact.type === 'military' ? 'bg-error-950/40 text-error-400' : 'bg-success-950/40 text-success-400'}`}>
          {pact.type === 'military' ? t('pact_type_military', lang) : t('pact_type_economic', lang)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {pact.members.map((m) => (
          <span key={m} className="text-lg" title={nationName(m, lang)}>
            {nationFlag(m)}
          </span>
        ))}
      </div>

      <div className="space-y-1 mb-3">
        {pact.mutualDefense && (
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Icons.Shield className="w-3.5 h-3.5 text-error-400" />
            {t('pact_defense_effect', lang)}
          </div>
        )}
        {pact.tradeBonus > 0 && (
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Icons.TrendingUp className="w-3.5 h-3.5 text-success-400" />
            {t('pact_trade_effect', lang)}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isPlayerPact ? (
          <button
            onClick={onLeave}
            className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-error-900/40 transition-all active:scale-95"
          >
            {t('leave_pact', lang)}
          </button>
        ) : canJoin ? (
          <button
            onClick={() => onJoin(pact.id)}
            className="flex-1 py-2 rounded-lg text-xs font-bold bg-primary-600 text-white hover:bg-primary-500 transition-all active:scale-95"
          >
            {t('join_pact', lang)}
          </button>
        ) : (
          <span className="flex-1 text-center py-2 text-xs text-slate-500">
            {isPlayerMember ? t('member', lang) : t('not_member', lang)}
          </span>
        )}
      </div>
    </div>
  );
}

function PactsViewInner({ lang, state, onJoinPact, onLeavePact, onFoundPact, onVote }: Props) {
  const activeResolutions = state.unResolutions.filter((r) => !r.resolved);
  const resolvedResolutions = state.unResolutions.filter((r) => r.resolved).slice(-3);
  const militaryPacts = state.pacts.filter((p) => p.type === 'military');
  const economicPacts = state.pacts.filter((p) => p.type === 'economic');
  const canFoundPact = state.playerPactId === null && state.softPower >= 40;

  const handleFoundMilitary = useCallback(() => onFoundPact('military'), [onFoundPact]);
  const handleFoundEconomic = useCallback(() => onFoundPact('economic'), [onFoundPact]);

  return (
    <div className="space-y-5 p-3 pb-24 animate-slide-up">
      {/* UN Global Council */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Icons.Globe className="w-5 h-5 text-primary-400" />
          {t('global_council', lang)}
        </h2>

        <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{t('un_resolutions', lang)}</span>
            <span className="text-xs text-slate-500">
              {t('voting_in', lang)} {state.unVoteTimer} {t('turns', lang)}
            </span>
          </div>
        </div>

        {activeResolutions.length === 0 && resolvedResolutions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">{t('no_resolutions', lang)}</p>
        ) : (
          <div className="space-y-3">
            {activeResolutions.map((r) => (
              <ResolutionCard key={r.id} resolution={r} lang={lang} onVote={onVote} />
            ))}
            {resolvedResolutions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">{t('un_resolutions', lang)} — {t('eventLog', lang)}</p>
                {resolvedResolutions.map((r) => (
                  <ResolutionCard key={r.id} resolution={r} lang={lang} onVote={() => {}} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Found New Pact */}
      {canFoundPact && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Icons.PlusCircle className="w-5 h-5 text-accent-400" />
            {t('found_pact', lang)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleFoundMilitary}
              disabled={state.funds < 100}
              className={`rounded-2xl p-4 border text-left transition-all active:scale-[0.98] ${
                state.funds < 100 ? 'border-slate-800 bg-slate-900 opacity-50' : 'border-error-500/40 bg-error-950/30 hover:border-error-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icons.ShieldPlus className="w-5 h-5 text-error-400" />
                <h3 className="font-bold text-white text-sm">{t('found_military_pact', lang)}</h3>
              </div>
              <p className="text-xs text-slate-400">{t('pact_defense_effect', lang)}</p>
            </button>
            <button
              onClick={handleFoundEconomic}
              disabled={state.funds < 80}
              className={`rounded-2xl p-4 border text-left transition-all active:scale-[0.98] ${
                state.funds < 80 ? 'border-slate-800 bg-slate-900 opacity-50' : 'border-success-500/40 bg-success-950/30 hover:border-success-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icons.TrendingUp className="w-5 h-5 text-success-400" />
                <h3 className="font-bold text-white text-sm">{t('found_economic_pact', lang)}</h3>
              </div>
              <p className="text-xs text-slate-400">{t('pact_trade_effect', lang)}</p>
            </button>
          </div>
        </div>
      )}

      {/* Military Pacts */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Icons.ShieldCheck className="w-5 h-5 text-error-400" />
          {t('military_pacts', lang)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {militaryPacts.map((p) => (
            <PactCard
              key={p.id}
              pact={p}
              lang={lang}
              isPlayerMember={p.members.includes(state.countryId)}
              playerPactId={state.playerPactId}
              onJoin={onJoinPact}
              onLeave={onLeavePact}
              onFound={onFoundPact}
            />
          ))}
        </div>
      </div>

      {/* Economic Pacts */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Icons.TrendingUp className="w-5 h-5 text-success-400" />
          {t('economic_pacts', lang)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {economicPacts.map((p) => (
            <PactCard
              key={p.id}
              pact={p}
              lang={lang}
              isPlayerMember={p.members.includes(state.countryId)}
              playerPactId={state.playerPactId}
              onJoin={onJoinPact}
              onLeave={onLeavePact}
              onFound={onFoundPact}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const PactsView = memo(PactsViewInner);
