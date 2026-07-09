import { useState, useCallback } from 'react';
import type { ComparisonResult } from '../types';
import type { Iso8583ComparatorService } from '../core/services/Iso8583ComparatorService';

export function useCompareMessages(comparator: Iso8583ComparatorService) {
  const [compareMessageA, setCompareMessageA] = useState('');
  const [compareMessageB, setCompareMessageB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const compare = useCallback(() => {
    const a = compareMessageA.trim();
    const b = compareMessageB.trim();
    if (!a || !b) {
      alert('Please enter both ISO 8583 messages to compare.');
      return;
    }
    const result = comparator.compare(a, b);
    setComparisonResult(result);
  }, [compareMessageA, compareMessageB, comparator]);

  const clear = useCallback(() => {
    setCompareMessageA('');
    setCompareMessageB('');
    setComparisonResult(null);
  }, []);

  return {
    compareMessageA,
    setCompareMessageA,
    compareMessageB,
    setCompareMessageB,
    comparisonResult,
    compare,
    clear,
  };
}
