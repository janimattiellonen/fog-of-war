interface GameOverDialogProps {
  onMainMenu: () => void;
}

export default function GameOverDialog({ onMainMenu }: GameOverDialogProps) {
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
        color: '#e85050',
        fontSize: 36,
        fontWeight: 700,
        marginBottom: 16,
        letterSpacing: 2,
      }}>
        Game Over
      </p>
      <p style={{
        color: '#e8d5b5',
        fontSize: 18,
        marginBottom: 32,
      }}>
        You have been defeated.
      </p>
      <button
        onClick={onMainMenu}
        style={buttonStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        Main Menu
      </button>
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
