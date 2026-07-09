interface CompareInputPanelProps {
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function CompareInputPanel({ label, icon, value, onChange, placeholder }: CompareInputPanelProps) {
  return (
    <div className="panel compare-input-panel">
      <div className="panel-header">
        <h2><i className={icon}></i> {label}</h2>
      </div>
      <div className="panel-body">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
        />
      </div>
    </div>
  );
}
