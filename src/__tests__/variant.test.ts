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

  it('fromStr returns correct result', () => {
    const result1 = VariantUtil.fromStr("Argon2d");
    expect(result1.ok).toBe(true);
    if (result1.ok) expect(result1.value).toBe(Variant.Argon2d);

    const result2 = VariantUtil.fromStr("argon2i");
    expect(result2.ok).toBe(true);
    if (result2.ok) expect(result2.value).toBe(Variant.Argon2i);

    const result3 = VariantUtil.fromStr("foobar");
    expect(result3.ok).toBe(false);
    if (!result3.ok) expect(result3.error).toBe(ErrorType.DecodingFail);
  });

  it('fromU32 returns correct result', () => {
    const result1 = VariantUtil.fromU32(0);
    expect(result1.ok).toBe(true);
    if (result1.ok) expect(result1.value).toBe(Variant.Argon2d);

    const result2 = VariantUtil.fromU32(1);
    expect(result2.ok).toBe(true);
    if (result2.ok) expect(result2.value).toBe(Variant.Argon2i);

    const result3 = VariantUtil.fromU32(3);
    expect(result3.ok).toBe(false);
    if (!result3.ok) expect(result3.error).toBe(ErrorType.IncorrectType);
  });
});
