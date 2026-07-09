interface ParseInputPanelProps {
  rawMessage: string;
  onMessageChange: (value: string) => void;
  onParse: () => void;
  onClear: () => void;
}

export function ParseInputPanel({ rawMessage, onMessageChange, onParse, onClear }: ParseInputPanelProps) {
  return (
    <section className="panel control-panel">
      <div className="panel-header">
        <h2><i className="fa-solid fa-keyboard icon-accent"></i> Input ISO Message</h2>
      </div>
      <div className="panel-body">
        <div className="textarea-container">
          <textarea
            value={rawMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Paste your ISO 8583 message (ASCII string or hex dump)..."
            rows={6}
          />
          {rawMessage && (
            <button onClick={onClear} className="icon-btn-inline" title="Clear message">
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
        <div className="action-row">
          <button onClick={onParse} className="btn btn-primary btn-block">
            <i className="fa-solid fa-bolt button-icon"></i> Parse Message
          </button>
        </div>
      </div>
    </section>
  );
}
