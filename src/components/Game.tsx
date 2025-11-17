import { useEffect, useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { GameBoard } from './GameBoard';
import { Card as CardComponent } from './Card';
import { ActionLog } from './ActionLog';
import { DeckControls } from './DeckControls';
import { TokenCreator } from './TokenCreator';
import { TurnPhase } from './TurnPhase';
import { CardImport } from './CardImport';
import { PileViewer } from './PileViewer';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Card as CardType, ZoneType } from '../types/card';

export function Game() {
  const room = useGameStore((state) => state.room);
  const getCurrentPlayer = useGameStore((state) => state.getCurrentPlayer);
  const getOpponent = useGameStore((state) => state.getOpponent);
  const setRoom = useGameStore((state) => state.setRoom);
  const setSelectedCard = useGameStore((state) => state.setSelectedCard);

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [viewingPile, setViewingPile] = useState<{ zoneType: ZoneType; playerId: string } | null>(null);
  const [showSidebar, setShowSidebar] = useState<'menu' | 'info' | null>(null);

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

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

  const handlePileClick = (zoneType: ZoneType, playerId: string) => {
    setViewingPile({ zoneType, playerId });
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
  };

  const closePileViewer = () => {
    setViewingPile(null);
  };

  if (!room || !currentPlayer) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white">Loading game...</div>
      </div>
    );
  }

  const pileInfo = viewingPile ? (() => {
    const player = room.players.find(p => p.id === viewingPile.playerId);
    if (!player) return null;

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
      zoneName: zoneNames[viewingPile.zoneType],
      cards: player.zones[viewingPile.zoneType],
      hideCards: viewingPile.zoneType === 'deck' && viewingPile.playerId !== currentPlayer.id,
      canInteract: viewingPile.playerId === currentPlayer.id,
    };
  })() : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
        {/* Compact Header */}
        <header className="h-12 flex items-center justify-between px-4 bg-slate-800 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Card Game Simulator
            </h1>
            <span className="text-xs text-slate-400">
              Room: <code className="bg-slate-700 px-2 py-0.5 rounded">{room.id}</code>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSidebar(showSidebar === 'menu' ? null : 'menu')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showSidebar === 'menu'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setShowSidebar(showSidebar === 'info' ? null : 'info')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showSidebar === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => alert('Press ? for keyboard shortcuts')}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-300"
              title="Keyboard Shortcuts"
            >
              ?
            </button>
          </div>
        </header>

        {/* Main Game Area */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Game Board */}
          <div className="flex-1 min-w-0">
            <GameBoard
              player={currentPlayer}
              opponent={opponent}
              isCurrentPlayer={true}
              onPileClick={handlePileClick}
              onCardClick={handleCardClick}
            />
          </div>

          {/* Overlay Sidebars */}
          {showSidebar && (
            <>
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 z-40"
                onClick={() => setShowSidebar(null)}
              />

              {/* Sidebar Panel */}
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-800 border-l border-slate-700 z-50 overflow-y-auto shadow-2xl">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-200">
                      {showSidebar === 'menu' ? 'Menu' : 'Game Info'}
                    </h2>
                    <button
                      onClick={() => setShowSidebar(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {showSidebar === 'menu' ? (
                    <>
                      <CardImport />
                      <DeckControls />
                      <TokenCreator />
                    </>
                  ) : (
                    <>
                      <TurnPhase />
                      <ActionLog />
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pile Viewer Modal */}
        {viewingPile && pileInfo && (
          <PileViewer
            isOpen={true}
            onClose={closePileViewer}
            zoneName={pileInfo.zoneName}
            zoneType={viewingPile.zoneType}
            cards={pileInfo.cards}
            canInteract={pileInfo.canInteract}
            hideCards={pileInfo.hideCards}
          />
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCard ? <CardComponent card={activeCard} draggable={false} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
