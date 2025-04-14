import { Block } from './block';
import * as common from './common';
import { Context } from './context';
import { Memory } from './memory';
import { Variant } from './variant';
import { Version } from './version';

class Position {
    constructor(
        public pass: number,
        public lane: number,
        public slice: number,
        public index: number
    ) {}

    clone(): Position {
        return new Position(this.pass, this.lane, this.slice, this.index);
    }
}

export function initialize(context: Context, memory: Memory): void {
    fillFirstBlocks(context, memory, createH0(context));
}

export function fillMemoryBlocks(context: Context, memory: Memory): void {
    fillMemoryBlocksSt(context, memory);
}

export function finalize(context: Context, memory: Memory): Uint8Array {
    let blockHash = memory.getBlock(context.laneLength - 1).clone();
    
    for (let l = 1; l < context.config.lanes; l++) {
        const lastBlockInLane = l * context.laneLength + (context.laneLength - 1);
        const lastBlock = memory.getBlock(lastBlockInLane);
        blockHash.bitwiseXor(lastBlock);
    }

    const hash = new Uint8Array(context.config.hashLength);
    hprime(hash, blockHash.asU8());
    return hash;
}

function blake2b(out: Uint8Array, input: Uint8Array[]): void {
    // should be: https://github.com/dcposch/blakejs
}

function fBlaMka(x: bigint, y: bigint): bigint {
    const m = BigInt(0xFFFFFFFF);
    const xy = (x & m) * (y & m);
    return x + y + xy + xy;
}

function fillBlock(prevBlock: Block, refBlock: Block, nextBlock: Block, withXor: boolean): void {
    const blockR = refBlock.clone();
    blockR.bitwiseXor(prevBlock);
    const blockTmp = blockR.clone();

    if (withXor) {
        blockTmp.bitwiseXor(nextBlock);
    }

    for (let i = 0; i < 8; i++) {
        let v0 = blockR.get(16 * i);
        let v1 = blockR.get(16 * i + 1);
        let v2 = blockR.get(16 * i + 2);
        let v3 = blockR.get(16 * i + 3);
        let v4 = blockR.get(16 * i + 4);
        let v5 = blockR.get(16 * i + 5);
        let v6 = blockR.get(16 * i + 6);
        let v7 = blockR.get(16 * i + 7);
        let v8 = blockR.get(16 * i + 8);
        let v9 = blockR.get(16 * i + 9);
        let v10 = blockR.get(16 * i + 10);
        let v11 = blockR.get(16 * i + 11);
        let v12 = blockR.get(16 * i + 12);
        let v13 = blockR.get(16 * i + 13);
        let v14 = blockR.get(16 * i + 14);
        let v15 = blockR.get(16 * i + 15);

        p(
            [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15]
        );

        blockR.set(16 * i, v0);
        blockR.set(16 * i + 1, v1);
        blockR.set(16 * i + 2, v2);
        blockR.set(16 * i + 3, v3);
        blockR.set(16 * i + 4, v4);
        blockR.set(16 * i + 5, v5);
        blockR.set(16 * i + 6, v6);
        blockR.set(16 * i + 7, v7);
        blockR.set(16 * i + 8, v8);
        blockR.set(16 * i + 9, v9);
        blockR.set(16 * i + 10, v10);
        blockR.set(16 * i + 11, v11);
        blockR.set(16 * i + 12, v12);
        blockR.set(16 * i + 13, v13);
        blockR.set(16 * i + 14, v14);
        blockR.set(16 * i + 15, v15);
    }

    for (let i = 0; i < 8; i++) {
        let v0 = blockR.get(2 * i);
        let v1 = blockR.get(2 * i + 1);
        let v2 = blockR.get(2 * i + 16);
        let v3 = blockR.get(2 * i + 17);
        let v4 = blockR.get(2 * i + 32);
        let v5 = blockR.get(2 * i + 33);
        let v6 = blockR.get(2 * i + 48);
        let v7 = blockR.get(2 * i + 49);
        let v8 = blockR.get(2 * i + 64);
        let v9 = blockR.get(2 * i + 65);
        let v10 = blockR.get(2 * i + 80);
        let v11 = blockR.get(2 * i + 81);
        let v12 = blockR.get(2 * i + 96);
        let v13 = blockR.get(2 * i + 97);
        let v14 = blockR.get(2 * i + 112);
        let v15 = blockR.get(2 * i + 113);

        p(
            [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15]
        );

        blockR.set(2 * i, v0);
        blockR.set(2 * i + 1, v1);
        blockR.set(2 * i + 16, v2);
        blockR.set(2 * i + 17, v3);
        blockR.set(2 * i + 32, v4);
        blockR.set(2 * i + 33, v5);
        blockR.set(2 * i + 48, v6);
        blockR.set(2 * i + 49, v7);
        blockR.set(2 * i + 64, v8);
        blockR.set(2 * i + 65, v9);
        blockR.set(2 * i + 80, v10);
        blockR.set(2 * i + 81, v11);
        blockR.set(2 * i + 96, v12);
        blockR.set(2 * i + 97, v13);
        blockR.set(2 * i + 112, v14);
        blockR.set(2 * i + 113, v15);
    }

    blockTmp.copyTo(nextBlock);
    nextBlock.bitwiseXor(blockR);
}

function fillFirstBlocks(context: Context, memory: Memory, h0: Uint8Array): void {
    for (let lane = 0; lane < context.config.lanes; lane++) {
        const start = common.PREHASH_DIGEST_LENGTH;
        
        // H'(H0||0||i)
        setU32Le(h0, start, 0);
        setU32Le(h0, start + 4, lane);
        
        const block0 = memory.getBlockByLaneAndOffset(lane, 0);
        hprime(block0.asU8Mut(), h0);

        // H'(H0||1||i)
        setU32Le(h0, start, 1);
        
        const block1 = memory.getBlockByLaneAndOffset(lane, 1);
        hprime(block1.asU8Mut(), h0);
    }
}

function fillMemoryBlocksSt(context: Context, memory: Memory): void {
    for (let p = 0; p < context.config.timeCost; p++) {
        for (let s = 0; s < common.SYNC_POINTS; s++) {
            for (let l = 0; l < context.config.lanes; l++) {
                const position = new Position(p, l, s, 0);
                fillSegment(context, position, memory);
            }
        }
    }
}

function fillSegment(context: Context, position: Position, memory: Memory): void {
    const pos = position.clone();
    const dataIndependentAddressing = (context.config.variant === Variant.Argon2i)
        || (context.config.variant === Variant.Argon2id && pos.pass === 0
            && pos.slice < (common.SYNC_POINTS / 2));
    
    const zeroBlock = Block.zero();
    const inputBlock = Block.zero();
    const addressBlock = Block.zero();

    if (dataIndependentAddressing) {
        inputBlock.set(0, BigInt(pos.pass));
        inputBlock.set(1, BigInt(pos.lane));
        inputBlock.set(2, BigInt(pos.slice));
        inputBlock.set(3, BigInt(context.memoryBlocks));
        inputBlock.set(4, BigInt(context.config.timeCost));
        inputBlock.set(5, BigInt(context.config.variant));
    }

    let startingIndex = 0;

    if (pos.pass === 0 && pos.slice === 0) {
        startingIndex = 2;
        
        if (dataIndependentAddressing) {
            nextAddresses(addressBlock, inputBlock, zeroBlock);
        }
    }

    let currOffset = (pos.lane * context.laneLength)
        + (pos.slice * context.segmentLength)
        + startingIndex;

    let prevOffset = (currOffset % context.laneLength === 0)
        ? currOffset + context.laneLength - 1
        : currOffset - 1;

    let pseudoRand;
    for (let i = startingIndex; i < context.segmentLength; i++) {
        if (currOffset % context.laneLength === 1) {
            prevOffset = currOffset - 1;
        }

        if (dataIndependentAddressing) {
            if (i % common.ADDRESSES_IN_BLOCK === 0) {
                nextAddresses(addressBlock, inputBlock, zeroBlock);
            }
            pseudoRand = addressBlock.get(i % common.ADDRESSES_IN_BLOCK);
        } else {
            pseudoRand = memory.getBlock(prevOffset).get(0);
        }

        const refLane = ((pos.pass === 0) && (pos.slice === 0))
            ? BigInt(pos.lane)
            : (pseudoRand >> BigInt(32)) % BigInt(context.config.lanes);

        pos.index = i;
        const pseudoRandU32 = Number(pseudoRand & BigInt(0xFFFFFFFF));
        const sameLane = refLane === BigInt(pos.lane);
        const refIndex = indexAlpha(context, pos, pseudoRandU32, sameLane);

        const index = Number(BigInt(context.laneLength) * refLane + BigInt(refIndex));
        const currBlock = memory.getBlock(currOffset).clone();
        
        const prevBlock = memory.getBlock(prevOffset);
        const refBlock = memory.getBlock(index);
        
        if (context.config.version === Version.Version10 || pos.pass === 0) {
            fillBlock(prevBlock, refBlock, currBlock, false);
        } else {
            fillBlock(prevBlock, refBlock, currBlock, true);
        }

        memory.setBlock(currOffset, currBlock);
        currOffset += 1;
        prevOffset += 1;
    }
}

function setU32Le(array: Uint8Array, offset: number, value: number): void {
    array[offset] = value & 0xFF;
    array[offset + 1] = (value >> 8) & 0xFF;
    array[offset + 2] = (value >> 16) & 0xFF;
    array[offset + 3] = (value >> 24) & 0xFF;
}

function g(values: bigint[]): void {
    values[0] = fBlaMka(values[0], values[1]);
    values[3] = rotr64(values[3] ^ values[0], 32);
    values[2] = fBlaMka(values[2], values[3]);
    values[1] = rotr64(values[1] ^ values[2], 24);
    values[0] = fBlaMka(values[0], values[1]);
    values[3] = rotr64(values[3] ^ values[0], 16);
    values[2] = fBlaMka(values[2], values[3]);
    values[1] = rotr64(values[1] ^ values[2], 63);
}

function p(v: bigint[]): void {
    g([v[0], v[4], v[8], v[12]]);
    g([v[1], v[5], v[9], v[13]]);
    g([v[2], v[6], v[10], v[14]]);
    g([v[3], v[7], v[11], v[15]]);
    g([v[0], v[5], v[10], v[15]]);
    g([v[1], v[6], v[11], v[12]]);
    g([v[2], v[7], v[8], v[13]]);
    g([v[3], v[4], v[9], v[14]]);
}

function createH0(context: Context): Uint8Array {
    const h0 = new Uint8Array(common.PREHASH_SEED_LENGTH);
    return h0;
}

function hprime(out: Uint8Array, input: Uint8Array): void {
    const outLen = out.length;
    if (outLen <= common.BLAKE2B_OUT_LENGTH) {
        const outLenBytes = new Uint8Array(4);
        setU32Le(outLenBytes, 0, outLen);
        blake2b(out, [outLenBytes, input]);
    } else {
    }
}

function indexAlpha(context: Context, position: Position, pseudoRand: number, sameLane: boolean): number {
    return 0;
}

function nextAddresses(addressBlock: Block, inputBlock: Block, zeroBlock: Block): void {
    inputBlock.set(6, inputBlock.get(6) + BigInt(1));
    fillBlock(zeroBlock, inputBlock, addressBlock, false);
    fillBlock(zeroBlock, addressBlock.clone(), addressBlock, false);
}

function rotr64(w: bigint, c: number): bigint {
    return (w >> BigInt(c)) | (w << BigInt(64 - c));
}
