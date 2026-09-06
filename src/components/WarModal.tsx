import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, Region } from '@/game/types';
import { t } from '@/game/i18n';

interface Props {
  lang: Lang;
  playerPower: number;
  region: Region;
  onAttack: () => void;
  onRetreat: () => void;
}

function WarModalInner({ lang, playerPower, region, onAttack, onRetreat }: Props) {
  const enemyPower = region.enemyPower;
  const winChance = Math.min(95, Math.max(5, Math.round((playerPower / (playerPower + enemyPower)) * 100)));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 max-w-sm w-full p-6 rounded-2xl space-y-5 text-center relative animate-slide-up">
        <button onClick={onRetreat} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <Icons.X className="w-5 h-5" />
        </button>

        <div className="p-3 bg-error-500/10 border border-error-500/20 rounded-full w-fit mx-auto">
          <Icons.Swords className="w-8 h-8 text-error-400" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">{t('military_operation', lang)}</h3>
          <p className="text-xs text-slate-400 mt-1">{region.name[lang]} — {t('target_region', lang)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">{t('our_power', lang)}</span>
            <span className="text-success-400 font-bold text-base">{Math.round(playerPower)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">{t('enemy_power', lang)}</span>
            <span className="text-error-400 font-bold text-base">{enemyPower}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">{t('win_chance', lang)}:</span>
            <span className={winChance >= 50 ? 'text-success-400' : 'text-error-400'}>%{winChance}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${winChance >= 50 ? 'bg-success-500' : 'bg-error-500'}`}
              style={{ width: `${winChance}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onRetreat}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            {t('withdraw', lang)}
          </button>
          <button
            onClick={onAttack}
            className="py-2.5 bg-error-600 hover:bg-error-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-error-600/20 active:scale-95"
          >
            {t('launch_attack', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export const WarModal = memo(WarModalInner);
