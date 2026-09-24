import { greenApiRequest, type GreenApiCredentials } from './http'

export interface SendMessageResponse {
  idMessage: string
}

export async function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  return greenApiRequest<SendMessageResponse>(creds, 'sendMessage', {
    httpMethod: 'POST',
    body: { chatId, message },
  })
}
