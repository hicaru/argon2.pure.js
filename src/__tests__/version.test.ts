import { describe, it, expect } from 'vitest';
import { Version, VersionUtil } from '../version';
import { ErrorType } from '../error';

describe('Version', () => {
  it('asU32 returns correct u32', () => {
    expect(VersionUtil.asU32(Version.Version10)).toBe(0x10);
    expect(VersionUtil.asU32(Version.Version13)).toBe(0x13);
  });

  it('fromStr returns correct result', () => {
    const result1 = VersionUtil.fromStr("16");
    expect(result1.ok).toBe(true);
    if (result1.ok) expect(result1.value).toBe(Version.Version10);

    const result2 = VersionUtil.fromStr("19");
    expect(result2.ok).toBe(true);
    if (result2.ok) expect(result2.value).toBe(Version.Version13);

    const result3 = VersionUtil.fromStr("11");
    expect(result3.ok).toBe(false);
    if (!result3.ok) expect(result3.error).toBe(ErrorType.DecodingFail);
  });

  it('fromU32 returns correct result', () => {
    const result1 = VersionUtil.fromU32(0x10);
    expect(result1.ok).toBe(true);
    if (result1.ok) expect(result1.value).toBe(Version.Version10);

    const result2 = VersionUtil.fromU32(0x13);
    expect(result2.ok).toBe(true);
    if (result2.ok) expect(result2.value).toBe(Version.Version13);

    const result3 = VersionUtil.fromU32(0);
    expect(result3.ok).toBe(false);
    if (!result3.ok) expect(result3.error).toBe(ErrorType.IncorrectVersion);
  });
});
