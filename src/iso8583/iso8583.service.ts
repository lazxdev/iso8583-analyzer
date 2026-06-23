import { Injectable } from '@nestjs/common';
import { ISO_8583_1987_SPEC, FieldSpec } from './fields';
import { parseBitmap } from './parser/bitmap';
import { parseFields } from './parser/fields-parser';
import { hexToAscii } from './parser/utils';
import { mtiVersions, mtiClasses, mtiFunctions, mtiOriginators } from './mti';

export interface ParsedField {
  fieldNumber: number;
  name: string;
  type: FieldSpec['type'];
  length: number;
  format: FieldSpec['format'];
  rawValue: string;
}

export interface MtiDetails {
  value: string;
  version: string;
  class: string;
  function: string;
  originator: string;
}

export interface BitmapDetails {
  hex: string;
  binary: string;
  activeFields: number[];
}

export interface ParsedIsoMessage {
  inputFormat: 'ascii' | 'hex_decoded';
  rawInput: string;
  cleanedInput: string;
  header: string;
  mti: MtiDetails;
  primaryBitmap: BitmapDetails;
  secondaryBitmap?: BitmapDetails;
  fields: Record<number, ParsedField>;
  isValid: boolean;
  errors: string[];
}

@Injectable()
export class Iso8583Service {
  // MTI lookup maps are defined in `src/iso8583/mti.ts`
  private readonly mtiVersions = mtiVersions;
  private readonly mtiClasses = mtiClasses;
  private readonly mtiFunctions = mtiFunctions;
  private readonly mtiOriginators = mtiOriginators;

  /**
   * Main entry point to parse an ISO 8583 transaction message.
   * Extracts transport header, message type indicator (MTI), primary and secondary bitmaps,
   * and decodes all present message fields.
   *
   * @param rawInput The raw ISO 8583 message string (ASCII text or hex-encoded data).
   * @returns A structured result mapping decoded field values and parsing metadata.
   */
  parseMessage(rawInput: string): ParsedIsoMessage {
    const errors: string[] = [];

    // 1. Detect encoding & normalize whitespace
    const { cleaned, inputFormat } = this.detectAndNormalizeInput(rawInput);

    // 2. Scan and extract transport headers / determine MTI offset
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

    // 3. Parse Message Type Indicator (MTI)
    if (cleaned.length < offset + 4) {
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        'Message is too short to contain a 4-digit MTI',
      ]);
    }
    const { mti, nextOffset: offsetAfterMti } = this.parseMti(cleaned, offset);
    offset = offsetAfterMti;

    // 4. Parse Primary Bitmap
    if (cleaned.length < offset + 16) {
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        `Message truncated: expected 16-hex-character Primary Bitmap at index ${offset}`,
      ]);
    }

    const primaryBitmapHex = cleaned.substring(offset, offset + 16);
    let primaryBitmap: BitmapDetails;
    try {
      const bitmapResult = parseBitmap(cleaned, offset, 1);
      primaryBitmap = bitmapResult.bitmap;
      offset = bitmapResult.nextOffset;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return this.createErrorResponse(rawInput, cleaned, inputFormat, [
        `Invalid Primary Bitmap Hex "${primaryBitmapHex}": ${msg}`,
      ]);
    }

    // 5. Parse Secondary Bitmap if present (bit 1 is set in Primary Bitmap)
    let secondaryBitmap: BitmapDetails | undefined = undefined;
    const hasSecondary = primaryBitmap.binary[0] === '1';

    if (hasSecondary) {
      if (cleaned.length < offset + 16) {
        errors.push(
          `Message truncated: expected 16-hex-character Secondary Bitmap at index ${offset}`,
        );
      } else {
        const secondaryBitmapHex = cleaned.substring(offset, offset + 16);
        try {
          const bitmapResult = parseBitmap(cleaned, offset, 65);
          secondaryBitmap = bitmapResult.bitmap;
          offset = bitmapResult.nextOffset;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(
            `Invalid Secondary Bitmap Hex "${secondaryBitmapHex}": ${msg}`,
          );
        }
      }
    }

    // 6. Build final list of active fields (filtering out bit 1 representing the secondary bitmap itself)
    const activeFields = [
      ...primaryBitmap.activeFields.filter((f) => f !== 1),
      ...(secondaryBitmap ? secondaryBitmap.activeFields : []),
    ].sort((a, b) => a - b);

    // 7. Decode active fields
    const { fields, nextOffset: offsetAfterFields } = parseFields(
      cleaned,
      offset,
      activeFields,
      errors,
    );
    offset = offsetAfterFields;

    // 8. Capture leftover unparsed characters
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

  /**
   * Identifies hex-encoded inputs, decodes them to ASCII, and strips vertical whitespace.
   */
  private detectAndNormalizeInput(rawInput: string): {
    cleaned: string;
    inputFormat: 'ascii' | 'hex_decoded';
  } {
    let cleaned = rawInput.trim();
    let inputFormat: 'ascii' | 'hex_decoded' = 'ascii';

    const hexRegex = /^[0-9a-fA-F\s]+$/;
    if (hexRegex.test(cleaned)) {
      const sansSpaces = cleaned.replace(/\s+/g, '');
      if (sansSpaces.length % 2 === 0) {
        try {
          const decoded = hexToAscii(sansSpaces);
          if (/^(ISO\d{9})?\d{4}/.test(decoded) || decoded.startsWith('ISO')) {
            cleaned = decoded;
            inputFormat = 'hex_decoded';
          }
        } catch {
          // Keep raw ascii on decode failure
        }
      }
    }

    cleaned = cleaned.replace(/[\r\n\t]+/g, '').trim();
    return { cleaned, inputFormat };
  }

  /**
   * Scans the cleaned message for headers (such as 'ISO' prefixes or custom system wrappers)
   * and returns the header value along with the offset index indicating the starting point of the MTI.
   */
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

    if (mtiMatch && mtiMatch.index !== undefined) {
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

  /**
   * Decodes the 4-digit MTI fields.
   */
  private parseMti(
    cleaned: string,
    offset: number,
  ): { mti: MtiDetails; nextOffset: number } {
    const mtiValue = cleaned.substring(offset, offset + 4);
    const mtiDetails: MtiDetails = {
      value: mtiValue,
      version: this.mtiVersions[mtiValue[0]] ?? `Unknown (${mtiValue[0]})`,
      class: this.mtiClasses[mtiValue[1]] ?? `Unknown (${mtiValue[1]})`,
      function: this.mtiFunctions[mtiValue[2]] ?? `Unknown (${mtiValue[2]})`,
      originator:
        this.mtiOriginators[mtiValue[3]] ?? `Unknown (${mtiValue[3]})`,
    };
    return { mti: mtiDetails, nextOffset: offset + 4 };
  }  

  /**
   * Fallback structure for aborted parses.
   */
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
