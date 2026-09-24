import { create } from 'zustand'
import type { Message, MessageStatus } from './types'
import { shouldUpgradeStatus } from './types'

interface MessageState {
  messagesByChat: Record<string, Message[]>
  historyLoaded: Record<string, boolean>
  addMessage: (message: Message) => void
  mergeMessages: (chatId: string, messages: Message[]) => void
  updateMessageStatus: (idMessage: string, status: MessageStatus) => void
  getMessages: (chatId: string) => Message[]
  markHistoryLoaded: (chatId: string) => void
  isHistoryLoaded: (chatId: string) => boolean
  remapChatId: (fromChatId: string, toChatId: string) => void
  reset: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messagesByChat: {},
  historyLoaded: {},
  addMessage: (message) => {
    set((state) => {
      const list = state.messagesByChat[message.chatId] ?? []
      if (list.some((m) => m.id === message.id)) {
        return state
      }
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [message.chatId]: [...list, message],
        },
      }
    })
  },
  mergeMessages: (chatId, messages) => {
    set((state) => {
      const existing = state.messagesByChat[chatId] ?? []
      const byId = new Map(existing.map((m) => [m.id, m]))
      for (const message of messages) {
        const prev = byId.get(message.id)
        if (!prev) {
          byId.set(message.id, message)
          continue
        }
        byId.set(message.id, {
          ...prev,
          ...message,
          status:
            message.status && shouldUpgradeStatus(prev.status, message.status)
              ? message.status
              : prev.status,
        })
      }
      const merged = [...byId.values()].sort((a, b) => a.timestamp - b.timestamp)
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: merged,
        },
      }
    })
  },
  updateMessageStatus: (idMessage, status) => {
    set((state) => {
      let changed = false
      const next: Record<string, Message[]> = {}
      for (const [chatId, list] of Object.entries(state.messagesByChat)) {
        next[chatId] = list.map((message) => {
          if (message.id !== idMessage) return message
          if (!shouldUpgradeStatus(message.status, status)) return message
          changed = true
          return { ...message, status }
        })
      }
      return changed ? { messagesByChat: next } : state
    })
  },
  getMessages: (chatId) => get().messagesByChat[chatId] ?? [],
  markHistoryLoaded: (chatId) => {
    set((state) => ({
      historyLoaded: { ...state.historyLoaded, [chatId]: true },
    }))
  },
  isHistoryLoaded: (chatId) => Boolean(get().historyLoaded[chatId]),
  remapChatId: (fromChatId, toChatId) => {
    if (fromChatId === toChatId) return
    set((state) => {
      const fromList = state.messagesByChat[fromChatId] ?? []
      const toList = state.messagesByChat[toChatId] ?? []
      const merged = [
        ...toList,
        ...fromList.map((m) => ({ ...m, chatId: toChatId })),
      ]
      const unique = merged.filter(
        (m, index, arr) => arr.findIndex((x) => x.id === m.id) === index,
      )
      const nextMessages = { ...state.messagesByChat }
      delete nextMessages[fromChatId]
      nextMessages[toChatId] = unique.sort((a, b) => a.timestamp - b.timestamp)

      const nextHistory = { ...state.historyLoaded }
      if (nextHistory[fromChatId]) {
        nextHistory[toChatId] = true
        delete nextHistory[fromChatId]
      }

      return { messagesByChat: nextMessages, historyLoaded: nextHistory }
    })
  },
  reset: () => set({ messagesByChat: {}, historyLoaded: {} }),
}))
