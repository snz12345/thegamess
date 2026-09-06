import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, GameEvent } from '@/game/types';
import { t } from '@/game/i18n';

interface Props {
  lang: Lang;
  event: GameEvent;
  onChoose: (optionIndex: number) => void;
}

function EventModalInner({ lang, event, onChoose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 max-w-sm w-full p-6 rounded-2xl space-y-4 animate-slide-up">
        <div className="flex items-center gap-2 text-accent-400">
          <Icons.Zap className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wide">{t('event_title', lang)}</span>
        </div>

        <h3 className="text-lg font-bold text-white">{t(event.titleKey as never, lang)}</h3>
        <p className="text-sm text-slate-400">{t(event.descKey as never, lang)}</p>

        <div className="space-y-2 pt-1">
          <p className="text-xs text-slate-500 font-semibold">{t('choose_response', lang)}</p>
          {event.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onChoose(i)}
              className="w-full px-4 py-3 bg-slate-800 hover:bg-primary-600 text-slate-200 hover:text-white text-sm font-semibold rounded-xl transition-all text-left active:scale-[0.98] flex items-center justify-between group"
            >
              <span>{t(option.labelKey as never, lang)}</span>
              <Icons.ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const EventModal = memo(EventModalInner);
