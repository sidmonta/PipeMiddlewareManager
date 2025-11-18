import { StopCall, MaybePromise, Middleware } from './types'

const generateMessage = (
  message: string | ((...args: unknown[]) => string),
  params: unknown[]
): string => (typeof message === 'function' ? (message as (...args: unknown[]) => string)(...params) : message)

export function throwError<In = unknown, Rest extends unknown[] = unknown[]>(
  errorMessage: string | ((...args: [In, ...Rest]) => string)
): Middleware<unknown, In, never, Rest> {
  return () => (...params: [In, ...Rest]) => {
    throw new Error(generateMessage(errorMessage, params))
  }
}

export function stop<In = unknown, Rest extends unknown[] = unknown[]>(
  stopMessage: string | ((...args: [In, ...Rest]) => string)
): Middleware<unknown, In, never, Rest> {
  return () => (...params: [In, ...Rest]) => {
    throw new StopCall(generateMessage(stopMessage, params))
  }
}

export function pushData<T>(data: T): Middleware<unknown, unknown, T, unknown[]> {
  return () => () => data
}

export function tap<In = unknown, Rest extends unknown[] = unknown[]>(
  fun: (...args: [In, ...Rest]) => MaybePromise<unknown>
): Middleware<unknown, In, In, Rest> {
  return () => async (...params: [In, ...Rest]) => {
    await fun(...params)
    return params[0]
  }
}

export function map<In = unknown, Out = unknown, Rest extends unknown[] = unknown[]>(
  fun: (...args: [In, ...Rest]) => MaybePromise<Out>
): Middleware<unknown, In, Out, Rest> {
  return () => async (...params: [In, ...Rest]) => await fun(...params)
}