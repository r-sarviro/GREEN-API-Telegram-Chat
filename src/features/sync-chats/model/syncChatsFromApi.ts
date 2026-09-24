import { getChats } from '@/shared/api'
import type { GreenApiCredentials } from '@/shared/api'
import { enrichChatProfile, useChatStore } from '@/entities/chat'

export async function syncChatsFromApi(credentials: GreenApiCredentials) {
  const remoteChats = await getChats(credentials)
  const chatStore = useChatStore.getState()

  const personal = remoteChats.filter(
    (chat) => !chat.type || chat.type === 'user',
  )

  for (const remote of personal) {
    const title =
      remote.name?.trim() ||
      (remote.phoneNumber && remote.phoneNumber > 0
        ? `+${remote.phoneNumber}`
        : remote.username?.trim() || remote.chatId)

    chatStore.upsertChat({
      chatId: remote.chatId,
      title,
      phone:
        remote.phoneNumber && remote.phoneNumber > 0
          ? String(remote.phoneNumber)
          : undefined,
      username: remote.username || undefined,
    })
  }

  const toEnrich = personal.slice(0, 15)
  await Promise.allSettled(
    toEnrich.map((chat) =>
      enrichChatProfile(
        credentials,
        chat.chatId,
        chat.name?.trim() || chat.chatId,
      ),
    ),
  )
}
