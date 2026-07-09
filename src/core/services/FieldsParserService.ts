import type { FieldsParser, FieldsParserResult } from '../interfaces/fields-parser';
import type { FieldSpecProvider } from '../interfaces/field-spec-provider';
import type { ParsedField } from '../../types';

export class FieldsParserService implements FieldsParser {
  constructor(private readonly specProvider: FieldSpecProvider) {}

  parse(
    cleaned: string,
    startOffset: number,
    activeFields: number[],
    errors: string[],
  ): FieldsParserResult {
    const fields: Record<number, ParsedField> = {};
    let offset = startOffset;

    for (const fieldNumber of activeFields) {
      if (offset >= cleaned.length) {
        errors.push(
          `Message truncated: field ${fieldNumber} was expected but raw message ended.`,
        );
        break;
      }

      const spec = this.specProvider.getSpec(fieldNumber);

      try {
        let fieldValue = '';

        if (spec.type === 'fixed') {
          if (cleaned.length < offset + spec.length) {
            errors.push(
              `Truncated fixed field ${fieldNumber} ("${spec.name}"): expected ${spec.length} chars, got ${cleaned.length - offset}`,
            );
            fieldValue = cleaned.substring(offset);
            offset = cleaned.length;
          } else {
            fieldValue = cleaned.substring(offset, offset + spec.length);
            offset += spec.length;
          }
        } else if (spec.type === 'llvar') {
          if (cleaned.length < offset + 2) {
            errors.push(
              `Truncated LLVAR field ${fieldNumber} ("${spec.name}"): cannot read 2-digit length indicator`,
            );
            offset = cleaned.length;
          } else {
            const lengthIndicatorStr = cleaned.substring(offset, offset + 2);
            const lengthIndicator = Number.parseInt(lengthIndicatorStr, 10);
            offset += 2;

            if (Number.isNaN(lengthIndicator)) {
              errors.push(
                `Invalid LLVAR length indicator "${lengthIndicatorStr}" for field ${fieldNumber}`,
              );
            } else {
              if (cleaned.length < offset + lengthIndicator) {
                errors.push(
                  `Truncated LLVAR field ${fieldNumber} ("${spec.name}"): expected ${lengthIndicator} chars, got ${cleaned.length - offset}`,
                );
                fieldValue = cleaned.substring(offset);
                offset = cleaned.length;
              } else {
                fieldValue = cleaned.substring(offset, offset + lengthIndicator);
                offset += lengthIndicator;
              }
            }
          }
        } else if (spec.type === 'lllvar') {
          if (cleaned.length < offset + 3) {
            errors.push(
              `Truncated LLLVAR field ${fieldNumber} ("${spec.name}"): cannot read 3-digit length indicator`,
            );
            offset = cleaned.length;
          } else {
            const lengthIndicatorStr = cleaned.substring(offset, offset + 3);
            const lengthIndicator = Number.parseInt(lengthIndicatorStr, 10);
            offset += 3;

            if (Number.isNaN(lengthIndicator)) {
              errors.push(
                `Invalid LLLVAR length indicator "${lengthIndicatorStr}" for field ${fieldNumber}`,
              );
            } else {
              if (cleaned.length < offset + lengthIndicator) {
                errors.push(
                  `Truncated LLLVAR field ${fieldNumber} ("${spec.name}"): expected ${lengthIndicator} chars, got ${cleaned.length - offset}`,
                );
                fieldValue = cleaned.substring(offset);
                offset = cleaned.length;
              } else {
                fieldValue = cleaned.substring(offset, offset + lengthIndicator);
                offset += lengthIndicator;
              }
            }
          }
        }

        fields[fieldNumber] = {
          fieldNumber,
          name: spec.name,
          type: spec.type,
          length: fieldValue.length,
          format: spec.format,
          rawValue: fieldValue,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Error parsing field ${fieldNumber}: ${msg}`);
      }
    }

    return { fields, nextOffset: offset };
  }
}
