export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  chatId: string
  text: string
  direction: MessageDirection
  timestamp: number
  status?: MessageStatus
}

export interface IncomingWebhookLike {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  chatId?: string
  status?: string
  senderData?: {
    chatId: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
    extendedTextMessageData?: {
      text: string
    }
  }
}

const STATUS_RANK: Record<MessageStatus, number> = {
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
}

export function normalizeMessageStatus(raw?: string): MessageStatus | null {
  if (!raw) return null
  if (raw === 'noAccount') return 'failed'
  if (
    raw === 'pending' ||
    raw === 'sent' ||
    raw === 'delivered' ||
    raw === 'read' ||
    raw === 'failed'
  ) {
    return raw
  }
  return null
}

export function shouldUpgradeStatus(
  current: MessageStatus | undefined,
  next: MessageStatus,
): boolean {
  if (!current) return true
  if (next === 'failed') return true
  if (current === 'failed') return false
  return STATUS_RANK[next] >= STATUS_RANK[current]
}

export function extractTextFromWebhook(body: IncomingWebhookLike): string | null {
  const data = body.messageData
  if (!data) return null

  if (data.typeMessage === 'textMessage' && data.textMessageData?.textMessage) {
    return data.textMessageData.textMessage
  }

  if (
    data.typeMessage === 'extendedTextMessage' &&
    data.extendedTextMessageData?.text
  ) {
    return data.extendedTextMessageData.text
  }

  return null
}

export function messageFromIncomingWebhook(body: IncomingWebhookLike): Message | null {
  if (body.typeWebhook !== 'incomingMessageReceived') {
    return null
  }

  const text = extractTextFromWebhook(body)
  const chatId = body.senderData?.chatId
  const idMessage = body.idMessage

  if (!text || !chatId || !idMessage) {
    return null
  }

  return {
    id: idMessage,
    chatId,
    text,
    direction: 'incoming',
    timestamp: body.timestamp,
  }
}

export function createOutgoingMessage(
  chatId: string,
  text: string,
  idMessage: string,
  status: MessageStatus = 'sent',
): Message {
  return {
    id: idMessage,
    chatId,
    text,
    direction: 'outgoing',
    timestamp: Math.floor(Date.now() / 1000),
    status,
  }
}
