import { create } from 'zustand'
import type { Chat } from './types'

interface ChatState {
  chats: Chat[]
  activeChatId: string | null
  addChat: (chat: Chat) => void
  upsertChat: (chat: Chat) => void
  setActiveChat: (chatId: string | null) => void
  updateChatId: (fromChatId: string, toChatId: string) => void
  setChatAvatar: (chatId: string, avatarUrl: string) => void
  updateChatMeta: (
    chatId: string,
    patch: Partial<Pick<Chat, 'title' | 'phone' | 'avatarUrl' | 'username'>>,
  ) => void
  findChatByPhone: (phoneDigits: string) => Chat | undefined
  reset: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  addChat: (chat) => {
    const exists = get().chats.some((c) => c.chatId === chat.chatId)
    if (exists) {
      set({ activeChatId: chat.chatId })
      return
    }
    set((state) => ({
      chats: [chat, ...state.chats],
      activeChatId: chat.chatId,
    }))
  },
  upsertChat: (chat) => {
    set((state) => {
      const index = state.chats.findIndex((c) => c.chatId === chat.chatId)
      if (index === -1) {
        return { chats: [...state.chats, chat] }
      }
      const prev = state.chats[index]
      const next = [...state.chats]
      next[index] = {
        ...prev,
        ...chat,
        title: chat.title || prev.title,
        avatarUrl: chat.avatarUrl || prev.avatarUrl,
        phone: chat.phone || prev.phone,
        username: chat.username || prev.username,
      }
      return { chats: next }
    })
  },
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  updateChatId: (fromChatId, toChatId) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatId === fromChatId ? { ...chat, chatId: toChatId } : chat,
      ),
      activeChatId: state.activeChatId === fromChatId ? toChatId : state.activeChatId,
    }))
  },
  setChatAvatar: (chatId, avatarUrl) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, avatarUrl } : chat,
      ),
    }))
  },
  updateChatMeta: (chatId, patch) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, ...patch } : chat,
      ),
    }))
  },
  findChatByPhone: (phoneDigits) => {
    const digits = phoneDigits.replace(/\D/g, '')
    return get().chats.find((chat) => {
      if (!chat.phone) return false
      return chat.phone.replace(/\D/g, '') === digits
    })
  },
  reset: () => set({ chats: [], activeChatId: null }),
}))
