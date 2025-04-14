import { describe, it, expect } from 'vitest';
import { Variant, VariantUtil } from '../variant';
import { ErrorType } from '../error';

describe('Variant', () => {
  it('asLowercaseStr returns correct str', () => {
    expect(VariantUtil.asLowercaseStr(Variant.Argon2d)).toBe("argon2d");
    expect(VariantUtil.asLowercaseStr(Variant.Argon2i)).toBe("argon2i");
    expect(VariantUtil.asLowercaseStr(Variant.Argon2id)).toBe("argon2id");
  });

  it('asU32 returns correct u32', () => {
    expect(VariantUtil.asU32(Variant.Argon2d)).toBe(0);
    expect(VariantUtil.asU32(Variant.Argon2i)).toBe(1);
    expect(VariantUtil.asU32(Variant.Argon2id)).toBe(2);
  });

  it('asU64 returns correct u64', () => {
    expect(VariantUtil.asU64(Variant.Argon2d)).toBe(0);
    expect(VariantUtil.asU64(Variant.Argon2i)).toBe(1);
    expect(VariantUtil.asU64(Variant.Argon2id)).toBe(2);
  });

  it('asUppercaseStr returns correct str', () => {
    expect(VariantUtil.asUppercaseStr(Variant.Argon2d)).toBe("Argon2d");
    expect(VariantUtil.asUppercaseStr(Variant.Argon2i)).toBe("Argon2i");
    expect(VariantUtil.asUppercaseStr(Variant.Argon2id)).toBe("Argon2id");
  });

  it('fromStr returns correct variant', () => {
    expect(VariantUtil.fromStr("Argon2d")).toBe(Variant.Argon2d);
    expect(VariantUtil.fromStr("argon2i")).toBe(Variant.Argon2i);
    
    try {
      VariantUtil.fromStr("foobar");
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.DecodingFail);
    }
  });

  it('fromU32 returns correct variant', () => {
    expect(VariantUtil.fromU32(0)).toBe(Variant.Argon2d);
    expect(VariantUtil.fromU32(1)).toBe(Variant.Argon2i);
    
    try {
      VariantUtil.fromU32(3);
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.IncorrectType);
    }
  });
});
