import { io, Socket } from 'socket.io-client';
import type { Card, GameRoom, ZoneType, Player } from '../types/card';

interface ServerToClientEvents {
  'game:state': (room: GameRoom) => void;
  'game:action': (action: any) => void;
  'game:error': (error: string) => void;
  'room:joined': (room: GameRoom, playerId: string) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
}

interface ClientToServerEvents {
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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  autoConnect: false,
});

export const socketService = {
  connect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    if (socket.connected) {
      socket.disconnect();
    }
  },

  createRoom: (playerName: string): Promise<string> => {
    return new Promise((resolve) => {
      socket.emit('room:create', playerName, (roomId) => {
        resolve(roomId);
      });
    });
  },

  joinRoom: (roomId: string, playerName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      socket.emit('room:join', roomId, playerName, (success) => {
        resolve(success);
      });
    });
  },

  moveCard: (cardId: string, fromZone: ZoneType, toZone: ZoneType) => {
    socket.emit('card:move', cardId, fromZone, toZone);
  },

  drawCards: (count: number) => {
    socket.emit('deck:draw', count);
  },

  shuffleDeck: () => {
    socket.emit('deck:shuffle');
  },

  searchDeck: (query: string): Promise<Card[]> => {
    return new Promise((resolve) => {
      socket.emit('deck:search', query, (results) => {
        resolve(results);
      });
    });
  },

  importCards: (cards: Card[], zone: ZoneType) => {
    socket.emit('card:import', cards, zone);
  },

  addToHandFromDeck: (cardId: string) => {
    socket.emit('card:addToHand', cardId);
  },

  toggleTap: (instanceId: string) => {
    socket.emit('card:toggleTap', instanceId);
  },

  tap: (instanceId: string) => {
    socket.emit('card:tap', instanceId);
  },

  untap: (instanceId: string) => {
    socket.emit('card:untap', instanceId);
  },

  addCounter: (instanceId: string, counterType: string, amount: number = 1) => {
    socket.emit('card:addCounter', instanceId, counterType, amount);
  },

  removeCounter: (instanceId: string, counterType: string, amount: number = 1) => {
    socket.emit('card:removeCounter', instanceId, counterType, amount);
  },

  mulligan: () => {
    socket.emit('deck:mulligan');
  },

  setLife: (life: number) => {
    socket.emit('player:setLife', life);
  },

  changeLife: (amount: number) => {
    socket.emit('player:changeLife', amount);
  },

  setPoison: (poison: number) => {
    socket.emit('player:setPoison', poison);
  },

  changePoison: (amount: number) => {
    socket.emit('player:changePoison', amount);
  },

  createToken: (token: Card) => {
    socket.emit('token:create', token);
  },

  onGameState: (callback: (room: GameRoom) => void) => {
    socket.on('game:state', callback);
  },

  onRoomJoined: (callback: (room: GameRoom, playerId: string) => void) => {
    socket.on('room:joined', callback);
  },

  onPlayerJoined: (callback: (player: Player) => void) => {
    socket.on('player:joined', callback);
  },

  onPlayerLeft: (callback: (playerId: string) => void) => {
    socket.on('player:left', callback);
  },

  onError: (callback: (error: string) => void) => {
    socket.on('game:error', callback);
  },

  offGameState: (callback: (room: GameRoom) => void) => {
    socket.off('game:state', callback);
  },

  offRoomJoined: (callback: (room: GameRoom, playerId: string) => void) => {
    socket.off('room:joined', callback);
  },

  offPlayerJoined: (callback: (player: Player) => void) => {
    socket.off('player:joined', callback);
  },

  offPlayerLeft: (callback: (playerId: string) => void) => {
    socket.off('player:left', callback);
  },

  offError: (callback: (error: string) => void) => {
    socket.off('game:error', callback);
  },
};
