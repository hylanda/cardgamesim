import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';

interface LifeCounterProps {
  playerId: string;
  isCurrentPlayer: boolean;
}

export function LifeCounter({ playerId, isCurrentPlayer }: LifeCounterProps) {
  const player = useGameStore((state) =>
    state.room?.players.find((p) => p.id === playerId)
  );

  if (!player) return null;

  const life = player.state?.life ?? 20;
  const poison = player.state?.poison ?? 0;

  const handleLifeChange = (amount: number) => {
    if (!isCurrentPlayer) return;
    socketService.changeLife(amount);
  };

  const handlePoisonChange = (amount: number) => {
    if (!isCurrentPlayer) return;
    socketService.changePoison(amount);
  };

  return (
    <div className="flex gap-3">
      {/* Life Counter */}
      <div className="bg-slate-800 rounded-lg border-2 border-slate-600 p-3 flex-1">
        <div className="text-xs text-slate-400 mb-1 text-center">Life</div>
        <div className="flex items-center justify-between gap-2">
          {isCurrentPlayer && (
            <button
              onClick={() => handleLifeChange(-1)}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors"
            >
              -
            </button>
          )}
          <div className={`text-3xl font-bold text-center flex-1 ${
            life <= 0 ? 'text-red-500' : 'text-green-400'
          }`}>
            {life}
          </div>
          {isCurrentPlayer && (
            <button
              onClick={() => handleLifeChange(1)}
              className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded text-white font-bold transition-colors"
            >
              +
            </button>
          )}
        </div>
        {isCurrentPlayer && (
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => handleLifeChange(-5)}
              className="flex-1 px-2 py-1 bg-red-700 hover:bg-red-800 rounded text-xs text-white transition-colors"
            >
              -5
            </button>
            <button
              onClick={() => handleLifeChange(5)}
              className="flex-1 px-2 py-1 bg-green-700 hover:bg-green-800 rounded text-xs text-white transition-colors"
            >
              +5
            </button>
          </div>
        )}
      </div>

      {/* Poison Counter */}
      <div className="bg-slate-800 rounded-lg border-2 border-purple-600 p-3 flex-1">
        <div className="text-xs text-slate-400 mb-1 text-center">Poison</div>
        <div className="flex items-center justify-between gap-2">
          {isCurrentPlayer && (
            <button
              onClick={() => handlePoisonChange(-1)}
              className="w-8 h-8 bg-purple-700 hover:bg-purple-800 rounded text-white font-bold transition-colors"
            >
              -
            </button>
          )}
          <div className={`text-3xl font-bold text-center flex-1 ${
            poison >= 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'
          }`}>
            {poison}
          </div>
          {isCurrentPlayer && (
            <button
              onClick={() => handlePoisonChange(1)}
              className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded text-white font-bold transition-colors"
            >
              +
            </button>
          )}
        </div>
        {poison >= 10 && (
          <div className="text-xs text-red-400 text-center mt-1 font-semibold">
            DEFEATED
          </div>
        )}
      </div>
    </div>
  );
}
