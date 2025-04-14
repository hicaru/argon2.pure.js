import { describe, it, expect } from 'vitest';
import { Config } from '../config';
import { Context } from '../context';
import { ErrorType } from '../error';
import { Variant } from '../variant';
import { Version } from '../version';

describe('Context', () => {
  it('new returns correct instance', () => {
    const config = new Config(
      new TextEncoder().encode("additionaldata"),
      32,
      4,
      4096,
      new TextEncoder().encode("secret"),
      3,
      Variant.Argon2i,
      Version.Version13
    );
    const pwd = new TextEncoder().encode("password");
    const salt = new TextEncoder().encode("somesalt");
    
    const context = Context.new(config, pwd, salt);
    
    expect(context.config).toEqual(config);
    expect(context.pwd).toEqual(pwd);
    expect(context.salt).toEqual(salt);
    expect(context.memoryBlocks).toBe(4096);
    expect(context.segmentLength).toBe(256);
    expect(context.laneLength).toBe(1024);
  });

  it('new with too little mem_cost returns correct error', () => {
    const config = new Config(
      new Uint8Array(),
      32,
      1,
      7, // too small
      new Uint8Array(),
      2,
      Variant.Argon2id,
      Version.Version13
    );
    
    try {
      Context.new(config, new Uint8Array(8), new Uint8Array(8));
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.MemoryTooLittle);
    }
  });

  it('new with less than 8 x lanes mem_cost returns correct error', () => {
    const config = new Config(
      new Uint8Array(),
      32,
      4, // 4 lanes
      31, // less than 8 * 4
      new Uint8Array(),
      2,
      Variant.Argon2id,
      Version.Version13
    );
    
    try {
      Context.new(config, new Uint8Array(8), new Uint8Array(8));
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.MemoryTooLittle);
    }
  });

  it('new with too small time_cost returns correct error', () => {
    const config = new Config(
      new Uint8Array(),
      32,
      1,
      4096,
      new Uint8Array(),
      0, // too small
      Variant.Argon2id,
      Version.Version13
    );
    
    try {
      Context.new(config, new Uint8Array(8), new Uint8Array(8));
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.TimeTooSmall);
    }
  });

  it('new with too short salt returns correct error', () => {
    const config = new Config();
    const salt = new Uint8Array(7); // too short
    
    try {
      Context.new(config, new Uint8Array(8), salt);
      expect.fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error.message).toBe(ErrorType.SaltTooShort);
    }
  });
});
