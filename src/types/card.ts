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

export type ZoneType = 'deck' | 'hand' | 'playArea' | 'discard' | 'exile' | 'prizes';

export interface Zone {
  id: ZoneType;
  name: string;
  cards: Card[];
  maxCards?: number;
  allowSearch?: boolean;
}

export interface GameAction {
  id: string;
  timestamp: number;
  type: 'draw' | 'play' | 'discard' | 'exile' | 'shuffle' | 'search' | 'move' | 'import';
  cardId?: string;
  cardName?: string;
  fromZone?: ZoneType;
  toZone?: ZoneType;
  description: string;
}

export interface GameState {
  zones: Record<ZoneType, Card[]>;
  actions: GameAction[];
  selectedCard: Card | null;
}
