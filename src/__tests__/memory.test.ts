import { describe, it, expect } from "vitest";
import { Memory } from "../memory";
import { Block } from "../block";

describe("Memory", () => {
  it("new returns correct instance", () => {
    const lanes = 4;
    const laneLength = 128;
    const memory = new Memory(lanes, laneLength);

    const block = memory.getBlock(0);
    expect(block instanceof Block).toBe(true);

    const block1 = memory.getBlock(1);
    expect(block1 instanceof Block).toBe(true);

    const newBlock = Block.zero();
    memory.setBlock(2, newBlock);
    const retrievedBlock = memory.getBlock(2);
    expect(retrievedBlock.equals(newBlock)).toBe(true);

    const block3 = memory.getBlockByLaneAndOffset(0, 3);
    expect(block3 instanceof Block).toBe(true);

    const newBlock2 = Block.zero();
    memory.setBlockByLaneAndOffset(1, 2, newBlock2);
    const retrievedBlock2 = memory.getBlockByLaneAndOffset(1, 2);
    expect(retrievedBlock2.equals(newBlock2)).toBe(true);
  });
});
