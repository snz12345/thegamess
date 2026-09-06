export type Lang = 'tr' | 'en';

export type ViewName = 'overview' | 'economy' | 'military' | 'diplomacy' | 'politics' | 'map' | 'pacts' | 'market';

export type RelationStatus = 'allied' | 'friendly' | 'neutral' | 'hostile';

export interface CountryPreset {
  id: string;
  name: { tr: string; en: string };
  flag: string;
  startingFunds: number;
  perk: { tr: string; en: string };
  startingMilitary: number;
  startingInfrastructure: number;
  startingSoftPower: number;
}

export interface ForeignNation {
  id: string;
  name: { tr: string; en: string };
  flag: string;
  relation: RelationStatus;
  tradeDeal: boolean;
  sanction: boolean;
}

export interface Infrastructure {
  id: string;
  name: { tr: string; en: string };
  desc: { tr: string; en: string };
  cost: number;
  count: number;
  icon: string;
}

export type MilitaryBranchId = 'land' | 'air' | 'naval';

export interface MilitaryBranch {
  id: MilitaryBranchId;
  name: { tr: string; en: string };
  tier: number;
  units: number;
  maxTier: number;
}

export type RegionOwner = 'player' | 'neutral' | 'enemy';

export interface Region {
  id: string;
  name: { tr: string; en: string };
  owner: RegionOwner;
  threat: number;
  enemyPower: number;
}

export interface GameEvent {
  id: string;
  titleKey: string;
  descKey: string;
  options: {
    labelKey: string;
    effect: (state: GameState) => Partial<GameState>;
  }[];
}

export interface ActiveEvent {
  event: GameEvent;
}

export type PactType = 'military' | 'economic';

export interface Pact {
  id: string;
  name: { tr: string; en: string };
  type: PactType;
  members: string[];
  founder: string;
  mutualDefense: boolean;
  tradeBonus: number;
}

export type UNVote = 'yes' | 'no' | 'abstain';

export type UNResolutionType =
  | 'trade_embargo'
  | 'arms_limitation'
  | 'economic_aid'
  | 'humanitarian_intervention';

export interface UNResolution {
  id: string;
  type: UNResolutionType;
  titleKey: string;
  descKey: string;
  targetNationId: string;
  turnsLeft: number;
  playerVote: UNVote | null;
  passed: boolean;
  resolved: boolean;
}

export type ResourceId =
  | 'oil' | 'iron' | 'copper' | 'bauxite' | 'rare_earth'
  | 'lithium' | 'gas' | 'grain' | 'rubber' | 'titanium';

export type ProcessedGoodId = 'steel' | 'fuel' | 'polymers' | 'microchips';

export type TradeableId = ResourceId | ProcessedGoodId;

export interface ResourceState {
  stockpile: number;
  storageCap: number;
  monthlyProduction: number;
  monthlyConsumption: number;
}

export interface ProcessedGoodState {
  stockpile: number;
  storageCap: number;
  monthlyProduction: number;
}

export type FactoryId =
  | 'oil_rig' | 'mine_iron' | 'mine_copper' | 'mine_bauxite'
  | 'mine_rare_earth' | 'mine_lithium' | 'gas_well' | 'farm_grain'
  | 'rubber_plantation' | 'mine_titanium'
  | 'steel_mill' | 'refinery' | 'chip_fab' | 'defense_complex';

export interface FactoryBuilding {
  id: FactoryId;
  count: number;
}

export type TradeOrderType = 'buy' | 'sell';

export interface TradeOrder {
  id: string;
  resourceId: TradeableId;
  type: TradeOrderType;
  amount: number;
  active: boolean;
}

export interface MarketPrice {
  resourceId: TradeableId;
  price: number;
  trend: number;
}

export interface GameState {
  countryId: string;
  turn: number;
  funds: number;
  approval: number;
  stability: number;
  inflation: number;
  military: number;
  infrastructure: number;
  softPower: number;
  opposition: number;
  electionTimer: number;
  infrastructures: Infrastructure[];
  branches: MilitaryBranch[];
  foreign: ForeignNation[];
  regions: Region[];
  pacts: Pact[];
  playerPactId: string | null;
  unResolutions: UNResolution[];
  unVoteTimer: number;
  resources: Record<ResourceId, ResourceState>;
  processedGoods: Record<ProcessedGoodId, ProcessedGoodState>;
  factories: FactoryBuilding[];
  tradeOrders: TradeOrder[];
  marketPrices: Record<TradeableId, MarketPrice>;
  tradeBalance: number;
  log: LogEntry[];
  gameOver: boolean;
  gameOverReason?: { tr: string; en: string };
  activeEvent?: ActiveEvent | null;
}

export interface LogEntry {
  turn: number;
  text: { tr: string; en: string };
}
