import { useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { PlayerBoard } from './PlayerBoard';
import { Card as CardComponent } from './Card';
import { ActionLog } from './ActionLog';
import { DeckControls } from './DeckControls';
import { CardImport } from './CardImport';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import type { Card as CardType, ZoneType } from '../types/card';

export function Game() {
  const room = useGameStore((state) => state.room);
  const getCurrentPlayer = useGameStore((state) => state.getCurrentPlayer);
  const getOpponent = useGameStore((state) => state.getOpponent);
  const showMenu = useGameStore((state) => state.showMenu);
  const toggleMenu = useGameStore((state) => state.toggleMenu);
  const setRoom = useGameStore((state) => state.setRoom);

  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();

  useEffect(() => {
    // Listen for game state updates
    const handleGameState = (updatedRoom: typeof room) => {
      setRoom(updatedRoom);
    };

    socketService.onGameState(handleGameState);

    return () => {
      socketService.offGameState(handleGameState);
    };
  }, [setRoom]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as CardType;
    setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);

    const { active, over } = event;
    if (!over || !currentPlayer) return;

    const card = active.data.current?.card as CardType;
    const targetZone = over.id as ZoneType;

    // Find which zone the card is currently in
    let sourceZone: ZoneType | null = null;
    for (const [zoneId, zoneCards] of Object.entries(currentPlayer.zones)) {
      if (zoneCards.some((c: CardType) => c.id === card.id)) {
        sourceZone = zoneId as ZoneType;
        break;
      }
    }

    if (sourceZone && sourceZone !== targetZone) {
      socketService.moveCard(card.id, sourceZone, targetZone);
    }
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-white">Loading game...</div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4">
        {/* Header with Room Info and Menu Toggle */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Card Game Simulator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Room: <code className="bg-slate-700 px-2 py-1 rounded">{room.id}</code>
            </p>
          </div>
          <button
            onClick={toggleMenu}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium transition-colors"
          >
            {showMenu ? 'Hide Menu' : 'Show Menu'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar - Menu (collapsible) */}
          {showMenu && (
            <div className="lg:col-span-3 space-y-4">
              <CardImport />
              <DeckControls />
            </div>
          )}

          {/* Main Game Area */}
          <div className={`${showMenu ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-6`}>
            {/* Opponent Board */}
            {opponent && (
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <PlayerBoard player={opponent} isCurrentPlayer={false} isOpponent={true} />
              </div>
            )}

            {/* Divider */}
            <div className="border-t-2 border-dashed border-slate-600"></div>

            {/* Current Player Board */}
            <div className="bg-slate-800/50 rounded-lg p-4 border-2 border-blue-500/30">
              <PlayerBoard player={currentPlayer} isCurrentPlayer={true} />
            </div>
          </div>

          {/* Right Sidebar - Action Log */}
          <div className="lg:col-span-3">
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
