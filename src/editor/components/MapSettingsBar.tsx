import { useState } from 'react';
import { type EditorAction, type EditorState, getDefaultFloorTile } from '../editorState';
import { serializeMap } from '../mapSerializer';
import { parseMap } from '../../game/mapParser';

interface MapSettingsBarProps {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const buttonStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: 'none',
  borderRadius: 4,
  background: '#2a2a3e',
  color: '#ccc',
  cursor: 'pointer',
  fontSize: 13,
};

const inputStyle: React.CSSProperties = {
  width: 60,
  padding: '4px 6px',
  border: '1px solid #2a2a4e',
  borderRadius: 4,
  background: '#12121e',
  color: '#ccc',
  fontSize: 13,
};

export default function MapSettingsBar({ state, dispatch }: MapSettingsBarProps) {
  const [newWidth, setNewWidth] = useState(30);
  const [newHeight, setNewHeight] = useState(20);

  const defaultFloorTile = state.tileConfig ? getDefaultFloorTile(state.tileConfig) : null;

  const handleNew = () => {
    if (state.isDirty && !window.confirm('You have unsaved changes. Create a new map anyway?')) {
      return;
    }
    if (defaultFloorTile) {
      dispatch({ type: 'NEW_MAP', width: newWidth, height: newHeight, defaultTile: defaultFloorTile });
    }
  };

  const handleExport = () => {
    if (state.grid.length === 0) {
      return;
    }
    const content = serializeMap(state.grid);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.fileName;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'MARK_SAVED' });
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !state.tileConfig) {
      return;
    }
    if (state.isDirty && !window.confirm('You have unsaved changes. Load a different map?')) {
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseMap(text, state.tileConfig!);
      dispatch({ type: 'LOAD_MAP', grid: parsed.grid, fileName: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '6px 12px',
      background: '#1a1a2e',
      borderBottom: '1px solid #2a2a4e',
      flexWrap: 'wrap',
    }}>
      {/* New map */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#999', fontSize: 12 }}>New:</span>
        <input
          type="number"
          min={3}
          max={200}
          value={newWidth}
          onChange={(e) => setNewWidth(Number(e.target.value))}
          style={inputStyle}
          title="Width in tiles"
        />
        <span style={{ color: '#666' }}>x</span>
        <input
          type="number"
          min={3}
          max={200}
          value={newHeight}
          onChange={(e) => setNewHeight(Number(e.target.value))}
          style={inputStyle}
          title="Height in tiles"
        />
        <button style={buttonStyle} onClick={handleNew}>Create</button>
      </div>

      <div style={{ width: 1, height: 20, background: '#2a2a4e' }} />

      {/* Load */}
      <label style={{ ...buttonStyle, display: 'inline-flex', alignItems: 'center' }}>
        Load .map
        <input
          type="file"
          accept=".map"
          onChange={handleLoad}
          style={{ display: 'none' }}
        />
      </label>

      {/* Export */}
      <button style={buttonStyle} onClick={handleExport} disabled={state.grid.length === 0}>
        Export .map
      </button>

      <div style={{ width: 1, height: 20, background: '#2a2a4e' }} />

      {/* Info */}
      {state.grid.length > 0 && (
        <span style={{ color: '#666', fontSize: 12 }}>
          {state.widthInTiles} x {state.heightInTiles} tiles
          {state.isDirty && <span style={{ color: '#e8a040', marginLeft: 6 }}>unsaved</span>}
        </span>
      )}

      <span style={{ color: '#888', fontSize: 12 }}>{state.fileName}</span>
    </div>
  );
}
