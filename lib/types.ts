export class StopCall extends Error {}

export type MaybePromise<T> = T | Promise<T>

export type Fn<Args extends unknown[] = unknown[], R = unknown> = (...args: Args) => R

export type Middleware<D = unknown, In = unknown, Out = unknown, Rest extends unknown[] = unknown[]> = (deps: D) => (input: In, ...rest: Rest) => MaybePromise<Out>

export type AnyMiddleware = Middleware<unknown, unknown, unknown, unknown[]>
