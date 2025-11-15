import { Zone } from './Zone';
import { useGameStore } from '../store/gameStore';
import type { Player } from '../types/card';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isOpponent?: boolean;
}

export function PlayerBoard({ player, isCurrentPlayer, isOpponent = false }: PlayerBoardProps) {
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
  };

  // Only allow dragging for current player
  const canInteract = isCurrentPlayer;

  return (
    <div className={`space-y-3 ${isOpponent ? 'opacity-90' : ''}`}>
      {/* Player Name Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold text-slate-200">
          {player.name} {isCurrentPlayer && <span className="text-blue-400">(You)</span>}
        </h2>
        <div className="text-sm text-slate-400">
          Hand: {player.zones.hand.length} | Deck: {player.zones.deck.length}
        </div>
      </div>

      {/* Top Row: Deck and Prizes */}
      <div className="grid grid-cols-2 gap-3">
        <Zone
          id="deck"
          name="Deck"
          cards={player.zones.deck}
          hideCards={true}
        />
        <Zone
          id="prizes"
          name="Prizes"
          cards={player.zones.prizes}
          maxCards={6}
          onCardClick={canInteract ? handleCardClick : undefined}
        />
      </div>

      {/* Play Area - Larger */}
      <Zone
        id="playArea"
        name="Play Area"
        cards={player.zones.playArea}
        onCardClick={handleCardClick}
      />

      {/* Hand - Only show for current player */}
      {isCurrentPlayer && (
        <Zone
          id="hand"
          name="Your Hand"
          cards={player.zones.hand}
          onCardClick={handleCardClick}
        />
      )}

      {/* Bottom Row: Discard and Exile */}
      <div className="grid grid-cols-2 gap-3">
        <Zone
          id="discard"
          name="Discard"
          cards={player.zones.discard}
          onCardClick={handleCardClick}
        />
        <Zone
          id="exile"
          name="Exile"
          cards={player.zones.exile}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}
