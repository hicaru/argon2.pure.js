import { Context } from './context';
import { Decoded } from './decoded';
import { ErrorType } from './error';
import { Result, Ok, Err } from './result';
import { Variant, VariantUtil } from './variant';
import { Version, VersionUtil } from './version';

interface Options {
    memCost: number;
    timeCost: number;
    parallelism: number;
}

export function base64Len(length: number): number {
    const olen = Math.floor(length / 3) << 2;
    switch (length % 3) {
        case 2: return olen + 3;
        case 1: return olen + 2;
        default: return olen;
    }
}

export function decodeString(encoded: string): Result<Decoded> {
    const items = encoded.split('$');
    
    if (items.length === 6) {
        const emptyResult = decodeEmpty(items[0]);
        if (!emptyResult.ok) return emptyResult;

        const variantResult = decodeVariant(items[1]);
        if (!variantResult.ok) return variantResult;
        const variant = variantResult.value;

        const versionResult = decodeVersion(items[2]);
        if (!versionResult.ok) return versionResult;
        const version = versionResult.value;

        const optionsResult = decodeOptions(items[3]);
        if (!optionsResult.ok) return optionsResult;
        const options = optionsResult.value;

        try {
            const salt = base64Decode(items[4]);
            const hash = base64Decode(items[5]);

            return Ok(new Decoded(
                variant,
                version,
                options.memCost,
                options.timeCost,
                options.parallelism,
                salt,
                hash
            ));
        } catch {
            return Err(ErrorType.DecodingFail);
        }
    } else if (items.length === 5) {
        const emptyResult = decodeEmpty(items[0]);
        if (!emptyResult.ok) return emptyResult;

        const variantResult = decodeVariant(items[1]);
        if (!variantResult.ok) return variantResult;
        const variant = variantResult.value;

        const optionsResult = decodeOptions(items[2]);
        if (!optionsResult.ok) return optionsResult;
        const options = optionsResult.value;

        try {
            const salt = base64Decode(items[3]);
            const hash = base64Decode(items[4]);

            return Ok(new Decoded(
                variant,
                Version.Version10,
                options.memCost,
                options.timeCost,
                options.parallelism,
                salt,
                hash
            ));
        } catch {
            return Err(ErrorType.DecodingFail);
        }
    } else {
        return Err(ErrorType.DecodingFail);
    }
}

function decodeEmpty(str: string): Result<void> {
    if (str === "") {
        return Ok(undefined);
    } else {
        return Err(ErrorType.DecodingFail);
    }
}

function decodeOptions(str: string): Result<Options> {
    const items = str.split(',');
    if (items.length === 3) {
        const memResult = decodeOption(items[0], "m");
        if (!memResult.ok) return memResult;
        
        const timeResult = decodeOption(items[1], "t");
        if (!timeResult.ok) return timeResult;
        
        const parallelismResult = decodeOption(items[2], "p");
        if (!parallelismResult.ok) return parallelismResult;

        return Ok({
            memCost: memResult.value,
            timeCost: timeResult.value,
            parallelism: parallelismResult.value
        });
    } else {
        return Err(ErrorType.DecodingFail);
    }
}

function decodeOption(str: string, name: string): Result<number> {
    const items = str.split('=');
    if (items.length === 2) {
        if (items[0] === name) {
            return decodeU32(items[1]);
        } else {
            return Err(ErrorType.DecodingFail);
        }
    } else {
        return Err(ErrorType.DecodingFail);
    }
}

function decodeU32(str: string): Result<number> {
    const num = parseInt(str, 10);
    if (isNaN(num)) {
        return Err(ErrorType.DecodingFail);
    }
    return Ok(num);
}

function decodeVariant(str: string): Result<Variant> {
    return VariantUtil.fromStr(str);
}

function decodeVersion(str: string): Result<Version> {
    const items = str.split('=');
    if (items.length === 2) {
        if (items[0] === "v") {
            return VersionUtil.fromStr(items[1]);
        } else {
            return Err(ErrorType.DecodingFail);
        }
    } else {
        return Err(ErrorType.DecodingFail);
    }
}

export function encodeString(context: Context, hash: Uint8Array): string {
    return `$${VariantUtil.asLowercaseStr(context.config.variant)}$v=${context.config.version}$m=${context.config.memCost},t=${context.config.timeCost},p=${context.config.lanes}$${base64Encode(context.salt)}$${base64Encode(hash)}`;
}

export function numLen(number: number): number {
    let len = 1;
    let num = number;
    while (num >= 10) {
        len += 1;
        num = Math.floor(num / 10);
    }
    return len;
}


function base64Encode(data: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, [...data]))
        .replace(/=+$/, '');
}

function base64Decode(str: string): Uint8Array {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
