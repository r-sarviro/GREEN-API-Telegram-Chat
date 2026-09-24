import { describe, expect, it } from 'vitest'
import { resolveContactTitle } from './get-contact-info'

describe('resolveContactTitle', () => {
  it('приоритет contactName → name → username → phone', () => {
    expect(
      resolveContactTitle(
        {
          chatId: '1',
          contactName: 'Василий',
          name: 'Vasya',
          username: '@vasya',
          phoneNumber: 7999,
        },
        'fallback',
      ),
    ).toBe('Василий')

    expect(
      resolveContactTitle({ chatId: '1', name: 'Vasya', username: '@vasya' }, 'fallback'),
    ).toBe('Vasya')

    expect(resolveContactTitle({ chatId: '1', username: '@vasya' }, 'fallback')).toBe(
      '@vasya',
    )

    expect(resolveContactTitle({ chatId: '1', phoneNumber: 79991234567 }, 'fallback')).toBe(
      '+79991234567',
    )
  })
})
