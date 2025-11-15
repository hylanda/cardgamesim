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
}

export function Zone({ id, name, cards, onCardClick, hideCards = false, maxCards }: ZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

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
