import { useEffect, useRef } from 'react'
import { enrichChatProfile, useChatStore } from '@/entities/chat'
import { useMessageStore } from '@/entities/message'
import { useSessionStore } from '@/entities/session'
import { pollOnce } from './poll'

/**
 * Long-polls GREEN-API ReceiveNotification while the user is authenticated.
 */
export function useReceiveMessages() {
  const credentials = useSessionStore((s) => s.credentials)
  const aborted = useRef(false)

  useEffect(() => {
    if (!credentials) return

    aborted.current = false

    const run = async () => {
      while (!aborted.current) {
        try {
          const result = await pollOnce(credentials)
          if (aborted.current || !result) continue

          if (result.statusUpdate) {
            useMessageStore
              .getState()
              .updateMessageStatus(
                result.statusUpdate.idMessage,
                result.statusUpdate.status,
              )
            continue
          }

          if (!result.message) continue

          const { message } = result
          const chatState = useChatStore.getState()
          const messageState = useMessageStore.getState()
          const existingById = chatState.chats.find((c) => c.chatId === message.chatId)
          let shouldEnrich = false

          if (!existingById && result.phoneDigits) {
            const byPhone = chatState.findChatByPhone(result.phoneDigits)
            if (byPhone && byPhone.chatId !== message.chatId) {
              chatState.updateChatId(byPhone.chatId, message.chatId)
              messageState.remapChatId(byPhone.chatId, message.chatId)
              shouldEnrich = !byPhone.avatarUrl
            } else if (!byPhone) {
              chatState.addChat({
                chatId: message.chatId,
                title: result.chatName ?? `+${result.phoneDigits}`,
                phone: result.phoneDigits,
              })
              shouldEnrich = true
            }
          } else if (!existingById) {
            chatState.addChat({
              chatId: message.chatId,
              title: result.chatName ?? message.chatId,
            })
            shouldEnrich = true
          }

          messageState.addMessage(message)

          if (shouldEnrich) {
            void enrichChatProfile(
              credentials,
              message.chatId,
              result.chatName ?? message.chatId,
            )
          }
        } catch {
          if (aborted.current) break
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    void run()

    return () => {
      aborted.current = true
    }
  }, [credentials])
}
