import { Block } from "./block";

export class Memory {
  private rows: number;
  private cols: number;
  private blocks: Block[];

  constructor(lanes: number, laneLength: number) {
    this.rows = lanes;
    this.cols = laneLength;
    this.blocks = new Array(this.rows * this.cols);

    for (let i = 0; i < this.rows * this.cols; i++) {
      this.blocks[i] = Block.zero();
    }
  }

  getBlock(index: number): Block {
    return this.blocks[index];
  }

  setBlock(index: number, block: Block): void {
    this.blocks[index] = block;
  }

  getBlockByLaneAndOffset(lane: number, offset: number): Block {
    const index = lane * this.cols + offset;
    return this.blocks[index];
  }

  setBlockByLaneAndOffset(lane: number, offset: number, block: Block): void {
    const index = lane * this.cols + offset;
    this.blocks[index] = block;
  }
}
