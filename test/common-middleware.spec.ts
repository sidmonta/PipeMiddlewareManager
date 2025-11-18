import { describe, it, expect } from 'vitest'
import { throwError, stop, pushData, tap, map } from '../lib/common-middleware'
import { StopCall } from '../lib/types'

describe('common-middleware (functional)', () => {
  it('throwError throws with static message', () => {
    const mw = throwError('static')({})
    expect(() => mw('x')).toThrow('static')
  })

  it('throwError with dynamic message uses input', () => {
    const mw = throwError((a: string) => `err:${a}`)({})
    expect(() => mw('abc')).toThrow('err:abc')
  })

  it('stop throws a StopCall instance', () => {
    const mw = stop('stop now')({})
    expect(() => mw('x')).toThrow(StopCall)
    try {
      mw('x')
    } catch (e) {
      expect(e).toBeInstanceOf(StopCall)
      expect((e as Error).message).toBe('stop now')
    }
  })

  it('pushData returns provided data', async () => {
    const mw = pushData(123)({})
    const res = await Promise.resolve(mw(undefined as any))
    expect(res).toBe(123)
  })

  it('tap runs side-effect and returns the original input', async () => {
    let side = ''
    const sideEffect = async (input: number, label: string) => {
      side = `${label}:${input}`
    }
    const mw = tap(sideEffect)({})
    const out = await mw(7, 'lbl')
    expect(side).toBe('lbl:7')
    expect(out).toBe(7)
  })

  it('map transforms the input to the output', async () => {
    const mw = map((n: number) => n * 3)({})
    const out = await mw(4)
    expect(out).toBe(12)
  })
})
