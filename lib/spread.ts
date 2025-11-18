import { MaybePromise } from './types'

export function queueToRest<Rest extends unknown[]>(queue: unknown[]): Rest {
  return queue as unknown as Rest
}

export function callHandlerWithQueue<In, Out, Rest extends unknown[]>(
  handler: (input: In, ...rest: Rest) => MaybePromise<Out>,
  input: In,
  queue: unknown[]
): MaybePromise<Out> {
  return handler(input, ...(queueToRest<Rest>(queue)))
}