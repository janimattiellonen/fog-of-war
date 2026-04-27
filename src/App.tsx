import { useState } from 'react';
import { Routes, Route } from 'react-router';
import GameCanvas from './GameCanvas';
import MapEditor from './editor/MapEditor';
import StartMenu from './StartMenu';
import QuitDialog from './QuitDialog';
import GameOverDialog from './GameOverDialog';
import { loadSettings } from './game/settings';

function GamePage() {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [showQuit, setShowQuit] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState(loadSettings().visibilityMode);

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
        visibilityMode={visibilityMode}
      />
      {!selectedMap && (
        <StartMenu
          onStartGame={setSelectedMap}
          onSettingsChange={(s) => setVisibilityMode(s.visibilityMode)}
        />
      )}
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
