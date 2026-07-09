import { describe, it, expect } from 'vitest';
import { MtiLookupService } from './MtiLookupService';
import { FieldSpecProviderService } from './FieldSpecProviderService';
import { InputNormalizerService } from './InputNormalizerService';
import { BitmapParserService } from './BitmapParserService';
import { FieldsParserService } from './FieldsParserService';
import { Iso8583ParserService } from './Iso8583ParserService';

function createParser() {
  return new Iso8583ParserService(
    new MtiLookupService(),
    new InputNormalizerService(),
    new BitmapParserService(),
    new FieldsParserService(new FieldSpecProviderService()),
  );
}

describe('Iso8583ParserService', () => {
  it('parses a purchase message', () => {
    const parser = createParser();
    const msg =
      '02007210000108C0800016123456789012345600000000000001500006230854000000010806432109123456789012TERM0001MERCHANT1234567840';
    const result = parser.parseMessage(msg);

    expect(result.isValid).toBe(true);
    expect(result.mti.value).toBe('0200');
    expect(result.mti.class).toBe('Financial');
    expect(result.mti.function).toBe('Request');
    expect(result.primaryBitmap).toBeDefined();
    expect(result.fields[2]).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('parses an echo message', () => {
    const parser = createParser();
    const msg = '0800822000000000000004000000000000000623085400000002301';
    const result = parser.parseMessage(msg);

    expect(result.isValid).toBe(true);
    expect(result.mti.value).toBe('0800');
    expect(result.mti.class).toBe('Network Management');
  });

  it('returns errors for empty input', () => {
    const parser = createParser();
    const result = parser.parseMessage('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
