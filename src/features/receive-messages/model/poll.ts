import type { GreenApiCredentials, NotificationBody } from '@/shared/api'
import { deleteNotification, receiveNotification } from '@/shared/api'
import { RECEIVE_TIMEOUT_SEC } from '@/shared/config'
import {
  messageFromIncomingWebhook,
  normalizeMessageStatus,
  type Message,
  type MessageStatus,
} from '@/entities/message'

export interface ProcessResult {
  message: Message | null
  statusUpdate: { idMessage: string; status: MessageStatus } | null
  phoneDigits?: string
  chatName?: string
}

export function processNotificationBody(body: NotificationBody): ProcessResult {
  if (body.typeWebhook === 'outgoingMessageStatus') {
    const status = normalizeMessageStatus(body.status)
    if (body.idMessage && status) {
      return {
        message: null,
        statusUpdate: { idMessage: body.idMessage, status },
      }
    }
    return { message: null, statusUpdate: null }
  }

  const message = messageFromIncomingWebhook(body)
  const phoneDigits =
    body.senderData?.senderPhoneNumber !== undefined
      ? String(body.senderData.senderPhoneNumber)
      : undefined

  return {
    message,
    statusUpdate: null,
    phoneDigits,
    chatName: body.senderData?.chatName ?? body.senderData?.senderName,
  }
}

export async function pollOnce(creds: GreenApiCredentials): Promise<ProcessResult | null> {
  const notification = await receiveNotification(creds, RECEIVE_TIMEOUT_SEC)

  if (!notification) {
    return null
  }

  try {
    return processNotificationBody(notification.body)
  } finally {
    await deleteNotification(creds, notification.receiptId)
  }
}
