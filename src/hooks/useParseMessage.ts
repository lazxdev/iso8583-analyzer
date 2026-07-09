import { useState, useCallback } from 'react';
import type { Iso8583Parser } from '../core/interfaces';
import type { ParsedIsoMessage } from '../types';

export function useParseMessage(parser: Iso8583Parser) {
  const [rawMessage, setRawMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedIsoMessage | null>(null);

  const parse = useCallback(
    (messageText?: string) => {
      const text = (messageText ?? rawMessage).trim();
      if (!text) {
        alert('Please enter an ISO 8583 message string.');
        return;
      }
      const result = parser.parseMessage(text);
      setParsedData(result);
    },
    [parser, rawMessage],
  );

  const clear = useCallback(() => {
    setRawMessage('');
    setParsedData(null);
  }, []);

  return { rawMessage, setRawMessage, parsedData, setParsedData, parse, clear };
}
