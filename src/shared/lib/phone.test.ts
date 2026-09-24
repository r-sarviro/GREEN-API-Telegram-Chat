import { describe, expect, it } from 'vitest'
import { phoneToChatId, formatChatTitle } from './phone'

describe('phoneToChatId', () => {
  it('нормализует номер в формат chatId', () => {
    expect(phoneToChatId('+7 (999) 123-45-67')).toBe('79991234567@c.us')
  })

  it('принимает уже очищенный номер', () => {
    expect(phoneToChatId('79991234567')).toBe('79991234567@c.us')
  })

  it('бросает ошибку для слишком короткого номера', () => {
    expect(() => phoneToChatId('123')).toThrow('Номер телефона слишком короткий')
  })
})

describe('formatChatTitle', () => {
  it('использует phone если передан', () => {
    expect(formatChatTitle('1@c.us', '+7999')).toBe('+7999')
  })

  it('форматирует chatId с @c.us', () => {
    expect(formatChatTitle('79991234567@c.us')).toBe('+79991234567')
  })
})
