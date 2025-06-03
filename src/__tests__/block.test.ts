import { describe, it, expect } from "vitest";
import { Block } from "../block";
import * as common from "../common";
import { fillBlock } from "../core";

describe("Block", () => {
  it("asU8 returns correct slice", () => {
    const block = Block.zero();
    const expected = new Uint8Array(1024).fill(0);
    const actual = block.asU8();
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });

  it("asU8Mut returns correct slice", () => {
    const block = Block.zero();
    const expected = new Uint8Array(1024).fill(0);
    const actual = block.asU8Mut();
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });

  it("bitwiseXor updates lhs", () => {
    const lhs = Block.zero();
    const rhs = new Block();

    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      rhs.set(i, BigInt(1));
    }

    lhs.bitwiseXor(rhs);
    expect(lhs.equals(rhs)).toBe(true);
  });

  it("copyTo copies block", () => {
    const src = new Block();
    const dst = Block.zero();

    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      src.set(i, BigInt(1));
    }

    src.copyTo(dst);
    expect(dst.equals(src)).toBe(true);
  });

  it("clone clones block", () => {
    const orig = new Block();

    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      orig.set(i, BigInt(1));
    }

    const copy = orig.clone();
    expect(copy.equals(orig)).toBe(true);
  });

  it("zero creates block with all zeros", () => {
    const expected = new Block();
    const actual = Block.zero();
    expect(actual.equals(expected)).toBe(true);
  });

  it("correctly applies modifications to nextBlock", () => {
    const prevBlock = new Block();
    const refBlock = new Block();
    const nextBlock = new Block();

    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      prevBlock.set(i, BigInt(i));
      refBlock.set(i, BigInt(i + 100));
      nextBlock.set(i, BigInt(i + 200));
    }

    const originalNextBlock = nextBlock.clone();

    fillBlock(prevBlock, refBlock, nextBlock, false);

    expect(nextBlock.equals(originalNextBlock)).toBe(false);

    for (let i = 0; i < 10; i++) {
      expect(nextBlock.get(i)).not.toBe(originalNextBlock.get(i));
    }
  });

  it("correctly applies XOR when withXor=true", () => {
    const prevBlock = new Block();
    const refBlock = new Block();
    const nextBlock = new Block();

    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      prevBlock.set(i, BigInt(i));
      refBlock.set(i, BigInt(i + 100));
      nextBlock.set(i, BigInt(i + 200));
    }

    const nextBlock1 = nextBlock.clone();
    const nextBlock2 = nextBlock.clone();

    fillBlock(prevBlock, refBlock, nextBlock1, true);
    fillBlock(prevBlock, refBlock, nextBlock2, false);

    expect(nextBlock1.equals(nextBlock2)).toBe(false);
  });

  it("bitwiseXor modifies the block correctly", () => {
    const block1 = new Block();
    const block2 = new Block();

    for (let i = 0; i < 10; i++) {
      block1.set(i, BigInt(i));
      block2.set(i, BigInt(i + 10));
    }

    const original = block1.clone();

    block1.bitwiseXor(block2);

    for (let i = 0; i < 10; i++) {
      expect(block1.get(i)).toBe(original.get(i) ^ block2.get(i));
    }
  });

  it("copyTo correctly copies data to another block", () => {
    const src = new Block();
    const dst = new Block();

    for (let i = 0; i < 10; i++) {
      src.set(i, BigInt(i * 100));
    }

    src.copyTo(dst);

    for (let i = 0; i < 10; i++) {
      expect(dst.get(i)).toBe(src.get(i));
    }

    src.set(0, BigInt(999));
    expect(dst.get(0)).not.toBe(src.get(0));
  });

  it("clone creates an independent copy", () => {
    const original = new Block();

    for (let i = 0; i < 10; i++) {
      original.set(i, BigInt(i * 10));
    }

    const copy = original.clone();

    for (let i = 0; i < 10; i++) {
      expect(copy.get(i)).toBe(original.get(i));
    }

    original.set(5, BigInt(500));
    expect(copy.get(5)).not.toBe(original.get(5));
  });
});
