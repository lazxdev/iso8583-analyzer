import type { Iso8583Parser } from '../interfaces/iso8583-parser';
import type { MtiLookupProvider } from '../interfaces/mti-lookup-provider';
import type { InputNormalizer } from '../interfaces/input-normalizer';
import type { BitmapParser } from '../interfaces/bitmap-parser';
import type { FieldsParser } from '../interfaces/fields-parser';
import type { MtiDetails, BitmapDetails, ParsedIsoMessage } from '../../types';

export class Iso8583ParserService implements Iso8583Parser {
  constructor(
    private readonly mtiLookup: MtiLookupProvider,
    private readonly inputNormalizer: InputNormalizer,
    private readonly bitmapParser: BitmapParser,
    private readonly fieldsParser: FieldsParser,
  ) {}

  parseMessage(rawInput: string): ParsedIsoMessage {
    const errors: string[] = [];

    const { cleaned, inputFormat } = this.inputNormalizer.normalize(rawInput);

    let header = '';
    let offset = 0;
    try {
      const headerResult = this.extractHeaderAndMtiOffset(cleaned, errors);
      header = headerResult.header;
      offset = headerResult.offset;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        `Header extraction failed: ${msg}`,
      ]);
    }

    if (cleaned.length < offset + 4) {
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        'Message is too short to contain a 4-digit MTI',
      ]);
    }

    const { mti, nextOffset: offsetAfterMti } = this.parseMti(cleaned, offset);
    offset = offsetAfterMti;

    if (cleaned.length < offset + 16) {
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        `Message truncated: expected 16-hex-character Primary Bitmap at index ${offset}`,
      ]);
    }

    const primaryBitmapHex = cleaned.substring(offset, offset + 16);
    let primaryBitmap: BitmapDetails;
    try {
      const bitmapResult = this.bitmapParser.parse(cleaned, offset, 1);
      primaryBitmap = bitmapResult.bitmap;
      offset = bitmapResult.nextOffset;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        `Invalid Primary Bitmap Hex "${primaryBitmapHex}": ${msg}`,
      ]);
    }

    let secondaryBitmap: BitmapDetails | undefined;
    const hasSecondary = primaryBitmap.binary[0] === '1';

    if (hasSecondary) {
      if (cleaned.length < offset + 16) {
        errors.push(
          `Message truncated: expected 16-hex-character Secondary Bitmap at index ${offset}`,
        );
      } else {
        const secondaryBitmapHex = cleaned.substring(offset, offset + 16);
        try {
          const bitmapResult = this.bitmapParser.parse(cleaned, offset, 65);
          secondaryBitmap = bitmapResult.bitmap;
          offset = bitmapResult.nextOffset;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`Invalid Secondary Bitmap Hex "${secondaryBitmapHex}": ${msg}`);
        }
      }
    }

    const activeFields = [
      ...primaryBitmap.activeFields.filter((f) => f !== 1),
      ...(secondaryBitmap ? secondaryBitmap.activeFields : []),
    ].sort((a, b) => a - b);

    const { fields, nextOffset: offsetAfterFields } = this.fieldsParser.parse(
      cleaned,
      offset,
      activeFields,
      errors,
    );
    offset = offsetAfterFields;

    if (offset < cleaned.length) {
      errors.push(
        `Extra unparsed data at end of message (offset ${offset}/${cleaned.length}): "${cleaned.substring(offset)}"`,
      );
    }

    return {
      inputFormat,
      rawInput,
      cleanedInput: cleaned,
      header,
      mti,
      primaryBitmap,
      secondaryBitmap,
      fields,
      isValid: errors.length === 0,
      errors,
    };
  }

  private extractHeaderAndMtiOffset(
    cleaned: string,
    errors: string[],
  ): { header: string; offset: number } {
    let offset = 0;
    let header = '';
    let searchStart = 0;

    if (cleaned.startsWith('ISO')) {
      if (cleaned.length >= 12) {
        header = cleaned.substring(0, 12);
        searchStart = 12;
        offset = 12;
      } else {
        errors.push('Found partial ISO header, treating as start of message');
      }
    }

    const mtiSearchArea = cleaned.substring(searchStart);
    const mtiMatch = mtiSearchArea.match(/(\d{4})([0-9a-fA-F]{16})/);

    if (mtiMatch?.index !== undefined) {
      const matchIndex = searchStart + mtiMatch.index;
      header = cleaned.substring(0, matchIndex);
      offset = matchIndex;
    } else {
      errors.push(
        'Could not detect standard MTI and Primary Bitmap pattern. Attempting standard offset parsing.',
      );
    }

    return { header, offset };
  }

  private parseMti(
    cleaned: string,
    offset: number,
  ): { mti: MtiDetails; nextOffset: number } {
    const mtiValue = cleaned.substring(offset, offset + 4);
    const mtiDetails: MtiDetails = {
      value: mtiValue,
      version: this.mtiLookup.lookupVersion(mtiValue[0]),
      class: this.mtiLookup.lookupClass(mtiValue[1]),
      function: this.mtiLookup.lookupFunction(mtiValue[2]),
      originator: this.mtiLookup.lookupOriginator(mtiValue[3]),
    };
    return { mti: mtiDetails, nextOffset: offset + 4 };
  }

  private createErrorResponse(
    rawInput: string,
    cleaned: string,
    inputFormat: 'ascii' | 'hex_decoded',
    errors: string[],
  ): ParsedIsoMessage {
    return {
      inputFormat,
      rawInput,
      cleanedInput: cleaned,
      header: '',
      mti: { value: '', version: '', class: '', function: '', originator: '' },
      primaryBitmap: { hex: '', binary: '', activeFields: [] },
      fields: {},
      isValid: false,
      errors,
    };
  }
}
