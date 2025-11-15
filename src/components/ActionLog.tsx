import { useGameStore } from '../store/gameStore';

export function ActionLog() {
  const actions = useGameStore((state) => state.actions);
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);
  const zones = useGameStore((state) => state.zones);

  const handleCardClick = (cardId: string) => {
    // Find the card in any zone
    for (const zone of Object.values(zones)) {
      const card = zone.find((c) => c.id === cardId);
      if (card) {
        setSelectedCard(card);
        return;
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-200 mb-3">Action Log</h3>
      <div className="zone flex-1 overflow-y-auto max-h-96">
        {actions.length === 0 ? (
          <p className="text-slate-500 text-sm">No actions yet</p>
        ) : (
          <div className="space-y-2">
            {[...actions].reverse().map((action) => (
              <div
                key={action.id}
                className="text-sm p-2 bg-slate-700/50 rounded border border-slate-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-slate-300 flex-1">
                    {action.cardName && action.cardId ? (
                      <>
                        <button
                          onClick={() => handleCardClick(action.cardId!)}
                          className="text-blue-400 hover:text-blue-300 underline font-medium"
                        >
                          {action.cardName}
                        </button>
                        {' - '}
                        {action.description.replace(action.cardName, '').trim()}
                      </>
                    ) : (
                      action.description
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
