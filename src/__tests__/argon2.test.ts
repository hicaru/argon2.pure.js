import { describe, it, expect } from "vitest";
import { argon2Hash } from "../index";

describe("argon2Hash", () => {
  it("should hash a password with a salt", async () => {
    const result = await argon2Hash("password", "somesalt");
    expect(result).toBe("hashed");
  });
});
