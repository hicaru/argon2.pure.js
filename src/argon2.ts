import { Config } from './config';
import { Context } from './context';
import * as core from './core';
import * as encoding from './encoding';
import { Memory } from './memory';
import { Variant, VariantUtil } from './variant';
import { Version } from './version';

export function encodedLen(
    variant: Variant,
    memCost: number,
    timeCost: number,
    parallelism: number,
    saltLen: number,
    hashLen: number
): number {
    return ("$$v=$m=,t=,p=$$".length) +
           (VariantUtil.asLowercaseStr(variant).length) +
           encoding.numLen(Version.Version13) +
           encoding.numLen(memCost) +
           encoding.numLen(timeCost) +
           encoding.numLen(parallelism) +
           encoding.base64Len(saltLen) +
           encoding.base64Len(hashLen);
}

export function hashEncoded(pwd: Uint8Array, salt: Uint8Array, config: Config): string {
  const context = Context.new(config, pwd, salt);
  const hash = run(context);
  return encoding.encodeString(context, hash);
}

export function hashRaw(pwd: Uint8Array, salt: Uint8Array, config: Config): Uint8Array {
  const context = Context.new(config, pwd, salt);
  return run(context);
}

export function verifyEncoded(encoded: string, pwd: Uint8Array): boolean {
  return verifyEncodedExt(encoded, pwd, new Uint8Array(), new Uint8Array());
}

export function verifyEncodedExt(
  encoded: string, 
  pwd: Uint8Array, 
  secret: Uint8Array, 
  ad: Uint8Array
): boolean {
  try {
    const decoded = encoding.decodeString(encoded);
    const config = new Config(
      ad,
      decoded.hash.length,
      decoded.parallelism,
      decoded.memCost,
      secret,
      decoded.timeCost,
      decoded.variant,
      decoded.version
    );

    return verifyRaw(pwd, decoded.salt, decoded.hash, config);
  } catch (e) {
    return false;
  }
}

export function verifyRaw(
  pwd: Uint8Array, 
  salt: Uint8Array, 
  hash: Uint8Array, 
  config: Config
): boolean {
  try {
    const extConfig = new Config(
      config.ad,
      hash.length,
      config.lanes,
      config.memCost,
      config.secret,
      config.timeCost,
      config.variant,
      config.version
    );
    const context = Context.new(extConfig, pwd, salt);
    const calculatedHash = run(context);
    
    return constantTimeEq(hash, calculatedHash);
  } catch (e) {
    return false;
  }
}

function run(context: Context): Uint8Array {
    const memory = new Memory(context.config.lanes, context.laneLength);
    core.initialize(context, memory);
    core.fillMemoryBlocks(context, memory);
    return core.finalize(context, memory);
}

function constantTimeEq(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    
    return result === 0;
}
