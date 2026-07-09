import type { BitmapParser, BitmapParserResult } from '../interfaces/bitmap-parser';
import { hexToBinary } from '../utils/hex-to-binary';

export class BitmapParserService implements BitmapParser {
  parse(cleaned: string, offset: number, startFieldNumber: number): BitmapParserResult {
    const bitmapHex = cleaned.substring(offset, offset + 16);
    const binary = hexToBinary(bitmapHex);
    const activeFields: number[] = [];

    for (let i = 0; i < 64; i++) {
      if (binary[i] === '1') {
        activeFields.push(i + startFieldNumber);
      }
    }

    return {
      bitmap: { hex: bitmapHex, binary, activeFields },
      nextOffset: offset + 16,
    };
  }
}
