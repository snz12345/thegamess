import { useState, useCallback } from 'react';
import type { Lang, GameState, CountryPreset, ViewName, Infrastructure, MilitaryBranchId, RelationStatus, LogEntry, Region, GameEvent, Pact, UNResolution, UNVote, UNResolutionType, ResourceId, ProcessedGoodId, FactoryId, TradeOrder, TradeOrderType, TradeableId } from '@/game/types';
import { INFRA_PRESETS, BRANCH_PRESETS, FOREIGN_PRESETS, REGION_PRESETS, PACT_PRESETS, ELECTION_INTERVAL, UN_VOTE_INTERVAL, UN_RESOLUTION_TYPES, RESOURCE_IDS, RESOURCE_NAMES, BASE_PRICES, FACTORY_DEFS, RECRUIT_MATERIAL_COSTS, UPGRADE_MATERIAL_COSTS, UPGRADE_MONEY_COSTS, PROCESSED_GOOD_IDS, PROCESSED_BASE_PRICES, PROCESSED_GOOD_NAMES as PROCESSED_GOOD_NAMES_LOOKUP, ALL_TRADEABLE_IDS, createInitialResources, createInitialProcessedGoods, createInitialFactories, createInitialMarketPrices, createInitialTradeOrders } from '@/game/data';
import { clamp, uid } from '@/game/utils';
import { NationSelect } from '@/components/NationSelect';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';
import { OverviewView } from '@/components/OverviewView';
import { EconomyView } from '@/components/EconomyView';
import { MilitaryView } from '@/components/MilitaryView';
import { DiplomacyView } from '@/components/DiplomacyView';
import { PoliticsView } from '@/components/PoliticsView';
import { MapView } from '@/components/MapView';
import { PactsView } from '@/components/PactsView';
import { MarketView } from '@/components/MarketView';
import { WarModal } from '@/components/WarModal';
import { EventModal } from '@/components/EventModal';
import { GameOverScreen } from '@/components/GameOverScreen';

function upgradeRelation(r: RelationStatus): RelationStatus {
  if (r === 'hostile') return 'neutral';
  if (r === 'neutral') return 'friendly';
  return r;
}

function createInitialState(country: CountryPreset): GameState {
  return {
    countryId: country.id,
    turn: 1,
    funds: country.startingFunds,
    approval: 55,
    stability: 60,
    inflation: 10,
    military: country.startingMilitary,
    infrastructure: country.startingInfrastructure,
    softPower: country.startingSoftPower,
    opposition: 35,
    electionTimer: 0,
    infrastructures: INFRA_PRESETS.map((p) => ({ ...p, count: 0 })),
    branches: BRANCH_PRESETS.map((b) => ({ ...b, tier: 1, units: 10 })),
    foreign: FOREIGN_PRESETS.map((f) => ({
      ...f,
      relation: 'neutral' as RelationStatus,
      tradeDeal: false,
      sanction: false,
    })),
    regions: REGION_PRESETS.map((r) => ({ ...r })),
    pacts: PACT_PRESETS.map((p) => ({ ...p, members: [...p.members] })),
    playerPactId: null,
    unResolutions: [],
    unVoteTimer: UN_VOTE_INTERVAL,
    resources: createInitialResources(),
    processedGoods: createInitialProcessedGoods(),
    factories: createInitialFactories(),
    tradeOrders: createInitialTradeOrders(),
    marketPrices: createInitialMarketPrices(),
    tradeBalance: 0,
    log: [],
    gameOver: false,
    activeEvent: null,
  };
}

function maybeTriggerEvent(turn: number): GameEvent | null {
  if (turn < 3) return null;
  if (Math.random() < 0.35) {
    return null;
  }
  return null;
}

function generateResolution(): UNResolution {
  const types = UN_RESOLUTION_TYPES;
  const chosen = types[Math.floor(Math.random() * types.length)];
  const targets = ['rus', 'chn', 'usa', 'deu', 'gbr', 'jpn', 'fra', 'bra', 'all'];
  const target = targets[Math.floor(Math.random() * targets.length)];

  return {
    id: uid(),
    type: chosen.type,
    titleKey: chosen.titleKey,
    descKey: chosen.descKey,
    targetNationId: target,
    turnsLeft: 3,
    playerVote: null,
    passed: false,
    resolved: false,
  };
}

function applyResolutionEffect(resolution: UNResolution, state: GameState): Partial<GameState> {
  const isTarget = resolution.targetNationId === state.countryId || resolution.targetNationId === 'all';
  let changes: Partial<GameState> = {};

  if (resolution.type === 'trade_embargo' && isTarget) {
    changes = { funds: state.funds - 30, inflation: clamp(state.inflation + 5) };
  } else if (resolution.type === 'arms_limitation' && isTarget) {
    changes = { military: clamp(state.military - 15) };
  } else if (resolution.type === 'economic_aid' && isTarget) {
    changes = { funds: state.funds + 40, approval: clamp(state.approval + 5) };
  } else if (resolution.type === 'humanitarian_intervention' && isTarget) {
    changes = { stability: clamp(state.stability + 8), softPower: clamp(state.softPower + 5) };
  }

  return changes;
}

function App() {
  const [lang, setLang] = useState<Lang>('tr');
  const [country, setCountry] = useState<CountryPreset | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [view, setView] = useState<ViewName>('overview');
  const [warRegion, setWarRegion] = useState<Region | null>(null);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'tr' ? 'en' : 'tr'));
  }, []);

  const handleStart = useCallback((c: CountryPreset) => {
    setCountry(c);
    setState(createInitialState(c));
    setView('overview');
  }, []);

  const handleRestart = useCallback(() => {
    setCountry(null);
    setState(null);
    setView('overview');
    setWarRegion(null);
  }, []);

  const handleViewChange = useCallback((v: ViewName) => setView(v), []);

  const handleNextTurn = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;

      let funds = prev.funds;
      let approval = prev.approval;
      let stability = prev.stability;
      let inflation = prev.inflation;
      let military = prev.military;
      let infrastructure = prev.infrastructure;
      let softPower = prev.softPower;
      let opposition = prev.opposition;
      let electionTimer = prev.electionTimer + 1;
      let unVoteTimer = prev.unVoteTimer - 1;
      let unResolutions = prev.unResolutions;
      let pacts = prev.pacts;
      let playerPactId = prev.playerPactId;

      // Income & maintenance
      let income = 0;
      let maintenance = 0;
      prev.infrastructures.forEach((i) => {
        if (i.id === 'factory') {
          let factoryIncome = 12 * i.count;
          if (prev.countryId === 'cn') factoryIncome *= 1.5;
          income += factoryIncome;
        }
        if (i.id === 'defense') maintenance += 2 * i.count;
      });
      prev.foreign.forEach((f) => { if (f.tradeDeal) income += 20; });
      if (prev.countryId === 'br') income += 10;

      // Economic pact trade bonus: +15% trade revenue
      if (playerPactId) {
        const playerPact = pacts.find((p) => p.id === playerPactId);
        if (playerPact && playerPact.tradeBonus > 0) {
          income = Math.round(income * (1 + playerPact.tradeBonus / 100));
        }
      }

      funds += income - maintenance;

      // Tech R&D: soft power growth
      const techCount = prev.infrastructures.find((i) => i.id === 'tech')?.count ?? 0;
      let techBonus = techCount * 2;
      if (prev.countryId === 'jp') techBonus *= 1.25;
      softPower = clamp(softPower + techBonus * 0.5);

      // Steel plant: infrastructure
      const steelCount = prev.infrastructures.find((i) => i.id === 'steel')?.count ?? 0;
      infrastructure = clamp(infrastructure + steelCount * 2);

      // Defense complex: military
      const defenseCount = prev.infrastructures.find((i) => i.id === 'defense')?.count ?? 0;
      military = clamp(military + defenseCount * 1.5);

      // Natural drift
      approval = clamp(approval - 1.5);
      opposition = clamp(opposition + 1.2);
      inflation = clamp(inflation + 0.5 + (funds > 2000 ? 1 : 0));
      stability = clamp(stability + (approval - 50) * 0.05 - 0.5);

      // Diplomacy effects
      let sanctionPenalty = 0;
      let allyBonus = 0;
      prev.foreign.forEach((f) => {
        if (f.sanction) sanctionPenalty += 1;
        if (f.relation === 'allied') allyBonus += 0.5;
      });
      softPower = clamp(softPower - sanctionPenalty + allyBonus);

      // Region income from controlled territories
      const playerRegions = prev.regions.filter((r) => r.owner === 'player').length;
      if (playerRegions > 1) {
        funds += (playerRegions - 1) * 8;
      }

      // === Resource Production & Supply Chains ===
      const resources = { ...prev.resources };
      const processedGoods = { ...prev.processedGoods };
      let defenseUnitsProduced = 0;

      // Reset monthly stats
      for (const id of RESOURCE_IDS) {
        resources[id] = { ...resources[id], monthlyProduction: 0, monthlyConsumption: 0 };
      }
      (Object.keys(processedGoods) as ProcessedGoodId[]).forEach((id) => {
        processedGoods[id] = { ...processedGoods[id], monthlyProduction: 0 };
      });

      // Extraction factories produce raw materials
      for (const factory of prev.factories) {
        if (factory.count === 0) continue;
        const def = FACTORY_DEFS.find((f) => f.id === factory.id);
        if (!def || def.type !== 'extraction') continue;

        const outputId = def.output as ResourceId;
        const produced = def.outputAmount * factory.count;
        const res = resources[outputId];
        const newStockpile = Math.min(res.storageCap, res.stockpile + produced);
        const actualProduced = newStockpile - res.stockpile;
        resources[outputId] = {
          ...res,
          stockpile: newStockpile,
          monthlyProduction: res.monthlyProduction + actualProduced,
        };
      }

      // Processing factories consume inputs and produce goods
      for (const factory of prev.factories) {
        if (factory.count === 0) continue;
        const def = FACTORY_DEFS.find((f) => f.id === factory.id);
        if (!def || def.type !== 'processing') continue;

        // Check if all inputs are available
        let canProduce = true;
        for (const input of def.inputs ?? []) {
          const inputId = input.resource as ResourceId;
          const inputGoodId = input.resource as ProcessedGoodId;
          if (input.resource in resources) {
            if (resources[inputId].stockpile < input.amount * factory.count) {
              canProduce = false;
              break;
            }
          } else if (input.resource in processedGoods) {
            if (processedGoods[inputGoodId].stockpile < input.amount * factory.count) {
              canProduce = false;
              break;
            }
          }
        }

        if (!canProduce) continue;

        // Consume inputs
        for (const input of def.inputs ?? []) {
          const inputId = input.resource as ResourceId;
          const inputGoodId = input.resource as ProcessedGoodId;
          if (input.resource in resources) {
            const consumed = input.amount * factory.count;
            resources[inputId] = {
              ...resources[inputId],
              stockpile: Math.max(0, resources[inputId].stockpile - consumed),
              monthlyConsumption: resources[inputId].monthlyConsumption + consumed,
            };
          } else if (input.resource in processedGoods) {
            const consumed = input.amount * factory.count;
            processedGoods[inputGoodId] = {
              ...processedGoods[inputGoodId],
              stockpile: Math.max(0, processedGoods[inputGoodId].stockpile - consumed),
            };
          }
        }

        // Defense complex produces military units instead of goods
        if (def.id === 'defense_complex') {
          defenseUnitsProduced += factory.count * 2;
          continue;
        }

        // Produce output good
        const outputId = def.output as ProcessedGoodId;
        const produced = def.outputAmount * factory.count;
        const good = processedGoods[outputId];
        const newStockpile = Math.min(good.storageCap, good.stockpile + produced);
        const actualProduced = newStockpile - good.stockpile;
        processedGoods[outputId] = {
          ...good,
          stockpile: newStockpile,
          monthlyProduction: good.monthlyProduction + actualProduced,
        };
      }

      if (defenseUnitsProduced > 0) {
        military = clamp(military + defenseUnitsProduced * 2);
      }

      // === Trade Orders ===
      let tradeIncome = 0;
      let tradeExpense = 0;
      for (const order of prev.tradeOrders) {
        if (!order.active) continue;
        const price = prev.marketPrices[order.resourceId].price;
        const isResource = order.resourceId in resources;
        const isProcessed = order.resourceId in processedGoods;
        if (order.type === 'buy') {
          const cost = order.amount * price;
          if (funds >= cost) {
            funds -= cost;
            tradeExpense += cost;
            if (isResource) {
              const res = resources[order.resourceId as ResourceId];
              resources[order.resourceId as ResourceId] = {
                ...res,
                stockpile: Math.min(res.storageCap, res.stockpile + order.amount),
              };
            } else if (isProcessed) {
              const good = processedGoods[order.resourceId as ProcessedGoodId];
              processedGoods[order.resourceId as ProcessedGoodId] = {
                ...good,
                stockpile: Math.min(good.storageCap, good.stockpile + order.amount),
              };
            }
          }
        } else {
          let sellAmount = 0;
          if (isResource) {
            const res = resources[order.resourceId as ResourceId];
            sellAmount = Math.min(order.amount, res.stockpile);
            if (sellAmount > 0) {
              resources[order.resourceId as ResourceId] = {
                ...res,
                stockpile: res.stockpile - sellAmount,
              };
            }
          } else if (isProcessed) {
            const good = processedGoods[order.resourceId as ProcessedGoodId];
            sellAmount = Math.min(order.amount, good.stockpile);
            if (sellAmount > 0) {
              processedGoods[order.resourceId as ProcessedGoodId] = {
                ...good,
                stockpile: good.stockpile - sellAmount,
              };
            }
          }
          if (sellAmount > 0) {
            const revenue = sellAmount * price;
            funds += revenue;
            tradeIncome += revenue;
          }
        }
      }
      const tradeBalance = tradeIncome - tradeExpense;

      // === Market Price Fluctuation ===
      const marketPrices = { ...prev.marketPrices };
      for (const id of ALL_TRADEABLE_IDS) {
        const basePrice = id in BASE_PRICES
          ? BASE_PRICES[id as ResourceId]
          : PROCESSED_BASE_PRICES[id as ProcessedGoodId];
        const current = marketPrices[id];
        const fluctuation = (Math.random() - 0.5) * 2;
        const newPrice = Math.max(1, basePrice * 0.7 + current.price * 0.3 + fluctuation);
        const newTrend = newPrice - current.price;
        marketPrices[id] = { resourceId: id, price: Math.round(newPrice * 10) / 10, trend: Math.round(newTrend * 10) / 10 };
      }

      const newTurn = prev.turn + 1;
      let gameOver = false;
      let gameOverReason: { tr: string; en: string } | undefined;
      let log: LogEntry[] = [...prev.log, { turn: newTurn, text: { tr: `Tur ${newTurn} başladı`, en: `Turn ${newTurn} started` } }];

      // UN resolution processing
      unResolutions = unResolutions.map((r) => {
        if (r.resolved) return r;
        const turnsLeft = r.turnsLeft - 1;
        if (turnsLeft <= 0) {
          // Resolve: simulate vote
          // Player vote counts, AI votes are random-ish weighted
          const aiVotes = Math.floor(Math.random() * 6) + 2;
          const yesVotes = (r.playerVote === 'yes' ? 1 : 0) + Math.floor(aiVotes * 0.5);
          const noVotes = (r.playerVote === 'no' ? 1 : 0) + Math.floor(aiVotes * 0.35);
          const passed = yesVotes > noVotes;

          const effectChanges = passed ? applyResolutionEffect(r, prev) : {};
          Object.entries(effectChanges).forEach(([key, val]) => {
            if (key === 'funds' && typeof val === 'number') funds += val - prev.funds;
            else if (key === 'approval' && typeof val === 'number') approval = val as number;
            else if (key === 'stability' && typeof val === 'number') stability = val as number;
            else if (key === 'inflation' && typeof val === 'number') inflation = val as number;
            else if (key === 'military' && typeof val === 'number') military = val as number;
            else if (key === 'softPower' && typeof val === 'number') softPower = val as number;
          });

          log = [...log, {
            turn: newTurn,
            text: passed
              ? { tr: `BM kararı kabul edildi: ${r.titleKey}`, en: `UN resolution passed: ${r.titleKey}` }
              : { tr: `BM kararı reddedildi: ${r.titleKey}`, en: `UN resolution failed: ${r.titleKey}` },
          }];

          return { ...r, turnsLeft: 0, passed, resolved: true };
        }
        return { ...r, turnsLeft };
      });

      // New UN resolution
      if (unVoteTimer <= 0) {
        const newRes = generateResolution();
        unResolutions = [...unResolutions, newRes];
        unVoteTimer = UN_VOTE_INTERVAL;
        log = [...log, { turn: newTurn, text: { tr: 'Yeni BM kararı oylamaya açıldı', en: 'New UN resolution opened for voting' } }];
      }

      // Keep only last 10 resolved resolutions
      unResolutions = [...unResolutions.filter((r) => !r.resolved), ...unResolutions.filter((r) => r.resolved).slice(-3)];

      if (funds < -100) {
        gameOver = true;
        gameOverReason = { tr: 'Hazine iflas etti!', en: 'Treasury went bankrupt!' };
        log = [...log, { turn: newTurn, text: gameOverReason }];
      }

      if (stability < 10 && !gameOver) {
        gameOver = true;
        gameOverReason = { tr: 'Askeri darbe oldu! İstikrar çok düştü.', en: 'A military coup occurred! Stability too low.' };
        log = [...log, { turn: newTurn, text: gameOverReason }];
      }

      if (electionTimer >= ELECTION_INTERVAL && !gameOver) {
        if (approval > opposition) {
          log = [...log, { turn: newTurn, text: { tr: 'Seçimi kazandınız!', en: 'You won the election!' } }];
          electionTimer = 0;
          opposition = clamp(opposition - 10);
        } else {
          gameOver = true;
          gameOverReason = { tr: 'Seçimi kaybettiniz! Muhalefet sizi yendi.', en: 'You lost the election! Opposition defeated you.' };
          log = [...log, { turn: newTurn, text: gameOverReason }];
        }
      }

      // Random event
      let activeEvent = prev.activeEvent;
      if (!activeEvent && !gameOver) {
        const evt = maybeTriggerEvent(newTurn);
        if (evt) {
          activeEvent = { event: evt };
          log = [...log, { turn: newTurn, text: { tr: 'Bir olay meydana geldi!', en: 'An event has occurred!' } }];
        }
      }

      log = log.slice(-20);

      if (defenseUnitsProduced > 0) {
        log = [...log, { turn: newTurn, text: { tr: `${defenseUnitsProduced} savunma birliği üretildi`, en: `${defenseUnitsProduced} defense units produced` } }].slice(-20);
      }

      return {
        ...prev,
        turn: newTurn,
        funds,
        approval,
        stability,
        inflation,
        military,
        infrastructure,
        softPower,
        opposition,
        electionTimer,
        unVoteTimer,
        unResolutions,
        pacts,
        playerPactId,
        resources,
        processedGoods,
        marketPrices,
        tradeBalance,
        gameOver,
        gameOverReason,
        activeEvent,
        log,
      };
    });
  }, []);

  const handleBuild = useCallback((infra: Infrastructure) => {
    setState((prev) => {
      if (!prev || prev.funds < infra.cost) return prev;
      const existing = prev.infrastructures.find((i) => i.id === infra.id);
      const infrastructures = existing
        ? prev.infrastructures.map((i) => i.id === infra.id ? { ...i, count: i.count + 1 } : i)
        : [...prev.infrastructures, { ...infra, count: 1 }];
      const log = [...prev.log, { turn: prev.turn, text: { tr: `${infra.name.tr} inşa edildi`, en: `${infra.name.en} built` } }].slice(-20);
      return { ...prev, funds: prev.funds - infra.cost, infrastructures, log };
    });
  }, []);

  const handleRecruit = useCallback((branchId: MilitaryBranchId) => {
    setState((prev) => {
      if (!prev) return prev;
      const cost = 15;
      if (prev.funds < cost) return prev;
      const branch = prev.branches.find((b) => b.id === branchId);
      if (!branch) return prev;

      const matCost = RECRUIT_MATERIAL_COSTS[branch.tier] ?? { steel: 0, microchips: 0, titanium: 0 };
      const processedGoods = { ...prev.processedGoods };
      const resources = { ...prev.resources };

      if (processedGoods.steel.stockpile < matCost.steel) return prev;
      if (processedGoods.microchips.stockpile < matCost.microchips) return prev;
      if (resources.titanium.stockpile < matCost.titanium) return prev;

      if (matCost.steel > 0) processedGoods.steel = { ...processedGoods.steel, stockpile: processedGoods.steel.stockpile - matCost.steel };
      if (matCost.microchips > 0) processedGoods.microchips = { ...processedGoods.microchips, stockpile: processedGoods.microchips.stockpile - matCost.microchips };
      if (matCost.titanium > 0) resources.titanium = { ...resources.titanium, stockpile: resources.titanium.stockpile - matCost.titanium };

      const branches = prev.branches.map((b) => b.id === branchId ? { ...b, units: b.units + 5 } : b);
      const log = [...prev.log, { turn: prev.turn, text: { tr: `${branch.name.tr} için 5 birlik alındı`, en: `Recruited 5 units for ${branch.name.en}` } }].slice(-20);
      return { ...prev, funds: prev.funds - cost, branches, military: clamp(prev.military + 2), processedGoods, resources, log };
    });
  }, []);

  const handleUpgrade = useCallback((branchId: MilitaryBranchId) => {
    setState((prev) => {
      if (!prev) return prev;
      const branch = prev.branches.find((b) => b.id === branchId);
      if (!branch || branch.tier >= branch.maxTier) return prev;
      const targetTier = branch.tier + 1;
      const cost = UPGRADE_MONEY_COSTS[targetTier] ?? 60;
      if (prev.funds < cost) return prev;

      const matCost = UPGRADE_MATERIAL_COSTS[targetTier] ?? { steel: 0, microchips: 0, titanium: 0 };
      const processedGoods = { ...prev.processedGoods };
      const resources = { ...prev.resources };

      if (processedGoods.steel.stockpile < matCost.steel) return prev;
      if (processedGoods.microchips.stockpile < matCost.microchips) return prev;
      if (resources.titanium.stockpile < matCost.titanium) return prev;

      if (matCost.steel > 0) processedGoods.steel = { ...processedGoods.steel, stockpile: processedGoods.steel.stockpile - matCost.steel };
      if (matCost.microchips > 0) processedGoods.microchips = { ...processedGoods.microchips, stockpile: processedGoods.microchips.stockpile - matCost.microchips };
      if (matCost.titanium > 0) resources.titanium = { ...resources.titanium, stockpile: resources.titanium.stockpile - matCost.titanium };

      const branches = prev.branches.map((b) => b.id === branchId ? { ...b, tier: b.tier + 1 } : b);
      const log = [...prev.log, { turn: prev.turn, text: { tr: `${branch.name.tr} seviye ${targetTier}'e yükseltildi`, en: `${branch.name.en} upgraded to tier ${targetTier}` } }].slice(-20);
      return { ...prev, funds: prev.funds - cost, branches, military: clamp(prev.military + 5), processedGoods, resources, log };
    });
  }, []);

  const handleBorderOps = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const log = [...prev.log, { turn: prev.turn, text: { tr: 'Sınır operasyonu düzenlendi', en: 'Border operation conducted' } }].slice(-20);
      return { ...prev, stability: clamp(prev.stability - 5), military: clamp(prev.military + 10), log };
    });
  }, []);

  const handlePeacekeeping = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const log = [...prev.log, { turn: prev.turn, text: { tr: 'Barış gücü misyonu başlatıldı', en: 'Peacekeeping mission launched' } }].slice(-20);
      return { ...prev, softPower: clamp(prev.softPower + 8), stability: clamp(prev.stability - 3), log };
    });
  }, []);

  const handleDiplomacy = useCallback((nationId: string, action: 'trade' | 'humanitarian' | 'alliance' | 'sanction') => {
    setState((prev) => {
      if (!prev) return prev;
      const nation = prev.foreign.find((f) => f.id === nationId);
      if (!nation) return prev;

      let foreign = prev.foreign;
      let funds = prev.funds;
      let softPower = prev.softPower;
      let military = prev.military;
      let log = prev.log;

      if (action === 'trade') {
        if (nation.tradeDeal || nation.sanction) return prev;
        foreign = foreign.map((f) => f.id === nationId ? { ...f, tradeDeal: true, relation: upgradeRelation(f.relation) } : f);
        log = [...log, { turn: prev.turn, text: { tr: `${nation.name.tr} ile ticaret anlaşması`, en: `Trade deal with ${nation.name.en}` } }];
      } else if (action === 'humanitarian') {
        if (funds < 15 || nation.sanction) return prev;
        funds -= 15;
        softPower = clamp(softPower + 10);
        foreign = foreign.map((f) => f.id === nationId ? { ...f, relation: upgradeRelation(f.relation) } : f);
        log = [...log, { turn: prev.turn, text: { tr: `${nation.name.tr}'ye insani yardım`, en: `Humanitarian aid to ${nation.name.en}` } }];
      } else if (action === 'alliance') {
        if (nation.relation === 'allied' || nation.sanction) return prev;
        military = clamp(military + 15);
        foreign = foreign.map((f) => f.id === nationId ? { ...f, relation: 'allied' } : f);
        log = [...log, { turn: prev.turn, text: { tr: `${nation.name.tr} ile ittifak`, en: `Alliance with ${nation.name.en}` } }];
      } else if (action === 'sanction') {
        if (nation.sanction || nation.relation === 'allied') return prev;
        softPower = clamp(softPower - 5);
        foreign = foreign.map((f) => f.id === nationId ? { ...f, sanction: true, relation: 'hostile', tradeDeal: false } : f);
        log = [...log, { turn: prev.turn, text: { tr: `${nation.name.tr}'ye yaptırım`, en: `Sanctions on ${nation.name.en}` } }];
      }

      return { ...prev, foreign, funds, softPower, military, log: log.slice(-20) };
    });
  }, []);

  const handleRally = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.funds < 10) return prev;
      const log = [...prev.log, { turn: prev.turn, text: { tr: 'Miting düzenlendi', en: 'Rally held' } }].slice(-20);
      return { ...prev, funds: prev.funds - 10, approval: clamp(prev.approval + 8), opposition: clamp(prev.opposition - 3), log };
    });
  }, []);

  const handlePropaganda = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.funds < 5) return prev;
      const log = [...prev.log, { turn: prev.turn, text: { tr: 'Propaganda kampanyası', en: 'Propaganda campaign' } }].slice(-20);
      return { ...prev, funds: prev.funds - 5, approval: clamp(prev.approval + 5), log };
    });
  }, []);

  const handleSelectRegion = useCallback((regionId: string) => {
    const region = state?.regions.find((r) => r.id === regionId);
    if (!region || region.owner === 'player') return;
    setWarRegion(region);
  }, [state]);

  const handleMapAction = useCallback((nationId: string, action: 'war' | 'diplomacy' | 'trade' | 'intelligence') => {
    if (action === 'war') {
      setState((prev) => {
        if (!prev) return prev;
        const nation = prev.foreign.find((f) => f.id === nationId);
        if (!nation || nation.relation === 'allied') return prev;
        const foreign = prev.foreign.map((f) =>
          f.id === nationId ? { ...f, relation: 'hostile' as RelationStatus, tradeDeal: false } : f
        );
        const log = [...prev.log, { turn: prev.turn, text: { tr: `${nation.name.tr}'ye savaş ilan edildi`, en: `Declared war on ${nation.name.en}` } }].slice(-20);
        return { ...prev, foreign, stability: clamp(prev.stability - 5), log };
      });
    } else if (action === 'diplomacy') {
      setView('diplomacy');
    } else if (action === 'trade') {
      handleDiplomacy(nationId, 'trade');
    } else if (action === 'intelligence') {
      setState((prev) => {
        if (!prev || prev.funds < 10) return prev;
        const nation = prev.foreign.find((f) => f.id === nationId);
        if (!nation || nation.relation !== 'hostile') return prev;
        const foreign = prev.foreign.map((f) =>
          f.id === nationId ? { ...f, relation: 'neutral' as RelationStatus } : f
        );
        const log = [...prev.log, { turn: prev.turn, text: { tr: `${nation.name.tr}'ye istihbarat gönderildi, ilişki nötr`, en: `Intelligence sent to ${nation.name.en}, relation now neutral` } }].slice(-20);
        return { ...prev, foreign, funds: prev.funds - 10, log };
      });
    }
  }, []);

  const handleWarAttack = useCallback(() => {
    setState((prev) => {
      if (!prev || !warRegion) return prev;

      const playerPower = prev.military + prev.branches.reduce((sum, b) => sum + b.units * b.tier, 0);
      const enemyPower = warRegion.enemyPower;

      // Mutual defense: if player is in a military pact, allies contribute power
      let allyBonus = 0;
      if (prev.playerPactId) {
        const pact = prev.pacts.find((p) => p.id === prev.playerPactId);
        if (pact && pact.mutualDefense) {
          allyBonus = pact.members.length * 10;
        }
      }

      const totalPower = playerPower + allyBonus;
      const winChance = Math.min(95, Math.max(5, totalPower / (totalPower + enemyPower)));
      const won = Math.random() < winChance;

      let regions = prev.regions;
      let military = prev.military;
      let stability = prev.stability;
      let softPower = prev.softPower;
      let log = prev.log;

      if (won) {
        regions = prev.regions.map((r) =>
          r.id === warRegion.id ? { ...r, owner: 'player' as const, threat: 10, enemyPower: 0 } : r
        );
        military = clamp(military - 5);
        stability = clamp(stability + 3);
        log = [...log, { turn: prev.turn, text: { tr: `${warRegion.name.tr} bölgesi ele geçirildi!`, en: `${warRegion.name.en} region captured!` } }];
        if (allyBonus > 0) {
          log = [...log, { turn: prev.turn, text: { tr: 'Müttefikleriniz savunmanıza katıldı!', en: 'Your allies joined your defense!' } }];
        }
      } else {
        military = clamp(military - 15);
        stability = clamp(stability - 5);
        softPower = clamp(softPower - 3);
        log = [...log, { turn: prev.turn, text: { tr: `${warRegion.name.tr} saldırısı püskürtüldü, ağır kayıplar`, en: `Attack on ${warRegion.name.en} repelled, heavy losses` } }];
      }

      return { ...prev, regions, military, stability, softPower, log: log.slice(-20) };
    });
    setWarRegion(null);
  }, [warRegion]);

  const handleWarRetreat = useCallback(() => {
    setWarRegion(null);
  }, []);

  const handleEventChoice = useCallback((optionIndex: number) => {
    setState((prev) => {
      if (!prev || !prev.activeEvent) return prev;
      const option = prev.activeEvent.event.options[optionIndex];
      if (!option) return prev;

      const changes = option.effect(prev);
      const log = [...prev.log, {
        turn: prev.turn,
        text: { tr: `${prev.activeEvent.event.titleKey}: yanıt verildi`, en: `${prev.activeEvent.event.titleKey}: responded` },
      }].slice(-20);

      return { ...prev, ...changes, activeEvent: null, log };
    });
  }, []);

  // Pact handlers
  const handleJoinPact = useCallback((pactId: string) => {
    setState((prev) => {
      if (!prev || prev.playerPactId) return prev;
      const pact = prev.pacts.find((p) => p.id === pactId);
      if (!pact) return prev;
      if (pact.members.includes(prev.countryId)) return prev;

      const joinCost = pact.type === 'military' ? 50 : 40;
      if (prev.funds < joinCost) return prev;
      if (prev.softPower < 40) return prev;

      const pacts = prev.pacts.map((p) =>
        p.id === pactId ? { ...p, members: [...p.members, prev.countryId] } : p
      );

      const log = [...prev.log, {
        turn: prev.turn,
        text: { tr: `${pact.name.tr} pakta katıldınız`, en: `Joined ${pact.name.en}` },
      }].slice(-20);

      return { ...prev, pacts, playerPactId: pactId, funds: prev.funds - joinCost, log };
    });
  }, []);

  const handleLeavePact = useCallback(() => {
    setState((prev) => {
      if (!prev || !prev.playerPactId) return prev;
      const pact = prev.pacts.find((p) => p.id === prev.playerPactId);
      if (!pact) return prev;

      const pacts = prev.pacts.map((p) =>
        p.id === prev.playerPactId
          ? { ...p, members: p.members.filter((m) => m !== prev.countryId) }
          : p
      );

      const log = [...prev.log, {
        turn: prev.turn,
        text: { tr: `${pact.name.tr} paktından ayrıldınız`, en: `Left ${pact.name.en}` },
      }].slice(-20);

      return { ...prev, pacts, playerPactId: null, log };
    });
  }, []);

  const handleFoundPact = useCallback((type: 'military' | 'economic') => {
    setState((prev) => {
      if (!prev || prev.playerPactId) return prev;
      if (prev.softPower < 40) return prev;

      const cost = type === 'military' ? 100 : 80;
      if (prev.funds < cost) return prev;

      const newPact: Pact = {
        id: uid(),
        name: type === 'military'
          ? { tr: `${prev.countryId.toUpperCase()} Askeri İttifakı`, en: `${prev.countryId.toUpperCase()} Military Alliance` }
          : { tr: `${prev.countryId.toUpperCase()} Ticaret Birliği`, en: `${prev.countryId.toUpperCase()} Trade Union` },
        type,
        members: [prev.countryId],
        founder: prev.countryId,
        mutualDefense: type === 'military',
        tradeBonus: type === 'economic' ? 15 : 0,
      };

      const log = [...prev.log, {
        turn: prev.turn,
        text: { tr: `Yeni ${type === 'military' ? 'askeri' : 'ekonomik'} pakt kuruldu`, en: `New ${type === 'military' ? 'military' : 'economic'} pact founded` },
      }].slice(-20);

      return {
        ...prev,
        pacts: [...prev.pacts, newPact],
        playerPactId: newPact.id,
        funds: prev.funds - cost,
        log,
      };
    });
  }, []);

  const handleVote = useCallback((resolutionId: string, vote: UNVote) => {
    setState((prev) => {
      if (!prev) return prev;
      const unResolutions = prev.unResolutions.map((r) =>
        r.id === resolutionId && !r.resolved && r.playerVote === null
          ? { ...r, playerVote: vote }
          : r
      );
      return { ...prev, unResolutions };
    });
  }, []);

  // Factory building
  const handleBuildFactory = useCallback((factoryId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const def = FACTORY_DEFS.find((f) => f.id === factoryId);
      if (!def) return prev;
      if (prev.funds < def.cost) return prev;

      const factories = prev.factories.map((f) =>
        f.id === factoryId ? { ...f, count: f.count + 1 } : f
      );
      const log = [...prev.log, {
        turn: prev.turn,
        text: { tr: `${def.name.tr} inşa edildi`, en: `${def.name.en} built` },
      }].slice(-20);

      return { ...prev, funds: prev.funds - def.cost, factories, log };
    });
  }, []);

  // Trade order management
  const handleAddTradeOrder = useCallback((resourceId: TradeableId, type: TradeOrderType, amount: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const order: TradeOrder = {
        id: uid(),
        resourceId,
        type,
        amount,
        active: true,
      };
      const name = resourceId in RESOURCE_NAMES
        ? RESOURCE_NAMES[resourceId as ResourceId]
        : PROCESSED_GOOD_NAMES_LOOKUP[resourceId as ProcessedGoodId];
      const log = [...prev.log, {
        turn: prev.turn,
        text: type === 'buy'
          ? { tr: `Alış emri: ${amount}x ${name.tr}`, en: `Buy order: ${amount}x ${name.en}` }
          : { tr: `Satış emri: ${amount}x ${name.tr}`, en: `Sell order: ${amount}x ${name.en}` },
      }].slice(-20);
      return { ...prev, tradeOrders: [...prev.tradeOrders, order], log };
    });
  }, []);

  const handleRemoveTradeOrder = useCallback((orderId: string) => {
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, tradeOrders: prev.tradeOrders.filter((o) => o.id !== orderId) };
    });
  }, []);

  if (!country || !state) {
    return <NationSelect lang={lang} onStart={handleStart} onToggleLang={toggleLang} />;
  }

  const playerPower = state.military + state.branches.reduce((sum, b) => sum + b.units * b.tier, 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-x-hidden">
      <TopBar lang={lang} state={state} country={country} onNextTurn={handleNextTurn} />

      <div className="flex-1 max-w-2xl mx-auto w-full">
        {view === 'overview' && <OverviewView lang={lang} state={state} country={country} />}
        {view === 'economy' && <EconomyView lang={lang} state={state} onBuild={handleBuild} />}
        {view === 'military' && (
          <MilitaryView
            lang={lang}
            state={state}
            onRecruit={handleRecruit}
            onUpgrade={handleUpgrade}
            onBorderOps={handleBorderOps}
            onPeacekeeping={handlePeacekeeping}
          />
        )}
        {view === 'map' && (
          <MapView
            lang={lang}
            state={state}
            onSelectRegion={handleSelectRegion}
            onMapAction={handleMapAction}
          />
        )}
        {view === 'diplomacy' && <DiplomacyView lang={lang} state={state} onAction={handleDiplomacy} />}
        {view === 'pacts' && (
          <PactsView
            lang={lang}
            state={state}
            onJoinPact={handleJoinPact}
            onLeavePact={handleLeavePact}
            onFoundPact={handleFoundPact}
            onVote={handleVote}
          />
        )}
        {view === 'market' && (
          <MarketView
            lang={lang}
            state={state}
            onBuildFactory={handleBuildFactory}
            onAddTradeOrder={handleAddTradeOrder}
            onRemoveTradeOrder={handleRemoveTradeOrder}
          />
        )}
        {view === 'politics' && <PoliticsView lang={lang} state={state} onRally={handleRally} onPropaganda={handlePropaganda} />}
      </div>

      <BottomNav lang={lang} view={view} onViewChange={handleViewChange} />

      {warRegion && (
        <WarModal
          lang={lang}
          playerPower={playerPower}
          region={warRegion}
          onAttack={handleWarAttack}
          onRetreat={handleWarRetreat}
        />
      )}

      {state.activeEvent && !state.gameOver && (
        <EventModal
          lang={lang}
          event={state.activeEvent.event}
          onChoose={handleEventChoice}
        />
      )}

      {state.gameOver && <GameOverScreen lang={lang} state={state} country={country} onRestart={handleRestart} />}
    </div>
  );
}

export default App;
