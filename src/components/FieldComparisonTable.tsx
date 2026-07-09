import { fieldDescriptions } from '../constants';
import type { ComparisonResult } from '../types';

interface FieldComparisonTableProps {
  result: ComparisonResult;
}

export function FieldComparisonTable({ result }: FieldComparisonTableProps) {
  const allFields = new Set([
    ...result.sharedFields,
    ...result.onlyInAFields,
    ...result.onlyInBFields,
  ]);
  const sorted = [...allFields].sort((a, b) => a - b);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><i className="fa-solid fa-list-ul icon-accent"></i> Field Details Comparison</h2>
      </div>
      <div className="panel-body">
        <div className="fields-table-wrapper">
          <table className="fields-table">
            <thead>
              <tr>
                <th>Bit</th>
                <th>Field Name</th>
                <th>Present</th>
                <th>Value A</th>
                <th>Value B</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((fNum) => {
                const fieldA = result.a.fields[fNum];
                const fieldB = result.b.fields[fNum];
                const inBoth = fieldA && fieldB;
                const valMatch = inBoth && fieldA.rawValue === fieldB.rawValue;
                let presence = 'A & B';
                let presenceColor = 'var(--primary)';
                if (!fieldB) { presence = 'Only A'; presenceColor = '#60a5fa'; }
                if (!fieldA) { presence = 'Only B'; presenceColor = '#34d399'; }
                return (
                  <tr key={fNum}>
                    <td className="field-num">#{fNum}</td>
                    <td style={{ fontWeight: 500 }}>
                      {fieldA?.name || fieldB?.name || fieldDescriptions[fNum] || 'Unknown'}
                    </td>
                    <td><span style={{ color: presenceColor, fontWeight: 600 }}>{presence}</span></td>
                    <td className="field-val-cell code-font">{fieldA?.rawValue ?? '\u2014'}</td>
                    <td className="field-val-cell code-font">{fieldB?.rawValue ?? '\u2014'}</td>
                    <td>
                      {inBoth ? (
                        valMatch
                          ? <span style={{ color: 'var(--success)' }}>{'\u2713'} Same</span>
                          : <span style={{ color: '#f59e0b' }}>{'\u2717'} Different</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{'\u2014'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
