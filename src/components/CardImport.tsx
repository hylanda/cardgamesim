import { useState } from 'react';
import { searchScryfallCards } from '../services/scryfall';
import { searchPokemonCards } from '../services/pokemon';
import { importFromCubeCobra, importFromDecklistText } from '../services/cubecobra';
import { socketService } from '../services/socket';
import type { Card as CardType, CardGame, ZoneType } from '../types/card';

type ImportMode = 'search' | 'decklist' | 'cubecobra';

export function CardImport() {
  const [mode, setMode] = useState<ImportMode>('search');
  const [game, setGame] = useState<CardGame>('magic');
  const [searchQuery, setSearchQuery] = useState('');
  const [decklistText, setDecklistText] = useState('');
  const [cubeId, setCubeId] = useState('');
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

  const handleDecklistImport = async () => {
    if (!decklistText.trim()) {
      alert('Please enter a decklist');
      return;
    }

    setLoading(true);
    try {
      const cards = await importFromDecklistText(decklistText);
      if (cards.length > 0) {
        socketService.importCards(cards, targetZone);
        alert(`Successfully imported ${cards.length} cards to ${targetZone}`);
        setDecklistText('');
      } else {
        alert('No cards found. Please check your decklist format.');
      }
    } catch (error) {
      console.error('Error importing decklist:', error);
      alert('Failed to import decklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCubeCobraImport = async () => {
    if (!cubeId.trim()) {
      alert('Please enter a Cube Cobra ID');
      return;
    }

    setLoading(true);
    try {
      const cards = await importFromCubeCobra(cubeId);
      if (cards.length > 0) {
        socketService.importCards(cards, targetZone);
        alert(`Successfully imported ${cards.length} cards from Cube Cobra to ${targetZone}`);
        setCubeId('');
      } else {
        alert('No cards found. Please check the Cube Cobra ID.');
      }
    } catch (error) {
      console.error('Error importing from Cube Cobra:', error);
      alert('Failed to import from Cube Cobra. Please check the ID and try again.');
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

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-600">
        <button
          onClick={() => setMode('search')}
          className={`px-4 py-2 font-medium transition-colors ${
            mode === 'search'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setMode('decklist')}
          className={`px-4 py-2 font-medium transition-colors ${
            mode === 'decklist'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Decklist
        </button>
        <button
          onClick={() => setMode('cubecobra')}
          className={`px-4 py-2 font-medium transition-colors ${
            mode === 'cubecobra'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Cube Cobra
        </button>
      </div>

      <div className="zone space-y-3">
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

        {/* Search Mode */}
        {mode === 'search' && (
          <>
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
          </>
        )}

        {/* Decklist Mode */}
        {mode === 'decklist' && (
          <>
            <div>
              <label className="text-sm text-slate-300 block mb-2">
                Paste Decklist (MTG Format)
              </label>
              <textarea
                value={decklistText}
                onChange={(e) => setDecklistText(e.target.value)}
                placeholder={'4 Lightning Bolt\n3 Counterspell\n1 Black Lotus\n...'}
                rows={8}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Supports formats: "4 Card Name", "4x Card Name", or just "Card Name"
              </p>
            </div>
            <button
              onClick={handleDecklistImport}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
            >
              {loading ? 'Importing...' : 'Import Decklist'}
            </button>
          </>
        )}

        {/* Cube Cobra Mode */}
        {mode === 'cubecobra' && (
          <>
            <div>
              <label className="text-sm text-slate-300 block mb-2">
                Cube Cobra ID
              </label>
              <input
                type="text"
                value={cubeId}
                onChange={(e) => setCubeId(e.target.value)}
                placeholder="e.g., 5f4e..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Find the ID in the Cube Cobra URL: cubecobra.com/cube/overview/<strong>ID</strong>
              </p>
            </div>
            <button
              onClick={handleCubeCobraImport}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
            >
              {loading ? 'Importing...' : 'Import from Cube Cobra'}
            </button>
          </>
        )}

        {/* Results */}
        {mode === 'search' && searchResults.length > 0 && (
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
