import { useCallback } from 'react';
import type { ParsedIsoMessage } from '../types';
import { samples } from '../constants';
import { ParseInputPanel } from './ParseInputPanel';
import { SampleButtons } from './SampleButtons';
import { MtiCard } from './MtiCard';
import { MetadataCard } from './MetadataCard';
import { ParseResultsTabs } from './ParseResultsTabs';

interface ParseModeProps {
  rawMessage: string;
  onMessageChange: (value: string) => void;
  parsedData: ParsedIsoMessage | null;
  onParse: () => void;
  onClear: () => void;
  copyStatus: string;
  onCopyJson: () => void;
  onBitClick: (bitNum: number) => void;
}

export function ParseMode({
  rawMessage,
  onMessageChange,
  parsedData,
  onParse,
  onClear,
  copyStatus,
  onCopyJson,
  onBitClick,
}: ParseModeProps) {
  const handleSampleClick = useCallback(
    (key: keyof typeof samples) => {
      const val = samples[key];
      onMessageChange(val);
      setTimeout(() => onParse(), 0);
    },
    [onMessageChange, onParse],
  );

  return (
    <main className="dashboard-grid">
      <section className="panel control-panel">
        <ParseInputPanel
          rawMessage={rawMessage}
          onMessageChange={onMessageChange}
          onParse={onParse}
          onClear={onClear}
        />
        <div className="panel-body">
          <SampleButtons onSampleClick={handleSampleClick} />
          {parsedData?.mti && <MtiCard mti={parsedData.mti} />}
          {parsedData && <MetadataCard data={parsedData} />}
        </div>
      </section>
      <ParseResultsTabs
        data={parsedData}
        copyStatus={copyStatus}
        onCopyJson={onCopyJson}
        onBitClick={onBitClick}
      />
    </main>
  );
}
