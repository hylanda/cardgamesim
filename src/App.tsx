import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { Zone } from './components/Zone';
import { Card as CardComponent } from './components/Card';
import { ActionLog } from './components/ActionLog';
import { DeckControls } from './components/DeckControls';
import { CardImport } from './components/CardImport';
import { useGameStore } from './store/gameStore';
import type { Card as CardType, ZoneType } from './types/card';

function App() {
  const zones = useGameStore((state) => state.zones);
  const moveCard = useGameStore((state) => state.moveCard);
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as CardType;
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    const card = active.data.current?.card as CardType;
    const targetZone = over.id as ZoneType;

    // Find which zone the card is currently in
    let sourceZone: ZoneType | null = null;
    for (const [zoneId, zoneCards] of Object.entries(zones)) {
      if (zoneCards.some((c) => c.id === card.id)) {
        sourceZone = zoneId as ZoneType;
        break;
      }
    }

    if (sourceZone && sourceZone !== targetZone) {
      moveCard(card.id, sourceZone, targetZone);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-6">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Card Game Simulator
          </h1>
          <p className="text-slate-400 mt-2">
            Drag and drop cards between zones. Import cards from Scryfall or Pokemon TCG API.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <CardImport />
            <DeckControls />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deck and Prizes Row */}
            <div className="grid grid-cols-2 gap-4">
              <Zone
                id="deck"
                name="Deck"
                cards={zones.deck}
                hideCards={true}
              />
              <Zone
                id="prizes"
                name="Prizes"
                cards={zones.prizes}
                maxCards={6}
              />
            </div>

            {/* Hand */}
            <Zone
              id="hand"
              name="Hand"
              cards={zones.hand}
              onCardClick={setSelectedCard}
            />

            {/* Play Area */}
            <Zone
              id="playArea"
              name="Play Area"
              cards={zones.playArea}
              onCardClick={setSelectedCard}
            />

            {/* Discard and Exile Row */}
            <div className="grid grid-cols-2 gap-4">
              <Zone
                id="discard"
                name="Discard Pile"
                cards={zones.discard}
                onCardClick={setSelectedCard}
              />
              <Zone
                id="exile"
                name="Exile / Lost Zone"
                cards={zones.exile}
                onCardClick={setSelectedCard}
              />
            </div>
          </div>

          {/* Right Sidebar - Action Log */}
          <div className="lg:col-span-1">
            <ActionLog />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? <CardComponent card={activeCard} draggable={false} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
