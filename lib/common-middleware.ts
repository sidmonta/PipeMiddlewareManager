const generateMessage = (
  message: string | ((...args: any[]) => string),
  params: any[]
): string =>
  typeof message === "function" ? message(...params) : message

export function throwError(errorMessage: string | ((...args: any[]) => string)) {
  return () => (...params) => {
    throw new Error(generateMessage(errorMessage, params))
  }
}

export function stop(stopMessage) {
  return () => (...params) => {
    throw new StopCall(generateMessage(stopMessage, params))
  }
}
}

export function pushData(data) {
  return () => () => data
}

export function tap(fun) {
  return (deps) => async (...params) => {
    await fun(...params)
    return params[0]
  }
}

export function map(fun) {
  return (deps) => async (...params) => await fun(...params)
}