import type { TileConfig } from '../../game/mapParser';
import type { ActiveTool, Selection } from '../editorState';
import TilePalette from './TilePalette';

interface ToolboxProps {
  tileConfig: TileConfig | null;
  selectedTileCode: string | null;
  activeTool: ActiveTool;
  selection: Selection | null;
  onSelectTile: (code: string) => void;
  onSetTool: (tool: ActiveTool) => void;
  onDeleteSelection: () => void;
  onFillSelection: () => void;
  onAutoBorder: (wallTileCode: string) => void;
  onAutoRandomBorder: (wallTileCodes: string[]) => void;
}

const toolButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  border: 'none',
  borderRadius: 4,
  background: active ? '#4a9eff' : '#2a2a3e',
  color: active ? '#fff' : '#ccc',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: active ? 600 : 400,
});

export default function Toolbox({
  tileConfig,
  selectedTileCode,
  activeTool,
  selection,
  onSelectTile,
  onSetTool,
  onDeleteSelection,
  onFillSelection,
  onAutoBorder,
  onAutoRandomBorder,
}: ToolboxProps) {
  const wallTiles = tileConfig
    ? Object.entries(tileConfig.tiles).filter(([, def]) => {
        const classLetter = Object.entries(tileConfig.classes).find(([, c]) => c.name === def.className)?.[0];
        return classLetter ? tileConfig.classes[classLetter].solid : false;
      }).map(([code]) => code)
    : [];

  return (
    <div style={{
      width: 240,
      background: '#1a1a2e',
      borderRight: '1px solid #2a2a4e',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Tools */}
      <div style={{ padding: 8, borderBottom: '1px solid #2a2a4e' }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: '#999',
          marginBottom: 6,
          letterSpacing: '0.5px',
        }}>
          Tools
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={toolButtonStyle(activeTool === 'paint')} onClick={() => onSetTool('paint')}>Paint</button>
          <button style={toolButtonStyle(activeTool === 'select')} onClick={() => onSetTool('select')}>Select</button>
          <button style={toolButtonStyle(activeTool === 'autoborder')} onClick={() => onSetTool('autoborder')}>Auto Border</button>
        </div>
      </div>

      {/* Selection actions */}
      {activeTool === 'select' && selection && (
        <div style={{ padding: 8, borderBottom: '1px solid #2a2a4e' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#999',
            marginBottom: 6,
            letterSpacing: '0.5px',
          }}>
            Selection
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{ ...toolButtonStyle(false), background: '#5a2020' }}
              onClick={onDeleteSelection}
            >
              Delete
            </button>
            <button
              style={toolButtonStyle(false)}
              onClick={onFillSelection}
              disabled={!selectedTileCode}
              title={selectedTileCode ? `Fill with ${selectedTileCode}` : 'Select a tile first'}
            >
              Fill
            </button>
          </div>
        </div>
      )}

      {/* Auto border */}
      {activeTool === 'autoborder' && (
        <div style={{ padding: 8, borderBottom: '1px solid #2a2a4e' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#999',
            marginBottom: 6,
            letterSpacing: '0.5px',
          }}>
            Auto Border
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {wallTiles.map((code) => {
              const tileDef = tileConfig!.tiles[code];
              const isSelected = code === selectedTileCode;
              return (
                <button
                  key={code}
                  onClick={() => onSelectTile(code)}
                  title={code}
                  style={{
                    width: 40,
                    height: 40,
                    padding: 2,
                    border: isSelected ? '2px solid #4a9eff' : '2px solid transparent',
                    borderRadius: 4,
                    background: isSelected ? 'rgba(74, 158, 255, 0.15)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={`/assets/tiles/${tileDef.image}`}
                    alt={code}
                    style={{ width: 32, height: 32, imageRendering: 'pixelated' }}
                  />
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={toolButtonStyle(false)}
              onClick={() => {
                if (selectedTileCode && wallTiles.includes(selectedTileCode)) {
                  onAutoBorder(selectedTileCode);
                }
              }}
              disabled={!selectedTileCode || !wallTiles.includes(selectedTileCode)}
            >
              Apply Border
            </button>
            <button
              style={toolButtonStyle(false)}
              onClick={() => onAutoRandomBorder(wallTiles)}
              disabled={wallTiles.length === 0}
            >
              Random Border
            </button>
          </div>
        </div>
      )}

      {/* Tile palette */}
      {tileConfig && (
        <TilePalette
          tileConfig={tileConfig}
          selectedTileCode={selectedTileCode}
          onSelectTile={onSelectTile}
        />
      )}
    </div>
  );
}
