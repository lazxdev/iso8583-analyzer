import type { ParsedIsoMessage } from '../../types';

export interface Iso8583Parser {
  parseMessage(rawInput: string): ParsedIsoMessage;
}
