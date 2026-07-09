export function hexToBinary(hex: string): string {
  let binary = '';
  for (const char of hex) {
    const parsed = Number.parseInt(char, 16);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid hex character: "${char}"`);
    }
    binary += parsed.toString(2).padStart(4, '0');
  }
  return binary;
}
