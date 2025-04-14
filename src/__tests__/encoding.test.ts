import { describe, it, expect } from 'vitest';
import { encodeString } from '../encoding';
import { Config } from '../config';
import { Context } from '../context';
import { Variant } from '../variant';
import { Version } from '../version';

describe('Encoding', () => {
  it('encodeString returns correct string', () => {
    const hash = new TextEncoder().encode("12345678901234567890123456789012");
    const config = new Config(
      new Uint8Array(),
      hash.length,
      1,
      4096,
      new Uint8Array(),
      3,
      Variant.Argon2i,
      Version.Version13
    );
    
    const pwd = new TextEncoder().encode("password");
    const salt = new TextEncoder().encode("salt1234");
    
    const contextResult = Context.new(config, pwd, salt);
    expect(contextResult.ok).toBe(true);
    
    if (contextResult.ok) {
      const context = contextResult.value;
      const expected = "$argon2i$v=19$m=4096,t=3,p=1$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";
      const actual = encodeString(context, hash);
      expect(actual).toBe(expected);
    }
  });
  
  it('encodeString with Argon2d returns correct string', () => {
    const hash = new TextEncoder().encode("12345678901234567890123456789012");
    const config = new Config(
      new Uint8Array(),
      hash.length,
      1,
      8192,
      new Uint8Array(),
      2,
      Variant.Argon2d,
      Version.Version13
    );
    
    const pwd = new TextEncoder().encode("different-password");
    const salt = new TextEncoder().encode("othersalt");
    
    const contextResult = Context.new(config, pwd, salt);
    expect(contextResult.ok).toBe(true);
    
    if (contextResult.ok) {
      const context = contextResult.value;
      const expected = "$argon2d$v=19$m=8192,t=2,p=1$b3RoZXJzYWx0$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";
      const actual = encodeString(context, hash);
      expect(actual).toBe(expected);
    }
  });
  
  it('encodeString with Argon2id returns correct string', () => {
    const hash = new TextEncoder().encode("abcdefghijklmnopqrstuvwxyz123456");
    const config = new Config(
      new Uint8Array(),
      hash.length,
      4,
      16384,
      new Uint8Array(),
      5,
      Variant.Argon2id,
      Version.Version13
    );
    
    const pwd = new TextEncoder().encode("third-password");
    const salt = new TextEncoder().encode("thirdsalt");
    
    const contextResult = Context.new(config, pwd, salt);
    expect(contextResult.ok).toBe(true);
    
    if (contextResult.ok) {
      const context = contextResult.value;
      const expected = "$argon2id$v=19$m=16384,t=5,p=4$dGhpcmRzYWx0$YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY";
      const actual = encodeString(context, hash);
      expect(actual).toBe(expected);
    }
  });
});
