import { ErrorType } from './error';

export type Result<T> = { ok: true, value: T } | { ok: false, error: ErrorType };

export function Ok<T>(value: T): Result<T> {
    return { ok: true, value };
}

export function Err<T>(error: ErrorType): Result<T> {
    return { ok: false, error };
}
