export type CardGame = 'magic' | 'pokemon' | 'custom';

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  game: CardGame;
  // Magic specific
  manaCost?: string;
  type?: string;
  oracleText?: string;
  power?: string;
  toughness?: string;
  // Pokemon specific
  hp?: string;
  types?: string[];
  attacks?: Array<{
    name: string;
    damage?: string;
    cost?: string[];
  }>;
  // Common
  rarity?: string;
  set?: string;
  number?: string;
}

export type ZoneType = 'deck' | 'hand' | 'playArea' | 'discard' | 'exile' | 'prizes' | 'sideboard';

export interface CardInstance extends Card {
  instanceId: string;
  tapped: boolean;
  counters: Record<string, number>; // e.g., { '+1/+1': 2, '-1/-1': 1, 'loyalty': 4 }
}

export interface PlayerZones {
  deck: Card[];
  hand: Card[];
  playArea: CardInstance[];
  discard: Card[];
  exile: Card[];
  prizes: Card[];
  sideboard: Card[];
}

export interface PlayerState {
  life: number;
  poison: number;
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  zones: PlayerZones;
  state: PlayerState;
}

export interface GameAction {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  type: 'draw' | 'play' | 'discard' | 'exile' | 'shuffle' | 'search' | 'move' | 'import';
  cardId?: string;
  cardName?: string;
  fromZone?: ZoneType;
  toZone?: ZoneType;
  description: string;
}

export interface GameRoom {
  id: string;
  players: Player[];
  actions: GameAction[];
  maxPlayers: 2;
  createdAt: number;
}
