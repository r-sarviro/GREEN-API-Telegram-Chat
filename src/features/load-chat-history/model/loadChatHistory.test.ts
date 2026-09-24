import { describe, expect, it } from 'vitest'
import { mapHistoryToMessages } from './loadChatHistory'
import type { ChatHistoryItem } from '@/shared/api'

describe('mapHistoryToMessages', () => {
  it('мапит только текстовые сообщения и статусы исходящих', () => {
    const items: ChatHistoryItem[] = [
      {
        type: 'outgoing',
        idMessage: '1',
        timestamp: 10,
        typeMessage: 'textMessage',
        chatId: '100',
        textMessage: 'Hi',
        statusMessage: 'delivered',
      },
      {
        type: 'incoming',
        idMessage: '2',
        timestamp: 20,
        typeMessage: 'imageMessage',
        chatId: '100',
      },
      {
        type: 'incoming',
        idMessage: '3',
        timestamp: 30,
        typeMessage: 'textMessage',
        chatId: '100',
        textMessage: 'Hello',
      },
    ]

    expect(mapHistoryToMessages('100', items)).toEqual([
      {
        id: '1',
        chatId: '100',
        text: 'Hi',
        direction: 'outgoing',
        timestamp: 10,
        status: 'delivered',
      },
      {
        id: '3',
        chatId: '100',
        text: 'Hello',
        direction: 'incoming',
        timestamp: 30,
        status: undefined,
      },
    ])
  })
})
