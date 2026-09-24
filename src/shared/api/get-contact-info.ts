import { greenApiRequest, type GreenApiCredentials } from './http'

export interface ContactInfo {
  avatar?: string
  name?: string
  contactName?: string
  chatId: string
  chatType?: string
  phoneNumber?: number
  username?: string
  description?: string
}

export async function getContactInfo(
  creds: GreenApiCredentials,
  chatId: string,
): Promise<ContactInfo> {
  return greenApiRequest<ContactInfo>(creds, 'getContactInfo', {
    httpMethod: 'POST',
    body: { chatId },
  })
}

export function resolveContactTitle(info: ContactInfo, fallback: string): string {
  if (info.contactName?.trim()) return info.contactName.trim()
  if (info.name?.trim()) return info.name.trim()
  if (info.username?.trim()) return info.username.trim()
  if (info.phoneNumber && info.phoneNumber > 0) return `+${info.phoneNumber}`
  return fallback
}
