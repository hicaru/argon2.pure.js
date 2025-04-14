import { describe, it, expect } from 'vitest';
import { decodeString, base64Len, numLen } from '../encoding';
import { Variant } from '../variant';
import { Version } from '../version';

describe('Encoding', () => {
  it('base64Len returns correct length', () => {
    const tests = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 6],
      [5, 7],
      [6, 8],
      [7, 10],
      [8, 11],
      [9, 12],
      [10, 14],
    ];
    
    for (const [len, expected] of tests) {
      const actual = base64Len(len);
      expect(actual).toBe(expected);
    }
  });

  it('numLen returns correct length', () => {
    const tests = [
      [1, 1],
      [10, 2],
      [110, 3],
      [1230, 4],
      [12340, 5],
      [123457, 6],
    ];
    
    for (const [num, expected] of tests) {
      const actual = numLen(num);
      expect(actual).toBe(expected);
    }
  });

  it('decodeString with version13 returns correct result', () => {
    const encoded = "$argon2i$v=19$m=4096,t=3,p=1$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";
    const result = decodeString(encoded);
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      const decoded = result.value;
      expect(decoded.variant).toBe(Variant.Argon2i);
      expect(decoded.version).toBe(Version.Version13);
      expect(decoded.memCost).toBe(4096);
      expect(decoded.timeCost).toBe(3);
      expect(decoded.parallelism).toBe(1);
      expect(new TextDecoder().decode(decoded.salt)).toBe("salt1234");
      expect(new TextDecoder().decode(decoded.hash)).toBe("12345678901234567890123456789012");
    }
  });
});
