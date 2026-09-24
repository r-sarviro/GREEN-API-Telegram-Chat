import { describe, expect, it } from 'vitest'
import { processNotificationBody } from './poll'
import type { NotificationBody } from '@/shared/api'

describe('processNotificationBody', () => {
  it('возвращает сообщение и phoneDigits для входящего текста', () => {
    const body: NotificationBody = {
      typeWebhook: 'incomingMessageReceived',
      timestamp: 100,
      idMessage: 'id-1',
      senderData: {
        chatId: '10000000',
        senderPhoneNumber: 79991234567,
        chatName: 'Vasya',
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: 'Ответ' },
      },
    }

    const result = processNotificationBody(body)

    expect(result.message).toEqual({
      id: 'id-1',
      chatId: '10000000',
      text: 'Ответ',
      direction: 'incoming',
      timestamp: 100,
    })
    expect(result.phoneDigits).toBe('79991234567')
    expect(result.chatName).toBe('Vasya')
    expect(result.statusUpdate).toBeNull()
  })

  it('возвращает message: null для нетекстовых уведомлений', () => {
    const body: NotificationBody = {
      typeWebhook: 'incomingMessageReceived',
      timestamp: 100,
      idMessage: 'id-2',
      senderData: { chatId: '10000000' },
      messageData: { typeMessage: 'imageMessage' },
    }

    expect(processNotificationBody(body).message).toBeNull()
  })

  it('парсит outgoingMessageStatus', () => {
    const body: NotificationBody = {
      typeWebhook: 'outgoingMessageStatus',
      timestamp: 100,
      idMessage: 'msg-42',
      chatId: '10000000',
      status: 'read',
    }

    expect(processNotificationBody(body)).toEqual({
      message: null,
      statusUpdate: { idMessage: 'msg-42', status: 'read' },
    })
  })

  it('мапит noAccount в failed', () => {
    const body: NotificationBody = {
      typeWebhook: 'outgoingMessageStatus',
      timestamp: 100,
      idMessage: 'msg-43',
      status: 'noAccount',
    }

    expect(processNotificationBody(body).statusUpdate).toEqual({
      idMessage: 'msg-43',
      status: 'failed',
    })
  })
})
