import { describe, test, expect } from "vitest";
import { base64Len, decodeString, encodeString, numLen } from "../encoding";
import { Context } from "../context";
import { Config } from "../config";
import { Variant } from "../variant";
import { Version } from "../version";
import { ErrorType } from "../error";

describe("encoding", () => {
  test("base64Len returns correct length", () => {
    const tests = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 6],
      [5, 7],
      [6, 8],
      [7, 10],
      [8, 11],
      [9, 12],
      [10, 14],
    ];

    for (const [len, expected] of tests) {
      const actual = base64Len(len as number);
      expect(actual).toBe(expected);
    }
  });

  test("decodeString with version10 returns correct result", () => {
    const encoded =
      "$argon2i$v=16$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";

    const actual = decodeString(encoded);

    expect(actual.variant).toBe(Variant.Argon2i);
    expect(actual.version).toBe(Version.Version10);
    expect(actual.memCost).toBe(4096);
    expect(actual.timeCost).toBe(3);
    expect(actual.parallelism).toBe(1);
    expect(new TextDecoder().decode(actual.salt)).toBe("salt1234");
    expect(new TextDecoder().decode(actual.hash)).toBe(
      "12345678901234567890123456789012",
    );
  });

  test("decodeString with version13 returns correct result", () => {
    const encoded =
      "$argon2i$v=19$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";

    const actual = decodeString(encoded);

    expect(actual.variant).toBe(Variant.Argon2i);
    expect(actual.version).toBe(Version.Version13);
    expect(actual.memCost).toBe(4096);
    expect(actual.timeCost).toBe(3);
    expect(actual.parallelism).toBe(1);
    expect(new TextDecoder().decode(actual.salt)).toBe("salt1234");
    expect(new TextDecoder().decode(actual.hash)).toBe(
      "12345678901234567890123456789012",
    );
  });

  test("decodeString without version returns correct result", () => {
    const encoded =
      "$argon2i$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";

    const actual = decodeString(encoded);

    expect(actual.variant).toBe(Variant.Argon2i);
    expect(actual.version).toBe(Version.Version10);
    expect(actual.memCost).toBe(4096);
    expect(actual.timeCost).toBe(3);
    expect(actual.parallelism).toBe(1);
    expect(new TextDecoder().decode(actual.salt)).toBe("salt1234");
    expect(new TextDecoder().decode(actual.hash)).toBe(
      "12345678901234567890123456789012",
    );
  });

  test("decodeString without variant throws error", () => {
    const encoded =
      "$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with empty variant throws error", () => {
    const encoded =
      "$$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with invalid variant throws error", () => {
    const encoded =
      "$argon$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString without mem_cost throws error", () => {
    const encoded =
      "$argon2i$t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with empty mem_cost throws error", () => {
    const encoded =
      "$argon2i$m=,t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with non-numeric mem_cost throws error", () => {
    const encoded =
      "$argon2i$m=a,t=3,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString without time_cost throws error", () => {
    const encoded =
      "$argon2i$m=4096,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with empty time_cost throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with non-numeric time_cost throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=a,p=1" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString without parallelism throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=3" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with empty parallelism throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=3,p=" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString with non-numeric parallelism throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=3,p=a" +
      "$c2FsdDEyMzQ=$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString without salt throws error", () => {
    const encoded =
      "$argon2i$m=4096,t=3,p=1" +
      "$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("decodeString without hash throws error", () => {
    const encoded = "$argon2i$m=4096,t=3,p=1" + "$c2FsdDEyMzQ=";

    expect(() => decodeString(encoded)).toThrow(ErrorType.DecodingFail);
  });

  test("encodeString returns correct string", () => {
    const hash = new TextEncoder().encode("12345678901234567890123456789012");
    const config = new Config(
      new Uint8Array(0),
      hash.length,
      1,
      4096,
      new Uint8Array(0),
      3,
      Variant.Argon2i,
      Version.Version13,
    );

    const pwd = new TextEncoder().encode("password");
    const salt = new TextEncoder().encode("salt1234");

    const context = Context.new(config, pwd, salt);

    const expected =
      "$argon2i$v=19$m=4096,t=3,p=1" +
      "$c2FsdDEyMzQ$MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI";

    const actual = encodeString(context, hash);

    expect(actual).toBe(expected);
  });

  test("numLen returns correct length", () => {
    const tests = [
      [1, 1],
      [10, 2],
      [110, 3],
      [1230, 4],
      [12340, 5],
      [123457, 6],
    ];

    for (const [num, expected] of tests) {
      const actual = numLen(num as number);
      expect(actual).toBe(expected);
    }
  });
});
