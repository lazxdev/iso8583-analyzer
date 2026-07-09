import type { BitmapDetails } from '../../types';

export interface BitmapParserResult {
  bitmap: BitmapDetails;
  nextOffset: number;
}

export interface BitmapParser {
  parse(cleaned: string, offset: number, startFieldNumber: number): BitmapParserResult;
}
