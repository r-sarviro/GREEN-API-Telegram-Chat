import { describe, expect, it } from 'vitest'
import { createChatFromPhone } from './types'

describe('createChatFromPhone', () => {
  it('создаёт чат с title из телефона', () => {
    expect(createChatFromPhone('79991234567', '79991234567@c.us')).toEqual({
      chatId: '79991234567@c.us',
      title: '+79991234567',
      phone: '79991234567',
    })
  })
})
