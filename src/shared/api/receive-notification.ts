import { greenApiRequest, type GreenApiCredentials } from './http'

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  chatId?: string
  status?: string
  description?: string
  senderData?: {
    chatId: string
    sender?: string
    chatName?: string
    senderName?: string
    senderPhoneNumber?: number
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

export interface ReceiveNotificationResponse {
  receiptId: number
  body: NotificationBody
}

export async function receiveNotification(
  creds: GreenApiCredentials,
  receiveTimeout = 5,
): Promise<ReceiveNotificationResponse | null> {
  return greenApiRequest<ReceiveNotificationResponse | null>(
    creds,
    'receiveNotification',
    {
      httpMethod: 'GET',
      query: { receiveTimeout },
    },
  )
}

export interface DeleteNotificationResponse {
  result: boolean
}

export async function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number,
): Promise<DeleteNotificationResponse> {
  return greenApiRequest<DeleteNotificationResponse>(creds, 'deleteNotification', {
    httpMethod: 'DELETE',
    suffix: `/${receiptId}`,
  })
}
