import type { ParsedIsoMessage } from '../types';

interface FieldsTableProps {
  data: ParsedIsoMessage | null;
  onFieldClick: (bitNum: number) => void;
}

export function FieldsTable({ data, onFieldClick }: FieldsTableProps) {
  const fields = data?.fields;
  const hasFields = fields && Object.keys(fields).length > 0;

  return (
    <div className="fields-table-wrapper">
      <table className="fields-table">
        <thead>
          <tr>
            <th>Bit</th>
            <th>Field Name</th>
            <th>Type</th>
            <th>Length</th>
            <th>Format</th>
            <th>Raw Value</th>
          </tr>
        </thead>
        <tbody>
          {hasFields ? (
            Object.keys(fields)
              .map(Number)
              .sort((a, b) => a - b)
              .map((fieldNum) => {
                const field = fields[fieldNum];
                const badgeClass = field.type === 'fixed' ? 'type-fixed' : 'type-variable';
                return (
                  <tr key={fieldNum} onClick={() => onFieldClick(fieldNum)}>
                    <td className="field-num">#{field.fieldNumber}</td>
                    <td style={{ fontWeight: 500 }}>{field.name}</td>
                    <td><span className={`badge-field-type ${badgeClass}`}>{field.type}</span></td>
                    <td>{field.length}</td>
                    <td><span className="code-font" style={{ color: 'var(--accent)' }}>{field.format}</span></td>
                    <td className="field-val-cell code-font" title={field.rawValue}>{field.rawValue}</td>
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan={6} className="no-data">
                No parsed fields. Input an ISO message and click parse.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
