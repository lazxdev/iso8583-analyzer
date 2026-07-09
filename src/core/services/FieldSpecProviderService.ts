import type { FieldSpec } from '../interfaces/field-spec';
import type { FieldSpecProvider } from '../interfaces/field-spec-provider';
import { ISO_8583_1987_SPEC } from '../../constants';

export class FieldSpecProviderService implements FieldSpecProvider {
  getSpec(fieldNumber: number): FieldSpec {
    return ISO_8583_1987_SPEC[fieldNumber] ?? {
      name: `Proprietary / Unknown Field ${fieldNumber}`,
      type: 'lllvar',
      length: 999,
      format: 'ans',
    };
  }
}
