import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Card as CardType } from '../types/card';

export function DeckControls() {
  const [drawCount, setDrawCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const drawCards = useGameStore((state) => state.drawCards);
  const shuffleDeck = useGameStore((state) => state.shuffleDeck);
  const searchDeck = useGameStore((state) => state.searchDeck);
  const moveCard = useGameStore((state) => state.moveCard);
  const deckSize = useGameStore((state) => state.zones.deck.length);

  const handleDraw = () => {
    if (deckSize === 0) {
      alert('Deck is empty!');
      return;
    }
    drawCards(Math.min(drawCount, deckSize));
  };

  const handleShuffle = () => {
    shuffleDeck();
    alert('Deck shuffled!');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }
    const results = searchDeck(searchQuery);
    setSearchResults(results);
    setShowSearch(true);
  };

  const handleAddToHand = (card: CardType) => {
    moveCard(card.id, 'deck', 'hand');
    setSearchResults(searchResults.filter((c) => c.id !== card.id));
    if (searchResults.length <= 1) {
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200">Deck Controls</h3>

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

      {/* Search */}
      <div className="zone space-y-2">
        <label className="text-sm text-slate-300">Search Deck</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Card name..."
            className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
          />
          <button
            onClick={handleSearch}
            disabled={deckSize === 0}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {showSearch && (
          <div className="mt-3 p-3 bg-slate-700/50 rounded border border-slate-600 max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-400">No cards found</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-300 font-medium">
                  Found {searchResults.length} card(s):
                </p>
                {searchResults.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-2 bg-slate-800 rounded"
                  >
                    <span className="text-sm text-white">{card.name}</span>
                    <button
                      onClick={() => handleAddToHand(card)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                    >
                      Add to Hand
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
