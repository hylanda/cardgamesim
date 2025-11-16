import { useState } from 'react';
import { Zone } from './Zone';
import { PileViewer } from './PileViewer';
import { LifeCounter } from './LifeCounter';
import { useGameStore } from '../store/gameStore';
import type { Player, ZoneType } from '../types/card';

interface PlayerBoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isOpponent?: boolean;
}

export function PlayerBoard({ player, isCurrentPlayer, isOpponent = false }: PlayerBoardProps) {
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);
  const [viewingPile, setViewingPile] = useState<ZoneType | null>(null);

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
  };

  const handlePileClick = (zoneType: ZoneType) => {
    setViewingPile(zoneType);
  };

  const closePileViewer = () => {
    setViewingPile(null);
  };

  // Only allow interaction for current player
  const canInteract = isCurrentPlayer;

  // Get pile info for modal
  const getPileInfo = () => {
    if (!viewingPile) return null;

    const zoneNames: Record<ZoneType, string> = {
      deck: 'Deck',
      hand: 'Hand',
      playArea: 'Play Area',
      discard: 'Discard Pile',
      exile: 'Exile / Lost Zone',
      prizes: 'Prizes',
      sideboard: 'Sideboard',
    };

    return {
      zoneName: zoneNames[viewingPile],
      cards: player.zones[viewingPile],
      hideCards: viewingPile === 'deck' && isOpponent,
    };
  };

  const pileInfo = getPileInfo();

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

      {/* Life and Poison Counters */}
      <LifeCounter playerId={player.id} isCurrentPlayer={isCurrentPlayer} />

      {/* Top Row: Deck and Prizes (as piles) */}
      <div className="flex gap-3 flex-wrap">
        <Zone
          id="deck"
          name="Deck"
          cards={player.zones.deck}
          hideCards={true}
          isPile={true}
          onPileClick={() => handlePileClick('deck')}
        />
        <Zone
          id="prizes"
          name="Prizes"
          cards={player.zones.prizes}
          maxCards={6}
          isPile={true}
          onPileClick={() => handlePileClick('prizes')}
        />
        <Zone
          id="discard"
          name="Discard"
          cards={player.zones.discard}
          isPile={true}
          onPileClick={() => handlePileClick('discard')}
        />
        <Zone
          id="exile"
          name="Exile"
          cards={player.zones.exile}
          isPile={true}
          onPileClick={() => handlePileClick('exile')}
        />
        {isCurrentPlayer && (
          <Zone
            id="sideboard"
            name="Sideboard"
            cards={player.zones.sideboard}
            isPile={true}
            onPileClick={() => handlePileClick('sideboard')}
          />
        )}
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

      {/* Pile Viewer Modal */}
      {viewingPile && pileInfo && (
        <PileViewer
          isOpen={true}
          onClose={closePileViewer}
          zoneName={pileInfo.zoneName}
          zoneType={viewingPile}
          cards={pileInfo.cards}
          canInteract={canInteract}
          hideCards={pileInfo.hideCards}
        />
      )}
    </div>
  );
}
