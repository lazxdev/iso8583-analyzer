export function hexToAscii(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(Number.parseInt(hex.substring(i, i + 2), 16));
  }
  return str;
}
