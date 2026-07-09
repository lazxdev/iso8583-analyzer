interface CompareStatsProps {
  sharedCount: number;
  onlyACount: number;
  onlyBCount: number;
}

export function CompareStats({ sharedCount, onlyACount, onlyBCount }: CompareStatsProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2><i className="fa-solid fa-chart-bar icon-accent"></i> Field Comparison Summary</h2>
      </div>
      <div className="panel-body">
        <div className="compare-stats">
          <div className="compare-stat">
            <span className="compare-stat-num" style={{ color: 'var(--primary)' }}>{sharedCount}</span>
            <span className="compare-stat-label">Shared Fields</span>
          </div>
          <div className="compare-stat">
            <span className="compare-stat-num" style={{ color: '#60a5fa' }}>{onlyACount}</span>
            <span className="compare-stat-label">Only in A</span>
          </div>
          <div className="compare-stat">
            <span className="compare-stat-num" style={{ color: '#34d399' }}>{onlyBCount}</span>
            <span className="compare-stat-label">Only in B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
