import { Context } from './context';
import { Decoded } from './decoded';
import { ErrorType } from './error';
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

export function decodeString(encoded: string): Decoded {
    const items = encoded.split('$');
    
    if (items.length === 6) {
        decodeEmpty(items[0]);
        const variant = decodeVariant(items[1]);
        const version = decodeVersion(items[2]);
        const options = decodeOptions(items[3]);

        try {
            const salt = base64Decode(items[4]);
            const hash = base64Decode(items[5]);

            return new Decoded(
                variant,
                version,
                options.memCost,
                options.timeCost,
                options.parallelism,
                salt,
                hash
            );
        } catch {
            throw new Error(ErrorType.DecodingFail);
        }
    } else if (items.length === 5) {
        decodeEmpty(items[0]);
        const variant = decodeVariant(items[1]);
        const options = decodeOptions(items[2]);

        try {
            const salt = base64Decode(items[3]);
            const hash = base64Decode(items[4]);

            return new Decoded(
                variant,
                Version.Version10,
                options.memCost,
                options.timeCost,
                options.parallelism,
                salt,
                hash
            );
        } catch {
            throw new Error(ErrorType.DecodingFail);
        }
    } else {
        throw new Error(ErrorType.DecodingFail);
    }
}

function decodeEmpty(str: string): void {
    if (str === "") {
        return; 
    } else {
        throw new Error(ErrorType.DecodingFail);
    }
}

function decodeOptions(str: string): Options {
    const items = str.split(',');
    if (items.length === 3) {
        const memCost = decodeOption(items[0], "m");
        const timeCost = decodeOption(items[1], "t");
        const parallelism = decodeOption(items[2], "p");

        return {
            memCost,
            timeCost,
            parallelism
        };
    } else {
        throw new Error(ErrorType.DecodingFail);
    }
}

function decodeOption(str: string, name: string): number {
    const items = str.split('=');
    if (items.length === 2) {
        if (items[0] === name) {
            return decodeU32(items[1]);
        } else {
            throw new Error(ErrorType.DecodingFail);
        }
    } else {
        throw new Error(ErrorType.DecodingFail);
    }
}

function decodeU32(str: string): number {
    const num = parseInt(str, 10);
    if (isNaN(num)) {
        throw new Error(ErrorType.DecodingFail);
    }
    return num;
}

function decodeVariant(str: string): Variant {
    return VariantUtil.fromStr(str);
}

function decodeVersion(str: string): Version {
    const items = str.split('=');
    if (items.length === 2) {
        if (items[0] === "v") {
            return VersionUtil.fromStr(items[1]);
        } else {
            throw new Error(ErrorType.DecodingFail);
        }
    } else {
        throw new Error(ErrorType.DecodingFail);
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
