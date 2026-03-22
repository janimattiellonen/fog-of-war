import { useState, useEffect } from 'react';
import MapPreview from './MapPreview';

interface StartMenuProps {
  onStartGame: (mapFile: string) => void;
}

function formatMapName(filename: string): string {
  const base = filename.replace(/\.map$/, '');
  // Split trailing digits from the name: "demo2" -> "demo", "2"
  const match = base.match(/^(.+?)(\d+)$/);
  if (match) {
    const word = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    return `${word} ${match[2]}`;
  }
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function StartMenu({ onStartGame }: StartMenuProps) {
  const [maps, setMaps] = useState<string[]>([]);
  const [showMapSelect, setShowMapSelect] = useState(false);

  useEffect(() => {
    fetch('/maps/maps.json')
      .then((res) => res.json())
      .then((data: string[]) => setMaps(data))
      .catch(() => {});
  }, []);

  const handleStartNew = () => {
    if (maps.length === 0) return;
    const randomMap = maps[Math.floor(Math.random() * maps.length)];
    onStartGame(randomMap);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
    }}>
      <h1 style={{
        fontFamily: "'Georgia', serif",
        fontSize: 52,
        fontWeight: 700,
        color: '#e8d5b5',
        textShadow: '0 0 30px rgba(200, 150, 80, 0.5), 0 2px 4px rgba(0,0,0,0.8)',
        letterSpacing: 4,
        marginBottom: 48,
        textTransform: 'uppercase',
      }}>
        Fog of War
      </h1>

      {!showMapSelect ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MenuButton onClick={handleStartNew} disabled={maps.length === 0}>
            Start New Game
          </MenuButton>
          <MenuButton onClick={() => setShowMapSelect(true)} disabled={maps.length === 0}>
            Select Map
          </MenuButton>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '8px 16px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            width: '100%',
            maxWidth: 600,
          }}>
            {maps.map((mapFile) => (
              <button
                key={mapFile}
                onClick={() => onStartGame(mapFile)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(200, 150, 80, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <MapPreview mapFile={mapFile} size={130} />
                <span style={{
                  color: '#e8d5b5',
                  fontSize: 14,
                  fontWeight: 500,
                }}>
                  {formatMapName(mapFile)}
                </span>
              </button>
            ))}
          </div>

          <MenuButton onClick={() => setShowMapSelect(false)}>
            Back
          </MenuButton>
        </div>
      )}
    </div>
  );
}

function MenuButton({ children, onClick, disabled }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: '14px 40px',
        color: disabled ? '#555' : '#e8d5b5',
        fontSize: 18,
        fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        letterSpacing: 1,
        transition: 'background 0.2s, border-color 0.2s',
        minWidth: 220,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(200, 150, 80, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(200, 150, 80, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
    >
      {children}
    </button>
  );
}
