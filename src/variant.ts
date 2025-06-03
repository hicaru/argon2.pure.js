import { ErrorType } from "./error";

export enum Variant {
  Argon2d = 0,
  Argon2i = 1,
  Argon2id = 2,
}

export class VariantUtil {
  static asLowercaseStr(variant: Variant): string {
    switch (variant) {
      case Variant.Argon2d:
        return "argon2d";
      case Variant.Argon2i:
        return "argon2i";
      case Variant.Argon2id:
        return "argon2id";
    }
  }

  static asU32(variant: Variant): number {
    return variant;
  }

  static asU64(variant: Variant): number {
    return variant;
  }

  static asUppercaseStr(variant: Variant): string {
    switch (variant) {
      case Variant.Argon2d:
        return "Argon2d";
      case Variant.Argon2i:
        return "Argon2i";
      case Variant.Argon2id:
        return "Argon2id";
    }
  }

  static fromStr(str: string): Variant {
    switch (str) {
      case "Argon2d":
      case "argon2d":
        return Variant.Argon2d;
      case "Argon2i":
      case "argon2i":
        return Variant.Argon2i;
      case "Argon2id":
      case "argon2id":
        return Variant.Argon2id;
      default:
        throw new Error(ErrorType.DecodingFail);
    }
  }

  static fromU32(val: number): Variant {
    switch (val) {
      case 0:
        return Variant.Argon2d;
      case 1:
        return Variant.Argon2i;
      case 2:
        return Variant.Argon2id;
      default:
        throw new Error(ErrorType.IncorrectType);
    }
  }
}
