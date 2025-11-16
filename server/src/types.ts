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
  counters: Record<string, number>;
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

export interface ServerToClientEvents {
  'game:state': (room: GameRoom) => void;
  'game:action': (action: GameAction) => void;
  'game:error': (error: string) => void;
  'room:joined': (room: GameRoom, playerId: string) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (playerName: string, callback: (roomId: string) => void) => void;
  'room:join': (roomId: string, playerName: string, callback: (success: boolean) => void) => void;
  'card:move': (cardId: string, fromZone: ZoneType, toZone: ZoneType) => void;
  'card:tap': (instanceId: string) => void;
  'card:untap': (instanceId: string) => void;
  'card:toggleTap': (instanceId: string) => void;
  'card:addCounter': (instanceId: string, counterType: string, amount: number) => void;
  'card:removeCounter': (instanceId: string, counterType: string, amount: number) => void;
  'deck:draw': (count: number) => void;
  'deck:shuffle': () => void;
  'deck:mulligan': () => void;
  'deck:search': (query: string, callback: (results: Card[]) => void) => void;
  'card:import': (cards: Card[], zone: ZoneType) => void;
  'card:addToHand': (cardId: string) => void;
  'player:setLife': (life: number) => void;
  'player:changeLife': (amount: number) => void;
  'player:setPoison': (poison: number) => void;
  'player:changePoison': (amount: number) => void;
  'token:create': (token: Card) => void;
}
