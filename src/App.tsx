import { useState } from 'react';
import { Routes, Route } from 'react-router';
import GameCanvas from './GameCanvas';
import MapEditor from './editor/MapEditor';
import StartMenu from './StartMenu';
import QuitDialog from './QuitDialog';

function GamePage() {
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [showQuit, setShowQuit] = useState(false);

  const handleEscape = () => {
    if (selectedMap) setShowQuit(true);
  };

  const handleQuit = () => {
    setShowQuit(false);
    setSelectedMap(null);
  };

  return (
    <>
      <GameCanvas
        mapFile={selectedMap ?? 'demo4.map'}
        paused={!selectedMap || showQuit}
        onEscape={handleEscape}
      />
      {!selectedMap && <StartMenu onStartGame={setSelectedMap} />}
      {showQuit && (
        <QuitDialog
          onConfirm={handleQuit}
          onCancel={() => setShowQuit(false)}
        />
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
