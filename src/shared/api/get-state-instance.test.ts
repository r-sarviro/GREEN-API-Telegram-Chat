import { describe, expect, it } from 'vitest'
import { resolveLoginGate } from './get-state-instance'

describe('resolveLoginGate', () => {
  it('пускает только authorized', () => {
    expect(resolveLoginGate('authorized')).toEqual({ ok: true })
  })

  it('блокирует notAuthorized с подсказкой про QR', () => {
    const result = resolveLoginGate('notAuthorized')
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/QR/i)
  })

  it('блокирует прочие статусы', () => {
    expect(resolveLoginGate('blocked').ok).toBe(false)
    expect(resolveLoginGate('starting').ok).toBe(false)
    expect(resolveLoginGate('unknown').message).toMatch(/unknown/)
  })
})
