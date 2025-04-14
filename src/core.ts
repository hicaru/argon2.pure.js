import { Block } from './block';
import * as common from './common';
import { Context } from './context';
import { Memory } from './memory';
import { Variant } from './variant';
import { Version } from './version';
import { blake2b as blake2bJs } from 'blakejs';

/**
 * Position of the block currently being operated on.
 */
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

/**
 * Initializes the memory.
 */
export function initialize(context: Context, memory: Memory): void {
    fillFirstBlocks(context, memory, createH0(context));
}

/**
 * Fills all the memory blocks.
 */
export function fillMemoryBlocks(context: Context, memory: Memory): void {
    fillMemoryBlocksSt(context, memory);
}

/**
 * Calculates the final hash and returns it.
 */
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

/**
 * Blake2b hash function implementation using blakejs.
 */
function blake2b(out: Uint8Array, input: Uint8Array[]): void {
    // Concatenate all input arrays into a single one
    let totalLength = 0;
    for (const arr of input) {
        totalLength += arr.length;
    }
    
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of input) {
        combined.set(arr, offset);
        offset += arr.length;
    }
    
    // Use blakejs to compute the hash
    const result = blake2bJs(combined, undefined, out.length);
    
    // Copy the result to the output buffer
    out.set(new Uint8Array(result));
}

/**
 * Implements the f_bla_mka function from the Rust version.
 */
function fBlaMka(x: bigint, y: bigint): bigint {
    const m = BigInt(0xFFFFFFFF);
    const xy = (x & m) * (y & m);
    return x + y + xy + xy;
}

/**
 * Fill a block according to the Argon2 algorithm.
 */
function fillBlock(prevBlock: Block, refBlock: Block, nextBlock: Block, withXor: boolean): void {
    const blockR = refBlock.clone();
    blockR.bitwiseXor(prevBlock);
    const blockTmp = blockR.clone();

    if (withXor) {
        blockTmp.bitwiseXor(nextBlock);
    }

    // Apply Blake2 on columns of 64-bit words
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

        const values = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
        p(values);

        blockR.set(16 * i, values[0]);
        blockR.set(16 * i + 1, values[1]);
        blockR.set(16 * i + 2, values[2]);
        blockR.set(16 * i + 3, values[3]);
        blockR.set(16 * i + 4, values[4]);
        blockR.set(16 * i + 5, values[5]);
        blockR.set(16 * i + 6, values[6]);
        blockR.set(16 * i + 7, values[7]);
        blockR.set(16 * i + 8, values[8]);
        blockR.set(16 * i + 9, values[9]);
        blockR.set(16 * i + 10, values[10]);
        blockR.set(16 * i + 11, values[11]);
        blockR.set(16 * i + 12, values[12]);
        blockR.set(16 * i + 13, values[13]);
        blockR.set(16 * i + 14, values[14]);
        blockR.set(16 * i + 15, values[15]);
    }

    // Apply Blake2 on rows of 64-bit words
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

        const values = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
        p(values);

        blockR.set(2 * i, values[0]);
        blockR.set(2 * i + 1, values[1]);
        blockR.set(2 * i + 16, values[2]);
        blockR.set(2 * i + 17, values[3]);
        blockR.set(2 * i + 32, values[4]);
        blockR.set(2 * i + 33, values[5]);
        blockR.set(2 * i + 48, values[6]);
        blockR.set(2 * i + 49, values[7]);
        blockR.set(2 * i + 64, values[8]);
        blockR.set(2 * i + 65, values[9]);
        blockR.set(2 * i + 80, values[10]);
        blockR.set(2 * i + 81, values[11]);
        blockR.set(2 * i + 96, values[12]);
        blockR.set(2 * i + 97, values[13]);
        blockR.set(2 * i + 112, values[14]);
        blockR.set(2 * i + 113, values[15]);
    }

    blockTmp.copyTo(nextBlock);
    nextBlock.bitwiseXor(blockR);
}

/**
 * Fill the first blocks of memory.
 */
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

/**
 * Fill memory blocks in a single-threaded manner.
 */
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

/**
 * Fill a memory segment.
 */
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

    let pseudoRand: bigint;
    for (let i = startingIndex; i < context.segmentLength; i++) {
        // 1.1 Rotating prev_offset if needed
        if (currOffset % context.laneLength === 1) {
            prevOffset = currOffset - 1;
        }

        // 1.2 Computing the index of the reference block
        // 1.2.1 Taking pseudo-random value from the previous block
        if (dataIndependentAddressing) {
            if (i % common.ADDRESSES_IN_BLOCK === 0) {
                nextAddresses(addressBlock, inputBlock, zeroBlock);
            }
            pseudoRand = addressBlock.get(i % common.ADDRESSES_IN_BLOCK);
        } else {
            pseudoRand = memory.getBlock(prevOffset).get(0);
        }

        // 1.2.2 Computing the lane of the reference block
        const refLane = ((pos.pass === 0) && (pos.slice === 0))
            ? BigInt(pos.lane)
            : (pseudoRand >> BigInt(32)) % BigInt(context.config.lanes);

        // 1.2.3 Computing the number of possible reference block within the lane
        pos.index = i;
        const pseudoRandU32 = Number(pseudoRand & BigInt(0xFFFFFFFF));
        const sameLane = refLane === BigInt(pos.lane);
        const refIndex = indexAlpha(context, pos, pseudoRandU32, sameLane);

        // 2 Creating a new block
        const index = Number(BigInt(context.laneLength) * refLane + BigInt(refIndex));
        
        // Важно: получаем новый блок, который будем модифицировать
        const currBlock = memory.getBlock(currOffset).clone();
        const prevBlock = memory.getBlock(prevOffset);
        const refBlock = memory.getBlock(index);
        
        // Вызываем fillBlock, который должен изменить currBlock
        if (context.config.version === Version.Version10 || pos.pass === 0) {
            fillBlock(prevBlock, refBlock, currBlock, false);
        } else {
            fillBlock(prevBlock, refBlock, currBlock, true);
        }

        // Теперь нужно убедиться, что изменения сохраняются в memory
        memory.setBlock(currOffset, currBlock);
        
        // Увеличиваем смещения
        currOffset += 1;
        prevOffset += 1;
    }
}

/**
 * Write a 32-bit unsigned integer in little-endian format.
 */
function setU32Le(array: Uint8Array, offset: number, value: number): void {
    array[offset] = value & 0xFF;
    array[offset + 1] = (value >> 8) & 0xFF;
    array[offset + 2] = (value >> 16) & 0xFF;
    array[offset + 3] = (value >> 24) & 0xFF;
}

/**
 * Convert a 32-bit unsigned integer to little-endian byte array.
 */
function u32ToLe(value: number): Uint8Array {
    const result = new Uint8Array(4);
    setU32Le(result, 0, value);
    return result;
}

/**
 * The G function from the Blake2b algorithm.
 */
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

/**
 * Create the initial H0 value used in the algorithm.
 */
function createH0(context: Context): Uint8Array {
    const h0 = new Uint8Array(common.PREHASH_SEED_LENGTH);
    
    // Prepare the input array with all the parameters
    const lanesBytes = u32ToLe(context.config.lanes);
    const hashLengthBytes = u32ToLe(context.config.hashLength);
    const memCostBytes = u32ToLe(context.config.memCost);
    const timeCostBytes = u32ToLe(context.config.timeCost);
    const versionBytes = u32ToLe(context.config.version);
    const variantBytes = u32ToLe(context.config.variant);
    const pwdLenBytes = u32ToLe(context.pwd.length);
    const saltLenBytes = u32ToLe(context.salt.length);
    const secretLenBytes = u32ToLe(context.config.secret.length);
    const adLenBytes = u32ToLe(context.config.ad.length);
    
    // Combine all inputs for Blake2b
    const input = [
        lanesBytes,
        hashLengthBytes,
        memCostBytes,
        timeCostBytes,
        versionBytes,
        variantBytes,
        pwdLenBytes,
        context.pwd,
        saltLenBytes,
        context.salt,
        secretLenBytes,
        context.config.secret,
        adLenBytes,
        context.config.ad
    ];
    
    // Hash the combined input
    blake2b(h0.subarray(0, common.PREHASH_DIGEST_LENGTH), input);
    
    return h0;
}

/**
 * The H' function as defined in the Argon2 paper.
 */
function hprime(out: Uint8Array, input: Uint8Array): void {
    const outLen = out.length;
    
    if (outLen <= common.BLAKE2B_OUT_LENGTH) {
        const outLenBytes = u32ToLe(outLen);
        blake2b(out, [outLenBytes, input]);
    } else {
        const aiLen = 32;
        let outBuffer = new Uint8Array(common.BLAKE2B_OUT_LENGTH);
        let inBuffer = new Uint8Array(common.BLAKE2B_OUT_LENGTH);
        
        // Initial hash with the length
        const outLenBytes = u32ToLe(outLen);
        blake2b(outBuffer, [outLenBytes, input]);
        
        // Copy first block to output
        out.set(outBuffer.subarray(0, aiLen), 0);
        
        let outPos = aiLen;
        let toProduce = outLen - aiLen;
        
        while (toProduce > common.BLAKE2B_OUT_LENGTH) {
            inBuffer.set(outBuffer);
            blake2b(outBuffer, [inBuffer]);
            out.set(outBuffer.subarray(0, aiLen), outPos);
            outPos += aiLen;
            toProduce -= aiLen;
        }
        
        blake2b(out.subarray(outPos, outLen), [outBuffer]);
    }
}

function indexAlpha(context: Context, position: Position, pseudoRand: number, sameLane: boolean): number {
    let referenceAreaSize: number;
    
    if (position.pass === 0) {
        if (position.slice === 0) {
            referenceAreaSize = position.index - 1;
        } else if (sameLane) {
            referenceAreaSize = position.slice * context.segmentLength + position.index - 1;
        } else if (position.index === 0) {
            referenceAreaSize = position.slice * context.segmentLength - 1;
        } else {
            referenceAreaSize = position.slice * context.segmentLength;
        }
    } else {
        if (sameLane) {
            referenceAreaSize = context.laneLength - context.segmentLength + position.index - 1;
        } else if (position.index === 0) {
            referenceAreaSize = context.laneLength - context.segmentLength - 1;
        } else {
            referenceAreaSize = context.laneLength - context.segmentLength;
        }
    }
    
    // Calculate relative position using the 64-bit division simulation
    let relativePosition: number;
    let refAreaSizeU64 = BigInt(referenceAreaSize);
    let pseudoRandU64 = BigInt(pseudoRand);
    
    pseudoRandU64 = (pseudoRandU64 * pseudoRandU64) >> BigInt(32);
    relativePosition = Number(refAreaSizeU64 - BigInt(1) - ((refAreaSizeU64 * pseudoRandU64) >> BigInt(32)));
    
    let startPosition = 0;
    if (position.pass !== 0) {
        if (position.slice === common.SYNC_POINTS - 1) {
            startPosition = 0;
        } else {
            startPosition = (position.slice + 1) * context.segmentLength;
        }
    }
    
    return (startPosition + relativePosition) % context.laneLength;
}

function nextAddresses(addressBlock: Block, inputBlock: Block, zeroBlock: Block): void {
    inputBlock.set(6, inputBlock.get(6) + BigInt(1));
    fillBlock(zeroBlock, inputBlock, addressBlock, false);
    fillBlock(zeroBlock, addressBlock.clone(), addressBlock, false);
}

function p(v: bigint[]): void {
    g(v.slice(0, 4));   // v0, v4, v8, v12
    g(v.slice(4, 8));   // v1, v5, v9, v13
    g(v.slice(8, 12));  // v2, v6, v10, v14
    g(v.slice(12, 16)); // v3, v7, v11, v15
    
    g([v[0], v[5], v[10], v[15]]);
    g([v[1], v[6], v[11], v[12]]);
    g([v[2], v[7], v[8], v[13]]);
    g([v[3], v[4], v[9], v[14]]);
}


export function rotr64(w: bigint, c: number): bigint {
    const MASK_64 = BigInt("0xFFFFFFFFFFFFFFFF");
    const input = w & MASK_64;
    
    return ((input >> BigInt(c)) | ((input << BigInt(64 - c)) & MASK_64)) & MASK_64;
}
