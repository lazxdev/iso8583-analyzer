import type { FieldModalData } from '../types';

interface FieldDetailModalProps {
  field: FieldModalData;
  onClose: () => void;
}

export function FieldDetailModal({ field, onClose }: FieldDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Field #{field.number} Details</h3>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-item">
              <span className="modal-label">Name</span>
              <span className="modal-val">{field.name}</span>
            </div>
            <div className="modal-item">
              <span className="modal-label">Spec Type</span>
              <span className="modal-val">{field.type.toUpperCase()}</span>
            </div>
            <div className="modal-item">
              <span className="modal-label">Length</span>
              <span className="modal-val">{field.length}</span>
            </div>
            <div className="modal-item">
              <span className="modal-label">Format</span>
              <span className="modal-val">{field.format}</span>
            </div>
          </div>
          <div className="modal-raw-section">
            <span className="modal-label">Value</span>
            <textarea readOnly rows={4} className="code-font" value={field.rawValue} />
          </div>
        </div>
      </div>
    </div>
  );
}
