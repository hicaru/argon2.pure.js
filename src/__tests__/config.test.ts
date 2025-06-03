import { describe, it, expect } from "vitest";
import { Config } from "../config";
import { Variant } from "../variant";
import { Version } from "../version";

describe("Config", () => {
  it("default returns correct instance", () => {
    const config = new Config();
    expect(config.ad.length).toBe(0);
    expect(config.hashLength).toBe(32);
    expect(config.lanes).toBe(1);
    expect(config.memCost).toBe(19 * 1024);
    expect(config.secret.length).toBe(0);
    expect(config.timeCost).toBe(2);
    expect(config.variant).toBe(Variant.Argon2id);
    expect(config.version).toBe(Version.Version13);
  });

  it("original returns correct instance", () => {
    const config = Config.original();
    expect(config.ad.length).toBe(0);
    expect(config.hashLength).toBe(32);
    expect(config.lanes).toBe(1);
    expect(config.memCost).toBe(4096);
    expect(config.secret.length).toBe(0);
    expect(config.timeCost).toBe(3);
    expect(config.variant).toBe(Variant.Argon2i);
    expect(config.version).toBe(Version.Version13);
  });

  it("owasp1 returns correct instance", () => {
    const config = Config.owasp1();
    expect(config.ad.length).toBe(0);
    expect(config.hashLength).toBe(32);
    expect(config.lanes).toBe(1);
    expect(config.memCost).toBe(46 * 1024);
    expect(config.secret.length).toBe(0);
    expect(config.timeCost).toBe(1);
    expect(config.variant).toBe(Variant.Argon2id);
    expect(config.version).toBe(Version.Version13);
  });

  it("owasp2 returns correct instance", () => {
    const config = Config.owasp2();
    expect(config.ad.length).toBe(0);
    expect(config.hashLength).toBe(32);
    expect(config.lanes).toBe(1);
    expect(config.memCost).toBe(19 * 1024);
    expect(config.secret.length).toBe(0);
    expect(config.timeCost).toBe(2);
    expect(config.variant).toBe(Variant.Argon2id);
    expect(config.version).toBe(Version.Version13);
  });

  it("rfc9106 returns correct instance", () => {
    const config = Config.rfc9106();
    expect(config.ad.length).toBe(0);
    expect(config.hashLength).toBe(32);
    expect(config.lanes).toBe(1);
    expect(config.memCost).toBe(2 * 1024 * 1024);
    expect(config.secret.length).toBe(0);
    expect(config.timeCost).toBe(1);
    expect(config.variant).toBe(Variant.Argon2id);
    expect(config.version).toBe(Version.Version13);
  });
});
