import { useState } from 'react';
import { searchScryfallCards } from '../services/scryfall';
import { searchPokemonCards } from '../services/pokemon';
import { socketService } from '../services/socket';
import type { Card as CardType, CardGame, ZoneType } from '../types/card';

export function CardImport() {
  const [game, setGame] = useState<CardGame>('magic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetZone, setTargetZone] = useState<ZoneType>('deck');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      let results: CardType[] = [];
      if (game === 'magic') {
        results = await searchScryfallCards(searchQuery);
      } else if (game === 'pokemon') {
        results = await searchPokemonCards(searchQuery);
      }
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cards:', error);
      alert('Failed to search cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCard = (card: CardType) => {
    socketService.importCards([card], targetZone);
    alert(`Imported ${card.name} to ${targetZone}`);
  };

  const handleImportAll = () => {
    if (searchResults.length === 0) return;
    socketService.importCards(searchResults, targetZone);
    alert(`Imported ${searchResults.length} cards to ${targetZone}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200">Import Cards</h3>

      <div className="zone space-y-3">
        {/* Game Selection */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Card Game</label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value as CardGame)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          >
            <option value="magic">Magic: The Gathering</option>
            <option value="pokemon">Pokemon TCG</option>
          </select>
        </div>

        {/* Target Zone */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Import to Zone</label>
          <select
            value={targetZone}
            onChange={(e) => setTargetZone(e.target.value as ZoneType)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          >
            <option value="deck">Deck</option>
            <option value="hand">Hand</option>
            <option value="playArea">Play Area</option>
            <option value="discard">Discard</option>
            <option value="exile">Exile</option>
            <option value="prizes">Prizes</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">Search</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                game === 'magic'
                  ? 'e.g., Lightning Bolt'
                  : 'e.g., Pikachu'
              }
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">
                Found {searchResults.length} card(s)
              </p>
              <button
                onClick={handleImportAll}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white transition-colors"
              >
                Import All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start gap-3 p-3 bg-slate-700/50 rounded border border-slate-600"
                >
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-16 h-22 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {card.name}
                    </h4>
                    {card.type && (
                      <p className="text-xs text-slate-400">{card.type}</p>
                    )}
                    {card.set && (
                      <p className="text-xs text-slate-500">{card.set}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleImportCard(card)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors whitespace-nowrap"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
