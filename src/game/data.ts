import type { CountryPreset, ForeignNation, Infrastructure, MilitaryBranch, Region, GameEvent, GameState, Pact, UNResolutionType, ResourceId, ProcessedGoodId, FactoryId, ResourceState, ProcessedGoodState, MarketPrice, FactoryBuilding } from './types';
import { clamp } from './utils';

export const COUNTRIES: CountryPreset[] = [
  {
    id: 'tr',
    name: { tr: 'Türkiye', en: 'Turkey' },
    flag: '🇹🇷',
    startingFunds: 500,
    perk: { tr: 'Stratejik Konum: +5 Diplomasi etkisi', en: 'Strategic Location: +5 Diplomacy influence' },
    startingMilitary: 40,
    startingInfrastructure: 35,
    startingSoftPower: 30,
  },
  {
    id: 'us',
    name: { tr: 'ABD', en: 'USA' },
    flag: '🇺🇸',
    startingFunds: 800,
    perk: { tr: 'Küresel Güç: +20 Başlangıç askeri', en: 'Global Power: +20 Starting military' },
    startingMilitary: 70,
    startingInfrastructure: 60,
    startingSoftPower: 55,
  },
  {
    id: 'de',
    name: { tr: 'Almanya', en: 'Germany' },
    flag: '🇩🇪',
    startingFunds: 700,
    perk: { tr: 'Endüstri Lideri: +15 Başlangıç altyapısı', en: 'Industrial Leader: +15 Starting infrastructure' },
    startingMilitary: 35,
    startingInfrastructure: 65,
    startingSoftPower: 40,
  },
  {
    id: 'cn',
    name: { tr: 'Çin', en: 'China' },
    flag: '🇨🇳',
    startingFunds: 750,
    perk: { tr: 'Ekonomi Devi: +%50 fabrika geliri', en: 'Economic Giant: +50% factory revenue' },
    startingMilitary: 60,
    startingInfrastructure: 55,
    startingSoftPower: 35,
  },
  {
    id: 'jp',
    name: { tr: 'Japonya', en: 'Japan' },
    flag: '🇯🇵',
    startingFunds: 650,
    perk: { tr: 'Teknoloji Öncüsü: +%25 AR&GE etkisi', en: 'Tech Pioneer: +25% R&D effect' },
    startingMilitary: 30,
    startingInfrastructure: 70,
    startingSoftPower: 50,
  },
  {
    id: 'br',
    name: { tr: 'Brezilya', en: 'Brazil' },
    flag: '🇧🇷',
    startingFunds: 550,
    perk: { tr: 'Doğal Kaynaklar: +$10M/ay ek gelir', en: 'Natural Resources: +$10M/mo extra income' },
    startingMilitary: 35,
    startingInfrastructure: 40,
    startingSoftPower: 45,
  },
];

export const INFRA_PRESETS: Omit<Infrastructure, 'count'>[] = [
  {
    id: 'factory',
    name: { tr: 'Tüketim Malları Fabrikası', en: 'Consumer Goods Factory' },
    desc: { tr: '+$12M/ay gelir', en: '+$12M/mo revenue' },
    cost: 50,
    icon: 'Factory',
  },
  {
    id: 'defense',
    name: { tr: 'Savunma Sanayi Kompleksi', en: 'Defense Industrial Complex' },
    desc: { tr: '+20 Askeri Güç, -$2M bakım', en: '+20 Military Power, -$2M maintenance' },
    cost: 80,
    icon: 'Shield',
  },
  {
    id: 'steel',
    name: { tr: 'Ağır Çelik & Enerji Santrali', en: 'Heavy Steel & Energy Plant' },
    desc: { tr: '+%8 Altyapı & dayanıklılık', en: '+8% Infrastructure & resilience' },
    cost: 100,
    icon: 'Zap',
  },
  {
    id: 'tech',
    name: { tr: 'Teknoloji & AR&GE Merkezi', en: 'Tech & R&D Center' },
    desc: { tr: 'Politika indirimleri & yumuşak güç', en: 'Policy discounts & soft power growth' },
    cost: 150,
    icon: 'FlaskConical',
  },
];

export const BRANCH_PRESETS: Omit<MilitaryBranch, 'units' | 'tier'>[] = [
  { id: 'land', name: { tr: 'Kara Kuvvetleri', en: 'Land Forces' }, maxTier: 5 },
  { id: 'air', name: { tr: 'Hava Kuvvetleri', en: 'Air Force' }, maxTier: 5 },
  { id: 'naval', name: { tr: 'Deniz Kuvvetleri', en: 'Naval Fleet' }, maxTier: 5 },
];

export const FOREIGN_PRESETS: Omit<ForeignNation, 'relation' | 'tradeDeal' | 'sanction'>[] = [
  { id: 'usa', name: { tr: 'ABD', en: 'USA' }, flag: '🇺🇸' },
  { id: 'rus', name: { tr: 'Rusya', en: 'Russia' }, flag: '🇷🇺' },
  { id: 'chn', name: { tr: 'Çin', en: 'China' }, flag: '🇨🇳' },
  { id: 'deu', name: { tr: 'Almanya', en: 'Germany' }, flag: '🇩🇪' },
  { id: 'gbr', name: { tr: 'İngiltere', en: 'UK' }, flag: '🇬🇧' },
  { id: 'jpn', name: { tr: 'Japonya', en: 'Japan' }, flag: '🇯🇵' },
  { id: 'fra', name: { tr: 'Fransa', en: 'France' }, flag: '🇫🇷' },
  { id: 'bra', name: { tr: 'Brezilya', en: 'Brazil' }, flag: '🇧🇷' },
];

export const REGION_PRESETS: Region[] = [
  {
    id: 'capital',
    name: { tr: 'Başkent Bölgesi', en: 'Capital Region' },
    owner: 'player',
    threat: 20,
    enemyPower: 0,
  },
  {
    id: 'northern',
    name: { tr: 'Kuzey Sınırı', en: 'Northern Border' },
    owner: 'enemy',
    threat: 65,
    enemyPower: 50,
  },
  {
    id: 'southern',
    name: { tr: 'Güney Geçidi', en: 'Southern Pass' },
    owner: 'neutral',
    threat: 40,
    enemyPower: 30,
  },
];

export const ELECTION_INTERVAL = 12;

export const UN_VOTE_INTERVAL = 6;

export const PACT_PRESETS: Pact[] = [
  {
    id: 'western_alliance',
    name: { tr: 'Batı İttifakı', en: 'Western Alliance' },
    type: 'military',
    members: ['usa', 'deu', 'gbr', 'fra'],
    founder: 'usa',
    mutualDefense: true,
    tradeBonus: 0,
  },
  {
    id: 'eastern_pact',
    name: { tr: 'Doğu Paktı', en: 'Eastern Pact' },
    type: 'military',
    members: ['rus', 'chn'],
    founder: 'rus',
    mutualDefense: true,
    tradeBonus: 0,
  },
  {
    id: 'trade_union',
    name: { tr: 'Ticaret Birliği', en: 'Trade Union' },
    type: 'economic',
    members: ['jpn', 'bra'],
    founder: 'jpn',
    mutualDefense: false,
    tradeBonus: 15,
  },
];

// ISO 3166-1 numeric codes for world-atlas topojson
export const NATION_ISO_MAP: Record<string, number> = {
  usa: 840,
  rus: 643,
  chn: 156,
  deu: 276,
  gbr: 826,
  jpn: 392,
  fra: 250,
  bra: 76,
  tur: 792,
  tr: 792,
  us: 840,
  cn: 156,
  de: 276,
  jp: 392,
  br: 76,
};

// === Strategic Resources & Global Trade ===

export const RESOURCE_IDS: ResourceId[] = [
  'oil', 'iron', 'copper', 'bauxite', 'rare_earth',
  'lithium', 'gas', 'grain', 'rubber', 'titanium',
];

export const RESOURCE_NAMES: Record<ResourceId, { tr: string; en: string }> = {
  oil: { tr: 'Ham Petrol', en: 'Crude Oil' },
  iron: { tr: 'Demir Cevheri', en: 'Iron Ore' },
  copper: { tr: 'Bakır', en: 'Copper' },
  bauxite: { tr: 'Boksit (Alüminyum)', en: 'Bauxite (Aluminum)' },
  rare_earth: { tr: 'Nadir Toprak Elementleri', en: 'Rare Earth Elements' },
  lithium: { tr: 'Lityum', en: 'Lithium' },
  gas: { tr: 'Doğal Gaz', en: 'Natural Gas' },
  grain: { tr: 'Tahıl', en: 'Grain' },
  rubber: { tr: 'Kauçuk', en: 'Rubber' },
  titanium: { tr: 'Titanyum', en: 'Titanium' },
};

export const RESOURCE_ICONS: Record<ResourceId, string> = {
  oil: '🛢️', iron: '⛏️', copper: '🟤', bauxite: '🟠', rare_earth: '✨',
  lithium: '🔋', gas: '🔥', grain: '🌾', rubber: '🟢', titanium: '⚪',
};

export const BASE_PRICES: Record<ResourceId, number> = {
  oil: 8, iron: 5, copper: 9, bauxite: 6, rare_earth: 25,
  lithium: 20, gas: 7, grain: 4, rubber: 6, titanium: 30,
};

export const PROCESSED_GOOD_NAMES: Record<ProcessedGoodId, { tr: string; en: string }> = {
  steel: { tr: 'Ağır Çelik', en: 'Heavy Steel' },
  fuel: { tr: 'Yakıt', en: 'Fuel' },
  polymers: { tr: 'Polimerler', en: 'Polymers' },
  microchips: { tr: 'Mikroçip', en: 'Microchips' },
};

export const PROCESSED_GOOD_ICONS: Record<ProcessedGoodId, string> = {
  steel: '🏗️', fuel: '⛽', polymers: '🧪', microchips: '💾',
};

export const PROCESSED_GOOD_IDS: ProcessedGoodId[] = ['steel', 'fuel', 'polymers', 'microchips'];

export const PROCESSED_BASE_PRICES: Record<ProcessedGoodId, number> = {
  steel: 18, fuel: 15, polymers: 22, microchips: 50,
};

export const ALL_TRADEABLE_IDS = [...RESOURCE_IDS, ...PROCESSED_GOOD_IDS] as (ResourceId | ProcessedGoodId)[];

export const FACTORY_DEFS: { id: FactoryId; name: { tr: string; en: string }; cost: number; type: 'extraction' | 'processing'; output: ResourceId | ProcessedGoodId; outputAmount: number; inputs?: { resource: ResourceId | ProcessedGoodId; amount: number }[] }[] = [
  // Extraction
  { id: 'oil_rig', name: { tr: 'Petrol Kulesi', en: 'Oil Rig' }, cost: 60, type: 'extraction', output: 'oil', outputAmount: 10 },
  { id: 'mine_iron', name: { tr: 'Demir Madeni', en: 'Iron Mine' }, cost: 50, type: 'extraction', output: 'iron', outputAmount: 12 },
  { id: 'mine_copper', name: { tr: 'Bakır Madeni', en: 'Copper Mine' }, cost: 55, type: 'extraction', output: 'copper', outputAmount: 8 },
  { id: 'mine_bauxite', name: { tr: 'Boksit Madeni', en: 'Bauxite Mine' }, cost: 50, type: 'extraction', output: 'bauxite', outputAmount: 10 },
  { id: 'mine_rare_earth', name: { tr: 'Nadir Toprak Madeni', en: 'Rare Earth Mine' }, cost: 120, type: 'extraction', output: 'rare_earth', outputAmount: 4 },
  { id: 'mine_lithium', name: { tr: 'Lityum Madeni', en: 'Lithium Mine' }, cost: 90, type: 'extraction', output: 'lithium', outputAmount: 6 },
  { id: 'gas_well', name: { tr: 'Doğal Gaz Kuyusu', en: 'Natural Gas Well' }, cost: 55, type: 'extraction', output: 'gas', outputAmount: 10 },
  { id: 'farm_grain', name: { tr: 'Tarım Bölgesi', en: 'Agricultural Zone' }, cost: 40, type: 'extraction', output: 'grain', outputAmount: 15 },
  { id: 'rubber_plantation', name: { tr: 'Kauçuk Plantasyonu', en: 'Rubber Plantation' }, cost: 45, type: 'extraction', output: 'rubber', outputAmount: 8 },
  { id: 'mine_titanium', name: { tr: 'Titanyum Madeni', en: 'Titanium Mine' }, cost: 100, type: 'extraction', output: 'titanium', outputAmount: 5 },
  // Processing
  { id: 'steel_mill', name: { tr: 'Çelik Fabrikası', en: 'Steel Mill' }, cost: 80, type: 'processing', output: 'steel', outputAmount: 5, inputs: [{ resource: 'iron', amount: 3 }, { resource: 'gas', amount: 2 }] },
  { id: 'refinery', name: { tr: 'Rafineri & Kimya Tesisi', en: 'Refinery & Chemical Plant' }, cost: 90, type: 'processing', output: 'fuel', outputAmount: 6, inputs: [{ resource: 'oil', amount: 4 }] },
  { id: 'chip_fab', name: { tr: 'Yarı İletken (Çip) Fabrikası', en: 'Semiconductor (Chip) Fab' }, cost: 150, type: 'processing', output: 'microchips', outputAmount: 3, inputs: [{ resource: 'rare_earth', amount: 2 }, { resource: 'copper', amount: 3 }] },
  { id: 'defense_complex', name: { tr: 'Gelişmiş Savunma Kompleksi', en: 'Advanced Defense Complex' }, cost: 200, type: 'processing', output: 'microchips', outputAmount: 0, inputs: [{ resource: 'steel', amount: 2 }, { resource: 'microchips', amount: 1 }, { resource: 'titanium', amount: 1 }, { resource: 'rubber', amount: 2 }] },
];

export const RECRUIT_MATERIAL_COSTS: Record<number, { steel: number; microchips: number; titanium: number }> = {
  1: { steel: 0, microchips: 0, titanium: 0 },
  2: { steel: 0, microchips: 0, titanium: 0 },
  3: { steel: 2, microchips: 1, titanium: 0 },
  4: { steel: 3, microchips: 2, titanium: 1 },
  5: { steel: 4, microchips: 3, titanium: 2 },
};

export const UPGRADE_MATERIAL_COSTS: Record<number, { steel: number; microchips: number; titanium: number }> = {
  3: { steel: 5, microchips: 3, titanium: 0 },
  4: { steel: 8, microchips: 5, titanium: 2 },
  5: { steel: 12, microchips: 8, titanium: 5 },
};

export const UPGRADE_MONEY_COSTS: Record<number, number> = {
  3: 60,
  4: 80,
  5: 100,
};

export const DEFAULT_STORAGE_CAP = 100;
export const DEFAULT_PROCESSED_STORAGE_CAP = 50;

export function createInitialResources(): Record<ResourceId, ResourceState> {
  const result = {} as Record<ResourceId, ResourceState>;
  for (const id of RESOURCE_IDS) {
    result[id] = { stockpile: 20, storageCap: DEFAULT_STORAGE_CAP, monthlyProduction: 0, monthlyConsumption: 0 };
  }
  return result;
}

export function createInitialProcessedGoods(): Record<ProcessedGoodId, ProcessedGoodState> {
  return {
    steel: { stockpile: 5, storageCap: DEFAULT_PROCESSED_STORAGE_CAP, monthlyProduction: 0 },
    fuel: { stockpile: 5, storageCap: DEFAULT_PROCESSED_STORAGE_CAP, monthlyProduction: 0 },
    polymers: { stockpile: 0, storageCap: DEFAULT_PROCESSED_STORAGE_CAP, monthlyProduction: 0 },
    microchips: { stockpile: 0, storageCap: DEFAULT_PROCESSED_STORAGE_CAP, monthlyProduction: 0 },
  };
}

export function createInitialFactories(): FactoryBuilding[] {
  return FACTORY_DEFS.map((f) => ({ id: f.id, count: 0 }));
}

export function createInitialMarketPrices(): Record<ResourceId | ProcessedGoodId, MarketPrice> {
  const result = {} as Record<ResourceId | ProcessedGoodId, MarketPrice>;
  for (const id of RESOURCE_IDS) {
    result[id] = { resourceId: id, price: BASE_PRICES[id], trend: 0 };
  }
  for (const id of PROCESSED_GOOD_IDS) {
    result[id] = { resourceId: id, price: PROCESSED_BASE_PRICES[id], trend: 0 };
  }
  return result;
}

export function createInitialTradeOrders(): TradeOrder[] {
  return [];
}

import type { TradeOrder } from './types';

export const UN_RESOLUTION_TYPES: { type: UNResolutionType; titleKey: string; descKey: string }[] = [
  { type: 'trade_embargo', titleKey: 'un_res_embargo_title', descKey: 'un_res_embargo_desc' },
  { type: 'arms_limitation', titleKey: 'un_res_arms_title', descKey: 'un_res_arms_desc' },
  { type: 'economic_aid', titleKey: 'un_res_aid_title', descKey: 'un_res_aid_desc' },
  { type: 'humanitarian_intervention', titleKey: 'un_res_human_title', descKey: 'un_res_human_desc' },
];

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'economic_crisis',
    titleKey: 'event_crisis_title',
    descKey: 'event_crisis_desc',
    options: [
      {
        labelKey: 'event_crisis_opt1',
        effect: (state: GameState) => ({ funds: state.funds - 40 }),
      },
      {
        labelKey: 'event_crisis_opt2',
        effect: (state: GameState) => ({ approval: clamp(state.approval - 12) }),
      },
    ],
  },
  {
    id: 'border_tension',
    titleKey: 'event_tension_title',
    descKey: 'event_tension_desc',
    options: [
      {
        labelKey: 'event_tension_opt1',
        effect: (state: GameState) => ({ funds: state.funds - 20, stability: clamp(state.stability + 5) }),
      },
      {
        labelKey: 'event_tension_opt2',
        effect: (state: GameState) => ({ approval: clamp(state.approval - 5) }),
      },
    ],
  },
  {
    id: 'mass_protest',
    titleKey: 'event_protest_title',
    descKey: 'event_protest_desc',
    options: [
      {
        labelKey: 'event_protest_opt1',
        effect: (state: GameState) => ({ stability: clamp(state.stability - 3), military: clamp(state.military + 5) }),
      },
      {
        labelKey: 'event_protest_opt2',
        effect: (state: GameState) => ({ approval: clamp(state.approval + 10), funds: state.funds - 10 }),
      },
    ],
  },
  {
    id: 'economic_boom',
    titleKey: 'event_boom_title',
    descKey: 'event_boom_desc',
    options: [
      {
        labelKey: 'event_boom_opt1',
        effect: (state: GameState) => ({ funds: state.funds + 50, inflation: clamp(state.inflation + 3) }),
      },
      {
        labelKey: 'event_boom_opt2',
        effect: (state: GameState) => ({ funds: state.funds + 30, stability: clamp(state.stability + 5) }),
      },
    ],
  },
  {
    id: 'natural_disaster',
    titleKey: 'event_disaster_title',
    descKey: 'event_disaster_desc',
    options: [
      {
        labelKey: 'event_disaster_opt1',
        effect: (state: GameState) => ({ funds: state.funds - 30, approval: clamp(state.approval + 8) }),
      },
      {
        labelKey: 'event_disaster_opt2',
        effect: (state: GameState) => ({ softPower: clamp(state.softPower + 10) }),
      },
    ],
  },
];
