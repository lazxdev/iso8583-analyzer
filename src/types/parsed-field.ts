import type { FieldSpec } from '../core/interfaces/field-spec';

export interface ParsedField {
  fieldNumber: number;
  name: string;
  type: FieldSpec['type'];
  length: number;
  format: FieldSpec['format'];
  rawValue: string;
}
