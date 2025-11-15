import { create } from 'zustand';
import type { GameRoom, Card } from '../types/card';

interface GameStore {
  room: GameRoom | null;
  playerId: string | null;
  selectedCard: Card | null;
  isConnected: boolean;
  showMenu: boolean;

  setRoom: (room: GameRoom | null) => void;
  setPlayerId: (playerId: string | null) => void;
  setSelectedCard: (card: Card | null) => void;
  setIsConnected: (connected: boolean) => void;
  setShowMenu: (show: boolean) => void;
  toggleMenu: () => void;

  // Helper getters
  getCurrentPlayer: () => GameRoom['players'][0] | null;
  getOpponent: () => GameRoom['players'][0] | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  room: null,
  playerId: null,
  selectedCard: null,
  isConnected: false,
  showMenu: false,

  setRoom: (room) => set({ room }),

  setPlayerId: (playerId) => set({ playerId }),

  setSelectedCard: (card) => set({ selectedCard: card }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setShowMenu: (show) => set({ showMenu: show }),

  toggleMenu: () => set((state) => ({ showMenu: !state.showMenu })),

  getCurrentPlayer: () => {
    const { room, playerId } = get();
    if (!room || !playerId) return null;
    return room.players.find((p) => p.id === playerId) || null;
  },

  getOpponent: () => {
    const { room, playerId } = get();
    if (!room || !playerId) return null;
    return room.players.find((p) => p.id !== playerId) || null;
  },
}));
