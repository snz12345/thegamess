import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { Lang, ViewName } from '@/game/types';
import { t } from '@/game/i18n';

interface Props {
  lang: Lang;
  view: ViewName;
  onViewChange: (v: ViewName) => void;
}

const VIEWS: { id: ViewName; icon: keyof typeof Icons; label: 'overview' | 'economy' | 'militaryView' | 'diplomacy' | 'politics' | 'mapView' | 'pactsView' | 'marketView' }[] = [
  { id: 'overview', icon: 'LayoutDashboard', label: 'overview' },
  { id: 'economy', icon: 'Building2', label: 'economy' },
  { id: 'military', icon: 'Swords', label: 'militaryView' },
  { id: 'map', icon: 'Map', label: 'mapView' },
  { id: 'market', icon: 'ShoppingCart', label: 'marketView' },
  { id: 'diplomacy', icon: 'Globe', label: 'diplomacy' },
  { id: 'pacts', icon: 'Landmark', label: 'pactsView' },
  { id: 'politics', icon: 'Vote', label: 'politics' },
];

function BottomNavInner({ lang, view, onViewChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-bottom">
      <div className="flex justify-around items-center px-2 py-1.5 max-w-2xl mx-auto">
        {VIEWS.map((v) => {
          const Icon = Icons[v.icon] as React.ComponentType<{ className?: string }>;
          const isActive = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all ${
                isActive ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] font-semibold">{t(v.label, lang)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const BottomNav = memo(BottomNavInner);
