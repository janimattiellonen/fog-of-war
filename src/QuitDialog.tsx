import { useEffect } from 'react';

interface QuitDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function QuitDialog({ onConfirm, onCancel }: QuitDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
    }}>
      <p style={{
        color: '#e8d5b5',
        fontSize: 24,
        fontWeight: 500,
        marginBottom: 32,
      }}>
        Do you want to quit the game?
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={onConfirm}
          style={buttonStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          style={buttonStyle}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          No
        </button>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 8,
  padding: '14px 40px',
  color: '#e8d5b5',
  fontSize: 18,
  fontWeight: 500,
  cursor: 'pointer',
  letterSpacing: 1,
  transition: 'background 0.2s, border-color 0.2s',
  minWidth: 120,
};

const hoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'rgba(200, 150, 80, 0.2)';
  e.currentTarget.style.borderColor = 'rgba(200, 150, 80, 0.5)';
};

const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
};
