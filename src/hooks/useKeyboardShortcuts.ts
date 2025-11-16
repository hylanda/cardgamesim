import { useEffect } from 'react';
import { socketService } from '../services/socket';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ignore shortcuts with modifiers (except shift)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'd':
          // Draw 1 card
          e.preventDefault();
          socketService.drawCards(1);
          break;

        case 's':
          // Shuffle deck
          e.preventDefault();
          socketService.shuffleDeck();
          break;

        case 'm':
          // Mulligan
          e.preventDefault();
          if (window.confirm('Take a mulligan? This will shuffle your hand back into your deck and draw 7 new cards.')) {
            socketService.mulligan();
          }
          break;

        case '?':
          // Show help
          e.preventDefault();
          showKeyboardHelp();
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
}

function showKeyboardHelp() {
  const helpText = `
Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SPACE or D - Draw 1 card
S - Shuffle deck
M - Take mulligan
? - Show this help

Card Actions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Double-click card - Tap/Untap
Right-click card - Add/remove counters

Game Controls:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Click pile zones - View contents
Drag and drop - Move cards between zones
  `;

  alert(helpText);
}
