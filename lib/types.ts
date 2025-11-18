export class StopCall extends Error {}

export type MaybePromise<T> = T | Promise<T>

export type Middleware<D = any, In = any, Out = any> = (deps: D) => (input: In, ...rest: any[]) => MaybePromise<Out>

export type AnyMiddleware = Middleware<any, any, any>