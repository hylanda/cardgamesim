import { useState } from 'react';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';

function App() {
  const [inGame, setInGame] = useState(false);

  const handleGameStart = () => {
    setInGame(true);
  };

  return (
    <>
      {!inGame ? (
        <Lobby onGameStart={handleGameStart} />
      ) : (
        <Game />
      )}
    </>
  );
}

export default App;
