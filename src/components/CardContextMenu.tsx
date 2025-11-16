import { useState, useEffect } from 'react';
import type { CardInstance } from '../types/card';
import { socketService } from '../services/socket';

interface CardContextMenuProps {
  card: CardInstance | null;
  position: { x: number; y: number };
  onClose: () => void;
}

const COUNTER_TYPES = [
  { value: '+1/+1', label: '+1/+1 Counter' },
  { value: '-1/-1', label: '-1/-1 Counter' },
  { value: 'loyalty', label: 'Loyalty Counter' },
  { value: 'charge', label: 'Charge Counter' },
  { value: 'poison', label: 'Poison Counter' },
  { value: 'shield', label: 'Shield Counter' },
  { value: 'energy', label: 'Energy Counter' },
  { value: 'damage', label: 'Damage Counter' },
];

export function CardContextMenu({ card, position, onClose }: CardContextMenuProps) {
  const [selectedCounter, setSelectedCounter] = useState('+1/+1');

  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!card) return null;

  const handleAddCounter = () => {
    socketService.addCounter(card.instanceId, selectedCounter, 1);
    onClose();
  };

  const handleRemoveCounter = () => {
    socketService.removeCounter(card.instanceId, selectedCounter, 1);
    onClose();
  };

  const handleTap = () => {
    socketService.tap(card.instanceId);
    onClose();
  };

  const handleUntap = () => {
    socketService.untap(card.instanceId);
    onClose();
  };

  return (
    <div
      className="fixed bg-slate-800 border-2 border-slate-600 rounded-lg shadow-2xl p-2 z-50 min-w-[200px]"
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-xs font-bold text-slate-300 mb-2 px-2 py-1 border-b border-slate-600">
        {card.name}
      </div>

      {/* Tap/Untap */}
      <div className="mb-2">
        <button
          onClick={handleTap}
          disabled={card.tapped}
          className="w-full px-3 py-1 text-sm text-left hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors rounded"
        >
          Tap
        </button>
        <button
          onClick={handleUntap}
          disabled={!card.tapped}
          className="w-full px-3 py-1 text-sm text-left hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors rounded"
        >
          Untap
        </button>
      </div>

      <div className="border-t border-slate-600 pt-2 mb-2">
        <div className="text-xs text-slate-400 px-2 mb-1">Counter Type:</div>
        <select
          value={selectedCounter}
          onChange={(e) => setSelectedCounter(e.target.value)}
          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white mb-2"
        >
          {COUNTER_TYPES.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      {/* Counter Actions */}
      <div className="flex gap-1">
        <button
          onClick={handleAddCounter}
          className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white transition-colors"
        >
          Add
        </button>
        <button
          onClick={handleRemoveCounter}
          className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Current Counters */}
      {Object.keys(card.counters).length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-600">
          <div className="text-xs text-slate-400 px-2 mb-1">Current:</div>
          <div className="px-2 text-xs space-y-1">
            {Object.entries(card.counters).map(([type, count]) => (
              <div key={type} className="flex justify-between text-slate-300">
                <span>{type}:</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
