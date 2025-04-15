import * as common from './common';
import { MASK_64 } from './core';

export class Block {
   private data: BigUint64Array;

   constructor(data?: BigUint64Array) {
       this.data = data || new BigUint64Array(common.QWORDS_IN_BLOCK);
   }

   asU8(): Uint8Array {
       return new Uint8Array(this.data.buffer);
   }

   asU8Mut(): Uint8Array {
       return new Uint8Array(this.data.buffer);
   }

   copyTo(dst: Block): void {
       const newData = new BigUint64Array(common.QWORDS_IN_BLOCK);
       for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
           newData[i] = this.data[i];
       }
       dst.data = newData;
   }

   static zero(): Block {
       return new Block();
   }

   bitwiseXor(rhs: Block): void {
       for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
           this.data[i] = (this.data[i] ^ rhs.data[i]) & MASK_64;
       }
   }

   clone(): Block {
       const newData = new BigUint64Array(common.QWORDS_IN_BLOCK);
       for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
           newData[i] = this.data[i];
       }
       return new Block(newData);
   }

   get(index: number): bigint {
       return this.data[index];
   }

   set(index: number, value: bigint): void {
       this.data[index] = value & MASK_64;
   }

   equals(other: Block): boolean {
       for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
           if (this.data[i] !== other.data[i]) {
               return false;
           }
       }
       return true;
   }

   toArray(): Array<bigint> {
       return Array.from(this.data);
   }
}
