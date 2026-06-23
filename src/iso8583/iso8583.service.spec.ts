import { Test, TestingModule } from '@nestjs/testing';
import { Iso8583Service } from './iso8583.service';

describe('Iso8583Service', () => {
  let service: Iso8583Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Iso8583Service],
    }).compile();

    service = module.get<Iso8583Service>(Iso8583Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseMessage', () => {
    it('should parse a standard 0200 Purchase Request successfully', () => {
      // 0200 Purchase Request with primary bitmap and fields 2, 3, 4, 7, 11, 32, 37, 41, 42, 49
      const rawMessage =
        '02007210000108C0800016123456789012345600000000000001500006230854000000010806432109123456789012TERM0001MERCHANT1234567840';
      const result = service.parseMessage(rawMessage);

      expect(result.isValid).toBe(true);
      expect(result.mti.value).toBe('0200');
      expect(result.mti.version).toBe('ISO 8583:1987');
      expect(result.mti.class).toBe('Financial');
      expect(result.mti.function).toBe('Request');
      expect(result.mti.originator).toBe('Acquirer');

      expect(result.primaryBitmap.hex).toBe('7210000108C08000');
      expect(result.secondaryBitmap).toBeUndefined();

      // Check fields
      expect(result.fields[2]).toEqual({
        fieldNumber: 2,
        name: 'Primary Account Number (PAN)',
        type: 'llvar',
        length: 16,
        format: 'n',
        rawValue: '1234567890123456',
      });

      expect(result.fields[3]).toEqual({
        fieldNumber: 3,
        name: 'Processing Code',
        type: 'fixed',
        length: 6,
        format: 'n',
        rawValue: '000000',
      });

      expect(result.fields[4]).toEqual({
        fieldNumber: 4,
        name: 'Amount, Transaction',
        type: 'fixed',
        length: 12,
        format: 'n',
        rawValue: '000000015000',
      });

      expect(result.fields[41]).toEqual({
        fieldNumber: 41,
        name: 'Card Acceptor Terminal Identification',
        type: 'fixed',
        length: 8,
        format: 'ans',
        rawValue: 'TERM0001',
      });

      expect(result.fields[49]).toEqual({
        fieldNumber: 49,
        name: 'Currency Code, Transaction',
        type: 'fixed',
        length: 3,
        format: 'an',
        rawValue: '840',
      });
    });

    it('should parse an 0800 Network Management message with Secondary Bitmap', () => {
      // 0800 with primary and secondary bitmap and fields 7, 11, 70
      const rawMessage =
        '0800822000000000000004000000000000000623085400000002301';
      const result = service.parseMessage(rawMessage);

      expect(result.isValid).toBe(true);
      expect(result.mti.value).toBe('0800');
      expect(result.mti.version).toBe('ISO 8583:1987');
      expect(result.mti.class).toBe('Network Management');

      expect(result.primaryBitmap.hex).toBe('8220000000000000');
      expect(result.secondaryBitmap).toBeDefined();
      expect(result.secondaryBitmap?.hex).toBe('0400000000000000');

      expect(result.fields[7]).toBeDefined();
      expect(result.fields[11]).toBeDefined();
      expect(result.fields[70]).toEqual({
        fieldNumber: 70,
        name: 'Network Management Information Code',
        type: 'fixed',
        length: 3,
        format: 'n',
        rawValue: '301',
      });
    });

    it('should auto-detect and decode Hex-encoded ISO messages', () => {
      // Hex representation of '0800822000000000000004000000000000000623085400000002301'
      // 0800 -> 30383030
      // 8220... -> 38323230...
      const rawAscii =
        '0800822000000000000004000000000000000623085400000002301';
      const hexEncoded = Buffer.from(rawAscii).toString('hex');

      const result = service.parseMessage(hexEncoded);

      expect(result.isValid).toBe(true);
      expect(result.inputFormat).toBe('hex_decoded');
      expect(result.mti.value).toBe('0800');
      expect(result.fields[70].rawValue).toBe('301');
    });

    it('should report warnings for truncated messages', () => {
      const truncatedMessage = '02007210000108C080001612345'; // PAN truncated
      const result = service.parseMessage(truncatedMessage);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Truncated LLVAR field 2');
    });

    it('should parse messages with custom prefixes/transport headers', () => {
      const msgWithPrefix =
        'SEND394*0200F23EC081BAE0F000000000420600008116922595987216956750999900000004640012051349369980731349361205300800001205541116069920020992259598735000000000000000000000000000000000000007VVcgNwzm8sW0020025638000009920010001ENZONA XETID             LA HABANA    CU840000840000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016030000000519683200002013A07B338';
      const result = service.parseMessage(msgWithPrefix);

      expect(result.mti.value).toBe('0200');
      expect(result.header).toBe('SEND394*');
      expect(result.primaryBitmap.hex).toBe('F23EC081BAE0F000');
      expect(result.secondaryBitmap?.hex).toBe('0000004206000081');

      // MAC field 128 should parse correctly with 8-char length
      expect(result.fields[128]).toEqual({
        fieldNumber: 128,
        name: 'Message Authentication Code (MAC)',
        type: 'fixed',
        length: 8,
        format: 'b',
        rawValue: '3A07B338',
      });

      // PAN field 2 should parse correctly
      expect(result.fields[2].rawValue).toBe('9225959872169567');

      // Field 43 name/location should preserve internal spaces
      expect(result.fields[43].rawValue).toBe(
        'ENZONA XETID             LA HABANA    CU',
      );

      expect(result.isValid).toBe(true);
    });
  });
});
