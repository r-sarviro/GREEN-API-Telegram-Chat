import { useEffect, useState } from 'react'
import { useReceiveMessages } from '@/features/receive-messages'
import { syncChatsFromApi } from '@/features/sync-chats'
import { useChatStore } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { ChatSidebar } from '@/widgets/chat-sidebar'
import { MessagePanel } from '@/widgets/message-panel'
import styles from './ChatPage.module.css'

export function ChatPage() {
  useReceiveMessages()

  const credentials = useSessionStore((s) => s.credentials)
  const activeChatId = useChatStore((s) => s.activeChatId)
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const mobileShowChat = Boolean(activeChatId)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    if (!credentials) return
    let cancelled = false
    void syncChatsFromApi(credentials).catch(() => {
      if (!cancelled) {
        setSyncError('Не удалось синхронизировать список чатов')
      }
    })
    return () => {
      cancelled = true
    }
  }, [credentials])

  const handleBack = () => {
    setActiveChat(null)
  }

  return (
    <div className={styles.page}>
      {syncError ? <p className={styles.syncError}>{syncError}</p> : null}
      <div
        className={`${styles.pane} ${mobileShowChat ? styles.hideOnMobile : ''}`}
      >
        <ChatSidebar />
      </div>
      <div
        className={`${styles.pane} ${styles.chatPane} ${
          mobileShowChat ? '' : styles.hideOnMobile
        }`}
      >
        <MessagePanel onBack={handleBack} />
      </div>
    </div>
  )
}
