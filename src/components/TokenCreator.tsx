import { useState } from 'react';
import { socketService } from '../services/socket';
import type { Card } from '../types/card';

const COMMON_TOKENS = [
  {
    name: '1/1 Soldier',
    type: 'Creature Token — Soldier',
    power: '1',
    toughness: '1',
    imageUrl: '',
  },
  {
    name: '2/2 Knight',
    type: 'Creature Token — Knight',
    power: '2',
    toughness: '2',
    imageUrl: '',
  },
  {
    name: '3/3 Beast',
    type: 'Creature Token — Beast',
    power: '3',
    toughness: '3',
    imageUrl: '',
  },
  {
    name: '1/1 Goblin',
    type: 'Creature Token — Goblin',
    power: '1',
    toughness: '1',
    imageUrl: '',
  },
  {
    name: 'Treasure',
    type: 'Artifact Token — Treasure',
    oracleText: 'Tap, Sacrifice: Add one mana of any color.',
    imageUrl: '',
  },
  {
    name: 'Food',
    type: 'Artifact Token — Food',
    oracleText: '2, Tap, Sacrifice: You gain 3 life.',
    imageUrl: '',
  },
];

export function TokenCreator() {
  const [showCustom, setShowCustom] = useState(false);
  const [customToken, setCustomToken] = useState({
    name: '',
    power: '',
    toughness: '',
    type: '',
  });

  const createToken = (tokenData: Partial<Card>) => {
    const token: Card = {
      id: `token-${Date.now()}-${Math.random()}`,
      name: tokenData.name || 'Token',
      imageUrl: tokenData.imageUrl || '',
      game: 'custom',
      type: tokenData.type,
      power: tokenData.power,
      toughness: tokenData.toughness,
      oracleText: tokenData.oracleText,
    };

    socketService.createToken(token);
  };

  const handleCreateCustom = () => {
    if (!customToken.name) {
      alert('Token must have a name');
      return;
    }

    createToken({
      name: customToken.name,
      type: customToken.type || 'Token',
      power: customToken.power,
      toughness: customToken.toughness,
    });

    // Reset form
    setCustomToken({ name: '', power: '', toughness: '', type: '' });
    setShowCustom(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-200">Create Tokens</h3>

      {/* Common Tokens */}
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Quick Create</label>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_TOKENS.map((token, index) => (
            <button
              key={index}
              onClick={() => createToken(token)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm transition-colors text-left"
            >
              <div className="font-medium">{token.name}</div>
              {token.power && token.toughness && (
                <div className="text-xs text-slate-400">
                  {token.power}/{token.toughness}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Token Toggle */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors"
      >
        {showCustom ? 'Hide Custom Token' : 'Create Custom Token'}
      </button>

      {/* Custom Token Form */}
      {showCustom && (
        <div className="zone space-y-3">
          <div>
            <label className="text-xs text-slate-400">Name *</label>
            <input
              type="text"
              value={customToken.name}
              onChange={(e) => setCustomToken({ ...customToken, name: e.target.value })}
              placeholder="Token Name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Type</label>
            <input
              type="text"
              value={customToken.type}
              onChange={(e) => setCustomToken({ ...customToken, type: e.target.value })}
              placeholder="e.g., Creature — Elemental"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-400">Power</label>
              <input
                type="text"
                value={customToken.power}
                onChange={(e) => setCustomToken({ ...customToken, power: e.target.value })}
                placeholder="Power"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400">Toughness</label>
              <input
                type="text"
                value={customToken.toughness}
                onChange={(e) => setCustomToken({ ...customToken, toughness: e.target.value })}
                placeholder="Toughness"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              />
            </div>
          </div>

          <button
            onClick={handleCreateCustom}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            Create Token
          </button>
        </div>
      )}
    </div>
  );
}
