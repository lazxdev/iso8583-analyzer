interface HeaderProps {
  appMode: 'parse' | 'compare';
  onModeChange: (mode: 'parse' | 'compare') => void;
}

export function Header({ appMode, onModeChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo-icon">
          <i className="fa-solid fa-microchip"></i>
        </div>
        <div className="brand-text">
          <h1>ISO 8583 <span className="accent-text">Analyzer</span></h1>
          <p className="subtitle">Decode financial transaction messages into structured JSON instantly</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="mode-toggle">
          <button
            onClick={() => onModeChange('parse')}
            className={`mode-btn ${appMode === 'parse' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-bolt"></i> Parse
          </button>
          <button
            onClick={() => onModeChange('compare')}
            className={`mode-btn ${appMode === 'compare' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-code-compare"></i> Compare
          </button>
        </div>
        <a href="https://github.com/lazxdev/iso8583-parser" target="_blank" rel="noreferrer" className="action-btn-link">
          <i className="fa-brands fa-github"></i>
        </a>
      </div>
    </header>
  );
}
