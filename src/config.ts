import { Variant } from './variant';
import { Version } from './version';

export class Config {
    constructor(
        public ad: Uint8Array = new Uint8Array(),
        public hashLength: number = 32,
        public lanes: number = 1,
        public memCost: number = 19 * 1024,
        public secret: Uint8Array = new Uint8Array(),
        public timeCost: number = 2,
        public variant: Variant = Variant.Argon2id,
        public version: Version = Version.Version13
    ) {}

    static original(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            4096,
            new Uint8Array(),
            3,
            Variant.Argon2i,
            Version.Version13
        );
    }

    static owasp1(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            47104,
            new Uint8Array(),
            1,
            Variant.Argon2id,
            Version.Version13
        );
    }

    static owasp2(): Config {
        return new Config();
    }

    static owasp3(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            12288,
            new Uint8Array(),
            3,
            Variant.Argon2id,
            Version.Version13
        );
    }

    static owasp4(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            9216,
            new Uint8Array(),
            4,
            Variant.Argon2id,
            Version.Version13
        );
    }

    static owasp5(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            7168,
            new Uint8Array(),
            5,
            Variant.Argon2id,
            Version.Version13
        );
    }

    static rfc9106(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            2097152,
            new Uint8Array(),
            1,
            Variant.Argon2id,
            Version.Version13
        );
    }

    static rfc9106LowMem(): Config {
        return new Config(
            new Uint8Array(),
            32,
            1,
            65536,
            new Uint8Array(),
            3,
            Variant.Argon2id,
            Version.Version13
        );
    }

    clone(): Config {
        return new Config(
            new Uint8Array(this.ad),
            this.hashLength,
            this.lanes,
            this.memCost,
            new Uint8Array(this.secret),
            this.timeCost,
            this.variant,
            this.version
        );
    }
}
