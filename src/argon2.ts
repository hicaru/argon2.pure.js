import { Config } from './config';
import { Context } from './context';
import * as core from './core';
import * as encoding from './encoding';
import { Memory } from './memory';
import { Result, Ok } from './result';
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

export function hashEncoded(pwd: Uint8Array, salt: Uint8Array, config: Config): Result<string> {
    const contextResult = Context.new(config, pwd, salt);
    if (!contextResult.ok) return contextResult;
    
    const context = contextResult.value;
    const hash = run(context);
    const encoded = encoding.encodeString(context, hash);
    
    return Ok(encoded);
}

export function hashRaw(pwd: Uint8Array, salt: Uint8Array, config: Config): Result<Uint8Array> {
    const contextResult = Context.new(config, pwd, salt);
    if (!contextResult.ok) return contextResult;
    
    const context = contextResult.value;
    const hash = run(context);
    
    return Ok(hash);
}

export function verifyEncoded(encoded: string, pwd: Uint8Array): Result<boolean> {
    return verifyEncodedExt(encoded, pwd, new Uint8Array(), new Uint8Array());
}

export function verifyEncodedExt(
    encoded: string, 
    pwd: Uint8Array, 
    secret: Uint8Array, 
    ad: Uint8Array
): Result<boolean> {
    const decodedResult = encoding.decodeString(encoded);
    if (!decodedResult.ok) return decodedResult;
    
    const decoded = decodedResult.value;
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
}

export function verifyRaw(
    pwd: Uint8Array, 
    salt: Uint8Array, 
    hash: Uint8Array, 
    config: Config
): Result<boolean> {
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
    
    const contextResult = Context.new(extConfig, pwd, salt);
    if (!contextResult.ok) return contextResult;
    
    const context = contextResult.value;
    const calculatedHash = run(context);
    
    return Ok(constantTimeEq(hash, calculatedHash));
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
