import type { Iso8583Parser } from '../interfaces/iso8583-parser';
import type {
  BitmapComparison,
  ComparisonResult,
  MessageSummary,
  ParsedField,
} from '../../types';

export class Iso8583ComparatorService {
  constructor(private readonly parser: Iso8583Parser) {}

  compare(rawA: string, rawB: string): ComparisonResult {
    const parsedA = this.parser.parseMessage(rawA);
    const parsedB = this.parser.parseMessage(rawB);

    const aSummary: MessageSummary = this.toSummary(parsedA);
    const bSummary: MessageSummary = this.toSummary(parsedB);

    const primaryBitmapComparison = this.buildBitmapComparison(
      parsedA.primaryBitmap,
      parsedB.primaryBitmap,
    );

    let secondaryBitmapComparison: BitmapComparison | undefined;
    if (parsedA.secondaryBitmap || parsedB.secondaryBitmap) {
      secondaryBitmapComparison = this.buildBitmapComparison(
        parsedA.secondaryBitmap,
        parsedB.secondaryBitmap,
      );
    }

    const { common, onlyA, onlyB } = this.compareActiveFields(
      [
        ...parsedA.primaryBitmap.activeFields,
        ...(parsedA.secondaryBitmap?.activeFields ?? []),
      ].filter((f) => f !== 1),
      [
        ...parsedB.primaryBitmap.activeFields,
        ...(parsedB.secondaryBitmap?.activeFields ?? []),
      ].filter((f) => f !== 1),
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

  private toSummary(parsed: {
    header: string;
    mti: unknown;
    inputFormat: string;
    isValid: boolean;
    errors: string[];
    primaryBitmap: { hex: string; binary: string; activeFields: number[] };
    secondaryBitmap?: { hex: string; binary: string; activeFields: number[] };
    fields: Record<number, ParsedField>;
  }): MessageSummary {
    return {
      header: parsed.header,
      mti: parsed.mti,
      inputFormat: parsed.inputFormat,
      isValid: parsed.isValid,
      errors: parsed.errors,
      primaryBitmap: parsed.primaryBitmap,
      secondaryBitmap: parsed.secondaryBitmap,
      fieldsCount: Object.keys(parsed.fields).length,
      fields: parsed.fields,
    };
  }

  private compareActiveFields(aFields: number[], bFields: number[]) {
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

  private buildBitmapComparison(
    a?: { hex: string; binary: string; activeFields: number[] },
    b?: { hex: string; binary: string; activeFields: number[] },
  ): BitmapComparison {
    const hexA = a?.hex ?? '';
    const hexB = b?.hex ?? '';
    const binaryA = a?.binary ?? '';
    const binaryB = b?.binary ?? '';
    const aFields = a?.activeFields ?? [];
    const bFields = b?.activeFields ?? [];
    const { common, onlyA, onlyB } = this.compareActiveFields(aFields, bFields);
    return { hexA, hexB, binaryA, binaryB, commonBits: common, onlyInA: onlyA, onlyInB: onlyB };
  }
}
