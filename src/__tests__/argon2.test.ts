import { describe, it, expect } from 'vitest';
import { 
    Config, 
    Variant, 
    Version, 
    hashRaw, 
    hashEncoded, 
    verifyEncoded, 
    encodedLen, 
    ErrorType 
} from '../index';

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hash_test(
    variant: Variant,
    version: Version,
    t: number,
    m: number,
    p: number,
    pwd: Uint8Array,
    salt: Uint8Array,
    hex: string,
    enc: string,
) {
    const config = new Config(
        new Uint8Array(),
        32,
        p,
        m,
        new Uint8Array(),
        t,
        variant,
        version
    );
    
    const hash = hashRaw(pwd, salt, config);
    expect(bytesToHex(hash)).toBe(hex);
    
    const encoded = hashEncoded(pwd, salt, config);
    expect(encoded).toBe(enc);
    
    const result = verifyEncoded(encoded, pwd);
    expect(result).toBe(true);
    
    const result2 = verifyEncoded(enc, pwd);
    expect(result2).toBe(true);
}

describe('Argon2d', () => {
    it('version10 4', () => {
        hash_test(
            Variant.Argon2d,
            Version.Version10,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "bd404868ff00c52e7543c8332e6a772a5724892d7e328d5cf253bbc8e726b371",
            "$argon2d$m=256,t=2,p=1$c29tZXNhbHQ$vUBIaP8AxS51Q8gzLmp3KlckiS1+Mo1c8lO7yOcms3E",
        );
    });
    
    it('version10 5', () => {
        hash_test(
            Variant.Argon2d,
            Version.Version10,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "6a91d02b9f8854ba0841f04aa6e53c1d3374c0a0c646b8e431b03de805b91ec3",
            "$argon2d$m=256,t=2,p=2$c29tZXNhbHQ$apHQK5+IVLoIQfBKpuU8HTN0wKDGRrjkMbA96AW5HsM",
        );
    });
    
    it('version13 4', () => {
        hash_test(
            Variant.Argon2d,
            Version.Version13,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "25c4ee8ba448054b49efc804e478b9d823be1f9bd2e99f51d6ec4007a3a1501f",
            "$argon2d$v=19$m=256,t=2,p=1$c29tZXNhbHQ$JcTui6RIBUtJ78gE5Hi52CO+H5vS6Z9R1uxAB6OhUB8",
        );
    });
    
    it('version13 5', () => {
        hash_test(
            Variant.Argon2d,
            Version.Version13,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "7b69c92d7c3889aad1281dbc8baefc12cc37c80f1c75e33ef2c2d40c28ebc573",
            "$argon2d$v=19$m=256,t=2,p=2$c29tZXNhbHQ$e2nJLXw4iarRKB28i678Esw3yA8cdeM+8sLUDCjrxXM",
        );
    });
});

describe('Argon2i', () => {
    it('version10 4', () => {
        hash_test(
            Variant.Argon2i,
            Version.Version10,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "fd4dd83d762c49bdeaf57c47bdcd0c2f1babf863fdeb490df63ede9975fccf06",
            "$argon2i$m=256,t=2,p=1$c29tZXNhbHQ$/U3YPXYsSb3q9XxHvc0MLxur+GP960kN9j7emXX8zwY",
        );
    });
    
    it('version10 5', () => {
        hash_test(
            Variant.Argon2i,
            Version.Version10,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "b6c11560a6a9d61eac706b79a2f97d68b4463aa3ad87e00c07e2b01e90c564fb",
            "$argon2i$m=256,t=2,p=2$c29tZXNhbHQ$tsEVYKap1h6scGt5ovl9aLRGOqOth+AMB+KwHpDFZPs",
        );
    });
    
    it('version13 4', () => {
        hash_test(
            Variant.Argon2i,
            Version.Version13,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "89e9029f4637b295beb027056a7336c414fadd43f6b208645281cb214a56452f",
            "$argon2i$v=19$m=256,t=2,p=1$c29tZXNhbHQ$iekCn0Y3spW+sCcFanM2xBT63UP2sghkUoHLIUpWRS8",
        );
    });
    
    it('version13 5', () => {
        hash_test(
            Variant.Argon2i,
            Version.Version13,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "4ff5ce2769a1d7f4c8a491df09d41a9fbe90e5eb02155a13e4c01e20cd4eab61",
            "$argon2i$v=19$m=256,t=2,p=2$c29tZXNhbHQ$T/XOJ2mh1/TIpJHfCdQan76Q5esCFVoT5MAeIM1Oq2E",
        );
    });
});

describe('Argon2id', () => {
    it('version10 4', () => {
        hash_test(
            Variant.Argon2id,
            Version.Version10,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "da070e576e50f2f38a3c897cbddc6c7fb4028e870971ff9eae7b4e1879295e6e",
            "$argon2id$v=16$m=256,t=2,p=1$c29tZXNhbHQ$2gcOV25Q8vOKPIl8vdxsf7QCjocJcf+erntOGHkpXm4",
        );
    });
    
    it('version10 5', () => {
        hash_test(
            Variant.Argon2id,
            Version.Version10,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "f8aabb5315c63cddcdb3b4a021550928e525699da8fcbd1c2b0b1ccd35cc87a7",
            "$argon2id$v=16$m=256,t=2,p=2$c29tZXNhbHQ$+Kq7UxXGPN3Ns7SgIVUJKOUlaZ2o/L0cKwsczTXMh6c",
        );
    });
    
    it('version13 4', () => {
        hash_test(
            Variant.Argon2id,
            Version.Version13,
            2,
            256,
            1,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "9dfeb910e80bad0311fee20f9c0e2b12c17987b4cac90c2ef54d5b3021c68bfe",
            "$argon2id$v=19$m=256,t=2,p=1$c29tZXNhbHQ$nf65EOgLrQMR/uIPnA4rEsF5h7TKyQwu9U1bMCHGi/4",
        );
    });
    
    it('version13 5', () => {
        hash_test(
            Variant.Argon2id,
            Version.Version13,
            2,
            256,
            2,
            new TextEncoder().encode("password"),
            new TextEncoder().encode("somesalt"),
            "6d093c501fd5999645e0ea3bf620d7b8be7fd2db59c20d9fff9539da2bf57037",
            "$argon2id$v=19$m=256,t=2,p=2$c29tZXNhbHQ$bQk8UB/VmZZF4Oo79iDXuL5/0ttZwg2f/5U52iv1cDc",
        );
    });
});

describe('Error handling', () => {
    it('verify_encoded with missing dollar before salt version10', () => {
        const encoded = "$argon2i$m=65536,t=2,p=1c29tZXNhbHQ$9sTbSlTio3Biev89thdrlKKiCaYsjjYVJxGAL3swxpQ";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.DecodingFail);
        }
    });
    
    it('verify_encoded with missing dollar before salt version13', () => {
        const encoded = "$argon2i$v=19$m=65536,t=2,p=1c29tZXNhbHQ$wWKIMhR9lyDFvRz9YTZweHKfbftvj+qf+YFY4NeBbtA";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.DecodingFail);
        }
    });
    
    it('verify_encoded with missing dollar before hash version10', () => {
        const encoded = "$argon2i$m=65536,t=2,p=1$c29tZXNhbHQ9sTbSlTio3Biev89thdrlKKiCaYsjjYVJxGAL3swxpQ";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.DecodingFail);
        }
    });
    
    it('verify_encoded with missing dollar before hash version13', () => {
        const encoded = "$argon2i$v=19$m=65536,t=2,p=1$c29tZXNhbHQwWKIMhR9lyDFvRz9YTZweHKfbftvj+qf+YFY4NeBbtA";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.DecodingFail);
        }
    });
    
    it('verify_encoded with too short salt version10', () => {
        const encoded = "$argon2i$m=65536,t=2,p=1$$9sTbSlTio3Biev89thdrlKKiCaYsjjYVJxGAL3swxpQ";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.SaltTooShort);
        }
    });
    
    it('verify_encoded with too short salt version13', () => {
        const encoded = "$argon2i$v=19$m=65536,t=2,p=1$$9sTbSlTio3Biev89thdrlKKiCaYsjjYVJxGAL3swxpQ";
        const password = new TextEncoder().encode("password");
        try {
            verifyEncoded(encoded, password);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.SaltTooShort);
        }
    });
    
    it('verify_encoded with wrong password version10', () => {
        const encoded = "$argon2i$m=65536,t=2,p=1$c29tZXNhbHQ$b2G3seW+uPzerwQQC+/E1K50CLLO7YXy0JRcaTuswRo";
        const password = new TextEncoder().encode("password"); // should be "passwore"
        const result = verifyEncoded(encoded, password);
        expect(result).toBe(false);
    });
    
    it('verify_encoded with wrong password version13', () => {
        const encoded = "$argon2i$v=19$m=65536,t=2,p=1$c29tZXNhbHQ$8iIuixkI73Js3G1uMbezQXD0b8LG4SXGsOwoQkdAQIM";
        const password = new TextEncoder().encode("password"); // should be "passwore"
        const result = verifyEncoded(encoded, password);
        expect(result).toBe(false);
    });
});

describe('Utility functions', () => {
    it('encoded_len returns correct length', () => {
        expect(encodedLen(Variant.Argon2d, 256, 1, 1, 8, 32)).toBe(83);
        expect(encodedLen(Variant.Argon2i, 4096, 10, 10, 8, 32)).toBe(86);
        expect(encodedLen(Variant.Argon2id, 65536, 100, 10, 8, 32)).toBe(89);
    });
    
    it('hash_raw with not enough memory', () => {
        const pwd = new TextEncoder().encode("password");
        const salt = new TextEncoder().encode("diffsalt");
        const config = new Config(
            new Uint8Array(),
            32,
            1,
            2,
            new Uint8Array(),
            2,
            Variant.Argon2i,
            Version.Version13
        );
        try {
            hashRaw(pwd, salt, config);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.MemoryTooLittle);
        }
    });
    
    it('hash_raw with too short salt', () => {
        const pwd = new TextEncoder().encode("password");
        const salt = new TextEncoder().encode("s");
        const config = new Config(
            new Uint8Array(),
            32,
            1,
            2048,
            new Uint8Array(),
            2,
            Variant.Argon2i,
            Version.Version13
        );
        try {
            hashRaw(pwd, salt, config);
            expect.fail('Expected error was not thrown');
        } catch (error: any) {
            expect(error.message).toBe(ErrorType.SaltTooShort);
        }
    });
});
