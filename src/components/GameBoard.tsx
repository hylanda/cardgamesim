import { Zone } from './Zone';
import { LifeCounter } from './LifeCounter';
import type { Player, ZoneType } from '../types/card';

interface GameBoardProps {
  player: Player;
  opponent: Player | null;
  isCurrentPlayer: boolean;
  onPileClick: (zoneType: ZoneType, playerId: string) => void;
  onCardClick: (card: any) => void;
}

export function GameBoard({ player, opponent, onPileClick, onCardClick }: GameBoardProps) {
  return (
    <div className="h-full flex">
      {/* LEFT SIDEBAR - Past Zones (Discard, Exile, Prizes) */}
      <div className="w-40 flex flex-col gap-2 p-2 bg-slate-900/50">
        <h3 className="text-xs font-bold text-slate-400 text-center">PAST</h3>

        {/* Opponent Past Zones */}
        {opponent && (
          <div className="flex-1 flex flex-col gap-2 border-b border-slate-700 pb-2">
            <div className="text-xs text-slate-500 text-center">{opponent.name}</div>
            <Zone
              id="discard"
              name="Discard"
              cards={opponent.zones.discard}
              isPile={true}
              onPileClick={() => onPileClick('discard', opponent.id)}
            />
            <Zone
              id="exile"
              name="Exile"
              cards={opponent.zones.exile}
              isPile={true}
              onPileClick={() => onPileClick('exile', opponent.id)}
            />
            <Zone
              id="prizes"
              name="Prizes"
              cards={opponent.zones.prizes}
              maxCards={6}
              isPile={true}
              onPileClick={() => onPileClick('prizes', opponent.id)}
            />
          </div>
        )}

        {/* Player Past Zones */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-xs text-blue-400 text-center font-bold">You</div>
          <Zone
            id="discard"
            name="Discard"
            cards={player.zones.discard}
            isPile={true}
            onPileClick={() => onPileClick('discard', player.id)}
          />
          <Zone
            id="exile"
            name="Exile"
            cards={player.zones.exile}
            isPile={true}
            onPileClick={() => onPileClick('exile', player.id)}
          />
          <Zone
            id="prizes"
            name="Prizes"
            cards={player.zones.prizes}
            maxCards={6}
            isPile={true}
            onPileClick={() => onPileClick('prizes', player.id)}
          />
        </div>
      </div>

      {/* CENTER - Play Areas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Opponent Section */}
        {opponent && (
          <>
            {/* Opponent Hand (concealed) - 10% */}
            <div className="h-[10%] p-2 bg-slate-900/30 border-b border-slate-700">
              <Zone
                id="hand"
                name={`${opponent.name}'s Hand`}
                cards={opponent.zones.hand}
                hideCards={true}
                onCardClick={onCardClick}
              />
            </div>

            {/* Opponent Play Area - 45% */}
            <div className="h-[45%] p-2 bg-slate-800/30">
              <div className="h-full flex flex-col">
                <div className="text-sm font-bold text-slate-300 mb-1">{opponent.name}'s Board</div>
                <Zone
                  id="playArea"
                  name=""
                  cards={opponent.zones.playArea}
                  onCardClick={onCardClick}
                />
              </div>
            </div>
          </>
        )}

        {/* Player Play Area - 45% */}
        <div className={`${opponent ? 'h-[45%]' : 'h-[70%]'} p-2 bg-slate-800/50`}>
          <div className="h-full flex flex-col">
            <div className="text-sm font-bold text-blue-400 mb-1">Your Board</div>
            <Zone
              id="playArea"
              name=""
              cards={player.zones.playArea}
              onCardClick={onCardClick}
            />
          </div>
        </div>

        {/* Player Hand - 15% */}
        <div className={`${opponent ? 'h-[15%]' : 'h-[30%]'} border-t-2 border-blue-500/30 p-2 bg-slate-900/50`}>
          <Zone
            id="hand"
            name="Your Hand"
            cards={player.zones.hand}
            onCardClick={onCardClick}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR - Future Zones (Deck, Life, Sideboard) */}
      <div className="w-48 flex flex-col gap-2 p-2 bg-slate-900/50">
        <h3 className="text-xs font-bold text-slate-400 text-center">FUTURE</h3>

        {/* Opponent Future Zones */}
        {opponent && (
          <div className="flex-1 flex flex-col gap-2 border-b border-slate-700 pb-2">
            <div className="text-xs text-slate-500 text-center">{opponent.name}</div>
            <LifeCounter playerId={opponent.id} isCurrentPlayer={false} />
            <Zone
              id="deck"
              name="Deck"
              cards={opponent.zones.deck}
              hideCards={true}
              isPile={true}
              onPileClick={() => onPileClick('deck', opponent.id)}
            />
          </div>
        )}

        {/* Player Future Zones */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-xs text-blue-400 text-center font-bold">You</div>
          <LifeCounter playerId={player.id} isCurrentPlayer={true} />
          <Zone
            id="deck"
            name="Deck"
            cards={player.zones.deck}
            hideCards={true}
            isPile={true}
            onPileClick={() => onPileClick('deck', player.id)}
          />
          <Zone
            id="sideboard"
            name="Sideboard"
            cards={player.zones.sideboard}
            isPile={true}
            onPileClick={() => onPileClick('sideboard', player.id)}
          />
        </div>
      </div>
    </div>
  );
}
