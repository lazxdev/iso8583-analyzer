import type { FieldSpec } from './field-spec';

export interface FieldSpecProvider {
  getSpec(fieldNumber: number): FieldSpec;
}
