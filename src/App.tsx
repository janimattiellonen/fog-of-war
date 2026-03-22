import { Routes, Route } from 'react-router';
import GameCanvas from './GameCanvas';
import MapEditor from './editor/MapEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GameCanvas />} />
      <Route path="/editor" element={<MapEditor />} />
    </Routes>
  );
}
