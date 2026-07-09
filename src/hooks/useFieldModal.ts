import { useState, useCallback } from 'react';
import type { FieldModalData, ParsedIsoMessage } from '../types';
import { fieldDescriptions } from '../constants';

export function useFieldModal() {
  const [selectedField, setSelectedField] = useState<FieldModalData | null>(null);

  const openModal = useCallback((bitNum: number, parsedData: ParsedIsoMessage | null) => {
    if (!parsedData) return;

    const field = parsedData.fields[bitNum];
    if (field) {
      setSelectedField({
        number: bitNum,
        name: field.name,
        type: field.type,
        length: field.length,
        format: field.format,
        rawValue: field.rawValue,
      });
    } else {
      const name = fieldDescriptions[bitNum] || 'Reserved';
      const rawValue =
        bitNum === 1 && parsedData.secondaryBitmap
          ? parsedData.secondaryBitmap.hex
          : 'Not parsed / No data';
      setSelectedField({
        number: bitNum,
        name,
        type: bitNum === 1 ? 'fixed' : 'unknown',
        length: bitNum === 1 ? 16 : 0,
        format: bitNum === 1 ? 'b' : 'unknown',
        rawValue,
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelectedField(null);
  }, []);

  return { selectedField, openModal, closeModal };
}
