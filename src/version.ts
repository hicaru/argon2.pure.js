import { ErrorType } from "./error";

export enum Version {
  Version10 = 0x10,
  Version13 = 0x13,
}

export class VersionUtil {
  static asU32(version: Version): number {
    return version;
  }

  static fromStr(str: string): Version {
    switch (str) {
      case "16":
        return Version.Version10;
      case "19":
        return Version.Version13;
      default:
        throw new Error(ErrorType.DecodingFail);
    }
  }

  static fromU32(val: number): Version {
    switch (val) {
      case 0x10:
        return Version.Version10;
      case 0x13:
        return Version.Version13;
      default:
        throw new Error(ErrorType.IncorrectVersion);
    }
  }
}
