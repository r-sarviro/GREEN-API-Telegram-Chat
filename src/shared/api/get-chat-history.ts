import { greenApiRequest, type GreenApiCredentials } from './http'

export interface ChatHistoryItem {
  type: 'incoming' | 'outgoing'
  idMessage: string
  timestamp: number
  typeMessage: string
  chatId: string
  textMessage?: string
  statusMessage?: string
  senderName?: string
  senderContactName?: string
}

export async function getChatHistory(
  creds: GreenApiCredentials,
  chatId: string,
  count = 50,
): Promise<ChatHistoryItem[]> {
  const result = await greenApiRequest<ChatHistoryItem[]>(creds, 'getChatHistory', {
    httpMethod: 'POST',
    body: { chatId, count },
  })
  return Array.isArray(result) ? result : []
}
