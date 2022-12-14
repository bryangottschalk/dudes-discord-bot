export interface RootGameObject {
  activePlayer: ActivePlayer;
  allPlayers: Player[];
  events: Events;
  gameData: GameData;
}

export interface E {
  abilityLevel: number;
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface Passive {
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface Q {
  abilityLevel: number;
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface R {
  abilityLevel: number;
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface W {
  abilityLevel: number;
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface Abilities {
  E: E;
  Passive: Passive;
  Q: Q;
  R: R;
  W: W;
}

export interface ChampionStats {
  abilityHaste: number;
  abilityPower: number;
  armor: number;
  armorPenetrationFlat: number;
  armorPenetrationPercent: number;
  attackDamage: number;
  attackRange: number;
  attackSpeed: number;
  bonusArmorPenetrationPercent: number;
  bonusMagicPenetrationPercent: number;
  critChance: number;
  critDamage: number;
  currentHealth: number;
  healShieldPower: number;
  healthRegenRate: number;
  lifeSteal: number;
  magicLethality: number;
  magicPenetrationFlat: number;
  magicPenetrationPercent: number;
  magicResist: number;
  maxHealth: number;
  moveSpeed: number;
  omnivamp: number;
  physicalLethality: number;
  physicalVamp: number;
  resourceMax: number;
  resourceRegenRate: number;
  resourceType: string;
  resourceValue: number;
  spellVamp: number;
  tenacity: number;
}

export interface GeneralRune {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface Keystone {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface PrimaryRuneTree {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface SecondaryRuneTree {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface StatRune {
  id: number;
  rawDescription: string;
}

export interface FullRunes {
  generalRunes: GeneralRune[];
  keystone: Keystone;
  primaryRuneTree: PrimaryRuneTree;
  secondaryRuneTree: SecondaryRuneTree;
  statRunes: StatRune[];
}

export interface ActivePlayer {
  abilities: Abilities;
  championStats: ChampionStats;
  currentGold: number;
  fullRunes: FullRunes;
  level: number;
  summonerName: string;
  teamRelativeColors: boolean;
}

export interface Item {
  canUse: boolean;
  consumable: boolean;
  count: number;
  displayName: string;
  itemID: number;
  price: number;
  rawDescription: string;
  rawDisplayName: string;
  slot: number;
}

export interface Keystone2 {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface PrimaryRuneTree2 {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface SecondaryRuneTree2 {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface Runes {
  keystone: Keystone2;
  primaryRuneTree: PrimaryRuneTree2;
  secondaryRuneTree: SecondaryRuneTree2;
}

export interface Scores {
  assists: number;
  creepScore: number;
  deaths: number;
  kills: number;
  wardScore: number;
}

export interface SummonerSpellOne {
  displayName: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface SummonerSpellTwo {
  displayName: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface SummonerSpells {
  summonerSpellOne: SummonerSpellOne;
  summonerSpellTwo: SummonerSpellTwo;
}

export interface Player {
  championName: string;
  isBot: boolean;
  isDead: boolean;
  items: Item[];
  level: number;
  position: string;
  rawChampionName: string;
  respawnTimer: number;
  runes: Runes;
  scores: Scores;
  skinID: number;
  summonerName: string;
  summonerSpells: SummonerSpells;
  team: string;
  rawSkinName: string;
  skinName: string;
}

export interface Event {
  EventID: number;
  EventName: string;
  EventTime: number;
  KillerName: string;
  TurretKilled: string;
  Assisters: string[];
  InhibKilled: string;
  DragonType: string;
  Stolen: string;
  VictimName: string;
  KillStreak?: number;
  Acer: string;
  AcingTeam: string;
}

export interface RootEventsObject {
  Events: Event[];
}

export interface GameData {
  gameMode: string;
  gameTime: number;
  mapName: string;
  mapNumber: number;
  mapTerrain: string;
}
