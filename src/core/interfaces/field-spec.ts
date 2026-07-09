export type FieldType = 'fixed' | 'llvar' | 'lllvar';
export type FieldFormat = 'n' | 'an' | 'ans' | 'b' | 'z' | 'xn' | 'ns';

export interface FieldSpec {
  name: string;
  type: FieldType;
  length: number;
  format: FieldFormat;
}
