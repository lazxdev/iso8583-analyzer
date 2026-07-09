import { useState } from 'react';
import type { ParsedIsoMessage } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { BitmapVisualizer } from './BitmapVisualizer';
import { FieldsTable } from './FieldsTable';
import { JsonViewer } from './JsonViewer';

type Tab = 'visualizer' | 'fields' | 'json';

interface ParseResultsTabsProps {
  data: ParsedIsoMessage | null;
  copyStatus: string;
  onCopyJson: () => void;
  onBitClick: (bitNum: number) => void;
}

export function ParseResultsTabs({ data, copyStatus, onCopyJson, onBitClick }: ParseResultsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('visualizer');

  return (
    <section className="panel results-panel">
      <div className="tabs">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-table-cells-large"></i> Bitmap Visualizer
        </button>
        <button
          onClick={() => setActiveTab('fields')}
          className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-list-ul"></i> Parsed Fields
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
        >
          <i className="fa-solid fa-code"></i> JSON Output
        </button>
      </div>
      <div className="panel-body tab-content-wrapper">
        {data && data.errors.length > 0 && <ErrorMessage errors={data.errors} />}

        <div className={`tab-content ${activeTab === 'visualizer' ? 'active' : ''}`}>
          {data && (
            <BitmapVisualizer
              primaryBitmap={data.primaryBitmap}
              secondaryBitmap={data.secondaryBitmap}
              onBitClick={onBitClick}
            />
          )}
        </div>

        <div className={`tab-content ${activeTab === 'fields' ? 'active' : ''}`}>
          <FieldsTable data={data} onFieldClick={onBitClick} />
        </div>

        <div className={`tab-content ${activeTab === 'json' ? 'active' : ''}`}>
          <JsonViewer data={data} copyStatus={copyStatus} onCopy={onCopyJson} />
        </div>
      </div>
    </section>
  );
}
