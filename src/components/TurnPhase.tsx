import { useState } from 'react';

const PHASES = [
  { id: 'untap', name: 'Untap', color: 'bg-blue-600' },
  { id: 'upkeep', name: 'Upkeep', color: 'bg-cyan-600' },
  { id: 'draw', name: 'Draw', color: 'bg-green-600' },
  { id: 'main1', name: 'Main 1', color: 'bg-yellow-600' },
  { id: 'combat', name: 'Combat', color: 'bg-red-600' },
  { id: 'main2', name: 'Main 2', color: 'bg-yellow-600' },
  { id: 'end', name: 'End', color: 'bg-purple-600' },
];

export function TurnPhase() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const nextPhase = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % PHASES.length);
  };

  const prevPhase = () => {
    setCurrentPhaseIndex((prev) => (prev - 1 + PHASES.length) % PHASES.length);
  };

  const currentPhase = PHASES[currentPhaseIndex];

  return (
    <div className="bg-slate-800 rounded-lg border-2 border-slate-600 p-4">
      <h3 className="text-lg font-bold text-slate-200 mb-3">Turn Phase</h3>

      {/* Current Phase Display */}
      <div className={`${currentPhase.color} text-white text-center py-3 rounded-lg mb-3 font-bold text-xl`}>
        {currentPhase.name}
      </div>

      {/* Phase Navigation */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={prevPhase}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={nextPhase}
          className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white transition-colors"
        >
          Next →
        </button>
      </div>

      {/* All Phases */}
      <div className="space-y-1">
        {PHASES.map((phase, index) => (
          <button
            key={phase.id}
            onClick={() => setCurrentPhaseIndex(index)}
            className={`w-full px-3 py-1 text-sm rounded transition-colors text-left ${
              index === currentPhaseIndex
                ? `${phase.color} text-white font-bold`
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {phase.name}
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500 italic">
        Tip: Press N to advance phase (keyboard shortcut)
      </div>
    </div>
  );
}
