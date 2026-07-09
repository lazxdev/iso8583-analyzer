import type { ParsedField } from '../../types';

export interface FieldsParserResult {
  fields: Record<number, ParsedField>;
  nextOffset: number;
}

export interface FieldsParser {
  parse(
    cleaned: string,
    startOffset: number,
    activeFields: number[],
    errors: string[],
  ): FieldsParserResult;
}
