export interface NormalizedInput {
  cleaned: string;
  inputFormat: 'ascii' | 'hex_decoded';
}

export interface InputNormalizer {
  normalize(rawInput: string): NormalizedInput;
}
