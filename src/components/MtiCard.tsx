import type { MtiDetails } from '../types';

interface MtiCardProps {
  mti: MtiDetails;
}

export function MtiCard({ mti }: MtiCardProps) {
  if (!mti.value) return null;

  return (
    <div className="mti-card">
      <div className="mti-card-header">
        <span className="badge badge-mti">{mti.value}</span>
        <h3>MTI Details</h3>
      </div>
      <div className="mti-grid">
        <div className="mti-field">
          <span className="mti-label">ISO Version</span>
          <span className="mti-val">{mti.version}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Message Class</span>
          <span className="mti-val">{mti.class}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Message Function</span>
          <span className="mti-val">{mti.function}</span>
        </div>
        <div className="mti-field">
          <span className="mti-label">Originator</span>
          <span className="mti-val">{mti.originator}</span>
        </div>
      </div>
    </div>
  );
}
