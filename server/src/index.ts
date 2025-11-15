import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager';
import type { ServerToClientEvents, ClientToServerEvents } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const gameManager = new GameManager();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('room:create', (playerName, callback) => {
    const playerId = `player-${Date.now()}-${Math.random()}`;
    const roomId = gameManager.createRoom(playerId, socket.id, playerName);

    socket.join(roomId);

    const room = gameManager.getRoom(roomId);
    if (room) {
      socket.emit('room:joined', room, playerId);
      callback(roomId);
      console.log(`Room created: ${roomId} by ${playerName}`);
    }
  });

  socket.on('room:join', (roomId, playerName, callback) => {
    const room = gameManager.getRoom(roomId);

    if (!room) {
      callback(false);
      socket.emit('game:error', 'Room not found');
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      callback(false);
      socket.emit('game:error', 'Room is full');
      return;
    }

    const playerId = `player-${Date.now()}-${Math.random()}`;
    const player = gameManager.joinRoom(roomId, playerId, socket.id, playerName);

    if (player) {
      socket.join(roomId);
      socket.emit('room:joined', room, playerId);
      socket.to(roomId).emit('player:joined', player);
      io.to(roomId).emit('game:state', room);
      callback(true);
      console.log(`${playerName} joined room: ${roomId}`);
    } else {
      callback(false);
      socket.emit('game:error', 'Failed to join room');
    }
  });

  socket.on('card:move', (cardId, fromZone, toZone) => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) return;

    const { room, player } = result;
    const success = gameManager.moveCard(room.id, player.id, cardId, fromZone, toZone);

    if (success) {
      io.to(room.id).emit('game:state', room);
    }
  });

  socket.on('deck:draw', (count) => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) return;

    const { room, player } = result;
    gameManager.drawCards(room.id, player.id, count);
    io.to(room.id).emit('game:state', room);
  });

  socket.on('deck:shuffle', () => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) return;

    const { room, player } = result;
    gameManager.shuffleDeck(room.id, player.id);
    io.to(room.id).emit('game:state', room);
  });

  socket.on('deck:search', (query, callback) => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) {
      callback([]);
      return;
    }

    const { room, player } = result;
    const results = gameManager.searchDeck(room.id, player.id, query);
    callback(results);
  });

  socket.on('card:import', (cards, zone) => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) return;

    const { room, player } = result;
    gameManager.importCards(room.id, player.id, cards, zone);
    io.to(room.id).emit('game:state', room);
  });

  socket.on('card:addToHand', (cardId) => {
    const result = gameManager.getPlayerBySocketId(socket.id);
    if (!result) return;

    const { room, player } = result;
    gameManager.addToHandFromDeck(room.id, player.id, cardId);
    io.to(room.id).emit('game:state', room);
  });

  socket.on('disconnect', () => {
    const result = gameManager.removePlayer(socket.id);
    if (result) {
      const { room, playerId } = result;
      io.to(room.id).emit('player:left', playerId);
      console.log(`Player ${playerId} disconnected from room ${room.id}`);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
