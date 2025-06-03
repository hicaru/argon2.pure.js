import { Variant } from "./variant";
import { Version } from "./version";

export class Decoded {
  constructor(
    public variant: Variant,
    public version: Version,
    public memCost: number,
    public timeCost: number,
    public parallelism: number,
    public salt: Uint8Array,
    public hash: Uint8Array,
  ) {}
}
