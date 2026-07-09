import type { MtiDetails } from './mti-details';
import type { BitmapDetails } from './bitmap-details';
import type { ParsedField } from './parsed-field';

export interface ParsedIsoMessage {
  inputFormat: 'ascii' | 'hex_decoded';
  rawInput: string;
  cleanedInput: string;
  header: string;
  mti: MtiDetails;
  primaryBitmap: BitmapDetails;
  secondaryBitmap?: BitmapDetails;
  fields: Record<number, ParsedField>;
  isValid: boolean;
  errors: string[];
}
