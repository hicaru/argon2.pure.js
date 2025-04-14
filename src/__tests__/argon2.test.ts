import { describe, it, expect } from 'vitest';
import { 
    verifyEncoded
} from '../index';
import { fBlaMka, rotr64 } from '../core';

describe('Argon2d', () => {
    it('single_thread_verification_multi_lane_hash', () => {
        const hash = "$argon2i$v=19$m=4096,t=3,p=4$YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo$BvBk2OaSofBHfbrUW61nHrWB/43xgfs/QJJ5DkMAd8I";
        const result = verifyEncoded(hash, new TextEncoder().encode("foo"));
        expect(result).toBe(true);
    });

    it('core.rotr64', () => {
        let value = rotr64(0x0123456789abcdefn, 32);
        expect(value).toBe(9920249030613615975n);
    });

    it('core.fBlaMka', () => {
        let result = fBlaMka(0n, 0n);
        expect(result).toBe(0n);
        
        result = fBlaMka(1n, 1n);
        expect(result).toBe(4n);
        
        result = fBlaMka(0xFFFFFFFFn, 0xFFFFFFFFn);
        expect(result).toBe(0xfffffffe00000000n);
        
        result = fBlaMka(0x0123456789abcdefn, 0xfedcba9876543210n);
        expect(result).toBe(0x7f44f06fcac319dfn);
        
        result = fBlaMka(0xffffffffffffffffn, 0xffffffffffffffffn);
        expect(result).toBe(0xfffffffc00000000n);
        
        result = fBlaMka(0x8000000000000000n, 0x8000000000000000n);
        expect(result).toBe(0n);
        
        result = fBlaMka(0x7fffffffffffffffn, 1n);
        expect(result).toBe(0x80000001fffffffen);
    });
});
