import type { ParsedIsoMessage } from '../types';

interface MetadataCardProps {
  data: ParsedIsoMessage;
}

export function MetadataCard({ data }: MetadataCardProps) {
  return (
    <div className="metadata-card">
      <h3>Message Metadata</h3>
      <ul>
        <li>
          <strong>Input Format:</strong>
          <span>{data.inputFormat === 'hex_decoded' ? 'Hex-Encoded (Autodecoded)' : 'ASCII Plain Text'}</span>
        </li>
        <li>
          <strong>ISO Header:</strong>
          <span>{data.header || 'None'}</span>
        </li>
        <li>
          <strong>Primary Bitmap (Hex):</strong>
          <span className="code-font">{data.primaryBitmap.hex || '-'}</span>
        </li>
        <li>
          <strong>Secondary Bitmap (Hex):</strong>
          <span className="code-font">
            {data.secondaryBitmap ? data.secondaryBitmap.hex : 'None (Only Primary Bitmap Active)'}
          </span>
        </li>
      </ul>
    </div>
  );
}
