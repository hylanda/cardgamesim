import { useGameStore } from '../store/gameStore';
import type { Card } from '../types/card';

export function ActionLog() {
  const room = useGameStore((state) => state.room);
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);

  const handleCardClick = (cardId: string) => {
    if (!room) return;

    // Find the card in any player's zones
    for (const player of room.players) {
      for (const zone of Object.values(player.zones)) {
        const card = zone.find((c: Card) => c.id === cardId);
        if (card) {
          setSelectedCard(card);
          return;
        }
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!room) return null;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-200 mb-3">Action Log</h3>
      <div className="zone flex-1 overflow-y-auto max-h-96">
        {room.actions.length === 0 ? (
          <p className="text-slate-500 text-sm">No actions yet</p>
        ) : (
          <div className="space-y-2">
            {[...room.actions].reverse().map((action) => (
              <div
                key={action.id}
                className="text-sm p-2 bg-slate-700/50 rounded border border-slate-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-slate-300 flex-1">
                    <span className="font-medium text-blue-300">{action.playerName}:</span>{' '}
                    {action.cardName && action.cardId ? (
                      <>
                        <button
                          onClick={() => handleCardClick(action.cardId!)}
                          className="text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                          {action.cardName}
                        </button>
                        {' - '}
                        {action.description.replace(action.cardName, '').replace(action.playerName, '').trim()}
                      </>
                    ) : (
                      action.description.replace(action.playerName, '').trim()
                    )}
                  </p>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatTime(action.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
