# @hicaru/argon2-pure.js

A pure TypeScript/JavaScript implementation of the [Argon2](https://github.com/P-H-C/phc-winner-argon2) password hashing algorithm. This implementation provides full support for Argon2d, Argon2i, and Argon2id variants with no native code dependencies.

[![NPM package](https://img.shields.io/npm/v/@hicaru/argon2-pure.js.svg)](https://www.npmjs.com/package/@hicaru/argon2-pure.js)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- 100% pure TypeScript/JavaScript implementation, no native code dependencies
- Works in all JavaScript environments (browser, Node.js, etc.)
- Full support for all Argon2 variants:
  - Argon2d (data-dependent hashing, faster but potentially vulnerable to side-channel attacks)
  - Argon2i (data-independent hashing, resistant to side-channel attacks)
  - Argon2id (hybrid mode, combines security benefits of both)
- Support for both Argon2 versions:
  - Version 1.0 (0x10)
  - Version 1.3 (0x13, the latest version)
- Complies with the [RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106) specification

## Installation

```bash
npm install @hicaru/argon2-pure.js
```

## Usage

### Basic Usage

```typescript
import { 
  hashEncoded, 
  verifyEncoded, 
  Config, 
  Variant 
} from '@hicaru/argon2-pure.js';

// Create a hash with default parameters (Argon2id)
const password = new TextEncoder().encode("mySecurePassword");
const salt = new TextEncoder().encode("somesalt");  // In practice, generate a random salt
const hash = hashEncoded(password, salt, new Config());

console.log(hash);
// $argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$...

// Verify a password against a hash
const isValid = verifyEncoded(hash, password);
console.log(isValid); // true
```

### Advanced Usage

```typescript
import { 
  hashRaw, 
  hashEncoded, 
  verifyEncoded, 
  Config, 
  Variant, 
  Version 
} from '@hicaru/argon2-pure.js';

// Configure custom parameters
const config = new Config(
  new Uint8Array(),  // Additional data (optional)
  32,                // Hash length in bytes
  4,                 // Parallelism (lanes)
  4096,              // Memory cost (KB)
  new Uint8Array(),  // Secret key (optional)
  3,                 // Time cost (iterations)
  Variant.Argon2i,   // Algorithm variant
  Version.Version13  // Version 1.3
);

const password = new TextEncoder().encode("password");
const salt = new TextEncoder().encode("somesalt");

// Get raw hash bytes
const rawHash = hashRaw(password, salt, config);

// Get encoded hash string
const encodedHash = hashEncoded(password, salt, config);
console.log(encodedHash);
// $argon2i$v=19$m=4096,t=3,p=4$c29tZXNhbHQ$...

// Verify password against encoded hash
const isValid = verifyEncoded(encodedHash, password);
console.log(isValid); // true
```

### Predefined Configurations

The library provides several predefined configurations:

```typescript
import { Config } from '@hicaru/argon2-pure.js';

// Original Argon2 paper configuration
const originalConfig = Config.original();

// OWASP recommended configurations
const owasp1Config = Config.owasp1();
const owasp2Config = Config.owasp2();

// RFC 9106 recommended configuration
const rfcConfig = Config.rfc9106();
const rfcLowMemConfig = Config.rfc9106LowMem();
```

## Configuration Options

The `Config` class accepts these parameters:

| Parameter  | Type       | Default    | Description |
|------------|------------|------------|-------------|
| ad         | Uint8Array | Empty      | Associated data for additional security |
| hashLength | number     | 32         | Length of the hash output in bytes |
| lanes      | number     | 1          | Number of parallel lanes (threads) |
| memCost    | number     | 19456      | Memory usage in KB (minimum 8×lanes KB) |
| secret     | Uint8Array | Empty      | Optional secret value for keyed hashing |
| timeCost   | number     | 2          | Number of iterations |
| variant    | Variant    | Argon2id   | Algorithm variant (Argon2d, Argon2i, or Argon2id) |
| version    | Version    | Version13  | Algorithm version (Version10 or Version13) |

## Predefined Configurations

| Configuration      | Variant   | Memory   | Time | Parallelism | Description |
|--------------------|-----------|----------|------|-------------|-------------|
| `Config.original()`| Argon2i   | 4096 KB  | 3    | 1           | Original parameters from the Argon2 paper |
| `Config.owasp1()`  | Argon2id  | 47104 KB | 1    | 1           | OWASP recommended for high security |
| `Config.owasp2()`  | Argon2id  | 19456 KB | 2    | 1           | Default configuration, OWASP moderate security |
| `Config.rfc9106()` | Argon2id  | 2048 MB  | 1    | 1           | RFC 9106 standard recommendation |
| `Config.rfc9106LowMem()` | Argon2id | 64 MB | 3 | 1        | RFC 9106 low-memory recommendation |

## API Reference

### Core Functions

#### `hashRaw(pwd: Uint8Array, salt: Uint8Array, config: Config): Uint8Array`

Generates a raw hash output for the given password, salt, and configuration.

#### `hashEncoded(pwd: Uint8Array, salt: Uint8Array, config: Config): string`

Generates an encoded hash string (PHC format) for the given password, salt, and configuration.

#### `verifyEncoded(encoded: string, pwd: Uint8Array): boolean`

Verifies if the password matches the encoded hash.

#### `verifyEncodedExt(encoded: string, pwd: Uint8Array, secret: Uint8Array, ad: Uint8Array): boolean`

Verifies if the password matches the encoded hash, with additional secret key and associated data.

#### `verifyRaw(pwd: Uint8Array, salt: Uint8Array, hash: Uint8Array, config: Config): boolean`

Verifies if the password matches the raw hash with the provided configuration.

#### `encodedLen(variant: Variant, memCost: number, timeCost: number, parallelism: number, saltLen: number, hashLen: number): number`

Calculates the length of the encoded hash string.

### Enums

#### `Variant`

- `Variant.Argon2d`: Data-dependent hashing (faster but potentially vulnerable to side-channel attacks)
- `Variant.Argon2i`: Data-independent hashing (resistant to side-channel attacks)
- `Variant.Argon2id`: Hybrid mode, combines Argon2d and Argon2i

#### `Version`

- `Version.Version10`: Argon2 version 1.0 (0x10)
- `Version.Version13`: Argon2 version 1.3 (0x13)

### Classes

#### `Config`

Configuration class for Argon2 parameters.

##### Static Methods

- `Config.original()`: Returns original Argon2 paper configuration (Argon2i, 4096 KB, t=3)
- `Config.owasp1()`: Returns OWASP recommended configuration for high security
- `Config.owasp2()`: Returns OWASP recommended configuration for moderate security (default)
- `Config.owasp3()`, `Config.owasp4()`, `Config.owasp5()`: Alternative OWASP configurations
- `Config.rfc9106()`: Returns RFC 9106 standard recommendation (2 GB memory)
- `Config.rfc9106LowMem()`: Returns RFC 9106 low-memory recommendation (64 MB memory)

## Implementation Details

This library implements the Argon2 algorithm as specified in [RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106):

- Uses [Blake2b](https://www.blake2.net/) for the initial hashing phase
- Implements the memory-hard function with data-dependent (Argon2d) or data-independent (Argon2i) addressing
- Provides the hybrid mode (Argon2id) that combines both approaches
- Supports parallelism through multiple lanes
- Implements variable-length output hashing

## Limitations

- Performance is slower compared to native implementations due to the JavaScript runtime
- For high-security production environments with heavy usage, consider using native implementations like [node-argon2](https://github.com/ranisalt/node-argon2)
- The library is primarily designed for environments where native code is not available or deployable

## Security Recommendations

For production use:

1. Always generate cryptographically secure random salts for each hash (at least 16 bytes)
2. Choose appropriate memory and time parameters based on your security requirements and hardware constraints
3. For most web applications, use Argon2id variant (the default)
4. Follow OWASP or RFC 9106 recommendations for memory and time parameters

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## References

- [Argon2 GitHub Repository](https://github.com/P-H-C/phc-winner-argon2)
- [RFC 9106: Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications](https://datatracker.ietf.org/doc/html/rfc9106)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
