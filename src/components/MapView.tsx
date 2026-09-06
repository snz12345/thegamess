import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import * as Icons from 'lucide-react';
import type { Lang, GameState, ForeignNation, RelationStatus } from '@/game/types';
import { t } from '@/game/i18n';
import { NATION_ISO_MAP, FOREIGN_PRESETS } from '@/game/data';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type MapAction = 'war' | 'diplomacy' | 'trade' | 'intelligence';

interface SelectedNation {
  id: string;
  name: { tr: string; en: string };
  flag: string;
  relation: RelationStatus;
  tradeDeal: boolean;
  sanction: boolean;
  isPlayer: boolean;
}

interface Props {
  lang: Lang;
  state: GameState;
  onSelectRegion: (regionId: string) => void;
  onMapAction: (nationId: string, action: MapAction) => void;
}

const COUNTRY_COLORS: Record<string, string> = {
  player: '#10b981',
  ally: '#3b82f6',
  enemy: '#ef4444',
  neutral: '#374151',
  selected: '#f59e0b',
};

function getNationStatus(
  isoCode: number,
  state: GameState,
  selectedIso: number | null
): 'player' | 'ally' | 'enemy' | 'neutral' | 'selected' {
  if (selectedIso !== null && isoCode === selectedIso) return 'selected';

  const playerIso = NATION_ISO_MAP[state.countryId];
  if (isoCode === playerIso) return 'player';

  const foreign = state.foreign.find((f) => NATION_ISO_MAP[f.id] === isoCode);
  if (foreign) {
    if (foreign.relation === 'allied') return 'ally';
    if (foreign.relation === 'hostile' || foreign.sanction) return 'enemy';
    return 'neutral';
  }
  return 'neutral';
}

function isoToForeignId(isoCode: number, state: GameState): string | null {
  const f = state.foreign.find((fn) => NATION_ISO_MAP[fn.id] === isoCode);
  if (f) return f.id;
  if (NATION_ISO_MAP[state.countryId] === isoCode) return state.countryId;
  return null;
}

function WorldMapInner({ lang, state, onSelectRegion, onMapAction }: Props) {
  const [position, setPosition] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedIso, setSelectedIso] = useState<number | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (mounted) setGeoData(data);
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      });
    return () => { mounted = false; };
  }, []);

  const handleZoomIn = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(4, pos.zoom * 1.5) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(1, pos.zoom / 1.5) }));
  }, []);

  const handleReset = useCallback(() => {
    setPosition({ x: 0, y: 0, zoom: 1 });
  }, []);

  const handleGeographyClick = useCallback((geo: any) => {
    const iso = parseInt(geo.id, 10);
    setSelectedIso(iso);
  }, []);

  const selectedNation = useMemo<SelectedNation | null>(() => {
    if (selectedIso === null) return null;
    const foreignId = isoToForeignId(selectedIso, state);
    if (!foreignId) return null;
    if (foreignId === state.countryId) {
      return { id: state.countryId, name: { tr: state.countryId, en: state.countryId }, flag: '🏳️', relation: 'allied' as RelationStatus, tradeDeal: false, sanction: false, isPlayer: true };
    }
    const foreign = state.foreign.find((f) => f.id === foreignId);
    if (!foreign) return null;
    return { ...foreign, isPlayer: false };
  }, [selectedIso, state]);

  const handleAction = useCallback((action: MapAction) => {
    if (!selectedNation || selectedNation.isPlayer) return;
    onMapAction(selectedNation.id, action);
  }, [selectedNation, onMapAction]);

  const handleClosePanel = useCallback(() => {
    setSelectedIso(null);
  }, []);

  const playerRegions = state.regions.filter((r) => r.owner === 'player').length;

  return (
    <div className="p-3 space-y-4 pb-24 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Icons.Globe2 className="w-5 h-5 text-accent-400" />
          {t('world_map', lang)}
        </h2>
        <span className="text-xs text-slate-400">
          {t('regions_controlled', lang)}: <span className="text-success-400 font-bold">{playerRegions}/{state.regions.length}</span>
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(['legend_player', 'legend_ally', 'legend_enemy', 'legend_neutral'] as const).map((key, i) => {
          const colors = [COUNTRY_COLORS.player, COUNTRY_COLORS.ally, COUNTRY_COLORS.enemy, COUNTRY_COLORS.neutral];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i] }} />
              <span className="text-slate-400">{t(key, lang)}</span>
            </div>
          );
        })}
      </div>

      {/* Map container */}
      <div className="relative w-full h-72 sm:h-96 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loadError ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            {t('map_error', lang)}
          </div>
        ) : !geoData ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            <Icons.Loader2 className="w-5 h-5 animate-spin mr-2" />
            {t('loading_map', lang)}
          </div>
        ) : (
          <>
            <ComposableMap
              width={800}
              height={400}
              projectionConfig={{ scale: 120, center: [0, 0] }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={[position.x, position.y]}
                onMove={(newPos: { x: number; y: number; zoom: number }) => setPosition(newPos)}
                minZoom={1}
                maxZoom={4}
              >
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo) => {
                      const iso = parseInt(geo.id, 10);
                      const status = getNationStatus(iso, state, selectedIso);
                      const fill = COUNTRY_COLORS[status] ?? COUNTRY_COLORS.neutral;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#1e293b"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none', transition: 'fill 0.2s' },
                            hover: { outline: 'none', fill: '#f59e0b', cursor: 'pointer' },
                            pressed: { outline: 'none' },
                          }}
                          onClick={() => handleGeographyClick(geo)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
              <button
                onClick={handleZoomIn}
                className="w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-white hover:bg-slate-700 transition-colors flex items-center justify-center active:scale-95"
                title={t('zoom_in', lang)}
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-white hover:bg-slate-700 transition-colors flex items-center justify-center active:scale-95"
                title={t('zoom_out', lang)}
              >
                <Icons.Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-white hover:bg-slate-700 transition-colors flex items-center justify-center active:scale-95"
                title={t('reset_map', lang)}
              >
                <Icons.RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Country Action Panel */}
      {selectedNation && (
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedNation.flag}</span>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {selectedNation.isPlayer
                    ? `${selectedNation.name[lang]} (${t('your_country', lang)})`
                    : (FOREIGN_PRESETS.find((f) => f.id === selectedNation.id)?.name[lang] ?? selectedNation.name[lang])
                  }
                </h3>
                {!selectedNation.isPlayer && (
                  <span className={`text-xs font-semibold ${
                    selectedNation.relation === 'allied' ? 'text-primary-400'
                    : selectedNation.relation === 'hostile' ? 'text-error-400'
                    : selectedNation.relation === 'friendly' ? 'text-success-400'
                    : 'text-slate-400'
                  }`}>
                    {t(selectedNation.relation as never, lang)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClosePanel}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {!selectedNation.isPlayer && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('war')}
                disabled={selectedNation.relation === 'allied'}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedNation.relation === 'allied'
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-error-500/10 border border-error-500/30 text-error-400 hover:bg-error-500 hover:text-white'
                }`}
              >
                <Icons.Swords className="w-3.5 h-3.5" />
                {t('declare_war', lang)}
              </button>
              <button
                onClick={() => handleAction('diplomacy')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500 hover:text-white transition-all active:scale-95"
              >
                <Icons.Handshake className="w-3.5 h-3.5" />
                {t('open_diplomacy', lang)}
              </button>
              <button
                onClick={() => handleAction('trade')}
                disabled={selectedNation.tradeDeal || selectedNation.sanction}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedNation.tradeDeal || selectedNation.sanction
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-success-500/10 border border-success-500/30 text-success-400 hover:bg-success-500 hover:text-white'
                }`}
              >
                <Icons.TrendingUp className="w-3.5 h-3.5" />
                {t('propose_trade', lang)}
              </button>
              <button
                onClick={() => handleAction('intelligence')}
                disabled={selectedNation.relation !== 'hostile' || state.funds < 10}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedNation.relation !== 'hostile' || state.funds < 10
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-accent-500/10 border border-accent-500/30 text-accent-400 hover:bg-accent-500 hover:text-white'
                }`}
              >
                <Icons.Eye className="w-3.5 h-3.5" />
                {t('send_intelligence', lang)}
              </button>
            </div>
          )}

          {selectedNation.isPlayer && (
            <p className="text-xs text-slate-500 text-center py-2">{t('your_country', lang)}</p>
          )}
        </div>
      )}

      {/* Region list (preserved from original) */}
      <div className="grid gap-3">
        {state.regions.map((reg) => {
          const ownerColor = reg.owner === 'player' ? 'text-success-400' : reg.owner === 'enemy' ? 'text-error-400' : 'text-accent-400';
          const ownerLabel = reg.owner === 'player' ? t('region_player', lang) : reg.owner === 'enemy' ? t('region_enemy', lang) : t('region_neutral', lang);
          const canAttack = reg.owner !== 'player';
          return (
            <div key={reg.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">{reg.name[lang]}</div>
                <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                  <span className={`font-semibold ${ownerColor}`}>{ownerLabel}</span>
                  <span className="flex items-center gap-1">
                    <Icons.AlertCircle className="w-3 h-3 text-amber-400" />
                    {t('threat_level', lang)}: %{reg.threat}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSelectRegion(reg.id)}
                disabled={!canAttack}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  canAttack
                    ? 'bg-error-500/10 border border-error-500/30 hover:bg-error-500 hover:text-white text-error-400 active:scale-95'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Icons.Swords className="w-3.5 h-3.5" />
                {t('action', lang)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const MapView = memo(WorldMapInner);
