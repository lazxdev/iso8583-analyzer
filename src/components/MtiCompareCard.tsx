import type { MessageSummary } from '../types';

interface MtiCompareCardProps {
  label: string;
  summary: MessageSummary;
}

export function MtiCompareCard({ label, summary }: MtiCompareCardProps) {
  const mti = summary.mti as { value?: string; class?: string; function?: string };

  return (
    <div className={`mti-card ${summary.isValid ? '' : 'mti-card--error'}`}>
      <div className="mti-card-header">
        <span className="badge badge-mti">{mti.value || '????'}</span>
        <h3>{label}</h3>
      </div>
      <div className="mti-grid">
        <div className="mti-field">
          <span className="mti-label">Class</span>
          <span className="mti-val">{mti.class}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Function</span>
          <span className="mti-val">{mti.function}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Fields</span>
          <span className="mti-val">{summary.fieldsCount}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Valid</span>
          <span className="mti-val">{summary.isValid ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}
