import { expectType, expectError } from 'tsd'
import { throwError, stop, pushData, tap, map } from '../lib/common-middleware'

// throwError infers input type and returns middleware whose handler returns never
const te1 = throwError((s: string) => `err:${s}`)
expectType<(deps: unknown) => (input: string, ...rest: unknown[]) => never>(te1)

// stop infers input type and yields never output
const teStop = stop((n: number) => `stop:${n}`)
expectType<(deps: unknown) => (input: number, ...rest: unknown[]) => never>(teStop)

// pushData infers output type from argument
const pd = pushData(42)
expectType<(deps: unknown) => (input: unknown, ...rest: unknown[]) => number>(pd)

// tap: when provided a function (input: number, tag: string) => void
// the middleware should infer In=number, Rest=[string], Out=number (returns original input)
const tTap = tap((n: number, t: string) => Promise.resolve())
expectType<(deps: unknown) => (input: number, t: string) => Promise<number>>(tTap)

// map: when function returns string, middleware handler returns string
const tMap = map((n: number) => `${n}`)
expectType<(deps: unknown) => (input: number, ...rest: unknown[]) => Promise<string>>(tMap)

// Negative test: calling map handler with wrong input type should be error
expectError(
  map((s: string) => s.toUpperCase())({})(123 as any)
)
