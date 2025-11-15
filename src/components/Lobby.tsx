import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { useGameStore } from '../store/gameStore';

interface LobbyProps {
  onGameStart: () => void;
}

export function Lobby({ onGameStart }: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  const setRoom = useGameStore((state) => state.setRoom);
  const setPlayerId = useGameStore((state) => state.setPlayerId);
  const setIsConnected = useGameStore((state) => state.setIsConnected);

  useEffect(() => {
    socketService.connect();

    socketService.onRoomJoined((room, playerId) => {
      setRoom(room);
      setPlayerId(playerId);
      setIsConnected(true);

      if (room.players.length === 2) {
        onGameStart();
      } else {
        setWaitingForOpponent(true);
      }
    });

    socketService.onPlayerJoined((player) => {
      console.log('Player joined:', player.name);
      setWaitingForOpponent(false);
      onGameStart();
    });

    socketService.onError((error) => {
      setError(error);
      setIsCreating(false);
      setIsJoining(false);
    });

    return () => {
      socketService.offRoomJoined(() => {});
      socketService.offPlayerJoined(() => {});
      socketService.offError(() => {});
    };
  }, [onGameStart, setRoom, setPlayerId, setIsConnected]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setError('');
    setIsCreating(true);

    try {
      const newRoomId = await socketService.createRoom(playerName);
      setRoomId(newRoomId);
      console.log('Room created:', newRoomId);
    } catch (err) {
      setError('Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter a room code');
      return;
    }

    setError('');
    setIsJoining(true);

    try {
      const success = await socketService.joinRoom(roomId.toUpperCase(), playerName);
      if (!success) {
        setError('Failed to join room. Room may be full or not exist.');
        setIsJoining(false);
      }
    } catch (err) {
      setError('Failed to join room');
      setIsJoining(false);
    }
  };

  if (waitingForOpponent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-8 border-2 border-slate-600">
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-400">
            Waiting for Opponent...
          </h2>
          <p className="text-center text-slate-300 mb-6">Room Code:</p>
          <div className="text-center">
            <code className="text-3xl font-mono bg-slate-900 px-6 py-3 rounded border-2 border-blue-500 text-blue-300">
              {roomId}
            </code>
          </div>
          <p className="text-center text-slate-400 mt-6 text-sm">
            Share this code with your opponent to join
          </p>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl p-8 border-2 border-slate-600">
        <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Card Game Simulator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !playerName.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
          >
            {isCreating ? 'Creating Room...' : 'Create New Game'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Enter room code"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-blue-500"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining || !playerName.trim() || !roomId.trim()}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
          >
            {isJoining ? 'Joining...' : 'Join Existing Game'}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Two players required to start a game
        </p>
      </div>
    </div>
  );
}
