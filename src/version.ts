import { ErrorType } from './error';
import { Result, Ok, Err } from './result';

export enum Version {
    Version10 = 0x10,
    Version13 = 0x13
}

export class VersionUtil {
    static asU32(version: Version): number {
        return version;
    }

    static fromStr(str: string): Result<Version> {
        switch (str) {
            case "16": return Ok(Version.Version10);
            case "19": return Ok(Version.Version13);
            default: return Err(ErrorType.DecodingFail);
        }
    }

    static fromU32(val: number): Result<Version> {
        switch (val) {
            case 0x10: return Ok(Version.Version10);
            case 0x13: return Ok(Version.Version13);
            default: return Err(ErrorType.IncorrectVersion);
        }
    }
}
