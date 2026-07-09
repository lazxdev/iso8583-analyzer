import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [status, setStatus] = useState('Copy JSON');

  const copy = useCallback(async (data: unknown) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setStatus('Copied!');
      setTimeout(() => setStatus('Copy JSON'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Could not copy JSON: ' + message);
    }
  }, []);

  return { copyStatus: status, copy };
}
