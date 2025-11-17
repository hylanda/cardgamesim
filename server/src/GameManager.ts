import { Card, GameRoom, Player, PlayerZones, GameAction, ZoneType } from './types';
import { gameSessionRepository } from './database/repositories/GameSessionRepository';
import { gameStateSnapshotRepository } from './database/repositories/GameStateSnapshotRepository';

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private sessionIds: Map<string, string> = new Map(); // roomId -> sessionId
  private actionCounts: Map<string, number> = new Map(); // roomId -> action count

  createRoom(playerId: string, socketId: string, playerName: string): string {
    const roomId = this.generateRoomId();

    const player: Player = {
      id: playerId,
      socketId,
      name: playerName,
      zones: this.createEmptyZones(),
      state: {
        life: 20,
        poison: 0,
      },
    };

    const room: GameRoom = {
      id: roomId,
      players: [player],
      actions: [],
      maxPlayers: 2,
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.actionCounts.set(roomId, 0);

    // Create database session
    try {
      const session = gameSessionRepository.create({
        room_id: roomId,
        player1_id: playerId,
      });
      this.sessionIds.set(roomId, session.id);
    } catch (error) {
      console.error('Failed to create game session in database:', error);
    }

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
      state: {
        life: 20,
        poison: 0,
      },
    };

    room.players.push(player);

    // Update database session with second player
    const sessionId = this.sessionIds.get(roomId);
    if (sessionId) {
      try {
        gameSessionRepository.addPlayer2(sessionId, playerId);
      } catch (error) {
        console.error('Failed to update game session with player 2:', error);
      }
    }

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

    const card = player.zones[fromZone].find((c: any) => c.id === cardId);
    if (!card) return false;

    // Remove from source zone (type assertion needed because of union types)
    (player.zones[fromZone] as any[]) = player.zones[fromZone].filter((c: any) => c.id !== cardId);

    // Add to destination zone
    if (toZone === 'playArea') {
      // Convert to CardInstance if moving to play area
      const cardInstance: any = {
        ...(card as any),
        instanceId: (card as any).instanceId || `instance-${Date.now()}-${Math.random()}`,
        tapped: (card as any).tapped || false,
        counters: (card as any).counters || {},
      };
      player.zones[toZone].push(cardInstance);
    } else {
      // Strip instance properties if moving out of play area
      if (fromZone === 'playArea') {
        const { instanceId, tapped, counters, ...baseCard } = card as any;
        (player.zones[toZone] as any[]).push(baseCard);
      } else {
        (player.zones[toZone] as any[]).push(card);
      }
    }

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

    if (zone === 'playArea') {
      // Convert to CardInstances if importing to play area
      const cardInstances = cards.map(card => ({
        ...card,
        instanceId: `instance-${Date.now()}-${Math.random()}`,
        tapped: false,
        counters: {},
      }));
      player.zones[zone].push(...cardInstances);
    } else {
      (player.zones[zone] as any[]).push(...cards);
    }

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

  toggleTap(roomId: string, playerId: string, instanceId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const cardInstance = player.zones.playArea.find(c => c.instanceId === instanceId);
    if (!cardInstance) return false;

    cardInstance.tapped = !cardInstance.tapped;

    return true;
  }

  tap(roomId: string, playerId: string, instanceId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const cardInstance = player.zones.playArea.find(c => c.instanceId === instanceId);
    if (!cardInstance) return false;

    cardInstance.tapped = true;

    return true;
  }

  untap(roomId: string, playerId: string, instanceId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const cardInstance = player.zones.playArea.find(c => c.instanceId === instanceId);
    if (!cardInstance) return false;

    cardInstance.tapped = false;

    return true;
  }

  addCounter(roomId: string, playerId: string, instanceId: string, counterType: string, amount: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const cardInstance = player.zones.playArea.find(c => c.instanceId === instanceId);
    if (!cardInstance) return false;

    cardInstance.counters[counterType] = (cardInstance.counters[counterType] || 0) + amount;

    return true;
  }

  removeCounter(roomId: string, playerId: string, instanceId: string, counterType: string, amount: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const cardInstance = player.zones.playArea.find(c => c.instanceId === instanceId);
    if (!cardInstance) return false;

    const current = cardInstance.counters[counterType] || 0;
    cardInstance.counters[counterType] = Math.max(0, current - amount);

    if (cardInstance.counters[counterType] === 0) {
      delete cardInstance.counters[counterType];
    }

    return true;
  }

  setLife(roomId: string, playerId: string, life: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.state.life = life;

    return true;
  }

  changeLife(roomId: string, playerId: string, amount: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.state.life += amount;

    return true;
  }

  setPoison(roomId: string, playerId: string, poison: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.state.poison = poison;

    return true;
  }

  changePoison(roomId: string, playerId: string, amount: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    player.state.poison = Math.max(0, player.state.poison + amount);

    return true;
  }

  mulligan(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    // Put hand back into deck
    player.zones.deck.push(...player.zones.hand);
    player.zones.hand = [];

    // Shuffle deck
    player.zones.deck = this.shuffleArray(player.zones.deck);

    // Draw 7 cards (or however many are in deck)
    const cardsToDraw = Math.min(7, player.zones.deck.length);
    const drawnCards = player.zones.deck.slice(-cardsToDraw);
    player.zones.deck = player.zones.deck.slice(0, -cardsToDraw);
    player.zones.hand = drawnCards;

    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'shuffle',
      description: `${player.name} took a mulligan`,
    });

    return true;
  }

  createToken(roomId: string, playerId: string, token: Card): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    // Create a CardInstance from the token
    const tokenInstance = {
      ...token,
      instanceId: `token-${Date.now()}-${Math.random()}`,
      tapped: false,
      counters: {},
    };

    player.zones.playArea.push(tokenInstance);

    this.addAction(room, {
      playerId: player.id,
      playerName: player.name,
      type: 'play',
      cardId: tokenInstance.id,
      cardName: tokenInstance.name,
      toZone: 'playArea',
      description: `${player.name} created a ${token.name} token`,
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

    // Increment action count and auto-save every 10 actions
    const roomId = room.id;
    const currentCount = (this.actionCounts.get(roomId) || 0) + 1;
    this.actionCounts.set(roomId, currentCount);

    if (currentCount % 10 === 0) {
      this.autoSaveGameState(roomId);
    }
  }

  private autoSaveGameState(roomId: string) {
    const room = this.rooms.get(roomId);
    const sessionId = this.sessionIds.get(roomId);
    const actionCount = this.actionCounts.get(roomId);

    if (!room || !sessionId || actionCount === undefined) {
      return;
    }

    try {
      gameStateSnapshotRepository.create(sessionId, actionCount, room);
      console.log(`Auto-saved game state for room ${roomId} at action ${actionCount}`);

      // Prune old snapshots to keep only last 50
      gameStateSnapshotRepository.pruneOldSnapshots(sessionId, 50);
    } catch (error) {
      console.error('Failed to auto-save game state:', error);
    }
  }

  // Load game state from database
  loadGameState(roomId: string): GameRoom | null {
    const sessionId = this.sessionIds.get(roomId);
    if (!sessionId) return null;

    try {
      const snapshot = gameStateSnapshotRepository.findLatestBySessionId(sessionId);
      if (!snapshot) return null;

      const room = snapshot.state_data;
      this.rooms.set(roomId, room);
      this.actionCounts.set(roomId, snapshot.action_count);

      return room;
    } catch (error) {
      console.error('Failed to load game state:', error);
      return null;
    }
  }

  private createEmptyZones(): PlayerZones {
    return {
      deck: [],
      hand: [],
      playArea: [],
      discard: [],
      exile: [],
      prizes: [],
      sideboard: [],
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
