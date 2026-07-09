import type { ComparisonResult } from '../types';
import { CompareInputPanel } from './CompareInputPanel';
import { MtiCompareCard } from './MtiCompareCard';
import { CompareStats } from './CompareStats';
import { FieldComparisonTable } from './FieldComparisonTable';

interface CompareModeProps {
  messageA: string;
  onMessageAChange: (value: string) => void;
  messageB: string;
  onMessageBChange: (value: string) => void;
  onCompare: () => void;
  onClear: () => void;
  result: ComparisonResult | null;
}

export function CompareMode({
  messageA,
  onMessageAChange,
  messageB,
  onMessageBChange,
  onCompare,
  onClear,
  result,
}: CompareModeProps) {
  return (
    <main className="compare-layout">
      <div className="compare-input-row">
        <CompareInputPanel
          label="Message A"
          icon="fa-solid fa-a icon-accent"
          value={messageA}
          onChange={onMessageAChange}
          placeholder="Paste first ISO 8583 message..."
        />
        <CompareInputPanel
          label="Message B"
          icon="fa-solid fa-b icon-accent"
          value={messageB}
          onChange={onMessageBChange}
          placeholder="Paste second ISO 8583 message..."
        />
      </div>

      <div className="compare-actions">
        <button onClick={onCompare} className="btn btn-primary">
          <i className="fa-solid fa-code-compare"></i> Compare Messages
        </button>
        <button onClick={onClear} className="btn btn-secondary">
          <i className="fa-solid fa-xmark"></i> Clear
        </button>
      </div>

      {result && (
        <div className="compare-results">
          <div className="compare-mti-row">
            <MtiCompareCard label="Message A" summary={result.a} />
            <MtiCompareCard label="Message B" summary={result.b} />
          </div>

          <CompareStats
            sharedCount={result.sharedFields.length}
            onlyACount={result.onlyInAFields.length}
            onlyBCount={result.onlyInBFields.length}
          />
          <FieldComparisonTable result={result} />
        </div>
      )}
    </main>
  );
}
