import type { Card as CardType, CardInstance } from '../types/card';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { socketService } from '../services/socket';

interface CardProps {
  card: CardType | CardInstance;
  onClick?: (card: CardType | CardInstance) => void;
  draggable?: boolean;
  showControls?: boolean;
}

function isCardInstance(card: CardType | CardInstance): card is CardInstance {
  return 'instanceId' in card;
}

export function Card({ card, onClick, draggable = true, showControls = true }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !draggable,
    data: { card },
  });

  const isInstance = isCardInstance(card);
  const tapped = isInstance && card.tapped;
  const counters = isInstance ? card.counters : {};

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstance && showControls) {
      socketService.toggleTap(card.instanceId);
    }
  };

  const style = {
    transform: tapped
      ? `${CSS.Translate.toString(transform)} rotate(90deg)`
      : CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transition: 'transform 0.2s ease',
  };

  const hasCounters = Object.keys(counters).length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(draggable ? listeners : {})}
      {...(draggable ? attributes : {})}
      onClick={() => onClick?.(card)}
      onDoubleClick={handleDoubleClick}
      className={`card w-32 h-44 p-1 relative ${isDragging ? 'card-dragging' : ''} ${tapped ? 'tapped' : ''}`}
      title={`${card.name}${tapped ? ' (Tapped)' : ''}`}
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

      {/* Counters Badge */}
      {hasCounters && (
        <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs px-1 rounded-bl">
          {Object.entries(counters).map(([type, count]) => (
            <div key={type} className="whitespace-nowrap">
              {type}: {count}
            </div>
          ))}
        </div>
      )}

      {/* Tapped Indicator */}
      {tapped && (
        <div className="absolute inset-0 bg-black/30 rounded pointer-events-none" />
      )}
    </div>
  );
}
