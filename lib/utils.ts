export function isFulfilled<T>(res: PromiseSettledResult<T>): res is PromiseFulfilledResult<T> {
  return res.status === 'fulfilled'
}

export function isRejected<T>(res: PromiseSettledResult<T>): res is PromiseRejectedResult {
  return res.status === 'rejected'
}

export function settledValueOrFalse<T>(res: PromiseSettledResult<T>): T | false {
  return isFulfilled(res) ? res.value : false
}