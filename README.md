# Card Game Simulator - Multiplayer Edition

A real-time multiplayer browser-based card game simulator supporting Magic: The Gathering and Pokemon TCG. Features drag-and-drop card management, deck operations, WebSocket-powered multiplayer, and card imports from Scryfall and Pokemon TCG APIs.

## Features

### Multiplayer
- **Real-time 2-player games** via WebSocket (Socket.io)
- **Room system** - Create or join game rooms with 6-character codes
- **Server-authoritative game state** - Prevents cheating and ensures synchronization
- **Live action feed** - See all player actions in real-time

### Game Zones (Per Player)
- **Deck** - Hidden cards with card back display
- **Hand** - Your private hand of cards
- **Play Area** - Larger area for cards in play
- **Discard Pile** - Graveyard/discard zone
- **Exile/Lost Zone** - Removed from game cards
- **Prizes** - Pokemon-specific prize cards (max 6)

### Deck Operations
- Draw cards (1-10 at a time)
- Shuffle deck
- Search deck for specific cards
- Drag & drop cards between zones

### Card Import
- Import from Scryfall API (Magic: The Gathering)
- Import from Pokemon TCG API (Pokemon cards)
- Full card art and metadata
- Collapsible menu system

### Game Features
- **Action Logging** - Timestamped action history with player names
- **Clickable card references** - Click any card name to view it
- **Responsive design** - Works on desktop and tablet
- **Real-time updates** - All actions broadcast to both players

## Tech Stack

### Backend
- **Node.js** + **Express** - HTTP server
- **Socket.io** - Real-time WebSocket communication
- **TypeScript** - Type-safe server code

### Frontend
- **React 19** + **TypeScript** - Component architecture
- **Vite** - Fast build tool and dev server
- **@dnd-kit** - Accessible drag-and-drop
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **Socket.io-client** - WebSocket client

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**

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

### Development Mode (Recommended)

Run both the server and client concurrently:

```bash
npm start
```

This will start:
- **Server** on `http://localhost:3001`
- **Client** on `http://localhost:5173`

### Running Server and Client Separately

**Terminal 1 - Start the server:**
```bash
npm run server
```

**Terminal 2 - Start the client:**
```bash
npm run dev
```

### Production Build

1. Build the client:
```bash
npm run build
```

2. Build the server:
```bash
npm run server:build
```

3. Run the production server:
```bash
npm run server:start
```

4. Serve the client build from `dist/` folder using any static file server.

## Usage Guide

### Starting a Game

1. **Player 1**: Open the app and click "Create New Game"
   - Enter your name
   - You'll receive a 6-character room code (e.g., `AB12CD`)
   - Share this code with your opponent

2. **Player 2**: Open the app and enter the room code
   - Enter your name
   - Click "Join Existing Game"

3. Game starts automatically when both players join!

### Importing Cards

1. Click "Show Menu" button (top right)
2. Select card game (Magic or Pokemon)
3. Choose target zone (usually Deck)
4. Search for cards
5. Click "Import" or "Import All"
6. Click "Hide Menu" to collapse the sidebar

Example searches:
- **Magic**: "Lightning Bolt", "Black Lotus", "Counterspell"
- **Pokemon**: "Pikachu", "Charizard", "Mewtwo"

### Managing Your Deck

#### Drawing Cards
1. Set number of cards (1-10)
2. Click "Draw"
3. Cards move from deck to hand

#### Shuffling
- Click "Shuffle Deck" button

#### Searching Deck
1. Enter card name
2. Click "Search"
3. Click "Add to Hand" on found cards

### Moving Cards

**Drag and Drop:**
- Click and hold any card in your zones
- Drag to desired zone
- Drop to move

All moves are:
- Sent to the server
- Validated server-side
- Broadcast to both players
- Logged in the action feed

### Action Log

The right sidebar shows:
- All game actions from both players
- Player names in blue
- Clickable card names (underlined)
- Timestamps for each action
- Most recent actions at top

## Project Structure

```
cardgamesim/
├── server/                 # Backend server
│   └── src/
│       ├── index.ts       # Express + Socket.io server
│       ├── GameManager.ts # Game state management
│       └── types.ts       # Server-side types
├── src/                   # Frontend client
│   ├── components/
│   │   ├── Lobby.tsx      # Create/join room screen
│   │   ├── Game.tsx       # Main game component
│   │   ├── PlayerBoard.tsx # Individual player board
│   │   ├── Zone.tsx       # Card zone container
│   │   ├── Card.tsx       # Card component
│   │   ├── ActionLog.tsx  # Action history
│   │   ├── DeckControls.tsx # Deck operations
│   │   └── CardImport.tsx # Card search/import
│   ├── services/
│   │   ├── socket.ts      # WebSocket service
│   │   ├── scryfall.ts    # Scryfall API
│   │   └── pokemon.ts     # Pokemon TCG API
│   ├── store/
│   │   └── gameStore.ts   # Zustand store
│   ├── types/
│   │   └── card.ts        # TypeScript types
│   ├── App.tsx           # Root component
│   ├── index.css         # Global styles
│   └── main.tsx          # App entry point
├── package.json
└── README.md
```

## Environment Variables

### Server
Create a `.env` file in the root directory:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Client
Create a `.env` file in the root directory:

```env
VITE_SOCKET_URL=http://localhost:3001
```

For production, update these URLs to your deployment URLs.

## API References

- **Scryfall API**: https://scryfall.com/docs/api
- **Pokemon TCG API**: https://pokemontcg.io/

## Deployment

### Deploy Backend

**Heroku, Render, or Railway:**
1. Set environment variable `PORT` (auto-set on most platforms)
2. Set `CLIENT_URL` to your frontend URL
3. Deploy from `server/` directory

**Dockerfile example:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server ./server
RUN npm run server:build
CMD ["npm", "run", "server:start"]
EXPOSE 3001
```

### Deploy Frontend

**Vercel/Netlify:**
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_SOCKET_URL` environment variable to your backend URL

**GitHub Pages:**
```bash
# Update vite.config.ts with your repo name
npm run build
npx gh-pages -d dist
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

Modern browsers with WebSocket support required.

## Known Limitations

- Maximum 2 players per game
- No persistence (games reset on server restart)
- No authentication/accounts
- No spectator mode
- No card rules enforcement
- Limited to public API card data

## Future Enhancements

- [ ] Persistent game state (database)
- [ ] User accounts and authentication
- [ ] Game history and replays
- [ ] Spectator mode
- [ ] 3-4 player support
- [ ] Tournament mode
- [ ] Custom card creation
- [ ] Card rules engine
- [ ] Voice/video chat integration
- [ ] Mobile app (React Native)
- [ ] Deck building interface
- [ ] Export deck lists
- [ ] Counter and token management
- [ ] Life/damage tracking
- [ ] Timer/chess clock

## Troubleshooting

### Server won't start
- Check if port 3001 is available
- Make sure all dependencies are installed: `npm install`

### Client can't connect to server
- Verify server is running on port 3001
- Check `VITE_SOCKET_URL` environment variable
- Look for CORS errors in browser console

### Cards not importing
- Check internet connection
- Verify API endpoints are accessible
- Try different search queries

### Room connection issues
- Make sure room code is exactly 6 characters
- Verify both players are using the same server
- Check browser console for errors

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both server and client)
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section above

---

**Enjoy playing! Share your room code and battle your friends!** 🎴⚔️
