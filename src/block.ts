import * as common from './common';

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
        for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
            dst.data[i] = this.data[i];
        }
    }

    static zero(): Block {
        return new Block();
    }

    bitwiseXor(rhs: Block): void {
        for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
            this.data[i] ^= rhs.data[i];
        }
    }

    clone(): Block {
        const newBlock = new Block(new BigUint64Array(common.QWORDS_IN_BLOCK));
        this.copyTo(newBlock);
        return newBlock;
    }

    get(index: number): bigint {
        return this.data[index];
    }

    set(index: number, value: bigint): void {
        this.data[index] = value;
    }

    equals(other: Block): boolean {
        for (let i = 0; i < common.QWORDS_IN_BLOCK; i++) {
            if (this.data[i] !== other.data[i]) {
                return false;
            }
        }
        return true;
    }
}
