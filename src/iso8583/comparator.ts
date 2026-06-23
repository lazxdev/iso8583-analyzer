import { Iso8583Service } from './iso8583.service';

export interface BitmapComparison {
  hexA: string;
  hexB: string;
  binaryA: string;
  binaryB: string;
  commonBits: number[];
  onlyInA: number[];
  onlyInB: number[];
}

import { ParsedField } from './iso8583.service';

export interface MessageSummary {
  header: string;
  mti: any;
  inputFormat: string;
  isValid: boolean;
  errors: string[];
  primaryBitmap: { hex: string; binary: string; activeFields: number[] };
  secondaryBitmap?: { hex: string; binary: string; activeFields: number[] };
  fieldsCount: number;
  fields: Record<number, ParsedField>;
}

export interface ComparisonResult {
  a: MessageSummary;
  b: MessageSummary;
  primaryBitmapComparison: BitmapComparison;
  secondaryBitmapComparison?: BitmapComparison;
  sharedFields: number[];
  onlyInAFields: number[];
  onlyInBFields: number[];
}

const service = new Iso8583Service();

function compareActiveFields(aFields: number[], bFields: number[]) {
  const aSet = new Set(aFields);
  const bSet = new Set(bFields);
  const common: number[] = [];
  const onlyA: number[] = [];
  const onlyB: number[] = [];

  for (const f of aSet) {
    if (bSet.has(f)) common.push(f);
    else onlyA.push(f);
  }
  for (const f of bSet) {
    if (!aSet.has(f)) onlyB.push(f);
  }

  common.sort((x, y) => x - y);
  onlyA.sort((x, y) => x - y);
  onlyB.sort((x, y) => x - y);
  return { common, onlyA, onlyB };
}

function buildBitmapComparison(a: any, b: any): BitmapComparison {
  const hexA = a?.hex ?? '';
  const hexB = b?.hex ?? '';
  const binaryA = a?.binary ?? '';
  const binaryB = b?.binary ?? '';
  const aFields = a?.activeFields ?? [];
  const bFields = b?.activeFields ?? [];
  const { common, onlyA, onlyB } = compareActiveFields(aFields, bFields);
  return {
    hexA,
    hexB,
    binaryA,
    binaryB,
    commonBits: common,
    onlyInA: onlyA,
    onlyInB: onlyB,
  };
}

export function compareIsoMessages(rawA: string, rawB: string): ComparisonResult {
  const parsedA = service.parseMessage(rawA);
  const parsedB = service.parseMessage(rawB);

  const aSummary: MessageSummary = {
    header: parsedA.header,
    mti: parsedA.mti,
    inputFormat: parsedA.inputFormat,
    isValid: parsedA.isValid,
    errors: parsedA.errors,
    primaryBitmap: parsedA.primaryBitmap,
    secondaryBitmap: parsedA.secondaryBitmap,
    fieldsCount: Object.keys(parsedA.fields).length,
    fields: parsedA.fields,
  };

  const bSummary: MessageSummary = {
    header: parsedB.header,
    mti: parsedB.mti,
    inputFormat: parsedB.inputFormat,
    isValid: parsedB.isValid,
    errors: parsedB.errors,
    primaryBitmap: parsedB.primaryBitmap,
    secondaryBitmap: parsedB.secondaryBitmap,
    fieldsCount: Object.keys(parsedB.fields).length,
    fields: parsedB.fields,
  };

  const primaryBitmapComparison = buildBitmapComparison(
    parsedA.primaryBitmap,
    parsedB.primaryBitmap,
  );

  let secondaryBitmapComparison: BitmapComparison | undefined;
  if (parsedA.secondaryBitmap || parsedB.secondaryBitmap) {
    secondaryBitmapComparison = buildBitmapComparison(
      parsedA.secondaryBitmap,
      parsedB.secondaryBitmap,
    );
  }

  const { common, onlyA, onlyB } = compareActiveFields(
    [...parsedA.primaryBitmap.activeFields, ...(parsedA.secondaryBitmap?.activeFields ?? [])].filter(f => f !== 1),
    [...parsedB.primaryBitmap.activeFields, ...(parsedB.secondaryBitmap?.activeFields ?? [])].filter(f => f !== 1),
  );

  return {
    a: aSummary,
    b: bSummary,
    primaryBitmapComparison,
    secondaryBitmapComparison,
    sharedFields: common,
    onlyInAFields: onlyA,
    onlyInBFields: onlyB,
  };
}
