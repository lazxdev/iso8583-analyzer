import { samples } from '../constants';

interface SampleButtonsProps {
  onSampleClick: (key: keyof typeof samples) => void;
}

export function SampleButtons({ onSampleClick }: SampleButtonsProps) {
  return (
    <div className="samples-section">
      <h3><i className="fa-solid fa-list-check"></i> Sample Templates</h3>
      <div className="sample-buttons">
        <button onClick={() => onSampleClick('purchase')} className="sample-btn">
          <span className="sample-mti">0200</span>
          <span className="sample-desc">Purchase Request</span>
        </button>
        <button onClick={() => onSampleClick('echo')} className="sample-btn">
          <span className="sample-mti">0800</span>
          <span className="sample-desc">Network Echo</span>
        </button>
        <button onClick={() => onSampleClick('reversal')} className="sample-btn">
          <span className="sample-mti">0400</span>
          <span className="sample-desc">Reversal Request</span>
        </button>
      </div>
    </div>
  );
}
