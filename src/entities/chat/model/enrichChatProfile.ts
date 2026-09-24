import { getAvatar, getContactInfo, resolveContactTitle } from '@/shared/api'
import type { GreenApiCredentials } from '@/shared/api'
import { useChatStore } from './store'

export async function enrichChatProfile(
  credentials: GreenApiCredentials,
  chatId: string,
  fallbackTitle: string,
) {
  const chatStore = useChatStore.getState()

  try {
    const info = await getContactInfo(credentials, chatId)
    const title = resolveContactTitle(info, fallbackTitle)
    chatStore.updateChatMeta(chatId, {
      title,
      username: info.username || undefined,
      phone:
        info.phoneNumber && info.phoneNumber > 0
          ? String(info.phoneNumber)
          : undefined,
      avatarUrl: info.avatar?.trim() || undefined,
    })

    if (!info.avatar?.trim()) {
      const avatarUrl = await getAvatar(credentials, chatId)
      if (avatarUrl) chatStore.setChatAvatar(chatId, avatarUrl)
    }
  } catch {
    try {
      const avatarUrl = await getAvatar(credentials, chatId)
      if (avatarUrl) chatStore.setChatAvatar(chatId, avatarUrl)
    } catch {
      // optional enrichment
    }
  }
}
