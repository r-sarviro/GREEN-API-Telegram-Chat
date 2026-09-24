import { describe, expect, it } from 'vitest'
import {
  extractTextFromWebhook,
  messageFromIncomingWebhook,
  normalizeMessageStatus,
  shouldUpgradeStatus,
  type IncomingWebhookLike,
} from './types'

const baseWebhook: IncomingWebhookLike = {
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1588091580,
  idMessage: '1769676078000',
  senderData: {
    chatId: '10000000',
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: {
      textMessage: 'Привет!',
    },
  },
}

describe('extractTextFromWebhook', () => {
  it('извлекает textMessage', () => {
    expect(extractTextFromWebhook(baseWebhook)).toBe('Привет!')
  })

  it('извлекает extendedTextMessage', () => {
    expect(
      extractTextFromWebhook({
        ...baseWebhook,
        messageData: {
          typeMessage: 'extendedTextMessage',
          extendedTextMessageData: { text: 'Ссылка' },
        },
      }),
    ).toBe('Ссылка')
  })

  it('возвращает null для нетекстовых типов', () => {
    expect(
      extractTextFromWebhook({
        ...baseWebhook,
        messageData: { typeMessage: 'imageMessage' },
      }),
    ).toBeNull()
  })
})

describe('messageFromIncomingWebhook', () => {
  it('маппит входящее текстовое сообщение', () => {
    expect(messageFromIncomingWebhook(baseWebhook)).toEqual({
      id: '1769676078000',
      chatId: '10000000',
      text: 'Привет!',
      direction: 'incoming',
      timestamp: 1588091580,
    })
  })

  it('игнорирует другие typeWebhook', () => {
    expect(
      messageFromIncomingWebhook({
        ...baseWebhook,
        typeWebhook: 'outgoingMessageStatus',
      }),
    ).toBeNull()
  })
})

describe('normalizeMessageStatus', () => {
  it('нормализует статусы и noAccount → failed', () => {
    expect(normalizeMessageStatus('delivered')).toBe('delivered')
    expect(normalizeMessageStatus('noAccount')).toBe('failed')
    expect(normalizeMessageStatus('unknown')).toBeNull()
  })
})

describe('shouldUpgradeStatus', () => {
  it('не понижает статус; failed всегда применяется с ненулевого', () => {
    expect(shouldUpgradeStatus('read', 'delivered')).toBe(false)
    expect(shouldUpgradeStatus('sent', 'read')).toBe(true)
    expect(shouldUpgradeStatus('read', 'failed')).toBe(true)
    expect(shouldUpgradeStatus('failed', 'sent')).toBe(false)
  })
})
