import { fieldDescriptions } from '../constants';
import type { BitmapComparison } from '../types';

interface BitmapDiffGridProps {
  title: string;
  comparison: BitmapComparison;
  startBit: number;
}

export function BitmapDiffGrid({ title, comparison, startBit }: BitmapDiffGridProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2><i className="fa-solid fa-table-cells-large icon-accent"></i> {title}</h2>
        <div className="legend">
          <span className="legend-item"><span className="dot" style={{ background: 'var(--primary)' }}></span> Both</span>
          <span className="legend-item"><span className="dot" style={{ background: '#60a5fa' }}></span> Only A</span>
          <span className="legend-item"><span className="dot" style={{ background: '#34d399' }}></span> Only B</span>
        </div>
      </div>
      <div className="panel-body">
        <div className="bitmap-grid">
          {Array.from({ length: 64 }, (_, i) => {
            const bitNum = startBit + i;
            const inBoth = comparison.commonBits.includes(bitNum);
            const inA = comparison.onlyInA.includes(bitNum);
            const inB = comparison.onlyInB.includes(bitNum);
            let cls = 'bit-cell';
            if (inBoth) cls += ' common-bit';
            else if (inA) cls += ' only-a-bit';
            else if (inB) cls += ' only-b-bit';
            return (
              <div key={bitNum} className={cls}>
                {bitNum}
                {(inBoth || inA || inB) && (
                  <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
