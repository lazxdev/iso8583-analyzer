interface JsonViewerProps {
  data: unknown;
  copyStatus: string;
  onCopy: () => void;
}

export function JsonViewer({ data, copyStatus, onCopy }: JsonViewerProps) {
  return (
    <div className="code-viewer-container">
      <div className="code-header">
        <span><i className="fa-solid fa-code"></i> parsed_message.json</span>
        <button
          onClick={onCopy}
          disabled={!data}
          className="btn btn-secondary btn-sm"
        >
          <i className="fa-solid fa-copy"></i> {copyStatus}
        </button>
      </div>
      <pre>
        <code className="code-font">
          {data ? JSON.stringify(data, null, 2) : '{}'}
        </code>
      </pre>
    </div>
  );
}
