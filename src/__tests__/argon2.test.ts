import { describe, it, expect } from 'vitest';
import { 
    Block,
    Context,
    verifyEncoded
} from '../../';
import { fBlaMka, fillBlock, indexAlpha, nextAddresses, p, Position, rotr64 } from '../core';

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

    // it('nextAddresses basic functionality test', () => {
    //     const addressBlock = Block.zero();
    //     const inputBlock = Block.zero();
    //     const zeroBlock = Block.zero();
        
    //     inputBlock.set(0, BigInt(123));
        
    //     nextAddresses(addressBlock, inputBlock, zeroBlock);
    //     console.log(inputBlock);
        
    //     expect(inputBlock.get(6)).toBe(BigInt(1));
        
    //     let isZero = true;
    //     for (let i = 0; i < 128; i++) {
    //         if (addressBlock.get(i) !== BigInt(0)) {
    //             isZero = false;
    //             break;
    //         }
    //     }
    //     expect(isZero).toBe(false);
        
    //     console.log("addressBlock[0] =", addressBlock.get(0));
    //     console.log("addressBlock[1] =", addressBlock.get(1));
    //     console.log("addressBlock[2] =", addressBlock.get(2));
    // });

    it('should modify the nextBlock', () => {
        const prevBlock = new Block();
        const refBlock = new Block();
        const nextBlock = new Block();

        for (let i = 0; i < 128; i++) {
           prevBlock.set(i, BigInt(i));
           refBlock.set(i, BigInt(128 + i));
           nextBlock.set(i, BigInt(256 + i));
        }

        const initialNextBlock = nextBlock.clone();

        fillBlock(prevBlock, refBlock, nextBlock, false);
        expect(nextBlock).not.toEqual(initialNextBlock);

        let shouldbeArray = [
           13303187592812969783n,
           13303187592812969783n,
           13303187592812969783n,
           13303187592812969783n,
           11215437566541855968n,
           11215437566541855968n,
           11215437566541855968n,
           11215437566541855968n,
           16087878445821652372n,
           16087878445821652372n,
           16087878445821652372n,
           16087878445821652372n,
           9602081990130430169n,
           9602081990130430169n,
           9602081990130430169n,
           9602081990130430169n,
           13303187592812969783n,
           13303187592812969783n,
           13303187592812969783n,
           13303187592812969783n,
           11215437566541855968n,
           11215437566541855968n,
           11215437566541855968n,
           11215437566541855968n,
           16087878445821652372n,
           16087878445821652372n,
           16087878445821652372n,
           16087878445821652372n,
           9602081990130430169n,
           9602081990130430169n,
           9602081990130430169n,
           9602081990130430169n,
           9337542079366027238n,
           9337542079366027238n,
           9337542079366027238n,
           9337542079366027238n,
           1785801687056098406n,
           1785801687056098406n,
           1785801687056098406n,
           1785801687056098406n,
           775840776167736118n,
           775840776167736118n,
           775840776167736118n,
           775840776167736118n,
           13130438561479378583n,
           13130438561479378583n,
           13130438561479378583n,
           13130438561479378583n,
           9337542079366027238n,
           9337542079366027238n,
           9337542079366027238n,
           9337542079366027238n,
           1785801687056098406n,
           1785801687056098406n,
           1785801687056098406n,
           1785801687056098406n,
           775840776167736118n,
           775840776167736118n,
           775840776167736118n,
           775840776167736118n,
           13130438561479378583n,
           13130438561479378583n,
           13130438561479378583n,
           13130438561479378583n,
           2552009702885778139n,
           2552009702885778139n,
           2552009702885778139n,
           2552009702885778139n,
           3585535679615203329n,
           3585535679615203329n,
           3585535679615203329n,
           3585535679615203329n,
           5211691988315873700n,
           5211691988315873700n,
           5211691988315873700n,
           5211691988315873700n,
           9515542970984143762n,
           9515542970984143762n,
           9515542970984143762n,
           9515542970984143762n,
           2552009702885778139n,
           2552009702885778139n,
           2552009702885778139n,
           2552009702885778139n,
           3585535679615203329n,
           3585535679615203329n,
           3585535679615203329n,
           3585535679615203329n,
           5211691988315873700n,
           5211691988315873700n,
           5211691988315873700n,
           5211691988315873700n,
           9515542970984143762n,
           9515542970984143762n,
           9515542970984143762n,
           9515542970984143762n,
           5750521200656362819n,
           5750521200656362819n,
           5750521200656362819n,
           5750521200656362819n,
           17627765866126295426n,
           17627765866126295426n,
           17627765866126295426n,
           17627765866126295426n,
           5023844423338988105n,
           5023844423338988105n,
           5023844423338988105n,
           5023844423338988105n,
           4383434115888218882n,
           4383434115888218882n,
           4383434115888218882n,
           4383434115888218882n,
           5750521200656362819n,
           5750521200656362819n,
           5750521200656362819n,
           5750521200656362819n,
           17627765866126295426n,
           17627765866126295426n,
           17627765866126295426n,
           17627765866126295426n,
           5023844423338988105n,
           5023844423338988105n,
           5023844423338988105n,
           5023844423338988105n,
           4383434115888218882n,
           4383434115888218882n,
           4383434115888218882n,
           4383434115888218882n
        ];
        expect(nextBlock.toArray()).toEqual(shouldbeArray);
    });

    it('text p function', () => {
        const v = Array(16).fill(0n).map((_, i) => BigInt(i));
        const original = [...v];

        p(v);

        expect(v).not.toEqual(original);
        expect(v).toEqual([
            4309413561690544949n,
            10591790002093387956n,
            4054907587149926025n,
            12186936810293155319n,
            6987944521133659505n,
            11961256884274195702n,
            7717811659818223130n,
            7145962203480256264n,
            13478285582766688587n,
            8998272025916050531n,
            15850783893021893847n,
            16649433534529282490n,
            16981378724759909900n,
            5484704648486101607n,
            13959069891332574114n,
            5484003764239343556n,
        ]);
    });
});
