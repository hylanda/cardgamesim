import { Card, GameRoom, Player, PlayerZones, GameAction, ZoneType } from './types';

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(playerId: string, socketId: string, playerName: string): string {
    const roomId = this.generateRoomId();

    const player: Player = {
      id: playerId,
      socketId,
      name: playerName,
      zones: this.createEmptyZones(),
    };

    const room: GameRoom = {
      id: roomId,
      players: [player],
      actions: [],
      maxPlayers: 2,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    return roomId;
  }

  joinRoom(roomId: string, playerId: string, socketId: string, playerName: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length >= room.maxPlayers) return null;

    const player: Player = {
      id: playerId,
      socketId,
      name: playerName,
      zones: this.createEmptyZones(),
    };

    room.players.push(player);
    return player;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  getPlayerBySocketId(socketId: string): { room: GameRoom; player: Player } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  removePlayer(socketId: string): { room: GameRoom; playerId: string } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;

    const { room, player } = result;
    room.players = room.players.filter(p => p.socketId !== socketId);

    // Remove room if empty
    if (room.players.length === 0) {
      this.rooms.delete(room.id);
    }

    return { room, playerId: player.id };
  }

  moveCard(roomId: string, playerId: string, cardId: string, fromZone: ZoneType, toZone: ZoneType): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const card = player.zones[fromZone].find(c => c.id === cardId);
    if (!card) return false;

    // Remove from source zone
    player.zones[fromZone] = player.zones[fromZone].filter(c => c.id !== cardId);

    // Add to destination zone
    player.zones[toZone].push(card);

    // Log action
    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'move',
      cardId: card.id,
      cardName: card.name,
      fromZone,
      toZone,
      description: `${player.name} moved ${card.name} from ${fromZone} to ${toZone}`,
    });

    return true;
  }

  drawCards(roomId: string, playerId: string, count: number): Card[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const player = room.players.find(p => p.id === playerId);
    if (!player) return [];

    const deck = player.zones.deck;
    const cardsToDraw = deck.slice(-count);

    player.zones.deck = deck.slice(0, -count);
    player.zones.hand.push(...cardsToDraw);

    cardsToDraw.forEach(card => {
      this.addAction(room, {
        playerId: player.id,
        playerName: player.name,
        type: 'draw',
        cardId: card.id,
        cardName: card.name,
        fromZone: 'deck',
        toZone: 'hand',
        description: `${player.name} drew ${card.name}`,
      });
    });

    return cardsToDraw;
  }

  shuffleDeck(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.zones.deck = this.shuffleArray(player.zones.deck);

    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'shuffle',
      description: `${player.name} shuffled their deck`,
    });

    return true;
  }

  searchDeck(roomId: string, playerId: string, query: string): Card[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const player = room.players.find(p => p.id === playerId);
    if (!player) return [];

    const lowerQuery = query.toLowerCase();
    return player.zones.deck.filter(card =>
      card.name.toLowerCase().includes(lowerQuery)
    );
  }

  importCards(roomId: string, playerId: string, cards: Card[], zone: ZoneType): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.zones[zone].push(...cards);

    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'import',
      description: `${player.name} imported ${cards.length} card(s) to ${zone}`,
    });

    return true;
  }

  addToHandFromDeck(roomId: string, playerId: string, cardId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const card = player.zones.deck.find(c => c.id === cardId);
    if (!card) return false;

    player.zones.deck = player.zones.deck.filter(c => c.id !== cardId);
    player.zones.hand.push(card);

    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'move',
      cardId: card.id,
      cardName: card.name,
      fromZone: 'deck',
      toZone: 'hand',
      description: `${player.name} added ${card.name} to hand`,
    });

    return true;
  }

  private addAction(room: GameRoom, actionData: Omit<GameAction, 'id' | 'timestamp'>) {
    const action: GameAction = {
      ...actionData,
      id: `action-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    room.actions.push(action);
  }

  private createEmptyZones(): PlayerZones {
    return {
      deck: [],
      hand: [],
      playArea: [],
      discard: [],
      exile: [],
      prizes: [],
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
