import { StopCall, MaybePromise, Middleware } from './types'

// A handler is a middleware already bound to deps: (input, queue) => MaybePromise<Out>
export type Handler<In = unknown, Out = unknown> = (
  input: In,
  queue: unknown[]
) => MaybePromise<Out>

const _factory = <D, In, Out, Rest extends unknown[] = unknown[]>(
  deps: D
) => (middleware: Middleware<D, In, Out, Rest>): Handler<In, Out> => {
  const handler = middleware(deps)
  return (input, queue) => handler(input, ...(queue as unknown as Rest))
}

const _pipe = async (
  param: unknown,
  ...middlewares: Array<Handler<unknown, unknown>>
): Promise<unknown> => {
  const queue: unknown[] = []
  let current: unknown = param
  for (const mid of middlewares) {
    queue.push(current)
    current = await mid(current, queue)
  }
  return current
}

export function pipe<D = unknown>(deps: D) {
  return async (...middlewaresOrFirstParam: Array<any>) => {
    const first = middlewaresOrFirstParam.shift()
    if (typeof first === 'function') {
      // called as pipe(deps)(mw1, mw2, ...)
      return await pipAsMiddleware(first, ...middlewaresOrFirstParam)(deps)
    } else {
      try {
        const handlers = middlewaresOrFirstParam.map((mid) =>
          _factory<D, unknown, unknown>(deps)(mid)
        )
        return await _pipe(first, ...handlers)
      } catch (err) {
        if (!(err instanceof StopCall)) {
          throw err
        }
      }
    }
  }
}

export function when<D = unknown, In = unknown, Rest extends unknown[] = unknown[]>(
  condition: (...params: [In, ...Rest]) => boolean,
  middleware: Middleware<D, In, In, Rest>
): Middleware<D, In, In, Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) => {
    if (condition(...params)) {
      return await middleware(deps)(...params)
    }
    return params[0]
  }
}

export function tryCatch<D = unknown, In = unknown, Rest extends unknown[] = unknown[], R = unknown>(
  tryMiddleware: Middleware<D, In, R, Rest>,
  catchMiddleware: Middleware<D, Error, R, [Error, ...Rest]>
): Middleware<D, In, R, Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) => {
    try {
      return await tryMiddleware(deps)(...params)
    } catch (error) {
      return await catchMiddleware(deps)(error as Error, ...params)
    }
  }
}

export function doLoop<D = unknown, In = unknown, Rest extends unknown[] = unknown[]>(
  condition: (param: In, index: number, ...rest: Rest) => boolean,
  middleware: Middleware<D, In, In, Rest>
): Middleware<D, In, In, Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) => {
    let index = 0
    const [first, ...rest] = params
    let tmp: In = first
    do {
      tmp = (await middleware(deps)(tmp, ...(rest as Rest))) as In
    } while (condition(tmp, index++, ...(rest as Rest)))
    return tmp
  }
}

export function loop<D = unknown, In = unknown, Rest extends unknown[] = unknown[]>(
  condition: (param: In, index: number, ...rest: Rest) => boolean,
  middleware: Middleware<D, In, In, Rest>
): Middleware<D, In, In, Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) => {
    let index = 0
    const [first, ...rest] = params
    let tmp: In = first
    while (condition(tmp, index++, ...(rest as Rest))) {
      tmp = (await middleware(deps)(tmp, ...(rest as Rest))) as In
    }
    return tmp
  }
}

export function ifElse<D = unknown, In = unknown, Rest extends unknown[] = unknown[], R = unknown>(
  condition: (...params: [In, ...Rest]) => boolean,
  ifMiddleware: Middleware<D, In, R, Rest>,
  elseMiddleware: Middleware<D, In, R, Rest>
): Middleware<D, In, R, Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) =>
    condition(...params)
      ? await ifMiddleware(deps)(...params)
      : await elseMiddleware(deps)(...params)
}

export function concurrency<D = unknown, In = unknown, Rest extends unknown[] = unknown[], R = unknown>(
  ...middlewares: Array<Middleware<D, In, R, Rest>>
): Middleware<D, In, Array<R | false>, Rest> {
  return (deps: D) => async (...param: [In, ...Rest]) => {
    const result = await Promise.allSettled(
      middlewares.map((mid) => mid(deps)(...param))
    )
    const toReturn: Array<R | false> = []
    for (const res of result) {
      if (res.status === 'rejected' && !(res.reason instanceof StopCall)) {
        throw res.reason
      }
      toReturn.push((res as PromiseFulfilledResult<R>).value || false)
    }
    return toReturn
  }
}

export function ask<T = unknown, D = unknown, In = unknown, Rest extends unknown[] = unknown[]>(
  index: number
): Middleware<D, In, T | undefined, Rest> {
  return () => (param: In, queue?: unknown[]) => (queue ? (queue[index] as T | undefined) : undefined)
}

export function pipAsMiddleware<D = unknown>(
  ...middlewares: Array<Middleware<D, unknown, unknown, unknown[]>>
): Middleware<D, unknown, unknown, unknown[]> {
  return (deps: D) => async (param: unknown) => {
    return await pipe(deps)(param, ...middlewares)
  }
}

export function merge<D = unknown, In = unknown, Rest extends unknown[] = unknown[], R = unknown>(
  ...middlewares: Array<Middleware<D, In, R, Rest>>
): Middleware<D, In, R[], Rest> {
  return (deps: D) => async (...params: [In, ...Rest]) => {
    const list: R[] = []
    for (const middleware of middlewares) {
      list.push((await middleware(deps)(...params)) as R)
    }
    return list
  }
}

export function flow<D = unknown, In = unknown, R = unknown>(
  ...middlewares: Array<Middleware<D, In, R, unknown[]>>
) {
  return (overrideDeps: D) => async (firstParam: In) =>
    await pipe(overrideDeps)(...[firstParam, ...middlewares])
}

export function asMiddleware<In = unknown, Out = unknown, Rest extends unknown[] = unknown[]>(
  funct: (...args: [In, ...Rest]) => MaybePromise<Out>
): Middleware<unknown, In, Out, Rest> {
  return () => funct
}

export * as commonMiddleware from './common-middleware'