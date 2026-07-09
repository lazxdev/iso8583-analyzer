import { fieldDescriptions } from '../constants';
import type { BitmapDetails } from '../types';

interface BitmapVisualizerProps {
  primaryBitmap: BitmapDetails;
  secondaryBitmap?: BitmapDetails;
  onBitClick: (bitNum: number) => void;
}

function BitmapGrid({
  start,
  end,
  bitmap,
  onBitClick,
}: {
  start: number;
  end: number;
  bitmap: BitmapDetails;
  onBitClick: (bitNum: number) => void;
}) {
  return (
    <div className="bitmap-grid">
      {Array.from({ length: end - start + 1 }, (_, i) => {
        const bitNum = start + i;
        const isActive = bitmap.binary[i] === '1';
        return (
          <div
            key={bitNum}
            onClick={() => isActive && onBitClick(bitNum)}
            className={`bit-cell ${isActive ? 'active-bit' : ''}`}
          >
            {bitNum}
            {isActive && (
              <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BitmapVisualizer({ primaryBitmap, secondaryBitmap, onBitClick }: BitmapVisualizerProps) {
  return (
    <>
      <div className="bitmap-container">
        <div className="bitmap-header-row">
          <h3>Primary Bitmap Fields (1 - 64)</h3>
          <div className="legend">
            <span className="legend-item"><span className="dot active"></span> Active</span>
            <span className="legend-item"><span className="dot inactive"></span> Inactive</span>
          </div>
        </div>
        <BitmapGrid start={1} end={64} bitmap={primaryBitmap} onBitClick={onBitClick} />
      </div>

      {secondaryBitmap && (
        <div className="bitmap-container">
          <div className="bitmap-header-row border-top">
            <h3>Secondary Bitmap Fields (65 - 128)</h3>
          </div>
          <BitmapGrid start={65} end={128} bitmap={secondaryBitmap} onBitClick={onBitClick} />
        </div>
      )}

      <div className="info-card">
        <i className="fa-solid fa-info-circle"></i>
        <p>Hover over any active bit in the grid above to view the field name. Click on it to view details.</p>
      </div>
    </>
  );
}
