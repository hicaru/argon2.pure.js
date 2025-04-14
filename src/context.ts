import * as common from './common';
import { Config } from './config';
import { ErrorType } from './error';

export class Context {
    private constructor(
        public config: Config,
        public laneLength: number,
        public memoryBlocks: number,
        public pwd: Uint8Array,
        public salt: Uint8Array,
        public segmentLength: number
    ) {}

    static new(config: Config, pwd: Uint8Array, salt: Uint8Array): Context {
        if (config.lanes < common.MIN_LANES) {
            throw new Error(ErrorType.LanesTooFew);
        } else if (config.lanes > common.MAX_LANES) {
            throw new Error(ErrorType.LanesTooMany);
        }

        const lanes = config.lanes;
        if (config.memCost < common.MIN_MEMORY) {
            throw new Error(ErrorType.MemoryTooLittle);
        } else if (config.memCost > common.MAX_MEMORY) {
            throw new Error(ErrorType.MemoryTooMuch);
        } else if (config.memCost < 8 * lanes) {
            throw new Error(ErrorType.MemoryTooLittle);
        }

        if (config.timeCost < common.MIN_TIME) {
            throw new Error(ErrorType.TimeTooSmall);
        } else if (config.timeCost > common.MAX_TIME) {
            throw new Error(ErrorType.TimeTooLarge);
        }

        const pwdLen = pwd.length;
        if (pwdLen < common.MIN_PWD_LENGTH) {
            throw new Error(ErrorType.PwdTooShort);
        } else if (pwdLen > common.MAX_PWD_LENGTH) {
            throw new Error(ErrorType.PwdTooLong);
        }

        const saltLen = salt.length;
        if (saltLen < common.MIN_SALT_LENGTH) {
            throw new Error(ErrorType.SaltTooShort);
        } else if (saltLen > common.MAX_SALT_LENGTH) {
            throw new Error(ErrorType.SaltTooLong);
        }

        const secretLen = config.secret.length;
        if (secretLen < common.MIN_SECRET_LENGTH) {
            throw new Error(ErrorType.SecretTooShort);
        } else if (secretLen > common.MAX_SECRET_LENGTH) {
            throw new Error(ErrorType.SecretTooLong);
        }

        const adLen = config.ad.length;
        if (adLen < common.MIN_AD_LENGTH) {
            throw new Error(ErrorType.AdTooShort);
        } else if (adLen > common.MAX_AD_LENGTH) {
            throw new Error(ErrorType.AdTooLong);
        }

        if (config.hashLength < common.MIN_HASH_LENGTH) {
            throw new Error(ErrorType.OutputTooShort);
        } else if (config.hashLength > common.MAX_HASH_LENGTH) {
            throw new Error(ErrorType.OutputTooLong);
        }

        let memoryBlocks = config.memCost;
        if (memoryBlocks < 2 * common.SYNC_POINTS * lanes) {
            memoryBlocks = 2 * common.SYNC_POINTS * lanes;
        }

        const segmentLength = Math.floor(memoryBlocks / (lanes * common.SYNC_POINTS));
        memoryBlocks = segmentLength * (lanes * common.SYNC_POINTS);
        const laneLength = segmentLength * common.SYNC_POINTS;

        return new Context(
            config.clone(),
            laneLength,
            memoryBlocks,
            pwd,
            salt,
            segmentLength
        );
    }
}
