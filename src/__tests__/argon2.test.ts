import { describe, it, expect } from 'vitest';
import { 
    verifyEncoded
} from '../index';
import { rotr64 } from '../core';

describe('Argon2d', () => {
    // it('single_thread_verification_multi_lane_hash', () => {
    //     const hash = "$argon2i$v=19$m=4096,t=3,p=4$YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo$BvBk2OaSofBHfbrUW61nHrWB/43xgfs/QJJ5DkMAd8I";
    //     const result = verifyEncoded(hash, new TextEncoder().encode("foo"));
    //     expect(result).toBe(true);
    // });

    it('core.rotr64', () => {
        let value = rotr64(0x0123456789abcdefn, 32);
        expect(value).toBe(9920249030613615975n);
    });
});
