import type { TileConfig } from '../../game/mapParser';

interface TilePaletteProps {
  tileConfig: TileConfig;
  selectedTileCode: string | null;
  onSelectTile: (code: string) => void;
}

export default function TilePalette({ tileConfig, selectedTileCode, onSelectTile }: TilePaletteProps) {
  const grouped = new Map<string, string[]>();

  for (const [code, tileDef] of Object.entries(tileConfig.tiles)) {
    const className = tileDef.className;
    if (!grouped.has(className)) {
      grouped.set(className, []);
    }
    grouped.get(className)!.push(code);
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {Array.from(grouped.entries()).map(([className, codes]) => (
        <div key={className} style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#999',
            padding: '4px 8px',
            letterSpacing: '0.5px',
          }}>
            {className}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 8px' }}>
            {codes.map((code) => {
              const tileDef = tileConfig.tiles[code];
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
        </div>
      ))}
    </div>
  );
}
