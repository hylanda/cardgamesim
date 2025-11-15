import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';

export function DeckControls() {
  const [drawCount, setDrawCount] = useState(1);

  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());

  const deckSize = currentPlayer?.zones.deck.length || 0;

  const handleDraw = () => {
    if (deckSize === 0) {
      alert('Deck is empty!');
      return;
    }
    socketService.drawCards(Math.min(drawCount, deckSize));
  };

  const handleShuffle = () => {
    socketService.shuffleDeck();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200">Quick Actions</h3>

      {/* Draw Controls */}
      <div className="zone space-y-2">
        <label className="text-sm text-slate-300">Draw Cards</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="10"
            value={drawCount}
            onChange={(e) => setDrawCount(parseInt(e.target.value) || 1)}
            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
          />
          <button
            onClick={handleDraw}
            disabled={deckSize === 0}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
          >
            Draw
          </button>
        </div>
      </div>

      {/* Shuffle */}
      <div className="zone">
        <button
          onClick={handleShuffle}
          disabled={deckSize === 0}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
        >
          Shuffle Deck
        </button>
      </div>

      <p className="text-xs text-slate-500 italic">
        Tip: Click on your deck pile to search for specific cards
      </p>
    </div>
  );
}
