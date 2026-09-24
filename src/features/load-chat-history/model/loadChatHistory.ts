import { getChatHistory } from '@/shared/api'
import type { GreenApiCredentials } from '@/shared/api'
import {
  normalizeMessageStatus,
  useMessageStore,
  type Message,
} from '@/entities/message'

export function mapHistoryToMessages(
  chatId: string,
  items: Awaited<ReturnType<typeof getChatHistory>>,
): Message[] {
  return items
    .filter((item) => item.typeMessage === 'textMessage' && item.textMessage)
    .map((item) => ({
      id: item.idMessage,
      chatId: item.chatId || chatId,
      text: item.textMessage ?? '',
      direction: item.type === 'outgoing' ? 'outgoing' : 'incoming',
      timestamp: item.timestamp,
      status:
        item.type === 'outgoing'
          ? (normalizeMessageStatus(item.statusMessage) ?? 'sent')
          : undefined,
    }))
}

export async function loadChatHistory(
  credentials: GreenApiCredentials,
  chatId: string,
  count = 50,
) {
  const messageStore = useMessageStore.getState()
  if (messageStore.isHistoryLoaded(chatId)) return

  const items = await getChatHistory(credentials, chatId, count)
  const messages = mapHistoryToMessages(chatId, items)
  messageStore.mergeMessages(chatId, messages)
  messageStore.markHistoryLoaded(chatId)
}
