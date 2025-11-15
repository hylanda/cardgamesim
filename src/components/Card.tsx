import type { Card as CardType } from '../types/card';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface CardProps {
  card: CardType;
  onClick?: (card: CardType) => void;
  draggable?: boolean;
}

export function Card({ card, onClick, draggable = true }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggable,
    data: { card },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      onClick={() => onClick?.(card)}
      className={`card w-32 h-44 p-1 ${isDragging ? 'card-dragging' : ''}`}
      title={card.name}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
          <p className="text-xs font-bold mb-1">{card.name}</p>
          {card.manaCost && (
            <p className="text-xs text-slate-300">{card.manaCost}</p>
          )}
          {card.hp && <p className="text-xs text-slate-300">HP: {card.hp}</p>}
        </div>
      )}
    </div>
  );
}
