import { describe, it, expect } from 'vitest';
import { Block } from '../block';
import * as common from '../common';

describe('Block', () => {
  it('asU8 returns correct slice', () => {
    const block = Block.zero();
    const expected = new Uint8Array(1024).fill(0);
    const actual = block.asU8();
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });

  it('asU8Mut returns correct slice', () => {
    const block = Block.zero();
    const expected = new Uint8Array(1024).fill(0);
    const actual = block.asU8Mut();
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });

  it('bitwiseXor updates lhs', () => {
    const lhs = Block.zero();
    const rhs = new Block();
    
    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      rhs.set(i, BigInt(1));
    }
    
    lhs.bitwiseXor(rhs);
    expect(lhs.equals(rhs)).toBe(true);
  });

  it('copyTo copies block', () => {
    const src = new Block();
    const dst = Block.zero();
    
    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      src.set(i, BigInt(1));
    }
    
    src.copyTo(dst);
    expect(dst.equals(src)).toBe(true);
  });

  it('clone clones block', () => {
    const orig = new Block();
    
    for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
      orig.set(i, BigInt(1));
    }
    
    const copy = orig.clone();
    expect(copy.equals(orig)).toBe(true);
  });

  it('zero creates block with all zeros', () => {
    const expected = new Block();
    const actual = Block.zero();
    expect(actual.equals(expected)).toBe(true);
  });
});
