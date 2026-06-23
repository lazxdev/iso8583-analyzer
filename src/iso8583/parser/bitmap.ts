export function hexToBinary(hex: string): string {
  let binary = '';
  for (const char of hex) {
    const parsed = parseInt(char, 16);
    if (isNaN(parsed)) {
      throw new Error(`Invalid hex character: "${char}"`);
    }
    binary += parsed.toString(2).padStart(4, '0');
  }
  return binary;
}

/**
 * Parse a 16-hex-character bitmap at `offset` and return its details.
 * `startFieldNumber` should be 1 for primary and 65 for secondary.
 */
export function parseBitmap(
  cleaned: string,
  offset: number,
  startFieldNumber: number,
): { bitmap: { hex: string; binary: string; activeFields: number[] }; nextOffset: number } {
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
