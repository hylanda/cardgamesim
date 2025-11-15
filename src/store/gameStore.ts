import { create } from 'zustand';
import type { Card, GameAction, GameState, ZoneType } from '../types/card';

interface GameStore extends GameState {
  // Actions
  addCard: (card: Card, zone: ZoneType) => void;
  moveCard: (cardId: string, fromZone: ZoneType, toZone: ZoneType) => void;
  drawCards: (count: number) => void;
  shuffleDeck: () => void;
  searchDeck: (query: string) => Card[];
  setSelectedCard: (card: Card | null) => void;
  addAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  importCards: (cards: Card[], zone: ZoneType) => void;
  removeCardFromZone: (cardId: string, zone: ZoneType) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGameStore = create<GameStore>((set, get) => ({
  zones: {
    deck: [],
    hand: [],
    playArea: [],
    discard: [],
    exile: [],
    prizes: [],
  },
  actions: [],
  selectedCard: null,

  addCard: (card, zone) => {
    set((state) => ({
      zones: {
        ...state.zones,
        [zone]: [...state.zones[zone], card],
      },
    }));
    get().addAction({
      type: 'import',
      cardId: card.id,
      cardName: card.name,
      toZone: zone,
      description: `Added ${card.name} to ${zone}`,
    });
  },

  moveCard: (cardId, fromZone, toZone) => {
    const state = get();
    const card = state.zones[fromZone].find((c) => c.id === cardId);
    if (!card) return;

    set((state) => ({
      zones: {
        ...state.zones,
        [fromZone]: state.zones[fromZone].filter((c) => c.id !== cardId),
        [toZone]: [...state.zones[toZone], card],
      },
    }));

    get().addAction({
      type: 'move',
      cardId: card.id,
      cardName: card.name,
      fromZone,
      toZone,
      description: `Moved ${card.name} from ${fromZone} to ${toZone}`,
    });
  },

  drawCards: (count) => {
    const state = get();
    const deck = state.zones.deck;
    const cardsToDraw = deck.slice(-count);

    if (cardsToDraw.length === 0) return;

    set((state) => ({
      zones: {
        ...state.zones,
        deck: state.zones.deck.slice(0, -count),
        hand: [...state.zones.hand, ...cardsToDraw],
      },
    }));

    cardsToDraw.forEach((card) => {
      get().addAction({
        type: 'draw',
        cardId: card.id,
        cardName: card.name,
        fromZone: 'deck',
        toZone: 'hand',
        description: `Drew ${card.name}`,
      });
    });
  },

  shuffleDeck: () => {
    set((state) => ({
      zones: {
        ...state.zones,
        deck: shuffleArray(state.zones.deck),
      },
    }));

    get().addAction({
      type: 'shuffle',
      description: 'Shuffled the deck',
    });
  },

  searchDeck: (query) => {
    const state = get();
    const lowerQuery = query.toLowerCase();
    return state.zones.deck.filter((card) =>
      card.name.toLowerCase().includes(lowerQuery)
    );
  },

  setSelectedCard: (card) => {
    set({ selectedCard: card });
  },

  addAction: (action) => {
    set((state) => ({
      actions: [
        ...state.actions,
        {
          ...action,
          id: `action-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  importCards: (cards, zone) => {
    set((state) => ({
      zones: {
        ...state.zones,
        [zone]: [...state.zones[zone], ...cards],
      },
    }));

    get().addAction({
      type: 'import',
      description: `Imported ${cards.length} card(s) to ${zone}`,
    });
  },

  removeCardFromZone: (cardId, zone) => {
    set((state) => ({
      zones: {
        ...state.zones,
        [zone]: state.zones[zone].filter((c) => c.id !== cardId),
      },
    }));
  },
}));
