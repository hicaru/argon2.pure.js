import { describe, it, expect } from 'vitest';
import { Version, VersionUtil } from '../version';
import { ErrorType } from '../error';

describe('Version', () => {
  it('asU32 returns correct u32', () => {
    expect(VersionUtil.asU32(Version.Version10)).toBe(0x10);
    expect(VersionUtil.asU32(Version.Version13)).toBe(0x13);
  });

  it('fromStr returns correct version', () => {
    expect(VersionUtil.fromStr("16")).toBe(Version.Version10);
    expect(VersionUtil.fromStr("19")).toBe(Version.Version13);
    
    try {
      VersionUtil.fromStr("11");
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.DecodingFail);
    }
  });

  it('fromU32 returns correct version', () => {
    expect(VersionUtil.fromU32(0x10)).toBe(Version.Version10);
    expect(VersionUtil.fromU32(0x13)).toBe(Version.Version13);
    
    try {
      VersionUtil.fromU32(0);
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.IncorrectVersion);
    }
  });
});
