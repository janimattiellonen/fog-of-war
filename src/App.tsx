import { useState } from 'react';
import { Routes, Route } from 'react-router';
import GameCanvas from './GameCanvas';
import MapEditor from './editor/MapEditor';
import StartMenu from './StartMenu';
import QuitDialog from './QuitDialog';
import GameOverDialog from './GameOverDialog';

function GamePage() {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [showQuit, setShowQuit] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const handleEscape = () => {
    if (selectedMap && !showGameOver) setShowQuit(true);
  };

  const handleQuit = () => {
    setShowQuit(false);
    setShowGameOver(false);
    setSelectedMap(null);
  };

  return (
    <>
      <GameCanvas
        mapFile={selectedMap ?? 'demo4.map'}
        paused={!selectedMap || showQuit || showGameOver}
        onEscape={handleEscape}
        onGameOver={() => setShowGameOver(true)}
      />
      {!selectedMap && <StartMenu onStartGame={setSelectedMap} />}
      {showQuit && (
        <QuitDialog
          onConfirm={handleQuit}
          onCancel={() => setShowQuit(false)}
        />
      )}
      {showGameOver && (
        <GameOverDialog onMainMenu={handleQuit} />
      )}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GamePage />} />
      <Route path="/editor" element={<MapEditor />} />
    </Routes>
  );
}
