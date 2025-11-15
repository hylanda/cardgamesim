import { useState } from 'react';
import { Card as CardComponent } from './Card';
import { socketService } from '../services/socket';
import type { Card, ZoneType } from '../types/card';

interface PileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  zoneName: string;
  zoneType: ZoneType;
  cards: Card[];
  canInteract: boolean;
  hideCards?: boolean;
}

export function PileViewer({ isOpen, onClose, zoneName, zoneType, cards, canInteract, hideCards = false }: PileViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCards = searchQuery
    ? cards.filter(card => card.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : cards;

  const handleDrawCard = (cardId: string) => {
    if (zoneType === 'deck') {
      socketService.addToHandFromDeck(cardId);
    }
  };

  const handleShuffle = () => {
    if (zoneType === 'deck') {
      socketService.shuffleDeck();
      alert('Deck shuffled!');
    }
  };

  const handleDraw = () => {
    if (zoneType === 'deck') {
      socketService.drawCards(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-600 max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-slate-200">{zoneName}</h2>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{cards.length} cards</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Deck-specific controls */}
        {zoneType === 'deck' && canInteract && (
          <div className="p-4 border-b border-slate-600 bg-slate-700/50">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleDraw}
                disabled={cards.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
              >
                Draw 1 Card
              </button>
              <button
                onClick={handleShuffle}
                disabled={cards.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
              >
                Shuffle Deck
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find card in deck..."
                className="flex-1 min-w-[200px] px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Search for other zones */}
        {zoneType !== 'deck' && cards.length > 0 && (
          <div className="p-4 border-b border-slate-600">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
            />
          </div>
        )}

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {hideCards && zoneType === 'deck' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🂠</div>
                <p className="text-slate-400">Deck is hidden to all players</p>
                <p className="text-slate-500 text-sm mt-2">Use controls above to draw or search</p>
              </div>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">
                {searchQuery ? 'No cards found' : 'No cards in this zone'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredCards.map((card) => (
                <div key={card.id} className="relative">
                  <CardComponent card={card} draggable={false} />
                  {zoneType === 'deck' && canInteract && (
                    <button
                      onClick={() => handleDrawCard(card.id)}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white font-medium transition-colors"
                    >
                      Add to Hand
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
