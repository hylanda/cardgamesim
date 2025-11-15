# Card Game Simulator

A browser-based card game simulator that supports Magic: The Gathering and Pokemon TCG. Features drag-and-drop card management, deck operations, and card imports from Scryfall and Pokemon TCG APIs.

## Features

- **Multiple Game Zones**: Deck, Hand, Play Area, Discard Pile, Exile/Lost Zone, and Prizes
- **Drag & Drop**: Intuitive card movement between zones
- **Deck Operations**:
  - Draw cards (single or multiple)
  - Shuffle deck
  - Search deck for specific cards
- **Card Import**: Import cards from:
  - Scryfall API (Magic: The Gathering)
  - Pokemon TCG API (Pokemon cards)
- **Action Logging**: Every action is logged with timestamps and clickable card references
- **Responsive Design**: Works on desktop and mobile browsers

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **@dnd-kit** for drag-and-drop functionality
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Scryfall API** for Magic card data
- **Pokemon TCG API** for Pokemon card data

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cardgamesim
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage Guide

### Importing Cards

1. **Select Card Game**: Choose between Magic: The Gathering or Pokemon TCG
2. **Choose Target Zone**: Select which zone to import cards to (usually Deck)
3. **Search**: Enter a card name and click "Search"
4. **Import**: Click "Import" on individual cards or "Import All" for all results

Example searches:
- Magic: "Lightning Bolt", "Black Lotus", "Counterspell"
- Pokemon: "Pikachu", "Charizard", "Mewtwo"

### Managing Your Deck

#### Drawing Cards
1. Set the number of cards to draw (1-10)
2. Click the "Draw" button
3. Cards move from deck to hand

#### Shuffling
- Click "Shuffle Deck" to randomize your deck

#### Searching Deck
1. Enter a card name in the search field
2. Click "Search"
3. Results appear below with "Add to Hand" buttons

### Moving Cards

**Drag and Drop**:
- Click and hold any card
- Drag it to the desired zone
- Drop to complete the move

All moves are automatically logged in the Action Log.

### Action Log

The Action Log (right sidebar) shows:
- All game actions with timestamps
- Clickable card names (blue underlined)
- Most recent actions appear at the top

Click on any card name to view its details.

### Game Zones

- **Deck**: Hidden cards (shows card back and count)
- **Hand**: Your current hand of cards
- **Play Area**: Cards in play
- **Discard Pile**: Discarded cards
- **Exile/Lost Zone**: Removed cards
- **Prizes**: Prize cards (Pokemon-specific, max 6)

## Project Structure

```
src/
├── components/          # React components
│   ├── ActionLog.tsx   # Game action history
│   ├── Card.tsx        # Individual card component
│   ├── CardImport.tsx  # Card search and import
│   ├── DeckControls.tsx # Deck operations
│   └── Zone.tsx        # Card zone container
├── services/           # API services
│   ├── pokemon.ts      # Pokemon TCG API
│   └── scryfall.ts     # Scryfall API
├── store/              # State management
│   └── gameStore.ts    # Zustand store
├── types/              # TypeScript types
│   └── card.ts         # Card and game types
├── App.tsx             # Main application
├── index.css           # Global styles
└── main.tsx            # Application entry
```

## API References

- **Scryfall API**: https://scryfall.com/docs/api
- **Pokemon TCG API**: https://pokemontcg.io/

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

### Deploy to GitHub Pages

1. Update `vite.config.ts` with your repository name:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Limitations

- No persistence (game state resets on page reload)
- No multiplayer support
- No card rules enforcement
- Limited to public API card data

## Future Enhancements

- [ ] Save/load game states
- [ ] Export deck lists
- [ ] Custom card creation
- [ ] Multiplayer support via WebSockets
- [ ] Card rules engine
- [ ] Counter and token management
- [ ] Life point tracking
- [ ] Additional card games support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
