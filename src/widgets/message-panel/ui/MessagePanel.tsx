import { useEffect, useRef, useState } from 'react'
import { SendMessageForm } from '@/features/send-message'
import { loadChatHistory } from '@/features/load-chat-history'
import { ChatAvatar, useChatStore } from '@/entities/chat'
import { useMessageStore, type MessageStatus } from '@/entities/message'
import { useSessionStore } from '@/entities/session'
import { formatMessageTime } from '@/shared/lib'
import { Button, Spinner } from '@/shared/ui'
import styles from './MessagePanel.module.css'

interface MessagePanelProps {
  onBack?: () => void
}

function StatusTicks({ status }: { status?: MessageStatus }) {
  if (!status || status === 'pending') {
    return <span className={styles.statusPending}>…</span>
  }
  if (status === 'failed') {
    return <span className={styles.statusFailed}>!</span>
  }
  if (status === 'read') {
    return <span className={styles.statusRead}>✓✓</span>
  }
  return <span className={styles.statusSent}>✓</span>
}

export function MessagePanel({ onBack }: MessagePanelProps) {
  const credentials = useSessionStore((s) => s.credentials)
  const activeChatId = useChatStore((s) => s.activeChatId)
  const chats = useChatStore((s) => s.chats)
  const messagesByChat = useMessageStore((s) => s.messagesByChat)
  const isHistoryLoaded = useMessageStore((s) => s.isHistoryLoaded)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null
  const messages = activeChatId ? (messagesByChat[activeChatId] ?? []) : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeChatId])

  useEffect(() => {
    if (!credentials || !activeChatId) return
    if (isHistoryLoaded(activeChatId)) return

    let cancelled = false
    setHistoryLoading(true)
    setHistoryError('')

    void loadChatHistory(credentials, activeChatId)
      .catch(() => {
        if (!cancelled) {
          setHistoryError('Не удалось загрузить историю чата')
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [credentials, activeChatId, isHistoryLoaded])

  if (!activeChat) {
    return (
      <section className={styles.empty}>
        <p>Выберите чат или создайте новый</p>
      </section>
    )
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            className={styles.back}
            onClick={onBack}
            aria-label="Назад к списку чатов"
          >
            <svg
              className={styles.backIcon}
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M15.5 5.5L9 12l6.5 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        ) : null}
        <ChatAvatar title={activeChat.title} avatarUrl={activeChat.avatarUrl} />
        <div className={styles.headerInfo}>
          <h3 className={styles.name}>{activeChat.title}</h3>
          <p className={styles.meta}>
            {activeChat.username || activeChat.phone || activeChat.chatId}
          </p>
        </div>
      </header>

      <div className={styles.messages}>
        {historyLoading ? (
          <div className={styles.historyState}>
            <Spinner size="sm" />
            <span>Загрузка истории…</span>
          </div>
        ) : null}
        {historyError ? <p className={styles.historyError}>{historyError}</p> : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.bubble} ${
              message.direction === 'outgoing' ? styles.outgoing : styles.incoming
            }`}
          >
            <p className={styles.text}>{message.text}</p>
            <div className={styles.metaRow}>
              <time className={styles.time}>{formatMessageTime(message.timestamp)}</time>
              {message.direction === 'outgoing' ? (
                <StatusTicks status={message.status} />
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <SendMessageForm chatId={activeChat.chatId} />
    </section>
  )
}
