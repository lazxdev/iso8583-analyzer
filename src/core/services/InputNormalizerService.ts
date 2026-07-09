import type { InputNormalizer, NormalizedInput } from '../interfaces/input-normalizer';
import { hexToAscii } from '../utils/hex-to-ascii';

export class InputNormalizerService implements InputNormalizer {
  normalize(rawInput: string): NormalizedInput {
    let cleaned = rawInput.trim();
    let inputFormat: 'ascii' | 'hex_decoded' = 'ascii';

    const hexRegex = /^[0-9a-fA-F\s]+$/;
    if (hexRegex.test(cleaned)) {
      const sansSpaces = cleaned.replace(/\s+/g, '');
      if (sansSpaces.length % 2 === 0) {
        try {
          const decoded = hexToAscii(sansSpaces);
          if (/^(ISO\d{9})?\d{4}/.test(decoded) || decoded.startsWith('ISO')) {
            cleaned = decoded;
            inputFormat = 'hex_decoded';
          }
        } catch {
          /* keep raw ascii on decode failure */
        }
      }
    }

    cleaned = cleaned.replace(/[\r\n\t]+/g, '').trim();
    return { cleaned, inputFormat };
  }
}
