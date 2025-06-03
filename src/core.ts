import { Block } from "./block";
import * as common from "./common";
import { Context } from "./context";
import { Memory } from "./memory";
import { Variant } from "./variant";
import { Version } from "./version";
import { blake2b } from "blakejs";

export class Position {
  constructor(
    public pass: number,
    public lane: number,
    public slice: number,
    public index: number,
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

function localBlake2b(out: Uint8Array, input: Uint8Array[]): void {
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
  const result = blake2b(combined, undefined, out.length);

  // Copy the result to the output buffer
  out.set(new Uint8Array(result));
}

export function fBlaMka(x: bigint, y: bigint): bigint {
  const m = BigInt(0xffffffff);
  const xMasked = x & common.MASK_64;
  const yMasked = y & common.MASK_64;
  const xy = (xMasked & m) * (yMasked & m);
  return (xMasked + yMasked + xy + xy) & common.MASK_64;
}

export function fillBlock(
  prevBlock: Block,
  refBlock: Block,
  nextBlock: Block,
  withXor: boolean,
): void {
  const blockR = refBlock.clone();
  blockR.bitwiseXor(prevBlock);
  const blockTmp = blockR.clone();

  if (withXor) {
    blockTmp.bitwiseXor(nextBlock);
  }

  for (let i = 0; i < 8; i++) {
    const values = new Array<bigint>(16);

    for (let j = 0; j < 16; j++) {
      values[j] = blockR.get(16 * i + j);
    }

    p(values);

    for (let j = 0; j < 16; j++) {
      blockR.set(16 * i + j, values[j]);
    }
  }

  for (let i = 0; i < 8; i++) {
    const values = new Array<bigint>(16);

    values[0] = blockR.get(2 * i);
    values[1] = blockR.get(2 * i + 1);
    values[2] = blockR.get(2 * i + 16);
    values[3] = blockR.get(2 * i + 17);
    values[4] = blockR.get(2 * i + 32);
    values[5] = blockR.get(2 * i + 33);
    values[6] = blockR.get(2 * i + 48);
    values[7] = blockR.get(2 * i + 49);
    values[8] = blockR.get(2 * i + 64);
    values[9] = blockR.get(2 * i + 65);
    values[10] = blockR.get(2 * i + 80);
    values[11] = blockR.get(2 * i + 81);
    values[12] = blockR.get(2 * i + 96);
    values[13] = blockR.get(2 * i + 97);
    values[14] = blockR.get(2 * i + 112);
    values[15] = blockR.get(2 * i + 113);

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
function fillFirstBlocks(
  context: Context,
  memory: Memory,
  h0: Uint8Array,
): void {
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

export function fillSegment(
  context: Context,
  position: Position,
  memory: Memory,
): void {
  const pos = position.clone();
  const dataIndependentAddressing =
    context.config.variant === Variant.Argon2i ||
    (context.config.variant === Variant.Argon2id &&
      pos.pass === 0 &&
      pos.slice < common.SYNC_POINTS / 2);

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

  let currOffset =
    pos.lane * context.laneLength +
    pos.slice * context.segmentLength +
    startingIndex;

  let prevOffset =
    currOffset % context.laneLength === 0
      ? currOffset + context.laneLength - 1
      : currOffset - 1;

  const MASK_32 = BigInt("0xFFFFFFFF");

  for (let i = startingIndex; i < context.segmentLength; i++) {
    if (currOffset % context.laneLength === 1) {
      prevOffset = currOffset - 1;
    }

    let pseudoRand: bigint;
    if (dataIndependentAddressing) {
      if (i % common.ADDRESSES_IN_BLOCK === 0) {
        nextAddresses(addressBlock, inputBlock, zeroBlock);
      }
      pseudoRand = addressBlock.get(i % common.ADDRESSES_IN_BLOCK);
    } else {
      pseudoRand = memory.getBlock(prevOffset).get(0);
    }

    const refLane =
      pos.pass === 0 && pos.slice === 0
        ? BigInt(pos.lane)
        : (pseudoRand >> BigInt(32)) % BigInt(context.config.lanes);

    pos.index = i;
    const pseudoRandU32 = Number(pseudoRand & MASK_32);
    const sameLane = refLane === BigInt(pos.lane);
    const refIndex = indexAlpha(context, pos, pseudoRandU32, sameLane);

    const index = Number(
      BigInt(context.laneLength) * refLane + BigInt(refIndex),
    );

    const prevBlock = memory.getBlock(prevOffset);
    const refBlock = memory.getBlock(index);
    const currBlock = memory.getBlock(currOffset).clone();

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

/**
 * Write a 32-bit unsigned integer in little-endian format.
 */
function setU32Le(array: Uint8Array, offset: number, value: number): void {
  array[offset] = value & 0xff;
  array[offset + 1] = (value >> 8) & 0xff;
  array[offset + 2] = (value >> 16) & 0xff;
  array[offset + 3] = (value >> 24) & 0xff;
}

/**
 * Convert a 32-bit unsigned integer to little-endian byte array.
 */
function u32ToLe(value: number): Uint8Array {
  const result = new Uint8Array(4);
  setU32Le(result, 0, value);
  return result;
}

export function g(
  a: bigint,
  b: bigint,
  c: bigint,
  d: bigint,
): [bigint, bigint, bigint, bigint] {
  a = fBlaMka(a, b);
  d = rotr64(d ^ a, 32);
  c = fBlaMka(c, d);
  b = rotr64(b ^ c, 24);
  a = fBlaMka(a, b);
  d = rotr64(d ^ a, 16);
  c = fBlaMka(c, d);
  b = rotr64(b ^ c, 63);

  return [a, b, c, d];
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
    context.config.ad,
  ];

  // Hash the combined input
  localBlake2b(h0.subarray(0, common.PREHASH_DIGEST_LENGTH), input);

  return h0;
}

/**
 * The H' function as defined in the Argon2 paper.
 */
function hprime(out: Uint8Array, input: Uint8Array): void {
  const outLen = out.length;

  if (outLen <= common.BLAKE2B_OUT_LENGTH) {
    const outLenBytes = u32ToLe(outLen);
    localBlake2b(out, [outLenBytes, input]);
  } else {
    const aiLen = 32;
    let outBuffer = new Uint8Array(common.BLAKE2B_OUT_LENGTH);
    let inBuffer = new Uint8Array(common.BLAKE2B_OUT_LENGTH);

    // Initial hash with the length
    const outLenBytes = u32ToLe(outLen);
    localBlake2b(outBuffer, [outLenBytes, input]);

    // Copy first block to output
    out.set(outBuffer.subarray(0, aiLen), 0);

    let outPos = aiLen;
    let toProduce = outLen - aiLen;

    while (toProduce > common.BLAKE2B_OUT_LENGTH) {
      inBuffer.set(outBuffer);
      localBlake2b(outBuffer, [inBuffer]);
      out.set(outBuffer.subarray(0, aiLen), outPos);
      outPos += aiLen;
      toProduce -= aiLen;
    }

    localBlake2b(out.subarray(outPos, outLen), [outBuffer]);
  }
}

export function indexAlpha(
  context: Context,
  position: Position,
  pseudoRand: number,
  sameLane: boolean,
): number {
  let referenceAreaSize: number;

  if (position.pass === 0) {
    if (position.slice === 0) {
      referenceAreaSize = position.index - 1;
    } else if (sameLane) {
      referenceAreaSize =
        position.slice * context.segmentLength + position.index - 1;
    } else if (position.index === 0) {
      referenceAreaSize = position.slice * context.segmentLength - 1;
    } else {
      referenceAreaSize = position.slice * context.segmentLength;
    }
  } else {
    if (sameLane) {
      referenceAreaSize =
        context.laneLength - context.segmentLength + position.index - 1;
    } else if (position.index === 0) {
      referenceAreaSize = context.laneLength - context.segmentLength - 1;
    } else {
      referenceAreaSize = context.laneLength - context.segmentLength;
    }
  }

  const refAreaSizeU64 = BigInt(Math.max(1, referenceAreaSize));
  let pseudoRandU64 = BigInt(pseudoRand) & BigInt(0xffffffff);

  pseudoRandU64 =
    ((pseudoRandU64 * pseudoRandU64) & common.MASK_64) >> BigInt(32);
  const relativePosition = Number(
    refAreaSizeU64 -
      BigInt(1) -
      ((refAreaSizeU64 * pseudoRandU64) >> BigInt(32)),
  );

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

export function nextAddresses(
  addressBlock: Block,
  inputBlock: Block,
  zeroBlock: Block,
): void {
  inputBlock.set(6, inputBlock.get(6) + BigInt(1));
  fillBlock(zeroBlock, inputBlock, addressBlock, false);
  const tempBlock = addressBlock.clone();
  fillBlock(zeroBlock, tempBlock, addressBlock, false);
}

export function p(v: bigint[]): void {
  let v0 = v[0],
    v1 = v[1],
    v2 = v[2],
    v3 = v[3];
  let v4 = v[4],
    v5 = v[5],
    v6 = v[6],
    v7 = v[7];
  let v8 = v[8],
    v9 = v[9],
    v10 = v[10],
    v11 = v[11];
  let v12 = v[12],
    v13 = v[13],
    v14 = v[14],
    v15 = v[15];

  [v0, v4, v8, v12] = g(v0, v4, v8, v12);
  [v1, v5, v9, v13] = g(v1, v5, v9, v13);
  [v2, v6, v10, v14] = g(v2, v6, v10, v14);
  [v3, v7, v11, v15] = g(v3, v7, v11, v15);

  [v0, v5, v10, v15] = g(v0, v5, v10, v15);
  [v1, v6, v11, v12] = g(v1, v6, v11, v12);
  [v2, v7, v8, v13] = g(v2, v7, v8, v13);
  [v3, v4, v9, v14] = g(v3, v4, v9, v14);

  v[0] = v0;
  v[1] = v1;
  v[2] = v2;
  v[3] = v3;
  v[4] = v4;
  v[5] = v5;
  v[6] = v6;
  v[7] = v7;
  v[8] = v8;
  v[9] = v9;
  v[10] = v10;
  v[11] = v11;
  v[12] = v12;
  v[13] = v13;
  v[14] = v14;
  v[15] = v15;
}

export function rotr64(w: bigint, c: number): bigint {
  const input = w & common.MASK_64;
  return (
    ((input >> BigInt(c)) | ((input << BigInt(64 - c)) & common.MASK_64)) &
    common.MASK_64
  );
}
