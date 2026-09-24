import { greenApiRequest, type GreenApiCredentials } from './http'

export interface RemoteChat {
  chatId: string
  name?: string
  type?: string
  phoneNumber?: number
  username?: string
}

export async function getChats(creds: GreenApiCredentials): Promise<RemoteChat[]> {
  const result = await greenApiRequest<RemoteChat[]>(creds, 'getChats', {
    httpMethod: 'GET',
  })
  return Array.isArray(result) ? result : []
}
