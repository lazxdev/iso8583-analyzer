import type { ParsedField } from './parsed-field';

export interface BitmapComparison {
  hexA: string;
  hexB: string;
  binaryA: string;
  binaryB: string;
  commonBits: number[];
  onlyInA: number[];
  onlyInB: number[];
}

export interface MessageSummary {
  header: string;
  mti: unknown;
  inputFormat: string;
  isValid: boolean;
  errors: string[];
  primaryBitmap: { hex: string; binary: string; activeFields: number[] };
  secondaryBitmap?: { hex: string; binary: string; activeFields: number[] };
  fieldsCount: number;
  fields: Record<number, ParsedField>;
}

export interface ComparisonResult {
  a: MessageSummary;
  b: MessageSummary;
  primaryBitmapComparison: BitmapComparison;
  secondaryBitmapComparison?: BitmapComparison;
  sharedFields: number[];
  onlyInAFields: number[];
  onlyInBFields: number[];
}
