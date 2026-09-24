import { greenApiRequest, type GreenApiCredentials } from './http'

export interface GetAvatarResponse {
  urlAvatar: string
}

export async function getAvatar(
  creds: GreenApiCredentials,
  chatId: string,
): Promise<string | null> {
  const response = await greenApiRequest<GetAvatarResponse>(creds, 'getAvatar', {
    httpMethod: 'POST',
    body: { chatId },
  })

  const url = response?.urlAvatar?.trim()
  return url ? url : null
}
