import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import type { Card as CardType, ZoneType } from '../types/card';

interface ZoneProps {
  id: ZoneType;
  name: string;
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  hideCards?: boolean;
  maxCards?: number;
  isPile?: boolean;
  onPileClick?: () => void;
}

export function Zone({ id, name, cards, onCardClick, hideCards = false, maxCards, isPile = false, onPileClick }: ZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Pile view (card-sized, clickable)
  if (isPile) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-200">{name}</h3>
          <span className="text-xs text-slate-400">
            {cards.length}{maxCards ? `/${maxCards}` : ''}
          </span>
        </div>
        <div
          ref={setNodeRef}
          onClick={onPileClick}
          className={`relative w-32 h-44 rounded-lg border-2 ${
            isOver ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-800/50'
          } cursor-pointer hover:border-blue-400 transition-all group`}
        >
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
              <div className="text-3xl mb-1">📭</div>
              <span>Empty</span>
            </div>
          ) : hideCards ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl text-slate-600">🂠</div>
              <span className="text-slate-400 text-xs mt-2">{cards.length}</span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Show top card */}
              <div className="absolute inset-0">
                <Card card={cards[cards.length - 1]} draggable={false} />
              </div>
              {/* Pile depth indicator */}
              {cards.length > 1 && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-slate-900">
                  {cards.length}
                </div>
              )}
              {/* Hover indicator */}
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors rounded-lg flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                  View Pile
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard zone view (spread out cards)
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-slate-200">{name}</h3>
        <span className="text-sm text-slate-400">
          {cards.length}{maxCards ? `/${maxCards}` : ''} cards
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`zone ${isOver ? 'zone-active' : ''} ${
          id === 'hand' ? 'min-h-48' : ''
        }`}
      >
        {hideCards ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl text-slate-600">🂠</div>
            <p className="text-slate-400 mt-2">{cards.length} cards</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Drop cards here
          </div>
        ) : (
          <div className={`flex flex-wrap gap-2 ${id === 'hand' ? 'justify-start' : ''}`}>
            {cards.map((card) => (
              <Card key={card.id} card={card} onClick={onCardClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
